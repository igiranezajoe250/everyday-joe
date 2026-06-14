import { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { userClient, getToken, getUserId, fail, ok } from '../_lib/sb';

// Save service.
//   GET  /api/save                       wallet + ledger + goals + schedules + proposals
//   POST /api/save { action, ... }       deposit (default), withdraw, goal/schedule
//                                        CRUD, and the agent propose/confirm boundary.
//
// Everything runs with the caller's JWT, so RLS guarantees a user only ever
// touches their own rows. The Save expert agent never moves money directly — it
// writes a pending proposal that the user confirms here, which then runs the same
// validated handler as the manual path.

type Wallet = {
  id: string; user_id: string; label: string;
  balance_rwf: number; savings_rwf: number; credit_limit_rwf: number;
};

async function ensureWallet(sb: SupabaseClient, userId: string): Promise<Wallet> {
  const { data: rows, error } = await sb.from('wallets').select('*').eq('user_id', userId).limit(1);
  if (error) throw new Error(error.message);
  if (rows?.length) return rows[0] as Wallet;
  const { data: made, error: mkErr } = await sb
    .from('wallets')
    .insert({ user_id: userId, label: 'Everyday Wallet' })
    .select()
    .limit(1);
  if (mkErr) throw new Error(mkErr.message);
  if (!made?.length) throw new Error('wallet create returned empty');
  return made[0] as Wallet;
}

// Best-effort: add to a goal's saved total and mark reached when it crosses target.
async function bumpGoalProgress(sb: SupabaseClient, userId: string, goalId: string, amount: number) {
  const { data: rows } = await sb
    .from('savings_goals')
    .select('saved_rwf,target_rwf')
    .eq('id', goalId)
    .eq('user_id', userId)
    .limit(1);
  if (!rows?.length) return;
  const newSaved = (rows[0].saved_rwf || 0) + amount;
  const patch: Record<string, unknown> = { saved_rwf: newSaved };
  if (newSaved >= rows[0].target_rwf) patch.status = 'reached';
  await sb.from('savings_goals').update(patch).eq('id', goalId).eq('user_id', userId);
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  const sb = userClient(token);
  let wallet: Wallet;
  try { wallet = await ensureWallet(sb, userId); } catch (e) { return fail(502, msg(e)); }

  const [txs, goals, schedules, proposals] = await Promise.all([
    sb.from('transactions').select('*').eq('user_id', userId).eq('section', 'save').order('happened_at', { ascending: false }).limit(50),
    sb.from('savings_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    sb.from('savings_schedules').select('*').eq('user_id', userId).order('next_run_on', { ascending: true }),
    sb.from('agent_proposals').select('*').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false }),
  ]);

  return ok({
    wallet,
    transactions: txs.data ?? [],
    goals: goals.data ?? [],
    schedules: schedules.data ?? [],
    proposals: proposals.data ?? [],
    interest_apr: 0.08,
  });
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

  const sb = userClient(token);
  const action = String(body.action ?? '').trim();
  try {
    switch (action) {
      case '':
      case 'deposit':          return await deposit(sb, userId, body);
      case 'withdraw':         return await withdraw(sb, userId, body);
      case 'create_goal':      return await createGoal(sb, userId, body);
      case 'update_goal':      return await updateGoal(sb, userId, body);
      case 'delete_goal':      return await deleteGoal(sb, userId, body);
      case 'create_schedule':  return await createSchedule(sb, userId, body);
      case 'cancel_schedule':  return await cancelSchedule(sb, userId, body);
      case 'create_proposal':  return await createProposal(sb, userId, body);
      case 'confirm_proposal': return await handleProposal(sb, userId, body, true);
      case 'reject_proposal':  return await handleProposal(sb, userId, body, false);
      default:                 return fail(400, `unknown action: ${action}`);
    }
  } catch (e) {
    return fail(502, msg(e));
  }
}

function msg(e: unknown) { return e instanceof Error ? e.message : String(e); }

async function deposit(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const amount = Math.floor(Number(body.amount_rwf ?? 0));
  if (!Number.isFinite(amount) || amount <= 0) return fail(400, 'amount_rwf must be positive');
  const goalId = String(body.goal_id ?? '').trim();
  const title = String(body.title ?? '').trim() || 'Savings deposit';

  const wallet = await ensureWallet(sb, userId);
  const { error: txErr } = await sb.from('transactions').insert({
    user_id: userId, wallet_id: wallet.id, section: 'save', title,
    amount_rwf: amount, direction: 'in', status: 'completed',
    kind: goalId ? 'goal_deposit' : 'deposit',
  });
  if (txErr) return fail(502, txErr.message);

  const newSavings = wallet.savings_rwf + amount;
  const { error: wErr } = await sb.from('wallets').update({ savings_rwf: newSavings }).eq('id', wallet.id);
  if (wErr) return fail(502, wErr.message);
  if (goalId) await bumpGoalProgress(sb, userId, goalId, amount);

  return ok({ wallet: { ...wallet, savings_rwf: newSavings }, ok: true });
}

async function withdraw(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const amount = Math.floor(Number(body.amount_rwf ?? 0));
  if (!Number.isFinite(amount) || amount <= 0) return fail(400, 'amount_rwf must be positive');
  const title = String(body.title ?? '').trim() || 'Withdrawal';

  const wallet = await ensureWallet(sb, userId);
  if (amount > wallet.savings_rwf) return fail(400, 'amount exceeds savings balance');

  const { error: txErr } = await sb.from('transactions').insert({
    user_id: userId, wallet_id: wallet.id, section: 'save', title,
    amount_rwf: amount, direction: 'out', status: 'completed', kind: 'withdraw',
  });
  if (txErr) return fail(502, txErr.message);

  const newSavings = wallet.savings_rwf - amount;
  const { error: wErr } = await sb.from('wallets').update({ savings_rwf: newSavings }).eq('id', wallet.id);
  if (wErr) return fail(502, wErr.message);

  return ok({ wallet: { ...wallet, savings_rwf: newSavings }, ok: true });
}

async function createGoal(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const label = String(body.label ?? '').trim();
  const target = Math.floor(Number(body.target_rwf ?? 0));
  if (!label || !Number.isFinite(target) || target <= 0) return fail(400, 'label and positive target_rwf required');
  const row: Record<string, unknown> = { user_id: userId, label, target_rwf: target };
  const deadline = String(body.deadline ?? '').trim();
  if (deadline) row.deadline = deadline;
  const { data, error } = await sb.from('savings_goals').insert(row).select().limit(1);
  if (error) return fail(502, error.message);
  return ok({ goal: data?.[0] ?? null, ok: true });
}

async function updateGoal(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const goalId = String(body.goal_id ?? '').trim();
  if (!goalId) return fail(400, 'goal_id required');
  const patch: Record<string, unknown> = {};
  const label = String(body.label ?? '').trim();
  const target = Math.floor(Number(body.target_rwf ?? 0));
  const deadline = String(body.deadline ?? '').trim();
  if (label) patch.label = label;
  if (Number.isFinite(target) && target > 0) patch.target_rwf = target;
  if (deadline) patch.deadline = deadline;
  if (!Object.keys(patch).length) return fail(400, 'nothing to update');
  const { error } = await sb.from('savings_goals').update(patch).eq('id', goalId).eq('user_id', userId);
  if (error) return fail(502, error.message);
  return ok({ ok: true });
}

async function deleteGoal(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const goalId = String(body.goal_id ?? '').trim();
  if (!goalId) return fail(400, 'goal_id required');
  const { error } = await sb.from('savings_goals').delete().eq('id', goalId).eq('user_id', userId);
  if (error) return fail(502, error.message);
  return ok({ ok: true });
}

async function createSchedule(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const amount = Math.floor(Number(body.amount_rwf ?? 0));
  if (!Number.isFinite(amount) || amount <= 0) return fail(400, 'amount_rwf must be positive');
  const cadence = String(body.cadence ?? '').trim();
  if (!['daily', 'weekly', 'monthly'].includes(cadence)) return fail(400, 'cadence must be daily, weekly, or monthly');
  let next = String(body.start_on ?? '').trim();
  if (!next) {
    const d = new Date(); d.setUTCDate(d.getUTCDate() + 1);
    next = d.toISOString().slice(0, 10);
  }
  const row: Record<string, unknown> = { user_id: userId, amount_rwf: amount, cadence, next_run_on: next };
  const goalId = String(body.goal_id ?? '').trim();
  if (goalId) row.goal_id = goalId;
  const { data, error } = await sb.from('savings_schedules').insert(row).select().limit(1);
  if (error) return fail(502, error.message);
  return ok({ schedule: data?.[0] ?? null, ok: true });
}

async function cancelSchedule(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const scheduleId = String(body.schedule_id ?? '').trim();
  if (!scheduleId) return fail(400, 'schedule_id required');
  const { error } = await sb.from('savings_schedules').delete().eq('id', scheduleId).eq('user_id', userId);
  if (error) return fail(502, error.message);
  return ok({ ok: true });
}

// The Save expert agent emits a pending proposal; only kind is validated here.
// The payload is re-validated when the action executes on confirm, so a
// malformed payload can never move money.
async function createProposal(sb: SupabaseClient, userId: string, body: Record<string, unknown>) {
  const kind = String(body.kind ?? '').trim();
  if (!['deposit', 'schedule', 'goal'].includes(kind)) return fail(400, 'kind must be deposit, schedule, or goal');
  const summary = String(body.summary ?? '').trim() || `Confirm ${kind}`;
  const payload = body.payload ?? {};
  const { data, error } = await sb
    .from('agent_proposals')
    .insert({ user_id: userId, section: 'save', kind, summary, payload })
    .select()
    .limit(1);
  if (error) return fail(502, error.message);
  return ok({ proposal: data?.[0] ?? null, ok: true });
}

async function handleProposal(sb: SupabaseClient, userId: string, body: Record<string, unknown>, confirm: boolean) {
  const proposalId = String(body.proposal_id ?? '').trim();
  if (!proposalId) return fail(400, 'proposal_id required');

  const { data: rows, error } = await sb
    .from('agent_proposals')
    .select('id,kind,payload,status')
    .eq('id', proposalId)
    .eq('user_id', userId)
    .limit(1);
  if (error) return fail(502, error.message);
  if (!rows?.length) return fail(404, 'proposal not found');
  const p = rows[0];
  if (p.status !== 'pending') return fail(409, `proposal already ${p.status}`);

  if (!confirm) {
    await sb.from('agent_proposals').update({ status: 'rejected' }).eq('id', p.id);
    return ok({ ok: true, status: 'rejected' });
  }

  // Mark confirmed first so a double-tap can't execute twice.
  await sb.from('agent_proposals').update({ status: 'confirmed' }).eq('id', p.id);
  const payload = (p.payload ?? {}) as Record<string, unknown>;
  switch (p.kind) {
    case 'deposit':  return await deposit(sb, userId, payload);
    case 'schedule': return await createSchedule(sb, userId, payload);
    case 'goal':     return await createGoal(sb, userId, payload);
    default:         return fail(400, `unknown proposal kind: ${p.kind}`);
  }
}
