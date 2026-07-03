create table public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  emoji text,
  asset_key text,
  search_query text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.food_tags (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  tag text not null
);

create table public.roulette_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  emoji text,
  is_active boolean not null default true
);

create table public.roulette_group_foods (
  group_id uuid not null references public.roulette_groups(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  weight int not null default 1,
  primary key (group_id, food_id)
);

alter table public.foods enable row level security;
alter table public.food_tags enable row level security;
alter table public.roulette_groups enable row level security;
alter table public.roulette_group_foods enable row level security;

grant select on table public.foods to anon;
grant select on table public.food_tags to anon;
grant select on table public.roulette_groups to anon;
grant select on table public.roulette_group_foods to anon;

create policy "public read active foods"
on public.foods
for select
to anon
using (is_active = true);

create policy "public read food tags"
on public.food_tags
for select
to anon
using (true);

create policy "public read active roulette groups"
on public.roulette_groups
for select
to anon
using (is_active = true);

create policy "public read roulette group foods"
on public.roulette_group_foods
for select
to anon
using (true);
