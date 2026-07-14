# Panduan Setup Web2APK Studio

Panduan ini menyiapkan **Supabase Auth**, **database PostgreSQL**, **private storage**, **GitHub Actions APK builder**, dan **deployment Next.js**.

## Arsitektur singkat

```text
Browser
  └─ Next.js (Frontend + Backend API)
       ├─ Supabase Auth
       ├─ Supabase PostgreSQL
       ├─ Supabase private Storage
       └─ GitHub workflow_dispatch
            └─ Android/Gradle builder
                 └─ Upload APK ke Supabase Storage
```

GitHub Actions hanya menjadi worker build dan CI/CD, bukan server API 24/7. Next.js harus berjalan di Vercel atau hosting Node.js lain.

---

## 1. Buat project Supabase

1. Masuk ke <https://supabase.com/dashboard>.
2. Klik **New project**.
3. Pilih organisasi, lalu isi:
   - Project name: `web2apk`
   - Database password: buat password kuat dan simpan
   - Region: pilih yang dekat dengan pengguna
4. Tunggu hingga project aktif.

### Ambil API credentials

Buka **Project Settings → API** (pada UI baru dapat muncul sebagai **Settings → Data API**), lalu catat:

- Project URL, contoh `https://abcxyz.supabase.co`
- `anon` / publishable key
- `service_role` / secret key

`service_role` sangat rahasia. Key ini hanya boleh dipasang pada backend/Vercel dan GitHub Actions. Jangan memakai nama environment yang diawali `NEXT_PUBLIC_` untuk service-role key.

---

## 2. Buat database, RLS, dan Storage

1. Di Supabase, buka **SQL Editor**.
2. Klik **New query**.
3. Jalankan kedua migration secara berurutan:

```text
supabase/migrations/001_initial.sql
supabase/migrations/002_advanced_app_options.sql
supabase/migrations/003_saas_and_build_operations.sql
```

Migration kedua menambahkan app icon, permission Android, OneSignal, welcome notification, fullscreen, kontrol zoom, dan custom user agent. Migration ketiga menambahkan profil SaaS, paket/role, kuota build, progress real-time, output AAB, splash screen, dan retensi otomatis.

4. Klik **Run** untuk masing-masing file.

Migration tersebut otomatis membuat:

- Enum `build_mode`: `url`, `zip`
- Enum `build_status`: `queued`, `building`, `success`, `failed`
- Table `public.builds`
- Index build per pengguna
- Trigger `updated_at`
- Row Level Security
- Private bucket `sources`
- Private bucket `apks`

### Verifikasi database

Buka **Table Editor → builds**. Kolom yang terlihat harus mencakup:

```text
id, user_id, name, package_name, mode, source_url, source_path,
version_name, version_code, orientation, theme_color, status,
apk_path, error_message, created_at, updated_at
```

### Verifikasi Storage

Buka **Storage**. Harus ada dua bucket:

- `sources` — private, menyimpan ZIP sumber
- `apks` — private, menyimpan APK hasil build

Jangan mengubah bucket menjadi public. Download APK diberikan melalui signed URL sementara oleh backend.

### Cara kerja RLS

Policy pada table hanya mengizinkan pengguna membaca, membuat, dan menghapus build miliknya sendiri. Worker GitHub memakai `service_role`, sehingga dapat memperbarui status dan path APK meskipun RLS aktif.

---

## 3. Setup Supabase Authentication

Buka **Authentication → Providers → Email**.

Aktifkan:

- **Enable Email provider**
- **Allow new users to sign up**

Untuk production, disarankan mengaktifkan **Confirm email**. Untuk testing lokal yang lebih cepat, confirm email boleh dimatikan sementara.

### URL Configuration

Buka **Authentication → URL Configuration**.

Saat development:

```text
Site URL:
http://localhost:3000

Redirect URLs:
http://localhost:3000/auth/callback
```

Setelah deploy ke Vercel, tambahkan:

```text
https://DOMAIN-ANDA.vercel.app/auth/callback
```

Kemudian ubah Site URL menjadi domain production:

```text
https://DOMAIN-ANDA.vercel.app
```

Jangan menghapus redirect localhost jika masih ingin melakukan development lokal.

### Template email opsional

Buka **Authentication → Email Templates → Confirm signup**. Template default sudah dapat digunakan. Pastikan tautan konfirmasi menggunakan `{{ .ConfirmationURL }}`.

---

## 4. Siapkan repository GitHub

Repository project:

```text
https://github.com/Kallxy1/Web2apk
```

Buka **Settings → Actions → General**.

Pastikan:

- Actions diizinkan berjalan pada repository
- Workflow dari GitHub Actions resmi diizinkan
- Workflow permissions minimal **Read repository contents**

Project memiliki:

```text
.github/workflows/build-apk.yml
.github/workflows/ci.yml
```

`build-apk.yml` menerima job dari backend, menjalankan Gradle, mengunggah APK, lalu memperbarui database.

---

## 5. Buat token khusus workflow dispatch

Token untuk backend berbeda dari token sementara yang dipakai untuk `git push`.

Buat **fine-grained personal access token**:

1. GitHub → **Settings**.
2. **Developer settings → Personal access tokens → Fine-grained tokens**.
3. Klik **Generate new token**.
4. Resource owner: `Kallxy1`.
5. Repository access: **Only select repositories → Web2apk**.
6. Repository permissions:
   - **Actions: Read and write**
   - **Metadata: Read-only** (otomatis)
7. Pilih expiration yang wajar, misalnya 90 hari.
8. Simpan token sebagai `GITHUB_TOKEN` di backend/Vercel.

Jangan memasukkan token ini ke source code, `.env.example`, commit, atau GitHub Actions secrets kecuali memang diperlukan. Dalam arsitektur ini token tersebut hanya dibutuhkan oleh backend Next.js untuk memanggil `workflow_dispatch`.

---

## 6. Tambahkan GitHub Actions secrets

Di repository buka:

**Settings → Secrets and variables → Actions → New repository secret**

Tambahkan secret wajib:

| Nama | Isi |
|---|---|
| `SUPABASE_URL` | Project URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` / secret key Supabase |

### APK signing production

Tanpa signing secrets, builder memakai debug signing. APK tetap dapat diinstal untuk testing, tetapi tidak ideal untuk distribusi production atau update aplikasi.

Buat keystore di komputer lokal:

```bash
keytool -genkeypair -v \
  -keystore release.jks \
  -alias web2apk \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Ubah keystore menjadi base64.

Linux:

```bash
base64 -w 0 release.jks > release.jks.base64.txt
```

macOS:

```bash
base64 < release.jks | tr -d '\n' > release.jks.base64.txt
```

Tambahkan empat GitHub Actions secrets:

| Nama | Isi |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Isi `release.jks.base64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | Password keystore |
| `ANDROID_KEY_ALIAS` | `web2apk` atau alias yang dipilih |
| `ANDROID_KEY_PASSWORD` | Password key |

Simpan file `release.jks` dan seluruh password di password manager/offline backup. Aplikasi Android hanya dapat diperbarui dengan signing key yang sama.

---

## 7. Setup environment lokal

Clone repository:

```bash
git clone https://github.com/Kallxy1/Web2apk.git
cd Web2apk
npm install
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_ATAU_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY

GITHUB_TOKEN=FINE_GRAINED_TOKEN_UNTUK_WORKFLOW_DISPATCH
GITHUB_OWNER=Kallxy1
GITHUB_REPO=Web2apk
GITHUB_REF=main
```

Jalankan:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

### Tes Auth

1. Buka `/register`.
2. Buat akun dengan email aktif.
3. Jika Confirm email aktif, buka email konfirmasi.
4. Tautan akan kembali ke `/auth/callback` lalu `/dashboard`.
5. Jika email tidak diterima, periksa **Supabase → Authentication → Logs** dan folder spam.

---

## 8. Deploy frontend dan backend API ke Vercel

1. Masuk ke <https://vercel.com>.
2. Klik **Add New → Project**.
3. Import `Kallxy1/Web2apk`.
4. Framework harus terdeteksi sebagai **Next.js**.
5. Tambahkan environment variables berikut untuk Production, Preview, dan Development sesuai kebutuhan:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_REPO
GITHUB_REF
CRON_SECRET
```

Nilai production:

```env
NEXT_PUBLIC_APP_URL=https://DOMAIN-VERCEL-ANDA.vercel.app
GITHUB_OWNER=Kallxy1
GITHUB_REPO=Web2apk
GITHUB_REF=main
```

6. Klik **Deploy**.
7. Setelah domain tersedia, kembali ke Supabase Authentication dan tambahkan callback production seperti pada bagian Auth.
8. Redeploy jika Anda mengubah environment variable.

---

## 9. Pasang custom domain `web2apk.xystudio.my.id`

1. Buka project di **Vercel → Settings → Domains**.
2. Tambahkan `web2apk.xystudio.my.id`.
3. Di DNS provider untuk `xystudio.my.id`, buat record sesuai instruksi yang ditampilkan Vercel. Untuk subdomain biasanya:

```text
Type: CNAME
Name/Host: web2apk
Target: cname.vercel-dns.com
TTL: Auto
```

Jika Vercel menampilkan target yang berbeda, selalu ikuti nilai dari dashboard Vercel.

4. Tunggu status domain menjadi **Valid Configuration**. Vercel akan menerbitkan SSL/TLS otomatis.
5. Atur environment production:

```env
NEXT_PUBLIC_APP_URL=https://web2apk.xystudio.my.id
```

6. Di Supabase **Authentication → URL Configuration**, gunakan:

```text
Site URL: https://web2apk.xystudio.my.id
Redirect URL: https://web2apk.xystudio.my.id/auth/callback
```

7. Redeploy aplikasi. Gunakan **HTTPS**, bukan HTTP, untuk production.

## 10. Setup push notification OneSignal

1. Buat akun dan Android app di <https://onesignal.com>.
2. Saat diminta Firebase configuration, hubungkan project Firebase/FCM milik aplikasi Anda sesuai wizard OneSignal.
3. Salin **OneSignal App ID** dari **Settings → Keys & IDs**.
4. Saat membuat APK di Web2APK, aktifkan **OneSignal push notification** dan masukkan App ID tersebut.
5. Setelah APK terpasang dan pengguna memberi permission notifikasi, kirim pesan dari dashboard OneSignal.

OneSignal App ID bukan REST API key dan aman dimasukkan sebagai konfigurasi aplikasi. Jangan pernah menaruh OneSignal REST API key di APK atau form builder.

## 11. Tes build APK URL

1. Login ke dashboard production.
2. Klik **Build APK**.
3. Pilih **Dari URL**.
4. Isi contoh:

```text
Nama aplikasi: Web Test
Package name: com.kallxy.webtest
URL: https://example.com
Versi: 1.0.0
Version code: 1
Orientasi: Otomatis
```

5. Klik **Mulai build APK**.
6. Buka GitHub repository → **Actions → Build Android APK**.
7. Status dashboard berubah:

```text
queued → building → success
```

8. Klik **Download APK**.

URL wajib HTTPS karena template Android memblokir cleartext HTTP.

---

## 12. Tes build ZIP/HTML offline

Buat struktur:

```text
web-offline/
├── index.html
├── css/style.css
├── js/app.js
└── assets/logo.png
```

ZIP isi foldernya agar `index.html` berada di root ZIP:

```bash
cd web-offline
zip -r ../web-offline.zip .
```

Upload `web-offline.zip` dari dashboard. Builder juga menerima satu folder pembungkus, tetapi `index.html` tetap wajib ada di root atau tepat di dalam satu folder tersebut.

Batas saat ini:

- ZIP upload: 50 MB
- Hasil ekstraksi: 250 MB
- Satu file hasil ekstraksi: 100 MB

---

## 13. Troubleshooting

### Build tetap `queued`

Periksa:

- `GITHUB_TOKEN` di Vercel masih aktif
- Token memiliki permission **Actions: Read and write**
- `GITHUB_OWNER=Kallxy1`
- `GITHUB_REPO=Web2apk`
- Workflow Actions di repository tidak dinonaktifkan
- Vercel deployment sudah di-redeploy setelah env diubah

### Workflow gagal memperbarui database

Periksa repository Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Pastikan service-role key, bukan anon key.

### Registrasi berhasil tetapi tidak bisa login

Periksa:

- Pengguna sudah mengklik email konfirmasi
- Redirect URL `/auth/callback` sudah diizinkan
- Site URL Supabase sesuai domain
- Log Authentication Supabase

### ZIP gagal karena `index.html tidak ditemukan`

Buka ZIP dan pastikan bentuknya:

```text
index.html
css/
js/
```

Bukan beberapa folder bertingkat seperti:

```text
project/source/public/index.html
```

### APK tidak dapat update versi lama

Pastikan:

- Package name tidak berubah
- `versionCode` lebih besar
- Signing keystore dan alias sama

### GitHub Actions kehabisan kuota

Untuk penggunaan publik/volume tinggi, gunakan self-hosted runner atau worker Android khusus. Tambahkan rate limit pada `POST /api/builds` sebelum layanan dibuka ke banyak pengguna.

---

## 14. Checklist production

- [ ] Supabase migration berhasil
- [ ] Bucket `sources` dan `apks` bersifat private
- [ ] Email confirmation aktif
- [ ] Site URL dan redirect URL production benar
- [ ] Vercel environment lengkap
- [ ] GitHub fine-grained token hanya mengakses repository Web2apk
- [ ] GitHub Actions secrets Supabase sudah ditambahkan
- [ ] Production signing keystore sudah dibackup
- [ ] Build URL berhasil
- [ ] Build ZIP berhasil
- [ ] Rate limit API diterapkan sebelum layanan publik
- [ ] Monitoring kuota GitHub Actions dan Supabase aktif

## 15. Aktifkan SaaS, admin, dan cleanup

Setelah migration ketiga dijalankan, setiap akun baru otomatis mendapat profile paket `free`. Batas default:

- Free: 3 build/hari, 25 MB, retensi 7 hari
- Pro: 30 build/hari, 100 MB, retensi 30 hari
- Business: 100 build/hari, 250 MB, retensi 90 hari

Promosikan admin pertama melalui Supabase SQL Editor:

```sql
update public.profiles set role='admin' where email='EMAIL_ANDA';
```

Ubah paket pengguna sementara melalui SQL sampai payment gateway terhubung:

```sql
update public.profiles set plan='pro' where email='EMAIL_PENGGUNA';
```

Buat secret acak untuk cron cleanup:

```bash
openssl rand -hex 32
```

Simpan hasilnya sebagai `CRON_SECRET` di Vercel Production. Vercel Cron memanggil `/api/cron/cleanup` setiap hari untuk menghapus source dan output yang melewati masa retensi.

Builder sekarang menghasilkan APK dan AAB. Pastikan migration ketiga sudah aktif sebelum menjalankan build baru agar kolom progress dan `aab_path` tersedia.
