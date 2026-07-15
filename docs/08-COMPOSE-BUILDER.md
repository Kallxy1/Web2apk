# 08 — Trusted Jetpack Compose Builder

Format input adalah Android Studio/Gradle project ZIP lengkap dengan `gradlew` dan `settings.gradle(.kts)`.

Full Gradle project dapat menjalankan kode pada build host. Karena itu:

- akses hanya admin/trusted user
- source dipindai ClamAV
- Gradle berjalan pada job tanpa service-role/signing secrets
- artifact dipindahkan ke publish job
- signing/upload dilakukan terpisah

Admin mengaktifkan `compose_access` dari dashboard. Jangan membuka fitur ini untuk seluruh pengguna tanpa review tambahan.
