-- Jalankan melalui Supabase SQL Editor atau `supabase db push`.
create extension if not exists "pgcrypto";
create type public.build_mode as enum ('url','zip');
create type public.build_status as enum ('queued','building','success','failed');
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  package_name text not null,
  mode public.build_mode not null,
  source_url text,
  source_path text,
  version_name text not null default '1.0.0',
  version_code integer not null default 1 check (version_code > 0),
  orientation text not null default 'unspecified' check (orientation in ('portrait','landscape','unspecified')),
  theme_color text not null default '#0b1220',
  status public.build_status not null default 'queued',
  apk_path text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index builds_user_created_idx on public.builds(user_id,created_at desc);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now();return new;end $$;
create trigger builds_updated_at before update on public.builds for each row execute function public.set_updated_at();
alter table public.builds enable row level security;
create policy "read own builds" on public.builds for select using (auth.uid()=user_id);
create policy "insert own builds" on public.builds for insert with check (auth.uid()=user_id);
create policy "delete own builds" on public.builds for delete using (auth.uid()=user_id);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('sources','sources',false,52428800,array['application/zip']) on conflict(id) do nothing;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('apks','apks',false,209715200,array['application/vnd.android.package-archive','application/octet-stream']) on conflict(id) do nothing;
-- Storage hanya diakses server dengan service-role. Tidak ada public policy sengaja dibuat.
