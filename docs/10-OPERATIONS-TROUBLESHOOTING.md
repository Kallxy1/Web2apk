# 10 — Operasional, Performa & Troubleshooting

## Monitoring

- Vercel Analytics/Speed Insights setelah consent
- Supabase logs
- GitHub Actions logs
- audit_logs
- security alert webhook
- uptime monitoring untuk web/help/api

## Masalah umum

- Invalid Supabase path: hapus `/rest/v1` dari URL
- Build queued: periksa GitHub token dan Actions
- APK kecil tetapi data besar: uninstall data lama, gunakan storage mode low
- Duplicate Kotlin: gunakan workflow/template terbaru
- Signing kosong: isi semua signing secret atau kosongkan semuanya
- Compose gagal: periksa wrapper, SDK, dependency, dan Gradle log

## Rollback

Promote deployment Vercel sehat. Rollback kode tidak otomatis rollback database. Migration harus additive dan dibackup sebelum operasi destruktif.
