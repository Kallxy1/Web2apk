-- Optional public backend configuration exposed to generated WebView apps.
alter table public.builds
  add column if not exists backend_provider text not null default 'none' check(backend_provider in ('none','supabase','firebase','custom')),
  add column if not exists backend_url text,
  add column if not exists backend_public_key text;
