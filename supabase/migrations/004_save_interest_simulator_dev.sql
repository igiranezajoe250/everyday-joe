-- Dev-only helper to verify 8% interest without waiting for the daily cron.
-- Fast-forwards N days of accrual for one user and pays it out immediately.
-- Revoked from anon + authenticated, so it can only run from the SQL editor /
-- service-role context — never from a user session in production.
-- Usage: see supabase/seed/save_interest_demo.sql
create or replace function public.simulate_interest_days(p_user uuid, p_days int)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  w record;
  payout int;
begin
  update public.wallets
     set accrued_interest_rwf = accrued_interest_rwf
           + (savings_rwf::numeric * 0.08 / 365.0) * greatest(p_days, 1),
         last_accrual_on = current_date
   where user_id = p_user;

  select id, savings_rwf, accrued_interest_rwf
    into w
    from public.wallets
   where user_id = p_user
   limit 1;

  if w.id is null then
    return json_build_object('error', 'no wallet for user');
  end if;

  payout := floor(w.accrued_interest_rwf)::int;
  if payout >= 1 then
    insert into public.transactions
      (user_id, wallet_id, section, title, amount_rwf, direction, status, kind)
    values
      (p_user, w.id, 'save', 'Interest earned (simulated)', payout, 'in', 'completed', 'interest');
    update public.wallets
       set savings_rwf = savings_rwf + payout,
           accrued_interest_rwf = accrued_interest_rwf - payout
     where id = w.id;
  end if;

  return json_build_object(
    'days', greatest(p_days, 1),
    'paid_rwf', payout,
    'new_savings', (select savings_rwf from public.wallets where id = w.id)
  );
end;
$$;

revoke execute on function public.simulate_interest_days(uuid, int) from public, anon, authenticated;
