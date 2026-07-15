# 02 — Supabase, Auth, Database & Storage

## Migration

Jalankan seluruh file dalam `supabase/migrations/` berdasarkan nomor nama file. Jangan melompati urutan.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Jangan menambahkan `/rest/v1`, `/auth/v1`, atau `/storage/v1` pada Project URL.

## Auth URLs

```text
Site URL: https://web2apk.xystudio.my.id
Redirect: https://web2apk.xystudio.my.id/auth/callback
Redirect: https://web2apk.xystudio.my.id/**
```

## Private Storage

- `sources`: source ZIP, Compose project, dan app icon
- `apks`: APK final

File diberikan melalui signed URL/HMAC download link, bukan public bucket.

## RLS

Pengguna hanya dapat membaca build, log, dan profile sendiri. Service-role digunakan server-side. Jangan menonaktifkan RLS untuk menyelesaikan error konfigurasi.

## Session

Session dikenali melalui secure cookie, bukan IP. IP hanya digunakan secara hash untuk keamanan, rate limit, dan audit.
