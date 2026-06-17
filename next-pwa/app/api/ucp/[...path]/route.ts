import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const UCP_VER = '2026-04-08';
const DELIVERY_FEE = 1000;

function adminClient() {
  if (!SB_URL || !SB_SVC) throw new Error('Supabase service credentials are required for checkout.');
  return createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
}

function getToken(req: NextRequest) {
  return (req.headers.get('authorization') ?? '').replace(/^bearer\s+/i, '').trim();
}

async function getUserId(token: string): Promise<string | null> {
  if (!token) return null;
  if (!SB_URL || !SB_ANON) throw new Error('Supabase auth credentials are required for checkout.');
  const { data } = await createClient(SB_URL, SB_ANON).auth.getUser(token);
  return data?.user?.id ?? null;
}

function fail(status: number, msg: string) {
  return NextResponse.json({ error: msg }, { status });
}

function wrap(body: object) {
  return NextResponse.json({ ...body, ucp: { version: UCP_VER } });
}

function rid() {
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
}

function calcTotals(lineItems: Array<{ price_rwf: number; qty: number }>, fulfillment?: Record<string, unknown>) {
  const subtotal = lineItems.reduce((s, i) => s + i.price_rwf * i.qty, 0);
  const delivery = fulfillment?.type === 'pickup' ? 0 : DELIVERY_FEE;
  return { subtotal, delivery, total: subtotal + delivery };
}

function normalizeCheckoutBody(body: Record<string, unknown>) {
  const checkout = (body.checkout as Record<string, unknown>) || body;
  return {
    lineItems: (checkout.line_items || body.line_items || []) as Array<Record<string, unknown>>,
    fulfillment: ((checkout.fulfillment || body.fulfillment || { type: 'delivery' }) as Record<string, unknown>),
    buyer: ((checkout.buyer || body.buyer || {}) as Record<string, unknown>),
  };
}

async function buildLineItems(rawItems: Array<Record<string, unknown>>) {
  if (!rawItems.length) throw new Error('line_items required');
  const svc = adminClient();
  const ids = rawItems.map((item) => String(item.product_id ?? '').trim()).filter(Boolean);
  if (!ids.length) throw new Error('product_id required');
  const { data, error } = await svc.from('products').select('id,name,price_rwf,stock,sold').in('id', ids);
  if (error) throw new Error(error.message);
  const byId = new Map((data ?? []).map((p) => [String(p.id), p]));
  return rawItems.map((item) => {
    const productId = String(item.product_id ?? '').trim();
    const product = byId.get(productId);
    if (!product) throw new Error(`product not found: ${productId}`);
    const qty = Math.max(1, Math.floor(Number(item.quantity ?? item.qty ?? 1)));
    if ((product.stock ?? 0) < qty) throw new Error(`only ${product.stock ?? 0} in stock`);
    return {
      product_id: product.id,
      name: product.name,
      price_rwf: product.price_rwf,
      qty,
    };
  });
}

async function decrementStock(lineItems: Array<{ product_id?: string; qty: number }>) {
  const svc = adminClient();
  await Promise.all(lineItems.map(async (item) => {
    if (!item.product_id) return;
    const { data } = await svc.from('products').select('stock,sold').eq('id', item.product_id).limit(1);
    const product = data?.[0];
    if (!product) return;
    await svc
      .from('products')
      .update({
        stock: Math.max(0, (product.stock ?? 0) - item.qty),
        sold: (product.sold ?? 0) + item.qty,
      })
      .eq('id', item.product_id);
  }));
}

async function debitWallet(userId: string, amountRwf: number, title: string) {
  const svc = adminClient();
  const { data: ws } = await svc
    .from('wallets')
    .select('id,balance_rwf')
    .eq('user_id', userId)
    .limit(1);
  if (!ws?.length) throw new Error('no_wallet');
  const w = ws[0];
  if (w.balance_rwf < amountRwf) throw new Error(`insufficient_balance:${w.balance_rwf}`);
  await svc.from('wallets').update({ balance_rwf: w.balance_rwf - amountRwf }).eq('id', w.id);
  const { data: tx } = await svc
    .from('transactions')
    .insert({
      user_id: userId,
      wallet_id: w.id,
      section: 'shop',
      title,
      amount_rwf: amountRwf,
      direction: 'out',
      status: 'completed',
      kind: 'purchase',
    })
    .select('id')
    .single();
  return String(tx?.id ?? `tx_${Date.now()}`);
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const [seg0, seg1] = path ?? [];

  // GET /api/ucp/checkout-sessions/:id
  if (seg0 === 'checkout-sessions' && seg1) {
    const token = getToken(req);
    const userId = await getUserId(token);
    if (!userId) return fail(401, 'unauthorized');
    const { data, error } = await adminClient()
      .from('ucp_checkout_sessions')
      .select('*')
      .eq('id', seg1)
      .eq('user_id', userId)
      .single();
    if (error || !data) return fail(404, 'session not found');
    return wrap({ session: data });
  }

  // GET /api/ucp/orders/:id
  if (seg0 === 'orders' && seg1) {
    const token = getToken(req);
    const userId = await getUserId(token);
    if (!userId) return fail(401, 'unauthorized');
    const { data, error } = await adminClient()
      .from('ucp_orders')
      .select('*')
      .eq('id', seg1)
      .eq('user_id', userId)
      .single();
    if (error || !data) return fail(404, 'order not found');
    return wrap({ order: data });
  }

  return fail(404, 'not found');
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const [seg0, seg1, seg2] = path ?? [];

  // POST /api/ucp/checkout-sessions — create session
  if (seg0 === 'checkout-sessions' && !seg1) {
    const token = getToken(req);
    const userId = await getUserId(token);
    if (!userId) return fail(401, 'unauthorized');

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

    let lineItems: Array<{ product_id: string; name: string; price_rwf: number; qty: number }>;
    let fulfillment: Record<string, unknown>;
    let buyer: Record<string, unknown>;
    try {
      const normalized = normalizeCheckoutBody(body);
      lineItems = await buildLineItems(normalized.lineItems);
      fulfillment = normalized.fulfillment;
      buyer = normalized.buyer;
    } catch (e) {
      return fail(400, e instanceof Error ? e.message : String(e));
    }

    const totals = calcTotals(lineItems, fulfillment);
    const svc = adminClient();
    const { data, error } = await svc
      .from('ucp_checkout_sessions')
      .insert({
        id: `cs_${rid()}`,
        user_id: userId,
        status: 'open',
        line_items: lineItems,
        fulfillment,
        buyer,
        totals,
      })
      .select()
      .single();
    if (error) return fail(500, error.message);
    return wrap({ session: data });
  }

  // POST /api/ucp/checkout-sessions/:id/complete
  if (seg0 === 'checkout-sessions' && seg1 && seg2 === 'complete') {
    const token = getToken(req);
    const userId = await getUserId(token);
    if (!userId) return fail(401, 'unauthorized');

    const svc = adminClient();
    const { data: sess, error: sessErr } = await svc
      .from('ucp_checkout_sessions')
      .select('*')
      .eq('id', seg1)
      .eq('user_id', userId)
      .single();
    if (sessErr || !sess) return fail(404, 'session not found');
    if (sess.status !== 'open') return fail(409, `session already ${sess.status}`);

    const totals = sess.totals as { subtotal: number; delivery: number; total: number };
    const title = `Shop order (${(sess.line_items as unknown[]).length} items)`;
    const lineItems = sess.line_items as Array<{ product_id?: string; qty: number }>;

    let txId: string;
    try {
      await buildLineItems(lineItems as Array<Record<string, unknown>>);
      txId = await debitWallet(userId, totals.total, title);
      await decrementStock(lineItems);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith('insufficient_balance')) return fail(402, 'insufficient wallet balance');
      return fail(500, msg);
    }

    const orderId = `ord_${rid()}`;
    const { data: order } = await svc
      .from('ucp_orders')
      .insert({
        id: orderId,
        user_id: userId,
        checkout_id: seg1,
        status: 'confirmed',
        line_items: sess.line_items,
        fulfillment: sess.fulfillment,
        buyer: sess.buyer,
        totals: sess.totals,
        events: [{ at: new Date().toISOString(), kind: 'confirmed', tx_id: txId }],
      })
      .select()
      .single();

    await svc
      .from('ucp_checkout_sessions')
      .update({ status: 'complete' })
      .eq('id', seg1);

    await svc.from('activity_events').insert({
      user_id: userId,
      section: 'shop',
      title,
      detail: `Order ${orderId} · RWF ${totals.total.toLocaleString()}`,
    });

    return wrap({ session: { ...sess, status: 'complete' }, order });
  }

  return fail(404, 'not found');
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const [seg0, seg1] = path ?? [];

  // PATCH /api/ucp/checkout-sessions/:id
  if (seg0 === 'checkout-sessions' && seg1) {
    const token = getToken(req);
    const userId = await getUserId(token);
    if (!userId) return fail(401, 'unauthorized');

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

    const updates: Record<string, unknown> = {};
    if (body.fulfillment) updates.fulfillment = body.fulfillment;
    if (body.buyer) updates.buyer = body.buyer;
    if (body.line_items) {
      try {
        const li = await buildLineItems(body.line_items as Array<Record<string, unknown>>);
        updates.line_items = li;
        updates.totals = calcTotals(li, (body.fulfillment as Record<string, unknown>) || undefined);
      } catch (e) {
        return fail(400, e instanceof Error ? e.message : String(e));
      }
    }

    const { data, error } = await adminClient()
      .from('ucp_checkout_sessions')
      .update(updates)
      .eq('id', seg1)
      .eq('user_id', userId)
      .select()
      .single();
    if (error || !data) return fail(404, 'session not found');
    return wrap({ session: data });
  }

  return fail(404, 'not found');
}
