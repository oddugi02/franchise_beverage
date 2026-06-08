-- Supabase SQL Editor에서 실행하세요.
-- config.js에 supabaseUrl, supabaseAnonKey 입력 후 전역 조회수·좋아요가 동작합니다.

create table if not exists public.menu_stats (
  menu_id text primary key,
  views bigint not null default 0,
  likes bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.menu_stats enable row level security;

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
