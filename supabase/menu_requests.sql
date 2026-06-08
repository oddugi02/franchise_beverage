-- Supabase SQL Editor에서 실행하세요.
-- config.js에 supabaseUrl, supabaseAnonKey 입력 후 메뉴 요청 폼이 DB에 저장됩니다.

create table if not exists public.menu_requests (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  menu_name text not null,
  note text,
  contact text,
  created_at timestamptz not null default now()
);

alter table public.menu_requests enable row level security;

-- 누구나 요청만 넣을 수 있음 (읽기는 Supabase 대시보드에서)
create policy "menu_requests_insert_anon"
  on public.menu_requests for insert
  to anon, authenticated
  with check (true);
