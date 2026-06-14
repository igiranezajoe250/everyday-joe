import { NextRequest } from 'next/server';
import { anonClient, fail, ok } from '../_lib/sb';

// GET /api/commute — public list of vetted ride options.
export async function GET(_req: NextRequest) {
  const { data, error } = await anonClient()
    .from('commute_options')
    .select('*')
    .order('eta_min', { ascending: true });
  if (error) return fail(502, error.message);
  return ok(data ?? []);
}
