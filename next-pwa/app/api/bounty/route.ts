import { NextRequest, NextResponse } from 'next/server';
import { anonClient, getToken, getUserId } from '../_lib/sb';

const AGENT_URL = process.env.BOUNTY_AGENT_URL || process.env.EVERYDAY_AGENT_URL || '';
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY || '';
const GOOGLE_AI_MODEL = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';
const GOOGLE_GEMMA_MODEL = process.env.GOOGLE_GEMMA_MODEL || process.env.BOUNTY_GEMMA_MODEL || 'gemma-3-4b-it';
const QWEN_BASE_URL = process.env.QWEN_OPENAI_BASE_URL || process.env.LLM_OPENAI_BASE_URL || '';
const QWEN_MODEL = process.env.QWEN_OPENAI_MODEL || process.env.LLM_OPENAI_MODEL || 'Qwen/Qwen3-8B';
const QWEN_KEY = process.env.QWEN_OPENAI_KEY || process.env.LLM_OPENAI_KEY || 'sk-local';
const GEMMA_BASE_URL = process.env.GEMMA_OPENAI_BASE_URL || '';
const GEMMA_MODEL = process.env.GEMMA_OPENAI_MODEL || process.env.BOUNTY_GEMMA_MODEL || 'google/gemma-3-4b-it';
const GEMMA_KEY = process.env.GEMMA_OPENAI_KEY || 'sk-local';

type ChatMessage = { role: 'user' | 'assistant'; text: string };
type AiSkill = {
  id: string;
  skill_name: string;
  category: string;
  user_intents: string[];
  required_fields: string[];
  optional_fields: string[];
  minimum_follow_up_question: string;
  function_calls: string[];
  sample_responses: string[];
  safety_rules: string[];
  confirmation_required: boolean;
};
type ClarificationRule = {
  skill_name: string;
  required_fields: string[];
  priority_order: string[];
  max_questions: number;
  use_context_first: boolean;
  confirmation_required: boolean;
  example_questions: Record<string, string>;
};
type IntentExpansion = {
  primary_intent: string;
  goal: string;
  urgency: 'immediate' | 'today' | 'this_week' | 'future';
  constraints: string[];
  missing_information: string[];
  recommended_next_question: string;
  confidence: 'low' | 'medium' | 'high';
};

const BUILT_IN_SKILLS: AiSkill[] = [
  {
    id: 'commute_transport',
    skill_name: 'Commute / Moto / Transport',
    category: 'commute',
    user_intents: ['moto to Kimironko', 'go to town at 3pm', 'go from Remera to Kacyiru', 'book me a ride after work'],
    required_fields: ['from_location', 'to_location', 'time', 'transport_type'],
    optional_fields: ['urgency', 'budget_preference'],
    minimum_follow_up_question: 'Where are you starting from?',
    function_calls: ['get_current_location', 'search_route', 'estimate_transport_cost', 'prepare_commute', 'open_commute_confirmation'],
    sample_responses: ['Got it. To get you there on time, I need only one thing: where are you starting from?'],
    safety_rules: ['Never book a ride without confirmation.'],
    confirmation_required: true,
  },
  {
    id: 'shopping_shop',
    skill_name: 'Shopping / Shop',
    category: 'shop',
    user_intents: ['black shoes', 'dress for an event', 'groceries for this week', 'skincare products', 'gift for my mother'],
    required_fields: ['product_type', 'budget'],
    optional_fields: ['delivery_preference', 'size', 'color', 'brand', 'occasion', 'delivery_time'],
    minimum_follow_up_question: 'What budget should I use?',
    function_calls: ['search_products', 'search_stores', 'compare_products', 'prepare_cart', 'open_shop_confirmation'],
    sample_responses: ['I can help you find that. What budget should I stay within?'],
    safety_rules: ['Never place an order without confirmation.'],
    confirmation_required: true,
  },
  {
    id: 'payment_bills',
    skill_name: 'Payment / Send Money / Bills',
    category: 'pay',
    user_intents: ['pay rent', 'send 20000 to Eric', 'pay electricity', 'school fee payment', 'internet bill every month'],
    required_fields: ['amount', 'recipient', 'reason', 'date_time', 'payment_method'],
    optional_fields: ['recurring'],
    minimum_follow_up_question: 'Who should I send it to?',
    function_calls: ['find_contact', 'prepare_payment', 'schedule_payment', 'open_payment_confirmation'],
    sample_responses: ['I can prepare that payment. Who should receive the money?'],
    safety_rules: ['Never send money without explicit confirmation.'],
    confirmation_required: true,
  },
  {
    id: 'planning_tasks',
    skill_name: 'Planning / Daily Tasks',
    category: 'plan',
    user_intents: ['plan my day', 'meeting at 2 and errands after', 'organize tomorrow', 'plan for this week', 'finish work before Friday'],
    required_fields: ['task_list'],
    optional_fields: ['deadlines', 'priority', 'available_time', 'location'],
    minimum_follow_up_question: 'What are the main things you must finish?',
    function_calls: ['create_daily_plan', 'prioritize_tasks', 'create_calendar_blocks', 'save_plan', 'open_planning_page'],
    sample_responses: ['Tell me the main things you must finish today, and I will turn them into a simple schedule.'],
    safety_rules: ['Save plans only after the user accepts the structure.'],
    confirmation_required: false,
  },
  {
    id: 'food_delivery',
    skill_name: 'Food / Restaurants / Delivery',
    category: 'shop',
    user_intents: ['hungry', 'find me lunch', 'order food near me', 'cheap and fast', 'eat with friends'],
    required_fields: ['delivery_or_dine_in', 'location'],
    optional_fields: ['food_type', 'budget', 'number_of_people'],
    minimum_follow_up_question: 'Do you want delivery or dine-in?',
    function_calls: ['search_restaurants', 'search_delivery_options', 'prepare_food_order', 'open_food_confirmation'],
    sample_responses: ['Do you want delivery or a place to sit and eat?'],
    safety_rules: ['Never place a food order without confirmation.'],
    confirmation_required: true,
  },
  {
    id: 'savings_money_planning',
    skill_name: 'Savings / Money Planning',
    category: 'capital',
    user_intents: ['save 100k', 'save this month', 'create a savings plan', 'save for a laptop', 'borrow against my savings'],
    required_fields: ['goal_amount', 'timeline'],
    optional_fields: ['current_savings', 'monthly_income', 'safe_amount_to_save'],
    minimum_follow_up_question: 'When do you want to reach this goal?',
    function_calls: ['calculate_savings_plan', 'create_savings_goal', 'check_savings_balance', 'estimate_borrowing_limit'],
    sample_responses: ['Good goal. When do you want to reach it?'],
    safety_rules: ['Never move money without confirmation.'],
    confirmation_required: true,
  },
  {
    id: 'events_social',
    skill_name: 'Events / Social Activities',
    category: 'plan',
    user_intents: ['plan a birthday', 'something to do this weekend', 'place for a meeting', 'plan a date with friends', 'book an event space'],
    required_fields: ['event_type', 'people_count'],
    optional_fields: ['date_time', 'budget', 'location', 'mood_style'],
    minimum_follow_up_question: 'How many people is it for?',
    function_calls: ['search_events', 'search_venues', 'create_event_plan', 'prepare_booking_request'],
    sample_responses: ['Nice. How many people are you planning for?'],
    safety_rules: ['Never book a venue or event without confirmation.'],
    confirmation_required: true,
  },
  {
    id: 'documents_notes_reports',
    skill_name: 'Documents / Notes / Reports',
    category: 'plan',
    user_intents: ['turn this note into a plan', 'make this into a report', 'organize my journal', 'summarize my day', 'create a budget from this note'],
    required_fields: ['source_note', 'desired_format'],
    optional_fields: ['audience', 'deadline'],
    minimum_follow_up_question: 'What format do you want: plan, report, checklist, or summary?',
    function_calls: ['read_note', 'structure_note', 'create_document', 'save_document'],
    sample_responses: ['I can organize this. Should I turn it into a plan, report, checklist, or summary?'],
    safety_rules: ['Do not overwrite user notes without confirmation.'],
    confirmation_required: false,
  },
];

const KEYWORDS: Record<string, string[]> = {
  commute_transport: ['ride', 'moto', 'taxi', 'bus', 'walk', 'driver', 'traffic', 'airport', 'pickup', 'commute', 'route', 'kimironko', 'remera', 'kacyiru'],
  shopping_shop: ['shop', 'buy', 'shoes', 'dress', 'groceries', 'skincare', 'gift', 'product', 'store', 'market', 'electronics', 'pharmacy', 'boutique'],
  payment_bills: ['pay', 'send', 'transfer', 'bill', 'rent', 'electricity', 'school fee', 'internet', 'invoice', 'recipient'],
  planning_tasks: ['plan my day', 'organize', 'task', 'meeting', 'errand', 'deadline', 'schedule', 'tomorrow', 'week', 'finish'],
  food_delivery: ['hungry', 'lunch', 'dinner', 'food', 'restaurant', 'eat', 'delivery', 'dine', 'cheap and fast'],
  savings_money_planning: ['save', 'saving', 'savings', 'wallet', 'borrow', 'credit', 'goal', 'laptop', '100k'],
  events_social: ['birthday', 'event', 'weekend', 'venue', 'friends', 'date', 'book an event', 'meeting place', 'activity'],
  documents_notes_reports: ['note', 'report', 'journal', 'summarize', 'summary', 'checklist', 'document', 'budget from this'],
};

const BUILT_IN_CLARIFICATION_RULES: ClarificationRule[] = [
  {
    skill_name: 'commute',
    required_fields: ['destination', 'current_location', 'time', 'transport_preference'],
    priority_order: ['destination', 'current_location', 'time', 'transport_preference', 'budget'],
    max_questions: 1,
    use_context_first: true,
    confirmation_required: true,
    example_questions: {
      destination: 'Where are you going?',
      current_location: 'Where are you starting from?',
      time: 'Are you leaving now or later?',
      transport_preference: 'Do you prefer moto, taxi, bus, or walking?',
      budget: 'What budget should I keep in mind?',
    },
  },
  {
    skill_name: 'shopping',
    required_fields: ['item', 'budget'],
    priority_order: ['item', 'budget', 'size_specification', 'delivery_location', 'delivery_time'],
    max_questions: 1,
    use_context_first: true,
    confirmation_required: true,
    example_questions: {
      item: 'What item should I look for?',
      budget: 'What budget should I stay within?',
      size_specification: 'What size or style should I use?',
      delivery_location: 'Where should it be delivered?',
      delivery_time: 'When do you need it?',
    },
  },
  {
    skill_name: 'payment',
    required_fields: ['recipient', 'amount', 'reason'],
    priority_order: ['recipient', 'amount', 'reason', 'date', 'payment_method'],
    max_questions: 1,
    use_context_first: true,
    confirmation_required: true,
    example_questions: {
      recipient: 'Who should I send it to?',
      amount: 'How much should I send?',
      reason: 'What is it for?',
      date: 'When should this happen?',
      payment_method: 'Which payment method should I use?',
    },
  },
  {
    skill_name: 'food',
    required_fields: ['delivery_or_dine_in'],
    priority_order: ['delivery_or_dine_in', 'location', 'budget', 'food_preference'],
    max_questions: 1,
    use_context_first: true,
    confirmation_required: true,
    example_questions: {
      delivery_or_dine_in: 'Do you want delivery or a place nearby?',
      location: 'What location should I use?',
      budget: 'What budget should I stay within?',
      food_preference: 'What kind of food sounds good?',
    },
  },
  {
    skill_name: 'booking',
    required_fields: ['service_type', 'date', 'time'],
    priority_order: ['service_type', 'date', 'time', 'location', 'budget', 'number_of_people'],
    max_questions: 1,
    use_context_first: true,
    confirmation_required: true,
    example_questions: {
      service_type: 'What should I book?',
      date: 'What date should I use?',
      time: 'What time works?',
      location: 'What location should I search around?',
      budget: 'What budget should I stay within?',
      number_of_people: 'How many people is it for?',
    },
  },
  {
    skill_name: 'planning',
    required_fields: ['task_list'],
    priority_order: ['task_list', 'deadline', 'priority'],
    max_questions: 1,
    use_context_first: true,
    confirmation_required: false,
    example_questions: {
      task_list: 'What are the main 3 things you must finish today?',
      deadline: 'When does this need to be done?',
      priority: 'What matters most?',
    },
  },
  {
    skill_name: 'savings',
    required_fields: ['goal_amount', 'timeline'],
    priority_order: ['goal_amount', 'timeline', 'current_savings', 'monthly_budget'],
    max_questions: 1,
    use_context_first: true,
    confirmation_required: true,
    example_questions: {
      goal_amount: 'How much do you want to save?',
      timeline: 'When do you want to reach this goal?',
      current_savings: 'How much have you saved already?',
      monthly_budget: 'What monthly amount feels safe?',
    },
  },
];

function systemPrompt(skills: AiSkill[], rules: ClarificationRule[]) {
  const skillLines = skills.map((s) => {
    const calls = s.function_calls.slice(0, 5).join(', ');
    return `${s.skill_name}: category=${s.category}; required=${s.required_fields.join(', ')}; ask="${s.minimum_follow_up_question}"; calls=${calls}; confirmation=${s.confirmation_required}`;
  }).join('\n');
  const ruleLines = rules.map((r) => {
    return `${r.skill_name}: priority=${r.priority_order.join(' > ')}; max_questions=${r.max_questions}; use_context_first=${r.use_context_first}`;
  }).join('\n');
  return [
    "You are Bount, also called Bounty, the Everyday app assistant.",
    "Help users complete real-life tasks in the fewest safe steps.",
    "Before every skill, run the Intent Expansion Engine: identify primary intent, user goal, context, constraints, urgency, missing information, and confidence.",
    "Then run the Clarification Layer before calling any function.",
    "Use saved user context before asking. Never ask for information already known.",
    "Ask the smallest useful question. Never ask more than two questions unless the user is planning something complex.",
    "Understand intent, collect only the minimum missing information, call or prepare the correct function, and route to the right Everyday service.",
    "Do not give generic answers. Be specific, practical, short, calm, and action-oriented.",
    "For sensitive actions like payments, orders, bookings, rides, and schedules, prepare the action and require user confirmation before execution.",
    "Never claim money was moved, an order was placed, a booking was made, or a ride was booked.",
    `Clarification rules:\n${ruleLines}`,
    `Available skills:\n${skillLines}`,
  ].join('\n');
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function normalizeSkill(row: Record<string, unknown>): AiSkill {
  return {
    id: String(row.id || ''),
    skill_name: String(row.skill_name || ''),
    category: String(row.category || 'plan'),
    user_intents: normalizeStringArray(row.user_intents),
    required_fields: normalizeStringArray(row.required_fields),
    optional_fields: normalizeStringArray(row.optional_fields),
    minimum_follow_up_question: String(row.minimum_follow_up_question || 'What is the key detail I should use?'),
    function_calls: normalizeStringArray(row.function_calls),
    sample_responses: normalizeStringArray(row.sample_responses),
    safety_rules: normalizeStringArray(row.safety_rules),
    confirmation_required: Boolean(row.confirmation_required),
  };
}

function normalizeQuestions(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, val]) => {
    acc[key] = String(val);
    return acc;
  }, {});
}

function normalizeRule(row: Record<string, unknown>): ClarificationRule {
  return {
    skill_name: String(row.skill_name || ''),
    required_fields: normalizeStringArray(row.required_fields),
    priority_order: normalizeStringArray(row.priority_order),
    max_questions: Number(row.max_questions || 1),
    use_context_first: row.use_context_first !== false,
    confirmation_required: row.confirmation_required !== false,
    example_questions: normalizeQuestions(row.example_questions),
  };
}

async function loadSkillCatalog(): Promise<AiSkill[]> {
  try {
    const { data, error } = await anonClient()
      .from('ai_skills')
      .select('id,skill_name,category,user_intents,required_fields,optional_fields,minimum_follow_up_question,function_calls,sample_responses,safety_rules,confirmation_required')
      .order('category', { ascending: true });
    if (error || !data?.length) throw error || new Error('No AI skills found');
    return data.map((row) => normalizeSkill(row as Record<string, unknown>)).filter((skill) => skill.id);
  } catch {
    return BUILT_IN_SKILLS;
  }
}

async function loadClarificationRules(): Promise<ClarificationRule[]> {
  try {
    const { data, error } = await anonClient()
      .from('ai_clarification_rules')
      .select('skill_name,required_fields,priority_order,max_questions,use_context_first,confirmation_required,example_questions')
      .order('skill_name', { ascending: true });
    if (error || !data?.length) throw error || new Error('No AI clarification rules found');
    return data.map((row) => normalizeRule(row as Record<string, unknown>)).filter((rule) => rule.skill_name);
  } catch {
    return BUILT_IN_CLARIFICATION_RULES;
  }
}

function scoreSkill(skill: AiSkill, text: string) {
  const q = text.toLowerCase();
  let score = 0;
  for (const word of KEYWORDS[skill.id] || []) {
    if (q.includes(word)) score += word.includes(' ') ? 5 : 3;
  }
  for (const intent of skill.user_intents) {
    for (const token of intent.toLowerCase().split(/[^a-z0-9]+/).filter((part) => part.length > 3)) {
      if (q.includes(token)) score += 1;
    }
  }
  return score;
}

function selectSkill(text: string, skills: AiSkill[]) {
  const ranked = skills
    .map((skill) => ({ skill, score: scoreSkill(skill, text) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score > 0 ? ranked[0].skill : skills.find((s) => s.id === 'planning_tasks') || skills[0] || BUILT_IN_SKILLS[3];
}

function routeForSkill(skill: AiSkill) {
  if (skill.id === 'commute_transport') return 'commute';
  if (skill.id === 'payment_bills') return 'pay';
  if (skill.id === 'shopping_shop' || skill.id === 'food_delivery') return 'shop';
  if (skill.id === 'savings_money_planning') return 'capital';
  if (skill.id === 'documents_notes_reports' || skill.id === 'events_social' || skill.id === 'planning_tasks') return 'plan';
  if (skill.category === 'listen') return 'listen';
  if (skill.category === 'capital') return 'capital';
  if (['shop', 'pay', 'commute', 'plan'].includes(skill.category)) return skill.category;
  return 'plan';
}

function labelFor(route: string) {
  return route === 'capital' ? 'Save' : route.charAt(0).toUpperCase() + route.slice(1);
}

function ruleNameForSkill(skill: AiSkill) {
  if (skill.id === 'commute_transport') return 'commute';
  if (skill.id === 'shopping_shop') return 'shopping';
  if (skill.id === 'payment_bills') return 'payment';
  if (skill.id === 'food_delivery') return 'food';
  if (skill.id === 'events_social') return 'booking';
  if (skill.id === 'savings_money_planning') return 'savings';
  return 'planning';
}

function findRule(skill: AiSkill, rules: ClarificationRule[]) {
  const name = ruleNameForSkill(skill);
  return rules.find((rule) => rule.skill_name === name) || BUILT_IN_CLARIFICATION_RULES.find((rule) => rule.skill_name === name) || BUILT_IN_CLARIFICATION_RULES[5];
}

function canonicalField(field: string) {
  const aliases: Record<string, string> = {
    destination: 'to_location',
    current_location: 'from_location',
    transport_preference: 'transport_type',
    item: 'product_type',
    size_specification: 'size',
    delivery_location: 'location',
    delivery_time: 'date_time',
    date: 'date_time',
    food_preference: 'food_type',
    service_type: 'event_type',
    deadline: 'date_time',
    monthly_budget: 'budget',
  };
  return aliases[field] || field;
}

function getContextObject(context: unknown): Record<string, unknown> {
  return context && typeof context === 'object' && !Array.isArray(context) ? context as Record<string, unknown> : {};
}

function contextValueFor(field: string, context: unknown) {
  const ctx = getContextObject(context);
  const userContext = getContextObject(ctx.user_context || ctx.userContext || ctx.profile || ctx.saved_context);
  const all = { ...userContext, ...ctx };
  const candidates: Record<string, string[]> = {
    to_location: ['to_location', 'destination', 'likely_destination', 'default_destination', 'home_location', 'work_location'],
    from_location: ['from_location', 'current_location', 'currentLocation', 'pickup_location', 'work_location', 'home_location'],
    time: ['time', 'leave_time', 'departure_time', 'preferred_time'],
    transport_type: ['transport_type', 'transport_preference', 'preferred_transport'],
    product_type: ['product_type', 'item', 'last_item'],
    budget: ['budget', 'usual_budget', 'monthly_budget', 'shopping_budget'],
    size: ['size', 'shoe_size', 'clothing_size', 'preferred_size'],
    amount: ['amount', 'last_amount', 'rent_amount'],
    recipient: ['recipient', 'last_recipient', 'rent_recipient'],
    reason: ['reason', 'payment_reason', 'last_payment_reason'],
    date_time: ['date_time', 'date', 'deadline', 'due_date', 'next_due_date'],
    payment_method: ['payment_method', 'preferred_payment_method'],
    task_list: ['task_list', 'tasks', 'today_tasks'],
    delivery_or_dine_in: ['delivery_or_dine_in', 'food_mode', 'preferred_food_mode'],
    location: ['location', 'delivery_location', 'current_location', 'home_location', 'work_location'],
    goal_amount: ['goal_amount', 'savings_goal_amount'],
    timeline: ['timeline', 'goal_timeline'],
    event_type: ['event_type', 'service_type'],
    people_count: ['people_count', 'number_of_people'],
    source_note: ['source_note', 'note_id', 'selected_note'],
    desired_format: ['desired_format', 'format'],
  };
  const keys = candidates[canonicalField(field)] || [field, canonicalField(field)];
  for (const key of keys) {
    const value = all[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  if (canonicalField(field) === 'to_location' && Array.isArray(all.frequent_destinations) && all.frequent_destinations.length) {
    return all.frequent_destinations[0];
  }
  if (canonicalField(field) === 'recipient' && all.recurring_payments && typeof all.recurring_payments === 'object') {
    return all.recurring_payments;
  }
  return null;
}

function fieldPresent(field: string, ask: string, context: unknown = {}, useContextFirst = true) {
  const canonical = canonicalField(field);
  if (useContextFirst && contextValueFor(canonical, context)) return true;
  const q = ask.toLowerCase();
  const hasAmount = /(\d[\d,]*(\s?(rwf|frw|usd|k))?|\bcheap\b|\bbudget\b|\bunder\b|\bwithin\b)/.test(q);
  const checks: Record<string, RegExp> = {
    from_location: /\b(from|starting from|pickup|near me|my location|current location)\b/,
    to_location: /\b(to|toward|kimironko|town|kacyiru|airport|nyamirambo|remera|kigali)\b/,
    time: /\b(now|today|tomorrow|morning|afternoon|evening|tonight|after work|at\s?\d|before|friday|weekend)\b/,
    transport_type: /\b(moto|taxi|bus|walk|walking|car|ride)\b/,
    product_type: /\b(shoes?|dress|groceries|skincare|gift|electronics|pharmacy|supplies|outfit|food|lunch|dinner)\b/,
    budget: /(\d[\d,]*(\s?(rwf|frw|usd|k))?|\bcheap\b|\bbudget\b|\bunder\b|\bwithin\b)/,
    amount: /\d[\d,]*(\s?(rwf|frw|usd|k))?/,
    recipient: /\bto\s+[a-z][a-z'-]+\b/,
    reason: /\b(rent|bill|electricity|school fee|internet|invoice|food|gift|fees?)\b/,
    date_time: /\b(today|tomorrow|monthly|every month|at\s?\d|before|friday|weekend|after work)\b/,
    payment_method: /\b(wallet|mobile money|momo|card|cash|bank)\b/,
    task_list: /\b(meeting|errands?|finish|work|call|buy|pay|visit|deadline|tasks?)\b/,
    delivery_or_dine_in: /\b(delivery|deliver|dine|sit|eat there|restaurant|takeaway)\b/,
    location: /\b(near me|in\s+[a-z]+|kigali|remera|kacyiru|kimironko|nyamirambo|town)\b/,
    goal_amount: /\b(\d[\d,]*(\s?(rwf|frw|usd|k))?|laptop|goal)\b/,
    timeline: /\b(month|week|year|by|before|in\s+\d+|tomorrow|friday|soon)\b/,
    event_type: /\b(birthday|event|meeting|date|party|space|venue|activity)\b/,
    people_count: /\b(\d+\s?(people|friends|guests|persons)|for\s+\d+|with friends)\b/,
    source_note: /\b(this note|journal|my day|from this|attached|pasted)\b/,
    desired_format: /\b(plan|report|checklist|summary|budget|document)\b/,
  };
  if (canonical === 'budget' || canonical === 'amount' || canonical === 'goal_amount') return hasAmount;
  return checks[canonical]?.test(q) ?? true;
}

function requiredFieldsForFallback(skill: AiSkill, ask: string, rule: ClarificationRule) {
  const q = ask.toLowerCase();
  const prioritized = rule.priority_order.length ? rule.priority_order : rule.required_fields;
  if (skill.id === 'payment_bills') {
    const scheduled = /\b(schedule|remind|monthly|every month|tomorrow|at\s?\d|before|friday)\b/.test(q);
    const required = scheduled ? ['recipient', 'amount', 'reason', 'date'] : ['recipient', 'amount', 'reason'];
    return prioritized.filter((field) => required.includes(field));
  }
  if (skill.id === 'food_delivery') return prioritized.filter((field) => ['delivery_or_dine_in'].includes(field));
  if (skill.id === 'events_social') return prioritized.filter((field) => ['service_type', 'date', 'time'].includes(field));
  if (skill.id === 'planning_tasks') return prioritized.filter((field) => ['task_list'].includes(field));
  return prioritized.filter((field) => rule.required_fields.includes(field) || skill.required_fields.includes(canonicalField(field)));
}

function questionForField(skill: AiSkill, field: string, rule?: ClarificationRule) {
  if (rule?.example_questions?.[field]) return rule.example_questions[field];
  const questions: Record<string, string> = {
    from_location: 'Where are you starting from?',
    to_location: 'Where are you going?',
    time: 'When do you need it?',
    transport_type: 'What transport do you prefer: moto, taxi, bus, or walking?',
    product_type: 'What item should I look for?',
    budget: 'What budget should I use?',
    amount: 'How much should I use?',
    recipient: 'Who should I send it to?',
    date_time: 'When should this happen?',
    payment_method: 'Which payment method should I use?',
    task_list: 'What are the main things you must finish?',
    delivery_or_dine_in: 'Do you want delivery or dine-in?',
    location: 'What location should I use?',
    goal_amount: 'How much do you want to save?',
    timeline: 'When do you want to reach this goal?',
    event_type: 'What kind of event is it?',
    people_count: 'How many people is it for?',
    source_note: 'Which note should I use?',
    desired_format: 'What format do you want: plan, report, checklist, or summary?',
  };
  return questions[field] || skill.minimum_follow_up_question;
}

function missingFieldsFor(skill: AiSkill, ask: string, context: unknown, rule: ClarificationRule) {
  return requiredFieldsForFallback(skill, ask, rule).filter((field) => !fieldPresent(field, ask, context, rule.use_context_first));
}

function detectUrgency(ask: string): IntentExpansion['urgency'] {
  const q = ask.toLowerCase();
  if (/\b(now|asap|urgent|immediately|right now|emergency)\b/.test(q)) return 'immediate';
  if (/\b(today|tonight|this morning|this afternoon|after work)\b/.test(q)) return 'today';
  if (/\b(this week|weekend|friday|saturday|sunday)\b/.test(q)) return 'this_week';
  return 'future';
}

function detectConstraints(ask: string) {
  const q = ask.toLowerCase();
  const constraints: string[] = [];
  if (/\b(cheap|budget|under|within|stay within|afford)\b/.test(q)) constraints.push('budget');
  if (/\bfast|quick|now|urgent|before|on time|late\b/.test(q)) constraints.push('time');
  if (/\bsafe|trusted|verified|vetted\b/.test(q)) constraints.push('safety');
  if (/\bnear|close|nearby|distance\b/.test(q)) constraints.push('distance');
  return constraints;
}

function goalFor(skill: AiSkill, ask: string) {
  const q = ask.toLowerCase();
  if (skill.id === 'commute_transport') {
    if (/\bcheap|budget\b/.test(q)) return 'cheapest_transport';
    if (/\bfast|urgent|on time|late\b/.test(q)) return 'arrive_on_time';
    return 'reach_destination';
  }
  if (skill.id === 'payment_bills') return 'prepare_safe_payment';
  if (skill.id === 'shopping_shop') return 'find_best_item';
  if (skill.id === 'food_delivery') return 'find_food_option';
  if (skill.id === 'savings_money_planning') return 'build_money_plan';
  if (skill.id === 'events_social') return 'prepare_booking_or_event_plan';
  if (skill.id === 'documents_notes_reports') return 'organize_information';
  return 'create_clear_plan';
}

function primaryIntentFor(skill: AiSkill) {
  if (skill.id === 'commute_transport') return 'transport';
  if (skill.id === 'shopping_shop') return 'buy';
  if (skill.id === 'payment_bills') return 'pay';
  if (skill.id === 'food_delivery') return 'find';
  if (skill.id === 'savings_money_planning') return 'save';
  if (skill.id === 'events_social') return 'book';
  if (skill.id === 'documents_notes_reports') return 'organize';
  return 'plan';
}

function buildIntentExpansion(skill: AiSkill, missing: string[], question: string, ask: string): IntentExpansion {
  return {
    primary_intent: primaryIntentFor(skill),
    goal: goalFor(skill, ask),
    urgency: detectUrgency(ask),
    constraints: detectConstraints(ask),
    missing_information: missing,
    recommended_next_question: question,
    confidence: scoreSkill(skill, ask) > 5 ? 'high' : 'medium',
  };
}

function fallbackBounty(ask: string, skills: AiSkill[] = BUILT_IN_SKILLS, rules: ClarificationRule[] = BUILT_IN_CLARIFICATION_RULES, context: unknown = {}) {
  const skill = selectSkill(ask, skills);
  const rule = findRule(skill, rules);
  const route = routeForSkill(skill);
  const label = labelFor(route);
  const missingFields = missingFieldsFor(skill, ask, context, rule);
  const missing = missingFields[0];
  const missingQuestion = missing ? questionForField(skill, missing, rule) : '';
  const intent = buildIntentExpansion(skill, missingFields, missingQuestion, ask);
  const primaryCall = skill.function_calls.find((call) => call.startsWith('prepare_') || call.startsWith('create_') || call.startsWith('calculate_')) || skill.function_calls[0] || 'open_section';
  const plan = {
    goal: ask || 'Everyday task',
    skill: skill.skill_name,
    clarification: {
      rule: rule.skill_name,
      max_questions: rule.max_questions,
      use_context_first: rule.use_context_first,
      missing_fields: missingFields,
    },
    intent,
    steps: [
      {
        section: route === 'capital' ? 'save' : route,
        title: missing ? `Ask: ${missingQuestion}` : `Prepare in ${label}`,
        detail: missing ? 'Collect one missing detail before preparing the action.' : 'Use the connected service screen to review and confirm.',
      },
      { section: 'plan', title: 'Keep the context', detail: 'Save the decision or receipt in Plan so Bounty can use it later.' },
    ],
    note: skill.confirmation_required
      ? 'This stays at the confirmation boundary until you approve it.'
      : 'This can be drafted directly, then saved after you accept it.',
  };
  if (missing) {
    return {
      text: `Got it. I need one thing: ${missingQuestion} Then I will prepare the next step in ${label}.`,
      route,
      action: `Continue in ${label}`,
      calls: [{ name: 'clarify_missing_field', label: missingQuestion, args: { field: missing, skill_id: skill.id, rule: rule.skill_name, intent } }],
      plan,
      model: 'supabase-clarification-router',
    };
  }
  return {
    text: `I can prepare this in ${label}. I will summarize the details first, then you confirm before anything is sent, ordered, booked, or saved.`,
    route,
    action: `Open ${label}`,
    calls: [
      { name: primaryCall, label: primaryCall.replace(/_/g, ' '), args: { skill_id: skill.id, request: ask, intent } },
      { name: 'open_section', label: `Open ${label}`, args: { route } },
    ],
    plan,
    model: 'supabase-clarification-router',
  };
}

function normalizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-8).map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    const role = String(row.role || '').toLowerCase() === 'assistant' ? 'assistant' : 'user';
    const text = String(row.text || row.content || '').trim();
    return text ? { role, text } : null;
  }).filter(Boolean) as ChatMessage[];
}

function withModelText(ask: string, text: string, model: string, skills: AiSkill[], rules: ClarificationRule[], context: unknown) {
  const base = fallbackBounty(ask, skills, rules, context);
  return {
    ...base,
    text: text.trim(),
    model,
    voice: false,
  };
}

async function callGoogleModel(model: string, ask: string, history: ChatMessage[], context: unknown, prompt: string) {
  if (!GOOGLE_AI_KEY || !model) return null;
  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
    {
      role: 'user',
      parts: [{ text: `${ask}\n\nContext JSON:\n${JSON.stringify(context || {}).slice(0, 5000)}` }],
    },
  ];
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GOOGLE_AI_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: prompt }] },
      contents,
      generationConfig: { temperature: 0.35, maxOutputTokens: 420 },
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google AI Studio ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('').trim();
  return text || null;
}

async function callOpenAICompatible(baseUrl: string, model: string, key: string, ask: string, history: ChatMessage[], context: unknown, prompt: string) {
  if (!baseUrl || !model) return null;
  const messages = [
    { role: 'system', content: prompt },
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: `${ask}\n\nContext JSON:\n${JSON.stringify(context || {}).slice(0, 5000)}` },
  ];
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.35, stream: false }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${model} ${res.status}`);
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content || '').trim() || null;
}

async function generateBountyText(ask: string, history: ChatMessage[], context: unknown, skills: AiSkill[], rules: ClarificationRule[]) {
  const prompt = systemPrompt(skills, rules);
  const selectedSkill = selectSkill(ask, skills);
  const selectedRule = findRule(selectedSkill, rules);
  const missing = missingFieldsFor(selectedSkill, ask, context, selectedRule);
  const question = missing[0] ? questionForField(selectedSkill, missing[0], selectedRule) : '';
  const modelContext = {
    ...(typeof context === 'object' && context ? context : {}),
    intent_expansion: buildIntentExpansion(selectedSkill, missing, question, ask),
    ai_skills: skills,
    ai_clarification_rules: rules,
  };
  const attempts: Array<{ model: string; run: () => Promise<string | null> }> = [
    { model: GOOGLE_AI_MODEL, run: () => callGoogleModel(GOOGLE_AI_MODEL, ask, history, modelContext, prompt) },
    { model: QWEN_MODEL, run: () => callOpenAICompatible(QWEN_BASE_URL, QWEN_MODEL, QWEN_KEY, ask, history, modelContext, prompt) },
    { model: GOOGLE_GEMMA_MODEL, run: () => callGoogleModel(GOOGLE_GEMMA_MODEL, ask, history, modelContext, prompt) },
    { model: GEMMA_MODEL, run: () => callOpenAICompatible(GEMMA_BASE_URL, GEMMA_MODEL, GEMMA_KEY, ask, history, modelContext, prompt) },
  ];
  for (const attempt of attempts) {
    try {
      const text = await attempt.run();
      if (text) return { text, model: attempt.model };
    } catch {
      // Try the next configured model.
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  let body: { ask?: string; message?: string; history?: unknown[]; context?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const ask = String(body.ask || body.message || '').trim();
  if (!ask) return NextResponse.json({ error: 'ask required' }, { status: 400 });
  const history = normalizeHistory(body.history);
  const skills = await loadSkillCatalog();
  const rules = await loadClarificationRules();

  const token = getToken(req);
  let userId: string | null = null;
  try { userId = await getUserId(token); } catch {}

  if (AGENT_URL) {
    try {
      const res = await fetch(`${AGENT_URL.replace(/\/$/, '')}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: ask,
          history,
          context: { ...(body.context || {}), ai_skills: skills, ai_clarification_rules: rules },
          user_id: userId,
        }),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) return NextResponse.json(data);
    } catch {
      // Fall through to the deterministic router so Bounty remains usable.
    }
  }

  const generated = await generateBountyText(ask, history, body.context || {}, skills, rules);
  if (generated) return NextResponse.json(withModelText(ask, generated.text, generated.model, skills, rules, body.context || {}));

  return NextResponse.json(fallbackBounty(ask, skills, rules, body.context || {}));
}
