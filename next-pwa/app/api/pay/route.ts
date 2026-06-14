import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Pay — real wallet-to-wallet transfer between two Everyday users.
//
//   GET  /api/pay                              recent pay-section ledger entries
//   POST /api/pay { amount_rwf, recipient, note? }
//        Resolves `recipient` (phone or email) to an Everyday user, then
//        atomically debits the sender and credits the recipient via the
//        transfer_p2p SECURITY DEFINER function. If the recipient isn't an
//        Everyday user, returns 404 so the UI can show an honest gate.

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function adminClient() {
  return createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
}

function getToken(req: NextRequest) {
  return (req.headers.get('authorization') ?? '').replace(/^bearer\s+/i, '').trim();
}

async function getUserId(token: string): Promise<string | null> {
  if (!token) return null;
  const { data } = await createClient(SB_URL, SB_ANON).auth.getUser(token);
  return data?.user?.id ?? null;
}

function fail(status: number, msg: string) {
  return NextResponse.json({ error: msg }, { status });
}

// Last 8+ digits of a phone, ignoring spaces / punctuation / country prefix —
// enough to match "+250 788 120 441" against "0788120441".
function phoneTail(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits.slice(-9);
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  const svc = adminClient();
  const { data, error } = await svc
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('section', 'pay')
    .order('happened_at', { ascending: false })
    .limit(50);
  if (error) return fail(502, error.message);
  return NextResponse.json({ transactions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

  const amount = Math.floor(Number(body.amount_rwf ?? 0));
  const recipientRaw = String(body.recipient ?? '').trim();
  const note = String(body.note ?? '').trim();

  if (!Number.isFinite(amount) || amount <= 0) return fail(400, 'amount_rwf must be positive');
  if (!recipientRaw) return fail(400, 'recipient required');

  const svc = adminClient();

  // Resolve the recipient to an Everyday user by email or phone.
  let recipientId: string | null = null;
  let recipientName = recipientRaw;
  if (recipientRaw.includes('@')) {
    const { data } = await svc
      .from('profiles')
      .select('id,display_name')
      .ilike('email', recipientRaw)
      .limit(1);
    if (data?.length) { recipientId = data[0].id; recipientName = data[0].display_name || recipientRaw; }
  } else {
    const tail = phoneTail(recipientRaw);
    if (tail.length >= 7) {
      const { data } = await svc
        .from('profiles')
        .select('id,display_name,phone')
        .like('phone', `%${tail}`)
        .limit(1);
      if (data?.length) { recipientId = data[0].id; recipientName = data[0].display_name || recipientRaw; }
    }
  }

  if (!recipientId) {
    // Honest gate: we can only transfer to people already on Everyday.
    return NextResponse.json(
      { error: `${recipientRaw} isn't an Everyday user yet, so you can't send to them.`, code: 'not_everyday_user' },
      { status: 404 }
    );
  }
  if (recipientId === userId) return fail(400, 'cannot transfer to yourself');

  const { data, error } = await svc.rpc('transfer_p2p', {
    p_sender: userId,
    p_recipient: recipientId,
    p_amount: amount,
    p_note: note,
  });

  if (error) {
    const m = error.message || '';
    if (/insufficient balance/i.test(m)) return fail(402, 'insufficient balance');
    if (/no wallet/i.test(m)) return fail(409, 'no wallet to send from');
    if (/yourself|positive/i.test(m)) return fail(400, m);
    return fail(502, m);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    ok: true,
    recipient: recipientName,
    amount_rwf: amount,
    balance_rwf: row?.sender_balance_rwf ?? null,
    tx_id: row?.out_tx_id ?? null,
  });
}
