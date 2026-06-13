-- Save section: goals, recurring schedules, agent propose-confirm boundary,
-- and the 8% interest engine (daily accrual, monthly payout).
-- Builds on 002 (wallets, transactions). RLS mirrors the existing pattern.

-- ── Interest accounting on the wallet ─────────────────────────────────────────
-- accrued_interest_rwf holds interest earned-but-not-yet-paid (cents-free, RWF
-- has no minor unit). We keep it as a numeric so daily fractions don't vanish;
-- payout floors to whole RWF when it lands as a transaction.
alter table public.wallets
  add column if not exists accrued_interest_rwf numeric(14,4) not null default 0,
  add column if not exists last_accrual_on date;

-- Tag transactions so interest credits are distinguishable from deposits.
alter table public.transactions
  add column if not exists kind text not null default 'deposit';

-- ── Savings goals ─────────────────────────────────────────────────────────────
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  target_rwf integer not null check (target_rwf > 0),
  saved_rwf integer not null default 0,
  deadline date,
  status text not null default 'active' check (status in ('active','reached','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Recurring savings schedules ───────────────────────────────────────────────
create table if not exists public.savings_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.savings_goals(id) on delete set null,
  amount_rwf integer not null check (amount_rwf > 0),
  cadence text not null check (cadence in ('daily','weekly','monthly')),
  next_run_on date not null,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Agent proposals (the propose → user-confirm boundary) ─────────────────────
-- The Save expert never moves money directly. It writes a pending proposal here;
-- the frontend renders a confirm button; Go executes only on confirm.
create table if not exists public.agent_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null default 'save',
  kind text not null check (kind in ('deposit','schedule','goal')),
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','expired')),
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '24 hours'
);

create index if not exists savings_goals_user_idx on public.savings_goals(user_id, status);
create index if not exists savings_schedules_due_idx on public.savings_schedules(active, next_run_on);
create index if not exists agent_proposals_user_idx on public.agent_proposals(user_id, status, created_at desc);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.savings_goals enable row level security;
alter table public.savings_schedules enable row level security;
alter table public.agent_proposals enable row level security;

drop policy if exists "own savings goals" on public.savings_goals;
create policy "own savings goals" on public.savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own savings schedules" on public.savings_schedules;
create policy "own savings schedules" on public.savings_schedules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own agent proposals" on public.agent_proposals;
create policy "own agent proposals" on public.agent_proposals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists savings_goals_set_updated_at on public.savings_goals;
create trigger savings_goals_set_updated_at before update on public.savings_goals
  for each row execute function public.set_updated_at();
drop trigger if exists savings_schedules_set_updated_at on public.savings_schedules;
create trigger savings_schedules_set_updated_at before update on public.savings_schedules
  for each row execute function public.set_updated_at();

-- ── Interest engine ───────────────────────────────────────────────────────────
-- These run as SECURITY DEFINER so a single daily cron (service role) can sweep
-- every wallet. They are NOT user-callable via RLS; only the cron invokes them.

-- Daily accrual: add balance * 8%/365 to accrued_interest for each wallet, once
-- per calendar day. Idempotent — re-running the same day is a no-op.
create or replace function public.accrue_daily_interest()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  touched integer;
begin
  update public.wallets
     set accrued_interest_rwf = accrued_interest_rwf
           + (savings_rwf::numeric * 0.08 / 365.0),
         last_accrual_on = current_date
   where coalesce(last_accrual_on, date '1970-01-01') < current_date
     and savings_rwf > 0;
  get diagnostics touched = row_count;
  return touched;
end;
$$;

-- Monthly payout: floor accrued interest into the savings balance as a
-- transaction, and keep the fractional remainder accruing.
create or replace function public.pay_monthly_interest()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  payout integer;
  paid integer := 0;
begin
  for r in select id, user_id, accrued_interest_rwf from public.wallets
           where accrued_interest_rwf >= 1
  loop
    payout := floor(r.accrued_interest_rwf)::integer;
    insert into public.transactions
      (user_id, wallet_id, section, title, amount_rwf, direction, status, kind)
    values
      (r.user_id, r.id, 'save', 'Interest earned (8% p.a.)', payout, 'in', 'completed', 'interest');
    update public.wallets
       set savings_rwf = savings_rwf + payout,
           accrued_interest_rwf = accrued_interest_rwf - payout
     where id = r.id;
    paid := paid + 1;
  end loop;
  return paid;
end;
$$;
