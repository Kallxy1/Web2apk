-- Build log stream and admin suspension state.
create table if not exists public.build_logs (
  id bigint generated always as identity primary key,
  build_id uuid not null references public.builds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null default 'info' check(level in ('info','success','warning','error')),
  message text not null check(char_length(message) between 1 and 20000),
  created_at timestamptz not null default now()
);
create index if not exists build_logs_build_created_idx on public.build_logs(build_id,created_at);
alter table public.build_logs enable row level security;
create policy "read own build logs" on public.build_logs for select using(auth.uid()=user_id);

alter table public.profiles add column if not exists is_suspended boolean not null default false;
