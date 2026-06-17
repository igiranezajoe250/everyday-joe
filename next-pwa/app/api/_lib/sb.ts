import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Shared Supabase helpers for the Everyday Next.js API routes. These replace the
// old Go microservices (which only ran on Vercel, not in local dev). Reads/writes
// run with the caller's JWT so Postgres RLS scopes everything to that user —
// exactly the security model the Go services used.

const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function requireSupabaseEnv() {
  if (!SB_URL || !SB_ANON) {
    throw new Error('Supabase URL and anon key are required for Everyday services.');
  }
}

export function getToken(req: NextRequest): string {
  return (req.headers.get('authorization') ?? '').replace(/^bearer\s+/i, '').trim();
}

// Anonymous client — public reads (RLS still applies).
export function anonClient(): SupabaseClient {
  requireSupabaseEnv();
  return createClient(SB_URL, SB_ANON, { auth: { persistSession: false } });
}

// User-scoped client — every PostgREST call carries the caller's JWT, so RLS
// limits reads/writes to that user's own rows.
export function userClient(token: string): SupabaseClient {
  requireSupabaseEnv();
  return createClient(SB_URL, SB_ANON, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function getUserId(token: string): Promise<string | null> {
  if (!token) return null;
  requireSupabaseEnv();
  const { data } = await anonClient().auth.getUser(token);
  return data?.user?.id ?? null;
}

export function fail(status: number, msg: string) {
  return NextResponse.json({ error: msg }, { status });
}

export function ok(body: object) {
  return NextResponse.json(body);
}
