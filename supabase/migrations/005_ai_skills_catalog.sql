-- Bounty skill catalog: hard-coded product knowledge for routing user requests
-- into the correct Everyday service, asking the minimum missing question, and
-- stopping at the confirmation boundary for sensitive actions.

create table if not exists public.ai_skills (
  id text primary key,
  skill_name text not null,
  category text not null,
  user_intents jsonb not null default '[]'::jsonb,
  required_fields jsonb not null default '[]'::jsonb,
  optional_fields jsonb not null default '[]'::jsonb,
  minimum_follow_up_question text not null,
  function_calls jsonb not null default '[]'::jsonb,
  sample_responses jsonb not null default '[]'::jsonb,
  safety_rules jsonb not null default '[]'::jsonb,
  confirmation_required boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.ai_functions (
  id text primary key,
  function_name text not null,
  skill_id text not null references public.ai_skills(id) on delete cascade,
  description text not null,
  input_schema jsonb not null default '{}'::jsonb,
  output_schema jsonb not null default '{}'::jsonb,
  requires_confirmation boolean not null default true,
  connected_service text not null,
  created_at timestamptz default now()
);

create table if not exists public.ai_user_journeys (
  id text primary key,
  journey_name text not null,
  skill_id text not null references public.ai_skills(id) on delete cascade,
  trigger_examples jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  missing_info_strategy text not null,
  success_response text not null,
  fallback_response text not null,
  created_at timestamptz default now()
);

create table if not exists public.ai_response_templates (
  id text primary key,
  skill_id text not null references public.ai_skills(id) on delete cascade,
  intent text not null,
  template text not null,
  tone text not null default 'calm, direct, minimal',
  required_variables jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists ai_functions_skill_idx on public.ai_functions(skill_id);
create index if not exists ai_user_journeys_skill_idx on public.ai_user_journeys(skill_id);
create index if not exists ai_response_templates_skill_idx on public.ai_response_templates(skill_id);

alter table public.ai_skills enable row level security;
alter table public.ai_functions enable row level security;
alter table public.ai_user_journeys enable row level security;
alter table public.ai_response_templates enable row level security;

drop policy if exists "AI skills are readable" on public.ai_skills;
create policy "AI skills are readable" on public.ai_skills for select using (true);

drop policy if exists "AI functions are readable" on public.ai_functions;
create policy "AI functions are readable" on public.ai_functions for select using (true);

drop policy if exists "AI user journeys are readable" on public.ai_user_journeys;
create policy "AI user journeys are readable" on public.ai_user_journeys for select using (true);

drop policy if exists "AI response templates are readable" on public.ai_response_templates;
create policy "AI response templates are readable" on public.ai_response_templates for select using (true);

insert into public.ai_skills
  (id, skill_name, category, user_intents, required_fields, optional_fields, minimum_follow_up_question, function_calls, sample_responses, safety_rules, confirmation_required)
values
  (
    'commute_transport',
    'Commute / Moto / Transport',
    'commute',
    '["I want a moto to Kimironko.","I need to go to town at 3pm.","How should I go from Remera to Kacyiru?","Book me a ride after work."]'::jsonb,
    '["from_location","to_location","time","transport_type"]'::jsonb,
    '["urgency","budget_preference"]'::jsonb,
    'Where are you starting from?',
    '["get_current_location","search_route","estimate_transport_cost","prepare_commute","open_commute_confirmation"]'::jsonb,
    '["Got it. To get you there on time, I need only one thing: where are you starting from? After that, I will suggest the best option and prepare the ride details."]'::jsonb,
    '["Never book a ride without confirmation.","Show route, estimated cost, time, and pickup before confirmation."]'::jsonb,
    true
  ),
  (
    'shopping_shop',
    'Shopping / Shop',
    'shop',
    '["I need black shoes.","Find me a dress for an event.","Buy groceries for this week.","Where can I get skincare products?","I need a gift for my mother."]'::jsonb,
    '["product_type","budget"]'::jsonb,
    '["delivery_preference","size","color","brand","occasion","delivery_time"]'::jsonb,
    'What budget should I use?',
    '["search_products","search_stores","compare_products","prepare_cart","open_shop_confirmation","check_delivery_options"]'::jsonb,
    '["I can help you find that. What budget should I stay within? Then I will suggest a few good options and prepare the order for you."]'::jsonb,
    '["Never place an order without confirmation.","Show item, vendor, delivery option, and total before confirmation."]'::jsonb,
    true
  ),
  (
    'payment_bills',
    'Payment / Send Money / Bills',
    'pay',
    '["Pay rent.","Send 20,000 to Eric.","Remind me to pay electricity.","Schedule my school fee payment.","Pay my internet bill every month."]'::jsonb,
    '["amount","recipient","reason","date_time","payment_method"]'::jsonb,
    '["recurring"]'::jsonb,
    'Who should I send it to?',
    '["find_contact","prepare_payment","schedule_payment","open_payment_confirmation","create_payment_reminder"]'::jsonb,
    '["I can prepare that payment. Who should receive the money? I will format the payment details and ask you to confirm before anything is sent."]'::jsonb,
    '["Never send money without explicit confirmation.","Show amount, recipient, reason, date, and method before confirmation."]'::jsonb,
    true
  ),
  (
    'planning_tasks',
    'Planning / Daily Tasks',
    'plan',
    '["Plan my day.","I have a meeting at 2 and errands after.","Help me organize tomorrow.","Make a plan for this week.","I need to finish my work before Friday."]'::jsonb,
    '["task_list"]'::jsonb,
    '["deadlines","priority","available_time","location"]'::jsonb,
    'What are the main things you must finish?',
    '["create_daily_plan","prioritize_tasks","create_calendar_blocks","save_plan","open_planning_page"]'::jsonb,
    '["Sure. Tell me the main things you must finish today, and I will turn them into a simple schedule with priorities."]'::jsonb,
    '["Save plans only after the user accepts the structure.","Keep plans short, realistic, and editable."]'::jsonb,
    false
  ),
  (
    'food_delivery',
    'Food / Restaurants / Delivery',
    'shop',
    '["I am hungry.","Find me lunch.","Order food near me.","I want something cheap and fast.","Where can I eat with friends?"]'::jsonb,
    '["delivery_or_dine_in","location"]'::jsonb,
    '["food_type","budget","number_of_people"]'::jsonb,
    'Do you want delivery or dine-in?',
    '["search_restaurants","search_delivery_options","prepare_food_order","open_food_confirmation"]'::jsonb,
    '["Do you want delivery or a place to sit and eat? I will suggest the best nearby options based on that."]'::jsonb,
    '["Never place a food order without confirmation.","Show restaurant, items, delivery or route, and total before confirmation."]'::jsonb,
    true
  ),
  (
    'savings_money_planning',
    'Savings / Money Planning',
    'capital',
    '["Help me save 100k.","How much should I save this month?","Create a savings plan.","I want to save for a laptop.","Can I borrow against my savings?"]'::jsonb,
    '["goal_amount","timeline"]'::jsonb,
    '["current_savings","monthly_income","safe_amount_to_save"]'::jsonb,
    'When do you want to reach this goal?',
    '["calculate_savings_plan","create_savings_goal","check_savings_balance","estimate_borrowing_limit","open_savings_confirmation"]'::jsonb,
    '["Good goal. When do you want to reach it? I will break it into a simple monthly or weekly saving plan."]'::jsonb,
    '["Never move money without confirmation.","Separate advice from confirmed savings actions."]'::jsonb,
    true
  ),
  (
    'events_social',
    'Events / Social Activities',
    'plan',
    '["Plan a birthday.","Find something to do this weekend.","I need a place for a meeting.","Help me plan a date with friends.","Book an event space."]'::jsonb,
    '["event_type","people_count"]'::jsonb,
    '["date_time","budget","location","mood_style"]'::jsonb,
    'How many people is it for?',
    '["search_events","search_venues","create_event_plan","prepare_booking_request","open_event_confirmation"]'::jsonb,
    '["Nice. How many people are you planning for? I will suggest places and a simple plan that fits the group."]'::jsonb,
    '["Never book a venue or event without confirmation.","Show people count, venue, date, budget, and booking terms before confirmation."]'::jsonb,
    true
  ),
  (
    'documents_notes_reports',
    'Documents / Notes / Reports',
    'plan',
    '["Turn this note into a plan.","Make this into a report.","Organize my journal.","Summarize my day.","Create a budget from this note."]'::jsonb,
    '["source_note","desired_format"]'::jsonb,
    '["audience","deadline"]'::jsonb,
    'What format do you want: plan, report, checklist, or summary?',
    '["read_note","structure_note","create_document","save_document","open_document_editor"]'::jsonb,
    '["I can organize this. Should I turn it into a plan, report, checklist, or summary?"]'::jsonb,
    '["Do not overwrite user notes without confirmation.","Keep source content traceable to the original note."]'::jsonb,
    false
  )
on conflict (id) do update set
  skill_name = excluded.skill_name,
  category = excluded.category,
  user_intents = excluded.user_intents,
  required_fields = excluded.required_fields,
  optional_fields = excluded.optional_fields,
  minimum_follow_up_question = excluded.minimum_follow_up_question,
  function_calls = excluded.function_calls,
  sample_responses = excluded.sample_responses,
  safety_rules = excluded.safety_rules,
  confirmation_required = excluded.confirmation_required;

insert into public.ai_functions
  (id, function_name, skill_id, description, input_schema, output_schema, requires_confirmation, connected_service)
values
  ('commute_prepare', 'prepare_commute', 'commute_transport', 'Prepare route, mode, pickup, ETA, and cost for confirmation.', '{"from_location":"text","to_location":"text","time":"text","transport_type":"text"}'::jsonb, '{"summary":"text","requires_confirmation":"boolean"}'::jsonb, true, 'commute'),
  ('commute_open', 'open_commute_confirmation', 'commute_transport', 'Open the commute confirmation flow.', '{"prepared_commute_id":"text"}'::jsonb, '{"route":"commute"}'::jsonb, true, 'commute'),
  ('shop_search', 'search_products', 'shopping_shop', 'Search trusted products and shops.', '{"query":"text","filters":"object"}'::jsonb, '{"products":"array"}'::jsonb, false, 'shop'),
  ('shop_prepare_cart', 'prepare_cart', 'shopping_shop', 'Prepare a cart for user confirmation.', '{"items":"array"}'::jsonb, '{"cart_summary":"text","requires_confirmation":"boolean"}'::jsonb, true, 'shop'),
  ('pay_prepare', 'prepare_payment', 'payment_bills', 'Prepare payment details before confirmation.', '{"amount":"number","recipient":"text","reason":"text"}'::jsonb, '{"payment_summary":"text","requires_confirmation":"boolean"}'::jsonb, true, 'pay'),
  ('pay_schedule', 'schedule_payment', 'payment_bills', 'Prepare a scheduled payment before confirmation.', '{"amount":"number","recipient":"text","date":"text","repeat":"text"}'::jsonb, '{"schedule_summary":"text","requires_confirmation":"boolean"}'::jsonb, true, 'pay'),
  ('plan_create', 'create_daily_plan', 'planning_tasks', 'Turn tasks into a simple prioritized plan.', '{"tasks":"array","date":"text"}'::jsonb, '{"plan":"array"}'::jsonb, false, 'plan'),
  ('food_search', 'search_restaurants', 'food_delivery', 'Find nearby restaurants or delivery options.', '{"location":"text","food_type":"text"}'::jsonb, '{"restaurants":"array"}'::jsonb, false, 'shop'),
  ('food_prepare_order', 'prepare_food_order', 'food_delivery', 'Prepare food order for confirmation.', '{"items":"array","restaurant_id":"text"}'::jsonb, '{"order_summary":"text","requires_confirmation":"boolean"}'::jsonb, true, 'shop'),
  ('save_calculate', 'calculate_savings_plan', 'savings_money_planning', 'Calculate weekly or monthly saving amount.', '{"goal_amount":"number","timeline":"text"}'::jsonb, '{"cadence":"text","amount_rwf":"number"}'::jsonb, false, 'capital'),
  ('save_create_goal', 'create_savings_goal', 'savings_money_planning', 'Prepare a savings goal for confirmation.', '{"goal":"text","amount":"number","timeline":"text"}'::jsonb, '{"goal_summary":"text","requires_confirmation":"boolean"}'::jsonb, true, 'capital'),
  ('events_search_venues', 'search_venues', 'events_social', 'Search venues that fit the group and budget.', '{"event_type":"text","people_count":"number","budget":"number"}'::jsonb, '{"venues":"array"}'::jsonb, false, 'plan'),
  ('events_prepare_booking', 'prepare_booking_request', 'events_social', 'Prepare an event booking request for confirmation.', '{"venue_id":"text","date_time":"text","people_count":"number"}'::jsonb, '{"booking_summary":"text","requires_confirmation":"boolean"}'::jsonb, true, 'plan'),
  ('docs_structure', 'structure_note', 'documents_notes_reports', 'Transform a note into the requested format.', '{"content":"text","format":"text"}'::jsonb, '{"document":"object"}'::jsonb, false, 'plan'),
  ('docs_save', 'save_document', 'documents_notes_reports', 'Save a generated document after user acceptance.', '{"title":"text","content":"text"}'::jsonb, '{"document_id":"text"}'::jsonb, true, 'plan')
on conflict (id) do update set
  function_name = excluded.function_name,
  skill_id = excluded.skill_id,
  description = excluded.description,
  input_schema = excluded.input_schema,
  output_schema = excluded.output_schema,
  requires_confirmation = excluded.requires_confirmation,
  connected_service = excluded.connected_service;

insert into public.ai_user_journeys
  (id, journey_name, skill_id, trigger_examples, steps, missing_info_strategy, success_response, fallback_response)
select
  id || '_journey',
  skill_name || ' Journey',
  id,
  user_intents,
  case id
    when 'commute_transport' then '["Extract destination and time.","Ask only for missing starting location.","Estimate route and transport options.","Prepare ride details.","Open commute confirmation after user confirms."]'::jsonb
    when 'shopping_shop' then '["Identify product category.","Ask for budget if missing.","Search trusted stores and products.","Compare the best options.","Prepare cart for confirmation."]'::jsonb
    when 'payment_bills' then '["Extract amount, recipient, date, and reason.","Ask only for the missing sensitive detail.","Prepare a payment summary.","Open payment confirmation before money moves."]'::jsonb
    when 'planning_tasks' then '["Gather the key tasks.","Order by urgency.","Create time blocks.","Save the plan after acceptance."]'::jsonb
    when 'food_delivery' then '["Ask delivery or dine-in.","Filter by location and budget.","Suggest the best options.","Prepare order or route for confirmation."]'::jsonb
    when 'savings_money_planning' then '["Extract saving goal.","Ask for timeline.","Calculate weekly or monthly amount.","Prepare savings goal confirmation."]'::jsonb
    when 'events_social' then '["Identify event type.","Ask people count.","Suggest places or activities.","Prepare booking plan for confirmation."]'::jsonb
    else '["Read the note.","Ask for target format.","Structure the content.","Save or open editor after acceptance."]'::jsonb
  end,
  'Ask one precise question for the highest-impact missing field, then move to a prepared action.',
  'Prepared. Review the summary, then confirm in Everyday before anything is executed.',
  'I can help with that. I need one detail first so I can prepare the right next step.'
from public.ai_skills
where id in (
  'commute_transport',
  'shopping_shop',
  'payment_bills',
  'planning_tasks',
  'food_delivery',
  'savings_money_planning',
  'events_social',
  'documents_notes_reports'
)
on conflict (id) do update set
  journey_name = excluded.journey_name,
  skill_id = excluded.skill_id,
  trigger_examples = excluded.trigger_examples,
  steps = excluded.steps,
  missing_info_strategy = excluded.missing_info_strategy,
  success_response = excluded.success_response,
  fallback_response = excluded.fallback_response;

insert into public.ai_response_templates
  (id, skill_id, intent, template, tone, required_variables)
select
  id || '_minimum_question',
  id,
  'minimum_missing_information',
  minimum_follow_up_question,
  'calm, direct, minimal',
  required_fields
from public.ai_skills
where id in (
  'commute_transport',
  'shopping_shop',
  'payment_bills',
  'planning_tasks',
  'food_delivery',
  'savings_money_planning',
  'events_social',
  'documents_notes_reports'
)
on conflict (id) do update set
  skill_id = excluded.skill_id,
  intent = excluded.intent,
  template = excluded.template,
  tone = excluded.tone,
  required_variables = excluded.required_variables;
