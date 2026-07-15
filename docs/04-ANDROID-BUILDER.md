# 04 — GitHub Actions & Android Builder

## WebView worker

Workflow `build-apk.yml` memvalidasi source, scan executable, menyiapkan template, menjalankan Gradle, signing, upload APK, dan update status/log.

## Android options

- min SDK 23/26/29
- target SDK 35/36
- universal/ARM32/ARM64/x86_64
- storage mode normal/low/ephemeral
- internal/media/app-specific download folder
- permission, splash, icon, orientation, fullscreen, user-agent

## Signing

Keempat secret harus lengkap:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

Jika tidak lengkap, workflow memakai debug signing. Package name, version code, dan signing key menentukan kemampuan update.

## Build log

Migration build logs wajib aktif. Halaman project menampilkan tahap worker dan potongan Gradle error.
