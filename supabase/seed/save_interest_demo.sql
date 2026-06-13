-- Verify 8% interest without waiting for the daily cron.
-- Run these in the Supabase SQL editor (service-role context).
--
-- simulate_interest_days(user_id, days) fast-forwards N days of daily accrual
-- and immediately pays the floored interest into savings as a transaction.
-- It is revoked from anon/authenticated, so it only runs here — never from the app.

-- 1. Find your user id (the account you signed in with on the app):
--    select id, email from auth.users order by created_at desc;

-- 2. Make sure that wallet has savings to earn on. Replace <USER_ID>:
--    update public.wallets set savings_rwf = 500000 where user_id = '<USER_ID>';

-- 3. Fast-forward 30 days of interest and pay out:
--    select public.simulate_interest_days('<USER_ID>', 30);
--    -- 500,000 RWF * 8% / 365 * 30 ≈ 3,287 RWF paid into savings.

-- 4. Confirm it landed:
--    select savings_rwf, accrued_interest_rwf from public.wallets where user_id = '<USER_ID>';
--    select title, amount_rwf, kind, happened_at from public.transactions
--      where user_id = '<USER_ID>' and kind = 'interest' order by happened_at desc;

-- The app's Save screen will show the new balance and the "Interest earned"
-- transaction after the store re-hydrates (reopen Save or pull to refresh).
