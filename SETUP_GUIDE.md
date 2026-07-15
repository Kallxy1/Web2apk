# Web2APK — Panduan Setup Production Lengkap

Panduan ini adalah sumber konfigurasi utama Web2APK untuk domain:

```text
https://web2apk.xystudio.my.id
```

Mencakup Supabase Auth, PostgreSQL, Row Level Security, private Storage, GitHub Actions Android builder, APK signing, OneSignal, Vercel, custom domain, SaaS quota, admin, cron cleanup, keamanan, performa, troubleshooting, dan operasional production.

> **Penting:** jangan pernah commit `.env`, token GitHub, Supabase service-role key, Android keystore, password signing, atau OneSignal REST API key. `.env.example` boleh masuk repository karena hanya berisi placeholder.

---

## Daftar Isi

1. Arsitektur
2. Kebutuhan awal
3. Setup Supabase project
4. Menjalankan database migration
5. Setup Supabase Auth
6. Setup custom SMTP
7. Setup Storage dan RLS
8. Setup GitHub repository
9. Token GitHub untuk workflow dispatch
10. GitHub Actions secrets
11. Android production signing
12. Environment Vercel
13. Deployment Vercel
14. Custom domain
15. Admin dan paket SaaS
16. OneSignal push notification
17. Pengujian end-to-end
18. Build URL, HTML, ZIP, dan APK
19. Retention dan automatic cleanup
20. Optimasi performa dan anti-lag
21. SEO dan monitoring
22. Keamanan production
23. Troubleshooting
24. Update dan rollback
25. Checklist production

---

# 1. Arsitektur

```text
Browser / Pengguna
│
├── Next.js frontend
│   ├── Landing page
│   ├── Authentication UI
│   ├── Dashboard
│   ├── Private create session /c/{kode}
│   ├── Pricing, FAQ, TOS, Privacy, Security
│   └── Skeleton/loading/animations
│
├── Next.js backend API di Vercel
│   ├── Create build
│   ├── Build status
│   ├── Retry build
│   ├── Delete project
│   ├── Signed APK download
│   └── Scheduled cleanup
│
├── Supabase
│   ├── Email Auth
│   ├── PostgreSQL
│   ├── Row Level Security
│   ├── Private source Storage
│   └── Private APK Storage
│
└── GitHub Actions
    ├── Download private source
    ├── Safe ZIP extraction
    ├── Generate Android project
    ├── Add icon, permission, splash, OneSignal
    ├── Build APK
    ├── Production signing
    ├── Upload output ke Supabase
    └── Update build progress
```

GitHub Actions adalah **worker build**, bukan backend API 24/7. Frontend dan backend API berjalan melalui Next.js di Vercel.

---

# 2. Kebutuhan Awal

Siapkan:

- Akun GitHub
- Repository `Kallxy1/Web2apk`
- Akun Vercel
- Project Supabase
- Domain `xystudio.my.id`
- Node.js 20+ untuk development lokal
- Java `keytool` jika ingin production signing
- OneSignal account jika push notification diperlukan

Repository:

```text
https://github.com/Kallxy1/Web2apk
```

Domain production:

```text
https://web2apk.xystudio.my.id
```

---

# 3. Setup Supabase Project

1. Buka <https://supabase.com/dashboard>.
2. Klik **New project**.
3. Pilih organisasi.
4. Isi nama project, misalnya `web2apk-production`.
5. Buat database password yang kuat.
6. Pilih region terdekat dengan mayoritas pengguna.
7. Tunggu project selesai dibuat.

## 3.1 Ambil project credentials

Buka:

```text
Supabase → Project Settings → API
```

Pada UI Supabase versi lain dapat tampil sebagai:

```text
Settings → Data API
```

Catat:

- Project URL
- Anon/publishable key
- Service-role/secret key

Project URL yang benar berbentuk:

```text
https://PROJECT_ID.supabase.co
```

**Jangan gunakan:**

```text
https://PROJECT_ID.supabase.co/rest/v1
https://PROJECT_ID.supabase.co/auth/v1
https://PROJECT_ID.supabase.co/storage/v1
```

Supabase SDK menambahkan path API secara otomatis. Menambahkan `/rest/v1` secara manual dapat menyebabkan:

```text
Invalid path specified in request URL
```

Aplikasi memiliki normalisasi URL sebagai perlindungan tambahan, tetapi environment tetap harus diisi dengan benar.

## 3.2 Fungsi setiap key

| Key | Lokasi | Boleh berada di browser? |
|---|---|---:|
| Project URL | Browser/server | Ya |
| Anon/publishable key | Browser/server | Ya |
| Service-role/secret key | Backend/Actions | **Tidak** |

Jangan memberi prefix `NEXT_PUBLIC_` pada service-role key.

---

# 4. Menjalankan Database Migration

Buka:

```text
Supabase → SQL Editor → New query
```

Jalankan migration **berurutan**:

```text
supabase/migrations/001_initial.sql
supabase/migrations/002_advanced_app_options.sql
supabase/migrations/003_saas_and_build_operations.sql
supabase/migrations/004_private_build_sessions.sql
supabase/migrations/005_build_logs_and_admin_controls.sql
supabase/migrations/006_premium_app_updates.sql
```

Jalankan satu file, pastikan berhasil, lalu lanjut ke file berikutnya.

## 4.1 Migration 001 — Core

Membuat:

- Enum `build_mode`
- Enum `build_status`
- Table `public.builds`
- Trigger `updated_at`
- Row Level Security
- Bucket private `sources`
- Bucket private `apks`

## 4.2 Migration 002 — Advanced app options

Menambahkan:

- App icon
- Source filename
- Android permission JSON
- OneSignal App ID
- Welcome notification
- Fullscreen mode
- WebView zoom control
- Custom user-agent
- Image MIME support pada source bucket

## 4.3 Migration 003 — SaaS operations

Menambahkan:

- Table `profiles`
- Plan `free`, `pro`, `business`
- Role `user`, `admin`
- Trigger profile pengguna baru
- Daily build usage
- APK paths
- Build progress
- Current build step
- Splash screen
- Retention/expiry
- Storage limit paket tertinggi
- Index operasional

## 4.4 Migration 004 — Private create sessions

Menambahkan `public_code` untuk URL seperti:

```text
/c/a81b9c20f4d312
```

Walaupun kolomnya bernama `public_code`, project tetap dilindungi login dan RLS. Kode hanya menjadi identifier URL yang sulit ditebak, bukan izin akses publik.

## 4.5 Migration 005 — Build logs dan admin controls

Menambahkan:

- Table `build_logs`
- RLS log per pemilik build
- Live log worker pada halaman build
- Detail error Gradle saat workflow gagal
- Status suspend pengguna untuk admin

## 4.6 Migration 006 — Premium app updates

Menambahkan hubungan antar versi aplikasi. Pengguna Pro/Business dapat memakai source, icon, package name, dan konfigurasi versi lama, lalu mengubah seluruh opsi dan membangun version code berikutnya. Update premium tidak memotong kuota build baru harian.

## 4.7 Verifikasi table

Buka **Table Editor → builds**. Pastikan kolom penting tersedia:

```text
id
user_id
public_code
name
package_name
mode
source_url
source_path
source_file_name
app_icon_path
version_name
version_code
orientation
theme_color
permissions
notification_enabled
onesignal_app_id
welcome_notification_enabled
welcome_notification_title
welcome_notification_body
fullscreen
allow_zoom
custom_user_agent
splash_enabled
splash_background
splash_duration
status
progress
current_step
apk_path
aab_path
expires_at
error_message
created_at
updated_at
```

Pastikan table berikut juga tersedia:

```text
public.profiles
```

## 4.8 Jangan menjalankan migration acak

Migration harus dijalankan satu kali dan berurutan. Jika migration enum dijalankan ulang dan muncul pesan object already exists, jangan menghapus database production. Periksa migration mana yang sudah aktif terlebih dahulu.

---

# 5. Setup Supabase Authentication

Buka:

```text
Authentication → Providers → Email
```

Aktifkan:

- Enable Email provider
- Allow new users to sign up
- Confirm email untuk production

Untuk testing singkat, email confirmation boleh dimatikan sementara. Aktifkan kembali sebelum website dibuka ke publik.

## 5.1 Session dikenali di seluruh website

Web2APK mengenali akun melalui secure Supabase session cookie, bukan alamat IP. Header landing, pricing, FAQ, legal, dan help center otomatis mengganti tombol Masuk/Daftar menjadi Dashboard/Build Baru ketika session aktif. IP tidak boleh dijadikan identitas karena dapat berubah, dipakai bersama satu jaringan, atau berada di balik VPN/CGNAT.

## 5.2 URL Configuration

Buka:

```text
Authentication → URL Configuration
```

Isi:

```text
Site URL:
https://web2apk.xystudio.my.id
```

Tambahkan redirect URLs:

```text
https://web2apk.xystudio.my.id/auth/callback
https://web2apk.xystudio.my.id/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

Jika menggunakan Vercel Preview, tambahkan pola preview secara hati-hati atau tambahkan URL preview tertentu yang sedang dipakai.

## 5.3 Confirmation email flow

Alur normal:

```text
/register
→ Supabase mengirim email
→ pengguna klik tautan
→ /auth/callback
→ exchange code menjadi session
→ /dashboard
```

Pastikan template email konfirmasi menggunakan confirmation URL yang disediakan Supabase.

## 5.4 Tes Auth

Uji:

- Registrasi akun baru
- Email confirmation
- Login
- Refresh browser
- Logout
- Login password salah
- Show/hide password
- Lupa password dan email recovery
- Menetapkan password baru
- User A tidak dapat membuka build User B

---

# 6. Setup Custom SMTP

Email bawaan Supabase cocok untuk development, tetapi production sebaiknya memakai SMTP sendiri.

Provider yang dapat digunakan:

- Resend
- Brevo
- Postmark
- Amazon SES

Gunakan alamat seperti:

```text
noreply@xystudio.my.id
support@xystudio.my.id
```

Konfigurasikan DNS:

- SPF
- DKIM
- DMARC

Setelah SMTP aktif, uji email pada Gmail, Outlook, Yahoo, dan folder spam.

Jangan menaruh SMTP password di repository.

---

# 7. Setup Storage dan RLS

Buka **Storage** dan pastikan ada:

```text
sources  → private
apks     → private
```

Jangan mengubah bucket menjadi public.

## 7.1 Struktur object

```text
sources/{user_id}/{build_id}/source.zip
sources/{user_id}/{build_id}/icon.png
apks/{user_id}/{build_id}.apk
```

Download dilakukan memakai signed URL sementara.

## 7.2 Row Level Security

RLS memastikan pengguna hanya membaca project miliknya. Service-role dipakai backend dan GitHub worker untuk operasi server-side.

Jangan menonaktifkan RLS untuk memperbaiki error. Cari policy atau credential yang salah.

---

# 8. Setup GitHub Repository

Repository:

```text
Kallxy1/Web2apk
```

Buka:

```text
Settings → Actions → General
```

Pastikan GitHub Actions diizinkan.

Workflow:

```text
.github/workflows/ci.yml
.github/workflows/build-apk.yml
```

CI menjalankan typecheck dan Next.js production build. APK workflow menjalankan Android builder.

## 8.1 Repository public vs private

Untuk membatasi penyalinan source, ubah repository menjadi private:

```text
Settings → General → Danger Zone → Change repository visibility
```

Pastikan integrasi Vercel tetap memiliki akses ke private repository.

`LICENSE` dan Terms memberi perlindungan legal, tetapi repository private memberi perlindungan teknis yang lebih kuat. Website publik tetap mengirim HTML/CSS/JavaScript client ke browser dan tidak mungkin dibuat 100% anti-copy.

---

# 9. Token GitHub untuk Workflow Dispatch

Backend Next.js memerlukan token untuk memanggil:

```text
workflow_dispatch
```

Buat **fine-grained personal access token**:

1. GitHub Settings
2. Developer settings
3. Personal access tokens
4. Fine-grained token
5. Resource owner: `Kallxy1`
6. Repository access: hanya `Web2apk`
7. Permission:
   - Actions: Read and write
   - Metadata: Read-only
8. Gunakan expiration yang wajar

Simpan di Vercel sebagai:

```text
GITHUB_TOKEN
```

Token untuk workflow dispatch berbeda dari token sementara untuk `git push`.

Jika token pernah ditulis di chat, screenshot, log, atau source code, rotate/revoke token tersebut.

---

# 10. GitHub Actions Secrets

Buka:

```text
Repository → Settings → Secrets and variables → Actions
```

Tambahkan:

| Secret | Nilai |
|---|---|
| `SUPABASE_URL` | `https://PROJECT_ID.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key |

`SUPABASE_URL` harus base URL, tanpa `/rest/v1`. Workflow memiliki normalisasi tambahan, tetapi secret tetap sebaiknya benar.

Untuk production signing tambahkan:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

---

# 11. Android Production Signing

Tanpa keystore production, builder memakai debug signing. APK dapat dipasang untuk testing, tetapi tidak ideal untuk distribusi production.

## 11.1 Membuat keystore

```bash
keytool -genkeypair -v \
  -keystore release.jks \
  -alias web2apk \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

## 11.2 Ubah menjadi base64

Linux:

```bash
base64 -w 0 release.jks > release.jks.base64.txt
```

macOS:

```bash
base64 < release.jks | tr -d '\n' > release.jks.base64.txt
```

Masukkan isi file base64 ke GitHub secret:

```text
ANDROID_KEYSTORE_BASE64
```

## 11.3 Backup

Backup permanen:

- `release.jks`
- Store password
- Key alias
- Key password

Jika signing key hilang, update aplikasi dengan package name yang sama dapat menjadi tidak mungkin.

Jangan commit `.jks`, `.keystore`, atau file base64. Keempat signing secret wajib terisi bersama. Jika hanya `ANDROID_KEYSTORE_BASE64` yang terisi sementara password/alias kosong, workflow terbaru mengabaikan signing production dan memakai debug signing agar build tidak gagal.

---

# 12. Environment Vercel

Buka:

```text
Vercel → Project → Settings → Environment Variables
```

Tambahkan:

```env
NEXT_PUBLIC_APP_URL=https://web2apk.xystudio.my.id
NEXT_PUBLIC_HELP_URL=https://help.xystudio.my.id
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY
GITHUB_TOKEN=FINE_GRAINED_WORKFLOW_TOKEN
GITHUB_OWNER=Kallxy1
GITHUB_REPO=Web2apk
GITHUB_REF=main
CRON_SECRET=RANDOM_LONG_SECRET
```

## 12.1 Buat CRON_SECRET

```bash
openssl rand -hex 32
```

Masukkan hasilnya ke Vercel. Jangan gunakan contoh placeholder.

## 12.2 Environment scope

Minimal aktifkan untuk:

- Production

Tambahkan juga untuk Preview/Development hanya jika memang diperlukan dan gunakan credentials terpisah jika memungkinkan.

## 12.3 Setelah env berubah

Environment baru tidak selalu diterapkan pada deployment lama. Lakukan:

```text
Deployments → pilih deployment terbaru → Redeploy
```

---

# 13. Deployment Vercel

1. Import repository `Kallxy1/Web2apk`.
2. Framework harus terdeteksi sebagai Next.js.
3. Root directory tetap repository root.
4. Tambahkan seluruh environment.
5. Deploy.
6. Buka deployment logs.
7. Pastikan typecheck/build sukses.
8. Hubungkan custom domain.

Perintah lokal yang sama dengan CI:

```bash
npm install
npm run typecheck
npm run build
```

Jangan memakai `npm audit fix --force` tanpa review karena dapat mengganti dependency ke versi breaking.

---

# 14. Custom Domain

Tambahkan di:

```text
Vercel → Project → Settings → Domains
```

Domain:

```text
web2apk.xystudio.my.id
```

DNS subdomain biasanya:

```text
Type: CNAME
Name: web2apk
Target: cname.vercel-dns.com
TTL: Auto
```

Ikuti target yang ditampilkan Vercel jika berbeda.

Untuk pusat bantuan terpisah, tambahkan juga domain berikut ke project Vercel yang sama:

```text
help.xystudio.my.id
```

Buat CNAME `help` mengikuti target Vercel, lalu tambahkan environment:

```env
NEXT_PUBLIC_HELP_URL=https://help.xystudio.my.id
```

Konfigurasi host akan menampilkan Help Center pada root subdomain, sedangkan `/terms`, `/privacy`, `/cookies`, `/faq`, dan `/security` memakai halaman legal/help yang sama tanpa duplikasi project.

Tunggu status:

```text
Valid Configuration
```

Vercel akan menyediakan HTTPS otomatis.

Verifikasi:

```bash
curl -I https://web2apk.xystudio.my.id
```

Harus memperoleh status `200` atau redirect valid dan header keamanan seperti:

```text
strict-transport-security
x-content-type-options
x-frame-options
referrer-policy
permissions-policy
```

---

# 15. Admin dan Paket SaaS

Paket default:

| Paket | Build/hari | Upload | Retensi |
|---|---:|---:|---:|
| Free | 3 | 25 MB | 7 hari |
| Pro | 30 | 100 MB | 30 hari |
| Business | 100 | 250 MB | 90 hari |

## 15.1 Promosikan admin

Jalankan di Supabase SQL Editor:

```sql
update public.profiles
set role='admin'
where email='EMAIL_ADMIN_ANDA';
```

Logout lalu login kembali. Menu Admin akan muncul. Admin Control Center dapat:

- Mengubah paket Free/Pro/Business
- Mengubah role User/Admin
- Suspend atau mengaktifkan kembali akun
- Melihat statistik pengguna dan build
- Menghapus build gagal beserta source dan APK

## 15.2 Ubah plan manual

Sebelum payment gateway aktif:

```sql
update public.profiles
set plan='pro'
where email='EMAIL_PENGGUNA';
```

Pilihan:

```text
free
pro
business
```

## 15.3 Premium app updates

Pengguna Pro dan Business mendapat tombol **Buat versi update** pada build yang sukses. Sistem:

- Memakai ulang source dan app icon versi sebelumnya
- Mempertahankan package name agar APK dapat menjadi update aplikasi lama
- Menyarankan version code +1
- Mengizinkan perubahan nama, versi, permission, splash, warna, orientasi, URL/source baru, dan capability lain
- Menyalin source ke storage object baru agar versi lama dan baru terpisah
- Tidak memotong kuota build baru harian untuk update premium
- Menghubungkan versi melalui `parent_build_id`

Package name harus tetap sama untuk update Android yang sebenarnya, dan signing key wajib sama dengan versi sebelumnya.

## 15.4 Payment gateway

Halaman Pricing saat ini menjadi foundation/waitlist. Untuk pembayaran production, integrasikan salah satu:

- Midtrans
- Xendit
- Tripay
- Stripe

Jangan mengubah plan hanya berdasarkan response browser. Verifikasi webhook payment pada server, simpan transaction ID, cek signature, lalu update plan menggunakan service-role.

---

# 16. OneSignal Push Notification

1. Buat akun OneSignal.
2. Buat Android application.
3. Hubungkan Firebase/FCM sesuai wizard OneSignal.
4. Buka Settings → Keys & IDs.
5. Salin **OneSignal App ID**.
6. Saat build, aktifkan push notification.
7. Masukkan OneSignal App ID.

OneSignal App ID boleh masuk APK. **OneSignal REST API key tidak boleh masuk APK atau form builder.**

Uji:

- Install APK
- Izinkan notifikasi
- Pastikan device terdaftar di OneSignal
- Kirim test notification
- Uji foreground dan background

---

# 17. Pengujian End-to-End

Jangan menganggap deployment selesai sebelum alur ini berhasil.

## 17.1 Auth

- Register
- Confirm email
- Login
- Logout
- Session refresh
- RLS antar pengguna

## 17.2 Create session

Klik Build aplikasi. URL harus berbentuk:

```text
https://web2apk.xystudio.my.id/c/14karakteracak
```

Isi semua langkah:

1. Source
2. Identitas
3. Capability
4. Review

Pastikan data langkah sebelumnya tetap terkirim saat klik Build APK.

## 17.3 Build status

Status normal:

```text
queued
→ building
→ progress 10%
→ project Android disiapkan 35%
→ Gradle build 55%
→ success 100%
```

Panel Build Log menampilkan event worker, validasi source, persiapan project, proses Gradle, upload APK, dan potongan error Gradle jika build gagal. Fitur ini memerlukan migration 005.

## 17.4 Output

Setelah sukses, uji:

- Download APK
- Install APK
- Splash screen
- App icon
- Fullscreen
- Zoom setting
- Back button
- Permission
- Offline HTML
- OneSignal

---

# 18. Build URL, HTML, dan ZIP

## 18.1 Website URL

URL wajib HTTPS:

```text
https://example.com
```

HTTP cleartext diblokir untuk keamanan.

## 18.2 HTML tunggal

File yang diterima:

```text
index.html
app.html
website.htm
```

Sistem otomatis membungkus HTML menjadi ZIP dengan nama `index.html`.

## 18.3 ZIP offline

Struktur ideal:

```text
project.zip
├── index.html
├── css/
├── js/
└── assets/
```

Satu folder pembungkus juga didukung:

```text
project.zip
└── project/
    ├── index.html
    └── assets/
```

Jangan memakai path absolut. Gunakan asset relatif.

## 18.4 Safe extraction

Builder memeriksa:

- Path traversal/zip-slip
- Ukuran file hasil ekstraksi
- Total hasil ekstraksi
- Kehadiran `index.html`

Untuk layanan publik skala besar, tambahkan malware scanning dan batas jumlah file.

---

# 19. Retention dan Automatic Cleanup

Vercel Cron memanggil:

```text
/api/cron/cleanup
```

Jadwal berada di `vercel.json` dan berjalan setiap hari.

Endpoint memerlukan:

```text
Authorization: Bearer CRON_SECRET
```

Cleanup menghapus:

- Source ZIP
- App icon
- APK
- Database build yang kedaluwarsa

Jangan memanggil endpoint tanpa secret.

Pantau Vercel Cron logs setelah deployment.

---

# 20. Optimasi Performa dan Anti-Lag

Web2APK sudah memakai:

- Next.js App Router
- Server Components pada halaman publik/dashboard
- Dynamic import untuk APK builder
- Dynamic import JSZip hanya saat upload ZIP
- Route loading skeleton
- Native scroll animation
- Reduced-motion support
- System font tanpa external font blocking
- Optimized Lucide imports
- Vercel compression
- Static logo cache
- `content-visibility` untuk section bawah layar
- Mobile blur reduction
- Mobile noise overlay disabled
- GPU-friendly transform animation
- Vercel Analytics
- Vercel Speed Insights

## 20.1 Menghindari lag di mobile

Efek berikut mahal pada GPU mobile:

- Blur besar
- Fixed noise overlay
- Banyak backdrop-filter
- Animasi filter blur
- Terlalu banyak elemen dengan `will-change`

Karena itu versi mobile mengurangi blur, mematikan noise overlay, dan menggunakan animasi transform/opacity.

## 20.2 Mengukur, bukan menebak

Buka:

```text
Vercel → Project → Analytics
Vercel → Project → Speed Insights
```

Pantau Core Web Vitals:

- LCP
- INP
- CLS
- FCP
- TTFB

Target umum:

```text
LCP < 2.5s
INP < 200ms
CLS < 0.1
```

## 20.3 Lighthouse

Jalankan Chrome DevTools:

```text
DevTools → Lighthouse → Mobile → Analyze page load
```

Uji minimal:

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/c/{kode}`
- `/pricing`

Gunakan mode Incognito, nonaktifkan extension, dan uji dengan throttling mobile.

## 20.4 Network testing

Uji dengan:

- Fast 4G
- Slow 4G
- Device low-end
- Cache kosong
- Cache aktif

Skeleton harus muncul saat route/data belum siap dan tidak boleh menyebabkan layout shift besar.

## 20.5 Jangan menambah dependency sembarangan

Sebelum menambah library UI/animation:

1. Periksa bundle size.
2. Pastikan tree-shaking.
3. Pilih CSS/native API jika cukup.
4. Dynamic import library berat.
5. Hindari animation library untuk efek sederhana.

## 20.6 Optimasi gambar

Untuk aset website:

- Gunakan SVG untuk logo sederhana.
- Gunakan Next Image untuk gambar raster statis.
- Gunakan WebP/AVIF jika sesuai.
- Jangan upload hero image berukuran beberapa MB.
- Tentukan width/height agar CLS rendah.

## 20.7 Builder performance

JSZip tidak masuk initial bundle builder. Source detection baru memuat JSZip ketika file ZIP dipilih. Jangan mengubahnya menjadi static import.

## 20.8 Database performance

Migration telah menambahkan index pada:

- User + created time
- Status + created time
- Public create code

Untuk data besar, pantau query Supabase dan gunakan pagination. Jangan mengambil seluruh build tanpa limit ketika jumlah data sudah ribuan.

---

# 21. SEO dan Monitoring

Sudah tersedia:

```text
/sitemap.xml
/robots.txt
/manifest.webmanifest
```

Halaman dashboard, API, login, register, dan create session tidak ditujukan untuk indexing.

Daftarkan domain ke:

- Google Search Console
- Bing Webmaster Tools

Submit:

```text
https://web2apk.xystudio.my.id/sitemap.xml
```

Monitoring yang disarankan:

- Vercel Analytics
- Vercel Speed Insights
- Supabase logs
- GitHub Actions logs
- UptimeRobot/Better Stack
- Sentry untuk error tracking lanjutan

---

# 22. Keamanan Production

## 22.1 Secret rules

Jangan commit:

```text
.env
.env.local
*.jks
*.keystore
service-role key
GitHub token
SMTP password
OneSignal REST key
```

Jika secret terekspos:

1. Revoke/rotate.
2. Update Vercel/GitHub Secrets.
3. Redeploy.
4. Periksa logs.
5. Jangan hanya menghapus dari commit terbaru; pertimbangkan history cleanup.

## 22.2 Public website tidak bisa 100% anti-copy

Klik kanan, inspect element, dan text selection bukan mekanisme keamanan. Kode server tetap tidak dikirim ke browser, tetapi HTML/CSS/client JavaScript publik dapat diperiksa.

Perlindungan yang benar:

- Private repository
- Proprietary license
- Server-side secrets
- RLS
- Private Storage
- Signed URL
- Rate/quota limits
- Legal TOS

## 22.3 Abuse prevention berikutnya

Untuk traffic besar, tambahkan:

- Cloudflare Turnstile
- IP rate limit
- Upstash Redis limiter
- Malware scanner
- Audit logs
- Payment webhook verification
- Alert build volume abnormal

---

# 23. Troubleshooting

## 23.1 `Invalid path specified in request URL`

Penyebab paling umum:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co/rest/v1/
```

Perbaiki menjadi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
```

Redeploy Vercel.

## 23.2 Error `Required` saat Review

Pastikan deployment sudah memakai commit fix wizard terbaru. Builder harus mempertahankan field dari semua langkah. Hard refresh atau buat sesi `/c/{kode}` baru setelah deployment.

## 23.3 Build tetap queued

Periksa:

- `GITHUB_TOKEN` Vercel
- Permission Actions Read and write
- `GITHUB_OWNER=Kallxy1`
- `GITHUB_REPO=Web2apk`
- `GITHUB_REF=main`
- GitHub Actions enabled

## 23.4 Workflow gagal update database

Periksa GitHub Actions secrets:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Gunakan service-role key, bukan anon key.

## 23.5 `public_code` tidak ditemukan

Jalankan:

```text
004_private_build_sessions.sql
```

## 23.6 Profile/plan error

Jalankan:

```text
003_saas_and_build_operations.sql
```

Pastikan profile user tersedia:

```sql
select * from public.profiles order by created_at desc;
```

## 23.7 Email tidak masuk

- Periksa Supabase Auth logs
- Periksa spam
- Verifikasi SMTP
- Periksa SPF/DKIM/DMARC
- Pastikan email confirmation aktif

## 23.8 ZIP gagal

Pastikan `index.html` ada di root atau tepat dalam satu folder pembungkus.

## 23.9 APK tidak dapat update

- Package name harus sama
- Version code harus naik
- Signing key harus sama

## 23.10 APK tidak tersedia

Pastikan GitHub Actions berhasil menjalankan `assembleRelease`, signing tidak salah, dan upload private Storage selesai.

## 23.11 Website terasa lambat

1. Buka Speed Insights.
2. Cari route dan device yang lambat.
3. Uji tanpa extension.
4. Periksa ukuran asset.
5. Periksa Supabase region.
6. Periksa API latency.
7. Pastikan deployment terbaru.
8. Jangan menambah blur/animation berat pada mobile.
9. Gunakan pagination untuk data besar.
10. Periksa browser memory pada wizard upload file besar.

## 23.12 Vercel env sudah diubah tetapi error masih sama

Environment hanya masuk pada deployment baru. Redeploy setelah mengubah env dan lakukan hard refresh.

## 23.13 Gradle `checkReleaseDuplicateClasses`

Jika log menyebut duplicate Kotlin stdlib/jdk7/jdk8, pastikan template terbaru digunakan. Builder sekarang hanya menambahkan dependency OneSignal ketika push notification benar-benar aktif dan memaksa versi Kotlin dependency agar konsisten. Build tanpa OneSignal tidak lagi membawa dependency Kotlin tersebut.

## 23.14 Signing password kosong

Jika log menampilkan `ANDROID_KEYSTORE_PASSWORD`, alias, atau key password kosong, lengkapi seluruh GitHub signing secrets atau hapus `ANDROID_KEYSTORE_BASE64` untuk sementara agar builder memakai debug signing.

---

# 24. Update dan Rollback

## 24.1 Sebelum push

```bash
npm install
npm run typecheck
npm run build
```

Periksa:

```bash
git status
git diff --check
```

Pastikan tidak ada secret.

## 24.2 Deployment normal

```text
Commit → Push main → GitHub CI → Vercel production deploy
```

## 24.3 Migration discipline

- Migration database harus additive jika memungkinkan.
- Jalankan migration sebelum fitur baru yang bergantung pada kolom tersebut dipakai.
- Backup sebelum perubahan destruktif.
- Jangan menghapus kolom production tanpa masa transisi.

## 24.4 Rollback aplikasi

Di Vercel:

```text
Deployments → pilih deployment sehat → Promote to Production
```

Rollback kode tidak otomatis rollback database. Migration database harus ditangani terpisah dan hati-hati.

---

# 25. Checklist Production

## Database

- [ ] Migration 001 berhasil
- [ ] Migration 002 berhasil
- [ ] Migration 003 berhasil
- [ ] Migration 004 berhasil
- [ ] Migration 005 berhasil
- [ ] Migration 006 berhasil
- [ ] Table `builds` lengkap
- [ ] Table `build_logs` tersedia
- [ ] Table `profiles` tersedia
- [ ] RLS aktif
- [ ] Index tersedia

## Auth

- [ ] Email provider aktif
- [ ] Confirm email aktif
- [ ] Site URL benar
- [ ] Callback production benar
- [ ] Custom SMTP aktif
- [ ] SPF/DKIM/DMARC valid

## Storage

- [ ] `sources` private
- [ ] `apks` private
- [ ] Signed download bekerja
- [ ] Cleanup cron bekerja

## Vercel

- [ ] Seluruh env tersedia
- [ ] Supabase URL tanpa `/rest/v1`
- [ ] `CRON_SECRET` kuat
- [ ] Custom domain valid
- [ ] HTTPS aktif
- [ ] Analytics aktif
- [ ] Speed Insights aktif

## GitHub

- [ ] Actions aktif
- [ ] CI sukses
- [ ] Build workflow dapat di-dispatch
- [ ] Supabase secrets tersedia
- [ ] Token dibatasi ke satu repository
- [ ] Repository private jika source harus dilindungi

## Android

- [ ] Production keystore tersedia
- [ ] Keystore dibackup
- [ ] APK berhasil
- [ ] App icon berhasil
- [ ] Splash berhasil
- [ ] Permission berhasil
- [ ] OneSignal berhasil

## SaaS

- [ ] Admin pertama dipromosikan
- [ ] Free quota bekerja
- [ ] Retention bekerja
- [ ] Retry bekerja
- [ ] Delete project bekerja
- [ ] Pricing sesuai kebijakan bisnis
- [ ] Webhook payment diverifikasi sebelum plan otomatis

## Performance

- [ ] Lighthouse mobile diuji
- [ ] LCP < 2.5 detik pada kondisi wajar
- [ ] INP < 200 ms
- [ ] CLS < 0.1
- [ ] Tidak ada asset gambar besar
- [ ] Skeleton muncul pada route dinamis
- [ ] Mobile blur tidak berlebihan
- [ ] Upload ZIP tidak membekukan UI secara lama

## Security

- [ ] Tidak ada `.env` dalam Git
- [ ] Tidak ada token dalam Git
- [ ] Token chat lama sudah di-rotate
- [ ] Service-role hanya server-side
- [ ] Keystore tidak masuk repository
- [ ] TOS, Privacy, Security tersedia
- [ ] Monitoring dan alert aktif

---

# Quick Recovery Checklist

Jika production bermasalah setelah update:

1. Periksa deployment Vercel terbaru.
2. Periksa GitHub CI.
3. Periksa semua migration.
4. Periksa environment Vercel.
5. Pastikan Supabase URL tidak mengandung `/rest/v1`.
6. Periksa Supabase Auth logs.
7. Periksa GitHub Actions build logs.
8. Coba akun dan create session baru.
9. Rollback deployment Vercel jika perlu.
10. Jangan menghapus database untuk memperbaiki error konfigurasi.

---

**Powered by XyStudio's**<br>
**Dikembangkan oleh KallAntiKecot**
