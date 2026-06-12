create table if not exists public.shops (
  id text primary key,
  name text not null,
  category text not null,
  city text default 'Kigali',
  trust_label text default 'verified',
  meta text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id text primary key,
  shop_id text references public.shops(id) on delete cascade,
  name text not null,
  category text not null,
  price_rwf integer not null,
  stock integer default 0,
  sold integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Everyday Wallet',
  balance_rwf integer not null default 0,
  savings_rwf integer not null default 0,
  credit_limit_rwf integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete set null,
  section text not null,
  title text not null,
  amount_rwf integer not null,
  direction text not null check (direction in ('in', 'out')),
  status text not null default 'completed',
  happened_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null,
  title text not null,
  detail text,
  created_at timestamptz default now()
);

create table if not exists public.commute_options (
  id text primary key,
  mode text not null,
  title text not null,
  route text not null,
  eta_min integer not null,
  price_rwf integer not null,
  trust_label text default 'vetted',
  created_at timestamptz default now()
);

create table if not exists public.listen_sources (
  id text primary key,
  name text not null,
  author text not null,
  description text,
  hue text default '#5B7CFA',
  created_at timestamptz default now()
);

create table if not exists public.listen_episodes (
  id text primary key,
  source_id text references public.listen_sources(id) on delete cascade,
  title text not null,
  minutes integer not null,
  published_label text,
  episode_type text default 'long',
  tag text,
  transcript jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.plan_folders (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'folder',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, id)
);

create table if not exists public.plan_files (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id text not null,
  title text default '',
  body text default '',
  attachments jsonb default '[]'::jsonb,
  voice jsonb default '[]'::jsonb,
  trashed boolean default false,
  updated bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, id)
);

create index if not exists plan_files_user_folder_idx on public.plan_files(user_id, folder_id);
create index if not exists transactions_user_time_idx on public.transactions(user_id, happened_at desc);
create index if not exists activity_events_user_time_idx on public.activity_events(user_id, created_at desc);

alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.activity_events enable row level security;
alter table public.commute_options enable row level security;
alter table public.listen_sources enable row level security;
alter table public.listen_episodes enable row level security;
alter table public.plan_folders enable row level security;
alter table public.plan_files enable row level security;

drop policy if exists "Catalog shops are readable" on public.shops;
create policy "Catalog shops are readable" on public.shops for select using (true);

drop policy if exists "Catalog products are readable" on public.products;
create policy "Catalog products are readable" on public.products for select using (true);

drop policy if exists "Catalog commute options are readable" on public.commute_options;
create policy "Catalog commute options are readable" on public.commute_options for select using (true);

drop policy if exists "Catalog listen sources are readable" on public.listen_sources;
create policy "Catalog listen sources are readable" on public.listen_sources for select using (true);

drop policy if exists "Catalog listen episodes are readable" on public.listen_episodes;
create policy "Catalog listen episodes are readable" on public.listen_episodes for select using (true);

drop policy if exists "Users can read their wallet" on public.wallets;
create policy "Users can read their wallet" on public.wallets for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their wallet" on public.wallets;
create policy "Users can insert their wallet" on public.wallets for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their wallet" on public.wallets;
create policy "Users can update their wallet" on public.wallets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can read their transactions" on public.transactions;
create policy "Users can read their transactions" on public.transactions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their transactions" on public.transactions;
create policy "Users can insert their transactions" on public.transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can read their activity" on public.activity_events;
create policy "Users can read their activity" on public.activity_events for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their activity" on public.activity_events;
create policy "Users can insert their activity" on public.activity_events for insert with check (auth.uid() = user_id);

drop policy if exists "Users can read their plan folders" on public.plan_folders;
create policy "Users can read their plan folders" on public.plan_folders for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their plan folders" on public.plan_folders;
create policy "Users can insert their plan folders" on public.plan_folders for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their plan folders" on public.plan_folders;
create policy "Users can update their plan folders" on public.plan_folders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their plan folders" on public.plan_folders;
create policy "Users can delete their plan folders" on public.plan_folders for delete using (auth.uid() = user_id);

drop policy if exists "Users can read their plan files" on public.plan_files;
create policy "Users can read their plan files" on public.plan_files for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their plan files" on public.plan_files;
create policy "Users can insert their plan files" on public.plan_files for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their plan files" on public.plan_files;
create policy "Users can update their plan files" on public.plan_files for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their plan files" on public.plan_files;
create policy "Users can delete their plan files" on public.plan_files for delete using (auth.uid() = user_id);

drop trigger if exists wallets_set_updated_at on public.wallets;
create trigger wallets_set_updated_at before update on public.wallets for each row execute function public.set_updated_at();
drop trigger if exists plan_folders_set_updated_at on public.plan_folders;
create trigger plan_folders_set_updated_at before update on public.plan_folders for each row execute function public.set_updated_at();
drop trigger if exists plan_files_set_updated_at on public.plan_files;
create trigger plan_files_set_updated_at before update on public.plan_files for each row execute function public.set_updated_at();

insert into public.shops (id, name, category, city, trust_label, meta) values
  ('house-of-tayo', 'House of Tayo', 'Women', 'Kigali', 'trusted', 'Fashion - local designer'),
  ('moshions', 'Moshions', 'Men', 'Kigali', 'verified', 'Premium tailoring'),
  ('haute-baso', 'Haute Baso', 'Women', 'Kigali', 'trusted', 'Modern Rwandan design'),
  ('rwanda-clothing', 'Rwanda Clothing', 'Unisex', 'Kigali', 'verified', 'Everyday apparel'),
  ('azizi-life', 'Azizi Life', 'Home decor', 'Kigali', 'vetted', 'Handmade home goods'),
  ('question-coffee', 'Question Coffee', 'Home decor', 'Kigali', 'verified', 'Coffee and gifts'),
  ('kimironko-market', 'Kigali Farmers Market', 'Home decor', 'Kigali', 'verified', 'Groceries and fresh goods')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  city = excluded.city,
  trust_label = excluded.trust_label,
  meta = excluded.meta;

insert into public.products (id, shop_id, name, category, price_rwf, stock, sold) values
  ('ankara-wrap-dress', 'house-of-tayo', 'Ankara Wrap Dress', 'Women', 14500, 12, 38),
  ('kitenge-headwrap', 'house-of-tayo', 'Kitenge Headwrap', 'Women', 4200, 3, 91),
  ('tailored-linen-shirt', 'moshions', 'Tailored Linen Shirt', 'Men', 28000, 8, 22),
  ('woven-basket-bag', 'azizi-life', 'Handwoven Basket Bag', 'Home decor', 18000, 0, 24),
  ('single-origin-coffee', 'question-coffee', 'Single Origin Coffee', 'Home decor', 6800, 19, 112)
on conflict (id) do update set
  shop_id = excluded.shop_id,
  name = excluded.name,
  category = excluded.category,
  price_rwf = excluded.price_rwf,
  stock = excluded.stock,
  sold = excluded.sold;

insert into public.commute_options (id, mode, title, route, eta_min, price_rwf, trust_label) values
  ('moto-kacyiru-town', 'Moto', 'Fast moto', 'Kacyiru to Kigali Heights', 12, 1800, 'vetted rider'),
  ('car-nyamirambo-town', 'Car', 'Comfort car', 'Nyamirambo to Kigali Heights', 22, 7500, 'verified driver'),
  ('shared-remere-town', 'Shared', 'Shared ride', 'Remera to city centre', 28, 3000, 'trusted route')
on conflict (id) do update set
  mode = excluded.mode,
  title = excluded.title,
  route = excluded.route,
  eta_min = excluded.eta_min,
  price_rwf = excluded.price_rwf,
  trust_label = excluded.trust_label;

insert into public.listen_sources (id, name, author, description, hue) values
  ('briefing', 'Everyday Briefing', 'EBC Studio', 'Your daily brief on Kigali in ten minutes.', '#5B7CFA'),
  ('business', 'Kigali Business', 'BK Media', 'Markets, founders, and money moves.', '#2FAE9B'),
  ('creator', 'Creator Talks', 'Studio Hill', 'Conversations with people who build.', '#A37BF2'),
  ('money', 'Money Habits', 'Everyday', 'Small habits that compound.', '#E2941F')
on conflict (id) do update set
  name = excluded.name,
  author = excluded.author,
  description = excluded.description,
  hue = excluded.hue;

insert into public.listen_episodes (id, source_id, title, minutes, published_label, episode_type, tag, transcript) values
  ('b1', 'briefing', 'Morning in Kigali', 12, 'Jun 11', 'long', 'new', '["Traffic is light toward Kacyiru.", "Markets open early around Kimironko."]'::jsonb),
  ('k1', 'business', 'Retail moves this week', 22, 'Jun 11', 'long', 'new', '["Local retail is moving toward trusted delivery.", "Inventory discipline is becoming important."]'::jsonb),
  ('c1', 'creator', 'Building a loyal audience', 34, 'Jun 10', 'long', 'popular', '["Consistency matters more than posting volume.", "A small community can compound."]'::jsonb),
  ('m1', 'money', 'Small savings that compound', 16, 'Jun 11', 'long', 'highlighted', '["A weekly saving habit lowers stress.", "Goals should be visible and simple."]'::jsonb)
on conflict (id) do update set
  source_id = excluded.source_id,
  title = excluded.title,
  minutes = excluded.minutes,
  published_label = excluded.published_label,
  episode_type = excluded.episode_type,
  tag = excluded.tag,
  transcript = excluded.transcript;
