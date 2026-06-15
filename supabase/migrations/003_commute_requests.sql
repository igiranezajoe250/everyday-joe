-- 003_commute_requests.sql — persist real ride requests.
--
-- commute_options (002) is the public catalog of vetted rides. This adds the
-- per-user record created when someone actually requests a ride, so "request a
-- ride" is a real backend action rather than a client-only success screen.
-- RLS scopes every row to its owner, matching the rest of the app.

create table if not exists public.commute_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  option_id text,
  driver_name text not null,
  vehicle text,
  mode text,
  origin text,
  destination text,
  eta_min integer,
  price_rwf integer,
  pay_mode text not null default 'on-arrival' check (pay_mode in ('prepaid', 'on-arrival')),
  status text not null default 'requested' check (status in ('requested', 'accepted', 'arriving', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create index if not exists commute_requests_user_created_idx
  on public.commute_requests (user_id, created_at desc);

alter table public.commute_requests enable row level security;

drop policy if exists "Users can read their commute requests" on public.commute_requests;
create policy "Users can read their commute requests"
  on public.commute_requests for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their commute requests" on public.commute_requests;
create policy "Users can insert their commute requests"
  on public.commute_requests for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their commute requests" on public.commute_requests;
create policy "Users can update their commute requests"
  on public.commute_requests for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
