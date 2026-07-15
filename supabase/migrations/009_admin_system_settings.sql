-- Global controls editable only through admin server APIs.
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.system_settings enable row level security;
create policy "read public system settings" on public.system_settings for select using(true);
insert into public.system_settings(key,value) values
 ('maintenance_mode','false'::jsonb),
 ('registration_enabled','true'::jsonb),
 ('builds_enabled','true'::jsonb),
 ('announcement','""'::jsonb)
on conflict(key) do nothing;
