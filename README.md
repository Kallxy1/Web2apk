# Web2APK Studio

> **Panduan instalasi lengkap:** buka [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) untuk setup Supabase Auth, database, private storage, GitHub Actions, APK signing, environment, dan deployment Vercel.

Platform full-stack untuk mengubah **URL website** atau **source HTML/CSS/JS dalam ZIP** menjadi APK Android. Frontend dan API menggunakan Next.js, akun/database/private storage menggunakan Supabase, sedangkan GitHub Actions menjadi worker build Android sekaligus CI/CD.

> GitHub Actions bukan server API 24/7. API tetap berjalan di Next.js (Vercel/hosting Node); Actions menerima job `workflow_dispatch`, membangun APK, mengunggah hasil ke Supabase, lalu memperbarui status database.

## Fitur

- Registrasi/login email dan proteksi route
- Dashboard project dan polling status build
- Input URL online, ZIP offline, atau file HTML tunggal (maks. 50 MB)
- Auto-detection judul HTML, nama file, dan saran package ID
- App icon custom, versi, orientasi, warna sistem, fullscreen, zoom, dan user agent
- Permission kamera, mikrofon, lokasi, notifikasi, dan getar
- OneSignal push notification serta welcome notification custom
- Worker Android WebView di GitHub Actions
- Trusted Jetpack Compose project builder dengan isolated untrusted job
- Cloudflare Turnstile, Upstash rate limit, malware scan, audit logs, abnormal-volume alert
- HMAC signed APK delivery melalui `api.xystudio.my.id`
- Admin system controls, maintenance mode, Compose access, dan audit viewer
- Cookie consent granular serta Help/Legal Center lengkap
- Private source/APK bucket dan signed download URL
- Supabase Row Level Security per pengguna
- ZIP extraction guard (zip-slip dan extracted-size limit)
- Signing release opsional; fallback debug signing untuk development

## Struktur

```text
web2apk/
├── app/                    # Next.js App Router, halaman + API
│   ├── api/builds/         # Backend API create/status build
│   ├── auth/callback/      # Callback Supabase Auth
│   └── dashboard/          # UI yang memerlukan login
├── components/             # Komponen UI/client
├── lib/                    # Supabase, GitHub API, types
├── supabase/migrations/    # Schema, RLS, storage bucket
├── builder/
│   ├── android-template/   # Template Android WebView native
│   ├── prepare.mjs         # Injeksi konfigurasi build
│   └── safe_extract.py     # Ekstraksi ZIP aman
└── .github/workflows/
    ├── build-apk.yml       # Worker build APK
    └── ci.yml              # Typecheck + Next.js build
```

## 1. Persiapan Supabase

1. Buat project di [Supabase](https://supabase.com).
2. Buka **SQL Editor**, jalankan Jalankan seluruh migration secara berurutan dari `001_initial.sql` hingga `010_backend_bridge.sql`.
3. Di **Authentication → URL Configuration**, set Site URL ke domain aplikasi dan redirect URL ke `https://DOMAIN/auth/callback`.
4. Ambil Project URL, anon key, dan service-role key dari pengaturan API.

Jangan pernah memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke variabel `NEXT_PUBLIC_*` atau frontend.

## 2. Persiapan repository GitHub

Push folder ini ke repository (private disarankan). Tambahkan **Settings → Secrets and variables → Actions**:

| Secret | Isi |
|---|---|
| `SUPABASE_URL` | Project URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key Supabase |
| `ANDROID_KEYSTORE_BASE64` | Keystore `.jks` dalam base64 (opsional) |
| `ANDROID_KEYSTORE_PASSWORD` | Store password (opsional) |
| `ANDROID_KEY_ALIAS` | Key alias (opsional) |
| `ANDROID_KEY_PASSWORD` | Key password (opsional) |

Membuat signing key produksi:

```bash
keytool -genkeypair -v -keystore release.jks -alias web2apk \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 release.jks
```

Simpan keystore dan password secara permanen. APK update wajib memakai key yang sama.

## 3. Environment aplikasi web

```bash
cp .env.example .env.local
```

Isi semua variabel. `GITHUB_TOKEN` memerlukan akses ke repository dan izin **Actions: Read and write** untuk memanggil workflow dispatch. Untuk fine-grained PAT, pilih repository ini dan beri permission Actions read/write.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_TOKEN=github_pat_...
GITHUB_OWNER=nama-user-atau-org
GITHUB_REPO=nama-repository
GITHUB_REF=main
```

## 4. Jalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. API lokal tetap dapat mengirim job ke GitHub selama repository, token, dan secrets sudah benar.

## 5. Deploy

### Vercel (disarankan untuk web/API)

1. Import repository ke Vercel.
2. Tambahkan seluruh environment aplikasi web di atas.
3. Deploy.
4. Perbarui `NEXT_PUBLIC_APP_URL` dan Supabase Auth redirect URL dengan domain produksi.

Workflow `ci.yml` menangani validasi source. Deployment bisa dibiarkan pada integrasi Git Vercel atau ditambahkan sebagai job deploy dengan token Vercel.

## Format ZIP

`index.html` wajib berada di root ZIP (atau di dalam satu folder pembungkus):

```text
my-app.zip
├── index.html
├── css/style.css
├── js/app.js
└── assets/logo.png
```

Gunakan path relatif. Aplikasi ZIP dibuka dari `file:///android_asset/www/index.html` dan dapat berjalan offline.

## Alur backend

1. Browser mengirim multipart form ke `POST /api/builds`.
2. API memvalidasi session/data, menyimpan ZIP secara private, dan membuat record `queued`.
3. API memanggil GitHub `workflow_dispatch` memakai PAT server-side.
4. Actions mengubah status menjadi `building`, menyiapkan template, dan menjalankan Gradle.
5. APK diunggah ke bucket private `apks`; record menjadi `success` atau `failed`.
6. Dashboard memanggil `GET /api/builds/:id`; API mengembalikan signed URL 10 menit.

## Catatan produksi

- Gunakan repository private karena input signed URL dapat terlihat oleh kolaborator yang dapat membuka metadata workflow.
- Tambahkan rate limit (Upstash Redis/Cloudflare) sebelum membuka layanan ke publik.
- GitHub-hosted runner memiliki kuota. Untuk volume tinggi gunakan self-hosted runner atau antrean khusus.
- Lakukan review kebijakan Google Play; aplikasi WebView sederhana dapat ditolak bila minim fungsi/nilai tambah.
- Template memblokir cleartext HTTP. URL produksi harus HTTPS.
