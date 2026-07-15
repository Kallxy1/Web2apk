# 05 — Security & Abuse Prevention

## Cloudflare Turnstile

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

Melindungi register, login, reset password, dan create build. Optional-by-env.

## Upstash rate limit

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Limiter diterapkan pada endpoint sensitif. Jika belum dikonfigurasi, request tetap berjalan tanpa distributed limiter.

## Malware dan source security

- zip-slip prevention
- symbolic-link rejection
- extracted size/file-count limit
- executable blocking untuk HTML source
- ClamAV untuk trusted Compose project
- Compose Gradle berjalan tanpa production secrets

## Audit dan alert

```env
AUDIT_HASH_SECRET=...
SECURITY_ALERT_WEBHOOK=...
```

Audit menyimpan aksi, resource, waktu, user, dan hash IP. Webhook memberi alert volume build abnormal.

## Download security

```env
DOWNLOAD_SECRET=...
```

Download token memakai HMAC dan expiry. Secret harus panjang dan berbeda dari secret lain.
