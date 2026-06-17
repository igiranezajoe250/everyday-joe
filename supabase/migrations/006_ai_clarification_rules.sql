-- Bounty clarification layer. This runs before skill functions so Bounty asks
-- the smallest useful question, checks context first, and only prepares actions
-- once required details are complete.

create table if not exists public.ai_clarification_rules (
  id uuid primary key default gen_random_uuid(),
  skill_name text not null unique,
  required_fields jsonb not null,
  priority_order jsonb not null,
  max_questions integer not null default 1,
  use_context_first boolean not null default true,
  confirmation_required boolean not null default true,
  example_questions jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.ai_clarification_rules enable row level security;

drop policy if exists "AI clarification rules are readable" on public.ai_clarification_rules;
create policy "AI clarification rules are readable"
on public.ai_clarification_rules
for select
using (true);

insert into public.ai_clarification_rules
  (skill_name, required_fields, priority_order, max_questions, use_context_first, confirmation_required, example_questions)
values
  (
    'commute',
    '["destination","current_location","time","transport_preference"]'::jsonb,
    '["destination","current_location","time","transport_preference","budget"]'::jsonb,
    1,
    true,
    true,
    '{
      "destination": "Where are you going?",
      "current_location": "Where are you starting from?",
      "time": "Are you leaving now or later?",
      "transport_preference": "Do you prefer moto, taxi, bus, or walking?",
      "budget": "What budget should I keep in mind?"
    }'::jsonb
  ),
  (
    'shopping',
    '["item","budget"]'::jsonb,
    '["item","budget","size_specification","delivery_location","delivery_time"]'::jsonb,
    1,
    true,
    true,
    '{
      "item": "What item should I look for?",
      "budget": "What budget should I stay within?",
      "size_specification": "What size or style should I use?",
      "delivery_location": "Where should it be delivered?",
      "delivery_time": "When do you need it?"
    }'::jsonb
  ),
  (
    'payment',
    '["recipient","amount","reason"]'::jsonb,
    '["recipient","amount","reason","date","payment_method"]'::jsonb,
    1,
    true,
    true,
    '{
      "recipient": "Who should I send it to?",
      "amount": "How much should I send?",
      "reason": "What is it for?",
      "date": "When should this happen?",
      "payment_method": "Which payment method should I use?"
    }'::jsonb
  ),
  (
    'food',
    '["delivery_or_dine_in"]'::jsonb,
    '["delivery_or_dine_in","location","budget","food_preference"]'::jsonb,
    1,
    true,
    true,
    '{
      "delivery_or_dine_in": "Do you want delivery or a place nearby?",
      "location": "What location should I use?",
      "budget": "What budget should I stay within?",
      "food_preference": "What kind of food sounds good?"
    }'::jsonb
  ),
  (
    'booking',
    '["service_type","date","time"]'::jsonb,
    '["service_type","date","time","location","budget","number_of_people"]'::jsonb,
    1,
    true,
    true,
    '{
      "service_type": "What should I book?",
      "date": "What date should I use?",
      "time": "What time works?",
      "location": "What location should I search around?",
      "budget": "What budget should I stay within?",
      "number_of_people": "How many people is it for?"
    }'::jsonb
  ),
  (
    'planning',
    '["task_list"]'::jsonb,
    '["task_list","deadline","priority"]'::jsonb,
    1,
    true,
    false,
    '{
      "task_list": "What are the main 3 things you must finish today?",
      "deadline": "When does this need to be done?",
      "priority": "What matters most?"
    }'::jsonb
  ),
  (
    'savings',
    '["goal_amount","timeline"]'::jsonb,
    '["goal_amount","timeline","current_savings","monthly_budget"]'::jsonb,
    1,
    true,
    true,
    '{
      "goal_amount": "How much do you want to save?",
      "timeline": "When do you want to reach this goal?",
      "current_savings": "How much have you saved already?",
      "monthly_budget": "What monthly amount feels safe?"
    }'::jsonb
  )
on conflict (skill_name) do update set
  required_fields = excluded.required_fields,
  priority_order = excluded.priority_order,
  max_questions = excluded.max_questions,
  use_context_first = excluded.use_context_first,
  confirmation_required = excluded.confirmation_required,
  example_questions = excluded.example_questions;
