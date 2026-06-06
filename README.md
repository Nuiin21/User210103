# WA HD Bot 🤖

Bot WhatsApp untuk upload Story HD tanpa kompresi.

---

## Cara Deploy ke Railway

### 1. Persiapan
- Akun GitHub: https://github.com
- Akun Railway: https://railway.app (login pakai GitHub)
- Nomor WA khusus buat bot (jangan nomor utama)

### 2. Upload ke GitHub
1. Buat repo baru di GitHub (nama bebas, set Private)
2. Upload semua file ini ke repo tersebut
3. Pastikan folder `auth_info/` TIDAK ikut diupload (sudah ada di .gitignore)

### 3. Deploy ke Railway
1. Login ke https://railway.app
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repo yang tadi dibuat
4. Railway otomatis detect Node.js dan build
5. Tunggu deploy selesai

### 4. Scan QR
1. Di Railway dashboard, buka tab **Deployments**
2. Klik deployment yang aktif → **View Logs**
3. QR code muncul di logs
4. Buka WA di HP → Perangkat Tertaut → Tautkan Perangkat Baru
5. Scan QR dari logs Railway
6. Bot langsung aktif ✅

---

## Cara Pakai Bot

### Video HD Story
1. Di WA, pilih file video
2. Kirim sebagai **Dokumen** (tap ikon 📎, bukan galeri)
3. Caption: `vidhd`
4. Bot balas dokumen video HD
5. Buka dokumen → Share → Status WA

### Gambar HD Story
1. Di WA, pilih file gambar
2. Kirim sebagai **Dokumen**
3. Caption: `imghd`
4. Bot balas dokumen gambar HD
5. Buka dokumen → Share → Status WA

### Perintah lain
- `menu` atau `/menu` — lihat semua perintah

---

## Catatan Penting

⚠️ **Railway Free Tier**: Bot bisa restart sewaktu-waktu dan QR perlu scan ulang.
Cek logs Railway kalau bot tiba-tiba ga respon.

⚠️ **Jangan pakai nomor utama** untuk bot — risiko banned dari WA karena
menggunakan unofficial API.

⚠️ **auth_info folder** menyimpan sesi login WA. Jangan share ke siapapun.
