-- Opsi branding, permission, notification, dan pengalaman WebView.
alter table public.builds
  add column if not exists source_file_name text,
  add column if not exists app_icon_path text,
  add column if not exists permissions jsonb not null default '{"camera":false,"microphone":false,"location":false,"notifications":false,"vibrate":false}'::jsonb,
  add column if not exists notification_enabled boolean not null default false,
  add column if not exists onesignal_app_id text,
  add column if not exists welcome_notification_enabled boolean not null default false,
  add column if not exists welcome_notification_title text,
  add column if not exists welcome_notification_body text,
  add column if not exists fullscreen boolean not null default false,
  add column if not exists allow_zoom boolean not null default false,
  add column if not exists custom_user_agent text;

-- Bucket sources juga menyimpan app icon secara private.
update storage.buckets
set allowed_mime_types = array['application/zip','image/png','image/jpeg','image/webp']
where id = 'sources';

comment on column public.builds.onesignal_app_id is 'Public OneSignal App ID untuk push notification; bukan REST API key.';
comment on column public.builds.permissions is 'Permission Android yang dipilih pengguna saat build.';
