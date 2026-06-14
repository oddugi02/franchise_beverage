-- Supabase SQL Editor에서 실행하세요.
-- 네이버 쇼핑 최저가 캐시 (scripts/update-naver-prices.js 또는 server API로 갱신)

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

-- 프론트(anon) 읽기 전용
create policy "shopping_prices_public_read"
  on public.shopping_prices for select
  to anon, authenticated
  using (true);

-- 쓰기는 service_role 키(server/CI)만 — 별도 insert/update policy 없음

grant select on public.shopping_prices to anon, authenticated;
