import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const NETWORK = 'everyday-wallet';

function adminClient() {
  if (!SB_URL || !SB_SVC) throw new Error('Supabase service credentials are required for wallet settlement.');
  return createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
}

function getToken(req: NextRequest) {
  return (req.headers.get('authorization') ?? '').replace(/^bearer\s+/i, '').trim();
}

async function getUserId(token: string): Promise<string | null> {
  if (!token) return null;
  if (!SB_URL || !SB_ANON) throw new Error('Supabase auth credentials are required for wallet settlement.');
  const { data } = await createClient(SB_URL, SB_ANON).auth.getUser(token);
  return data?.user?.id ?? null;
}

function fail(status: number, msg: string) {
  return NextResponse.json({ error: msg }, { status });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const [seg0] = path ?? [];

  // GET /api/x402/discovery — list payment methods
  if (seg0 === 'discovery' || !seg0) {
    return NextResponse.json({
      network: NETWORK,
      version: '1.0',
      accepts: [{ kind: 'wallet', currency: 'RWF', network: NETWORK }],
      endpoints: {
        verify: '/api/x402/verify',
        settle: '/api/x402/settle',
      },
    });
  }

  return fail(404, 'not found');
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const [seg0] = path ?? [];

  // POST /api/x402/verify — check if user can pay (no money moves)
  if (seg0 === 'verify') {
    const token = getToken(req);
    const userId = await getUserId(token);
    if (!userId) return fail(401, 'unauthorized');

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

    const requirements = (body.requirements ?? {}) as Record<string, unknown>;
    const amount = Number(body.amount_rwf ?? requirements.amount_rwf ?? requirements.amount ?? 0);
    if (!amount) return fail(400, 'amount_rwf required');

    const svc = adminClient();
    const { data: ws } = await svc
      .from('wallets')
      .select('balance_rwf')
      .eq('user_id', userId)
      .limit(1);

    const balance = ws?.[0]?.balance_rwf ?? 0;
    const canPay = balance >= amount;

    return NextResponse.json({
      verified: canPay,
      balance_rwf: balance,
      amount_rwf: amount,
      network: NETWORK,
      ...(canPay ? {} : { reason: 'insufficient_balance' }),
    });
  }

  // POST /api/x402/settle — debit wallet and record transaction
  if (seg0 === 'settle') {
    const token = getToken(req);
    const userId = await getUserId(token);
    if (!userId) return fail(401, 'unauthorized');

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

    const requirements = (body.requirements ?? {}) as Record<string, unknown>;
    const amount = Number(body.amount_rwf ?? requirements.amount_rwf ?? requirements.amount ?? 0);
    const title = String(body.title ?? 'Payment');
    const section = String(body.section ?? 'shop');
    if (!amount) return fail(400, 'amount_rwf required');

    const svc = adminClient();
    const { data: ws } = await svc
      .from('wallets')
      .select('id,balance_rwf')
      .eq('user_id', userId)
      .limit(1);

    if (!ws?.length) return fail(404, 'no wallet found');
    const w = ws[0];
    if (w.balance_rwf < amount) {
      return NextResponse.json(
        { settled: false, reason: 'insufficient_balance', balance_rwf: w.balance_rwf },
        { status: 402 }
      );
    }

    await svc.from('wallets').update({ balance_rwf: w.balance_rwf - amount }).eq('id', w.id);

    const { data: tx } = await svc
      .from('transactions')
      .insert({
        user_id: userId,
        wallet_id: w.id,
        section,
        title,
        amount_rwf: amount,
        direction: 'out',
        status: 'completed',
        kind: 'purchase',
      })
      .select('id')
      .single();

    const txId = tx?.id ?? `tx_${Date.now()}`;

    return NextResponse.json({
      settled: true,
      network: NETWORK,
      tx_id: txId,
      amount_rwf: amount,
      currency: 'RWF',
    });
  }

  return fail(404, 'not found');
}
