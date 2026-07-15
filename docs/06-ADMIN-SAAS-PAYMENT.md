# 06 — Admin, SaaS, Plan & Midtrans

Admin Control Center dapat:

- ubah plan/role
- suspend/aktifkan akun
- aktifkan trusted Compose
- hapus build/source/APK
- maintenance mode
- buka/tutup registrasi dan build
- announcement global
- melihat audit log

Admin tetap tidak boleh melihat plaintext password, secret, atau keystore.

## Midtrans

```env
MIDTRANS_SERVER_KEY=...
```

Webhook memverifikasi SHA-512 dan hanya mengaktifkan plan pada settlement/capture. Simpan user UUID pada `custom_field1` dan plan pada `custom_field2` ketika membuat transaksi.

Plan harus diubah melalui server/webhook terverifikasi, bukan dari browser.
