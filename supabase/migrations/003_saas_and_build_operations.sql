-- SaaS foundation: profiles, plans, build progress, AAB, splash screen, and cleanup metadata.
create type public.account_plan as enum ('free','pro','business');
create type public.account_role as enum ('user','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  plan public.account_plan not null default 'free',
  role public.account_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select using (auth.uid()=id);
create policy "update own profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,email) values(new.id,new.email) on conflict(id) do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id,email) select id,email from auth.users on conflict(id) do nothing;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

alter table public.builds
  add column if not exists aab_path text,
  add column if not exists progress integer not null default 0 check(progress between 0 and 100),
  add column if not exists current_step text not null default 'Menunggu antrean',
  add column if not exists splash_enabled boolean not null default false,
  add column if not exists splash_background text not null default '#050505',
  add column if not exists splash_duration integer not null default 1200 check(splash_duration between 300 and 5000),
  add column if not exists expires_at timestamptz default (now()+interval '30 days');

create index if not exists builds_status_created_idx on public.builds(status,created_at);

-- Bucket limit mengikuti paket tertinggi; API tetap menegakkan limit per paket.
update storage.buckets set file_size_limit=262144000 where id='sources';
update storage.buckets set file_size_limit=314572800 where id='apks';

-- User profile plan/role cannot be escalated through the public API.
revoke update(plan,role) on public.profiles from authenticated;

-- Helper view for dashboard usage; security invoker keeps RLS active.
create or replace view public.daily_build_usage with (security_invoker=true) as
select user_id, date_trunc('day',created_at) as usage_day, count(*)::integer as build_count
from public.builds group by user_id,date_trunc('day',created_at);
grant select on public.daily_build_usage to authenticated;
