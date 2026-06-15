import { NextRequest } from 'next/server';
import { userClient, getToken, getUserId, fail, ok } from '../_lib/sb';

// GET /api/activity — the signed-in user's real money + section activity.
//   transactions: every top-up / save / withdrawal / payment / interest, across
//                 all sections, newest first (drives the Activity screen).
//   events:       non-money activity (ride requested, etc.) from activity_events,
//                 newest first (folds into the Inbox alongside transactions).
//
// Runs with the caller's JWT so RLS scopes every row to that user — the same
// model the other private routes use. No service-role key here.
export async function GET(req: NextRequest) {
  const token = getToken(req);
  const userId = await getUserId(token);
  if (!userId) return fail(401, 'sign in required');

  const sb = userClient(token);
  const [txs, events] = await Promise.all([
    sb.from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('happened_at', { ascending: false })
      .limit(80),
    sb.from('activity_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(40),
  ]);
  if (txs.error) return fail(502, txs.error.message);
  if (events.error) return fail(502, events.error.message);

  return ok({ transactions: txs.data ?? [], events: events.data ?? [] });
}
