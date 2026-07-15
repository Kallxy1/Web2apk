# 09 — API, Backend & Database untuk Aplikasi

Aplikasi hasil build dapat menggunakan backend eksternal melalui HTTPS.

## Pilihan backend

- Supabase: Auth, PostgreSQL, Storage, Realtime, Edge Functions
- Firebase: Auth, Firestore, FCM
- Appwrite: Auth, Database, Storage, Functions
- REST/GraphQL API sendiri
- Cloudflare Workers/D1/KV untuk API ringan

## Native backend bridge

Pada WebView build, public config tersedia dari JavaScript:

```js
const provider = window.XyBackend?.getProvider();
const apiUrl = window.XyBackend?.getApiUrl();
const publicKey = window.XyBackend?.getPublicKey();
```

Gunakan fitur ini untuk Supabase anon key, Firebase public config, atau base URL REST/GraphQL.

## Aturan secret

APK hanya boleh berisi public/publishable key. Jangan memasukkan service-role, database password, GitHub token, private API key, atau Midtrans server key.

## Fitur menarik berikutnya

- backend preset wizard
- environment/public config injection
- native auth bridge
- offline sync queue
- remote config
- biometric app lock
- native download/upload manager
- deep links dan custom scheme
- API health check
- crash reporting
- analytics pilihan pengguna
