import { NextRequest } from 'next/server';
import { anonClient, userClient, getToken, getUserId, fail, ok } from '../_lib/sb';

// GET /api/commute — public list of vetted ride options.
export async function GET(_req: NextRequest) {
  const { data, error } = await anonClient()
    .from('commute_options')
    .select('*')
    .order('eta_min', { ascending: true });
  if (error) return fail(502, error.message);
  return ok(data ?? []);
}

// POST /api/commute — request a ride. Writes a per-user row (RLS-scoped to the
// caller via their JWT) so requesting a ride is a real backend action, not just
// a local success screen. Also drops a best-effort activity event.
//
//   POST /api/commute {
//     option_id?, driver_name, vehicle?, mode?, origin?, destination?,
//     eta_min?, price_rwf?, pay_mode?  ('prepaid' | 'on-arrival')
//   }
export async function POST(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(400, 'invalid json'); }

  const driver = String(body.driver_name ?? '').trim();
  if (!driver) return fail(400, 'driver_name required');

  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : null);
  const str = (v: unknown) => { const s = String(v ?? '').trim(); return s || null; };

  const row = {
    user_id: userId,
    option_id: str(body.option_id),
    driver_name: driver,
    vehicle: str(body.vehicle),
    mode: str(body.mode),
    origin: str(body.origin),
    destination: str(body.destination),
    eta_min: num(body.eta_min),
    price_rwf: num(body.price_rwf),
    pay_mode: body.pay_mode === 'prepaid' ? 'prepaid' : 'on-arrival',
    status: 'requested',
  };

  const sb = userClient(token);
  const { data, error } = await sb.from('commute_requests').insert(row).select().single();
  if (error) return fail(502, error.message);

  // Best-effort activity log — never block the ride on it.
  await sb.from('activity_events').insert({
    user_id: userId,
    section: 'commute',
    title: `Requested ${driver}`,
    detail: row.destination ? `To ${row.destination}` : null,
  });

  return ok({ ok: true, request: data });
}
