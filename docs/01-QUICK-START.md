# 01 — Quick Start & Checklist

## Urutan deployment

1. Clone repository dan jalankan `npm install`.
2. Buat project Supabase.
3. Jalankan migration `001` sampai migration terbaru secara berurutan.
4. Isi environment Vercel dari `.env.example`.
5. Tambahkan GitHub Actions secrets.
6. Deploy ke Vercel.
7. Tambahkan `web2apk`, `help`, dan `api` custom domains.
8. Konfigurasi Auth callback.
9. Build APK test URL, HTML, ZIP, lalu Compose trusted.

## Validasi lokal

```bash
npm install
npm run typecheck
npm run build
```

## Checklist minimum

- Supabase URL hanya `https://PROJECT.supabase.co`
- RLS aktif
- Bucket `sources` dan `apks` private
- Site URL dan callback Auth benar
- GitHub token memiliki Actions read/write
- Service-role hanya di backend/Actions
- Production signing secrets lengkap atau semuanya dikosongkan untuk debug signing
- `CRON_SECRET`, `DOWNLOAD_SECRET`, dan `AUDIT_HASH_SECRET` berbeda
