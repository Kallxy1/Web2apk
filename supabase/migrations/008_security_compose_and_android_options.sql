-- Security, trusted Compose builds, Android options, audit, and payment foundation.
alter type public.build_mode add value if not exists 'compose';

alter table public.profiles
  add column if not exists compose_access boolean not null default false;

alter table public.builds
  add column if not exists min_sdk integer not null default 23 check(min_sdk between 23 and 35),
  add column if not exists target_sdk integer not null default 35 check(target_sdk in (35,36)),
  add column if not exists architecture text not null default 'universal' check(architecture in ('universal','arm64','arm32','arm_both','x86_64')),
  add column if not exists data_folder_mode text not null default 'internal' check(data_folder_mode in ('none','internal','media','downloads'));

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_user_idx on public.audit_logs(user_id,created_at desc);
alter table public.audit_logs enable row level security;

create table if not exists public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null,
  external_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  plan public.account_plan,
  status text not null,
  amount numeric,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(provider,external_id,status)
);
alter table public.payment_events enable row level security;
