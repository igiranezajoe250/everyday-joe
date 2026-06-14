import { NextRequest } from 'next/server';
import { anonClient, fail, ok } from '../_lib/sb';

// GET /api/listen — public podcast sources + episodes.
export async function GET(_req: NextRequest) {
  const sb = anonClient();
  const [sources, episodes] = await Promise.all([
    sb.from('listen_sources').select('*').order('name', { ascending: true }),
    sb.from('listen_episodes').select('*').order('published_label', { ascending: false }),
  ]);
  if (sources.error) return fail(502, sources.error.message);
  if (episodes.error) return fail(502, episodes.error.message);
  return ok({ sources: sources.data ?? [], episodes: episodes.data ?? [] });
}
