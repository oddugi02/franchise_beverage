-- Supabase 대시보드 → SQL Editor → New query → 전체 붙여넣기 후 Run

-- 메뉴 요청 폼
create table if not exists public.menu_requests (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  menu_name text not null,
  note text,
  contact text,
  created_at timestamptz not null default now()
);

alter table public.menu_requests enable row level security;

drop policy if exists "menu_requests_insert_anon" on public.menu_requests;
create policy "menu_requests_insert_anon"
  on public.menu_requests for insert
  to anon, authenticated
  with check (true);

-- 조회수·좋아요
create table if not exists public.menu_stats (
  menu_id text primary key,
  views bigint not null default 0,
  likes bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.menu_stats enable row level security;

drop policy if exists "menu_stats_public_read" on public.menu_stats;
create policy "menu_stats_public_read"
  on public.menu_stats for select
  to anon, authenticated
  using (true);

create or replace function public.increment_menu_view(p_menu_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.menu_stats (menu_id, views, likes)
  values (p_menu_id, 1, 0)
  on conflict (menu_id) do update
    set views = public.menu_stats.views + 1,
        updated_at = now();
end;
$$;

create or replace function public.increment_menu_like(p_menu_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.menu_stats (menu_id, views, likes)
  values (p_menu_id, 0, 1)
  on conflict (menu_id) do update
    set likes = public.menu_stats.likes + 1,
        updated_at = now();
end;
$$;

create or replace function public.decrement_menu_like(p_menu_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.menu_stats
  set likes = greatest(0, likes - 1),
      updated_at = now()
  where menu_id = p_menu_id;
end;
$$;

grant execute on function public.increment_menu_view(text) to anon, authenticated;
grant execute on function public.increment_menu_like(text) to anon, authenticated;
grant execute on function public.decrement_menu_like(text) to anon, authenticated;

-- 네이버 쇼핑 최저가 캐시
create table if not exists public.shopping_prices (
  catalog_key text primary key,
  search_query text not null,
  buy_label text not null,
  product_title text,
  product_link text not null,
  pack_price integer not null,
  pack_units numeric,
  unit_kind text,
  unit_price numeric,
  mall_name text,
  updated_at timestamptz not null default now()
);

create index if not exists shopping_prices_updated_at_idx
  on public.shopping_prices (updated_at desc);

alter table public.shopping_prices enable row level security;

drop policy if exists "shopping_prices_public_read" on public.shopping_prices;
create policy "shopping_prices_public_read"
  on public.shopping_prices for select
  to anon, authenticated
  using (true);

grant select on public.shopping_prices to anon, authenticated;
