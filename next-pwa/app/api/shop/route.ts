import { NextRequest } from 'next/server';
import { anonClient, userClient, getToken, getUserId, fail, ok } from '../_lib/sb';

// GET  /api/shop                       public catalog (shops + products)
// POST /api/shop { product_id, quantity }
//      Places an order: records a ledger entry and decrements stock.

export async function GET(_req: NextRequest) {
  const sb = anonClient();
  const [shops, products] = await Promise.all([
    sb.from('shops').select('*').order('name', { ascending: true }),
    sb.from('products').select('*').order('sold', { ascending: false }),
  ]);
  if (shops.error) return fail(502, shops.error.message);
  if (products.error) return fail(502, products.error.message);
  return ok({ shops: shops.data ?? [], products: products.data ?? [] });
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

  const productId = String(body.product_id ?? '').trim();
  let quantity = Math.floor(Number(body.quantity ?? 1));
  if (!productId) return fail(400, 'product_id required');
  if (!Number.isFinite(quantity) || quantity <= 0) quantity = 1;

  const sb = userClient(token);

  const { data: prods, error: prodErr } = await sb
    .from('products')
    .select('*')
    .eq('id', productId)
    .limit(1);
  if (prodErr) return fail(502, prodErr.message);
  if (!prods?.length) return fail(404, 'product not found');

  const p = prods[0];
  if (p.stock < quantity) return fail(409, `only ${p.stock} in stock`);
  const total = p.price_rwf * quantity;

  const { error: txErr } = await sb.from('transactions').insert({
    user_id: userId,
    section: 'shop',
    title: p.name,
    amount_rwf: total,
    direction: 'out',
    status: 'completed',
  });
  if (txErr) return fail(502, txErr.message);

  const { error: stockErr } = await sb
    .from('products')
    .update({ stock: p.stock - quantity, sold: p.sold + quantity })
    .eq('id', p.id);
  if (stockErr) return fail(502, stockErr.message);

  return ok({ ok: true, product: p.id, quantity, total_rwf: total });
}
