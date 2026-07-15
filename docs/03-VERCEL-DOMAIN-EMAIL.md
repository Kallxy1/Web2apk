# 03 — Vercel, Domain, API & Email

## Domains

Tambahkan ke project Vercel yang sama:

```text
web2apk.xystudio.my.id
help.xystudio.my.id
api.xystudio.my.id
```

DNS subdomain biasanya berupa CNAME ke target yang ditampilkan Vercel.

## Environment domain

```env
NEXT_PUBLIC_APP_URL=https://web2apk.xystudio.my.id
NEXT_PUBLIC_HELP_URL=https://help.xystudio.my.id
NEXT_PUBLIC_API_URL=https://api.xystudio.my.id
```

## API domain

Digunakan untuk health check, signed APK delivery, payment webhook, dan integrasi server. Download URL memakai HMAC/expiry, tetapi filename mengikuti aplikasi, misalnya:

```text
TokoKita-Pro-v1.2.0.apk
```

## Email gratis

Gunakan Cloudflare Email Routing untuk menerima/forward:

```text
info@xystudio.my.id
support@xystudio.my.id
privacy@xystudio.my.id
security@xystudio.my.id
abuse@xystudio.my.id
```

Untuk outgoing SMTP/Auth email gunakan Resend atau Brevo free tier. Konfigurasi SPF, DKIM, dan DMARC.
