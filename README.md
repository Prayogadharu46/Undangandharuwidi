# Undangan Pernikahan Digital - Prayoga Imandharu & Widiya Putri

Website undangan pernikahan digital interaktif, elegan, dan siap produksi (*production-ready*). Dibangun dengan pendekatan **mobile-first (rasio 9:16)**, navigasi berbasis sentuhan (*tap to next*), transisi animasi lembut (*staggered animations*), pemutar musik latar, amplop digital (*cashless*), galeri foto dengan modal lightbox, hitung mundur *real-time*, serta sistem RSVP/Ucapan lengkap dengan panel admin dan fitur ekspor CSV/JSON.

---

## 📋 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Struktur Folder](#-struktur-folder)
3. [Panduan Menjalankan Secara Lokal](#-panduan-menjalankan-secara-lokal)
4. [Cara Mengatur Password Admin](#-cara-mengatur-password-admin)
5. [Cara Mengganti Lagu / Musik Latar](#-cara-mengganti-lagu--musik-latar)
6. [Cara Mengubah Data di `config.js`](#-cara-mengubah-data-di-configjs)
7. [Cara Membuat Tautan Khusus Tamu (`?to=Nama`)](#-cara-membuat-tautan-khusus-tamu-tonama)
8. [Panduan Deploy](#-panduan-deploy)
   - [Opsi A: VPS / Node.js Hosting](#opsi-a-deploy-ke-vps--node-hosting)
   - [Opsi B: Hosting Statis (GitHub Pages, Netlify, Vercel)](#opsi-b-deploy-ke-hosting-statis-github-pages-netlify-cpanel-html)
9. [Ringkasan Elemen & Placeholder yang Perlu Diisi Manual](#-ringkasan-elemen-yang-perlu-diisi-manual)

---

## ✨ Fitur Utama

- **Navigasi Layar (Tap to Advance)**: Transisi slide halus tanpa slider/carousel/swipe. Slide berpindah saat layar disentuh, dengan perlindungan anti-dobel-klik (*click lock*) saat animasi berlangsung.
- **Urutan 11 Slide Lengkap**:
  1. **Cover**: Amplop beranimasi buka, kartu undangan naik perlahan, nama mempelai, nama tamu otomatis, serta tombol berdenyut *"Open Invitation"*.
  2. **Mempelai**: Foto amplop berayun (*swaying*) dihiasi bunga tulip, disusul teks nama "Widiya", "- and -", "Dharu", serta tanggal.
  3. **Surah**: Kutipan ayat suci Q.S Ar-Rum : 21 yang muncul perlahan di tengah layar.
  4. **Salam Pembuka**: Kalimat salam tulus berpadu dengan ilustrasi meja & kursi santai.
  5. **Mempelai Pria**: Foto berbingkai ukir Prayoga Imandharu, S.T. beserta gelar dan keterangan keluarga.
  6. **Mempelai Wanita**: Foto berbingkai ukir merah muda Widiya Putri, S.E. beserta gelar dan keterangan keluarga.
  7. **Akad Nikah & Countdown**: Gapura bunga, tanggal, lokasi, jam, tombol Google Maps, dan widget hitung mundur *Save The Date* (Hari, Jam, Menit, Detik) *real-time*.
  8. **Resepsi**: Ilustrasi garis gedung pertemuan, detail waktu & lokasi, serta tautan navigasi peta.
  9. **Galeri Foto**: Kolase 6 foto dengan animasi masuk bertahap (*staggered scale & fade*). Setiap foto dapat diklik untuk membuka penampil ukuran penuh (*Lightbox*).
  10. **Cashless (Amplop Digital)**: Ilustrasi kado, kartu rekening Bank BCA (Pria) dan Bank Mandiri (Wanita) dilengkapi tombol *Copy account* dan notifikasi *Toast*.
  11. **RSVP & Doa Ucapan**: Statistik kehadiran (Hadir, Tidak Hadir, Masih Ragu), form kirim doa, serta daftar ucapan *scrollable* dengan proteksi tombol *Edit* & *Delete* hanya untuk pemilik perangkat.
  12. **Penutup (Closing Celebration)**: Teks *"See you on our Wedding Day"*, kamera polaroid dengan animasi pita film foto yang turun meluncur, serta kredit pembuat *"Dibuat dengan cinta oleh Dharu"*.
- **Bar Navigasi Bawah**: 5 ikon bertema merah muda dengan indikator aktif sesuai slide yang sedang dibuka.
- **Pemutar Musik**: Musik otomatis berputar setelah cover dibuka (*Open Invitation*) dengan tombol piringan berputar di pojok atas untuk jeda/putar kembali.
- **Panel Admin (/admin)**: Dilindungi kata sandi, melihat seluruh ucapan, menghapus ucapan spam, serta ekspor data ke format CSV (siap dibuka di Microsoft Excel) dan JSON.
- **Mode Dual Backend / Fallback Statis**: Jika dijalankan tanpa server Node.js (misal di GitHub Pages), sistem otomatis beralih ke penyimpanan `localStorage` pada browser pengunjung.

---

## 📁 Struktur Folder

```text
├── config.js                    # Konfigurasi master data pernikahan
├── package.json                 # Konfigurasi Node.js & dependencies
├── server.js                    # Backend REST API Express & static server
├── .env                         # Konfigurasi environment (PORT, ADMIN_PASSWORD)
├── .env.example                 # Contoh template konfigurasi .env
├── README.md                    # Dokumentasi lengkap
├── data/
│   └── ucapan.json              # Penyimpanan data ucapan permanen
└── public/
    ├── index.html               # Halaman utama undangan (11 slide)
    ├── admin.html               # Halaman panel admin RSVP
    ├── css/
    │   └── style.css            # Desain tampilan responsif & animasi
    ├── js/
    │   ├── config.js            # Konfigurasi frontend
    │   └── app.js               # Logika navigasi, audio, countdown, RSVP
    └── assets/
        ├── images/              # Seluruh aset visual (amplop, bunga, bingkai, dll.)
        │   ├── galeri/          # Foto-foto galeri berkualitas tinggi
        │   └── camera/          # Cuplikan animasi kamera polaroid
        └── music/
            └── lagu.mp3         # File audio latar belakang
```

---

## 🚀 Panduan Menjalankan Secara Lokal

Pastikan komputer Anda telah terpasang **Node.js** (versi 16 ke atas direkomendasikan).

1. **Buka Terminal / Command Prompt / PowerShell** di direktori proyek ini:
   ```bash
   cd "d:\1. DHARU WIDI\Undangan"
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi**:
   ```bash
   npm start
   ```

4. **Buka Browser**:
   - Halaman Undangan: [http://localhost:3000](http://localhost:3000)
   - Panel Admin RSVP: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Cara Mengatur Password Admin

Kata sandi panel admin disimpan di file `.env` pada baris:
```env
ADMIN_PASSWORD=dharuwidi2027
```

Untuk mengubahnya:
1. Buka file `.env` menggunakan teks editor (VS Code, Notepad, dll).
2. Ubah `dharuwidi2027` menjadi kata sandi yang Anda inginkan, contoh:
   ```env
   ADMIN_PASSWORD=RahasiaDharu2027!
   ```
3. Simpan file `.env` dan *restart* server (`Ctrl + C` lalu ketik `npm start`).
4. Buka `http://localhost:3000/admin` dan masuk menggunakan password baru tersebut.

---

## 🎵 Cara Mengganti Lagu / Musik Latar

Lagu latar default sudah terpasang di folder `public/assets/music/lagu.mp3` (diekstrak langsung dari referensi video).

Jika Anda ingin mengganti lagu dengan musik pilihan sendiri:
1. Siapkan file musik bertipe `.mp3`.
2. Beri nama file tersebut: `lagu.mp3`.
3. Timpa (*replace*) file di path:
   ```text
   public/assets/music/lagu.mp3
   ```
4. *Refresh* browser Anda. Musik baru akan langsung dimuat otomatis.

---

## ⚙️ Cara Mengubah Data di `config.js`

Semua teks, tanggal, lokasi, nomor rekening, dan informasi penting lainnya terpusat di `public/js/config.js` (dan salinannya di `config.js` root).

Contoh pengaturan yang dapat disesuaikan:

```javascript
// Nama dan Orang Tua Mempelai
couple: {
  groom: {
    fullName: "Prayoga Imandharu, S.T.",
    shortName: "Dharu",
    parents: "Putra Ketiga dari Bapak [Nama Ayah] dan Ibu [Nama Ibu]",
    accountBank: "Bank BCA",
    accountNumber: "1234567890", // Ganti nomor rekening BCA
    accountHolder: "Prayoga Imandharu"
  },
  bride: {
    fullName: "Widiya Putri, S.E.",
    shortName: "Widiya",
    parents: "Putri Ketiga dari Bapak [Nama Ayah] dan Ibu [Nama Ibu]",
    accountBank: "Bank Mandiri",
    accountNumber: "0987654321", // Ganti nomor rekening Mandiri
    accountHolder: "Widiya Putri"
  }
},

// Target Countdown Hari H (WITA / UTC+8)
countdownTarget: "2027-08-31T08:00:00+08:00",

// Tempat & Jam Akad
akad: {
  dayAndDate: "Selasa, 31 Agustus 2027",
  time: "08.00 s/d 10.00 WITA",
  locationName: "Gedung Mustikasari Convention Hall",
  address: "Jl. Pemuda No. 123, Kabupaten Berau",
  mapsUrl: "https://maps.google.com/?q=Lokasi+Akad"
},

// Tempat & Jam Resepsi
resepsi: {
  dayAndDate: "Selasa, 31 Agustus 2027",
  time: "11.00 s/d 14.00 WITA",
  locationName: "Gedung Mustikasari Convention Hall",
  address: "Jl. Pemuda No. 123, Kabupaten Berau",
  mapsUrl: "https://maps.google.com/?q=Lokasi+Resepsi"
}
```

---

## 💌 Cara Membuat Tautan Khusus Tamu (`?to=Nama`)

Anda dapat membuat tautan personal untuk setiap tamu dengan menambahkan parameter `?to=Nama+Tamu` di akhir alamat website:

- Format URL:
  ```text
  https://domain-undangan-anda.com/?to=Nama+Tamu
  ```
- Contoh untuk tamu "Bapak Joko Widodo":
  ```text
  https://domain-undangan-anda.com/?to=Bapak+Joko+Widodo
  ```
- Contoh untuk tamu "Sahabat Dharu di Berau":
  ```text
  https://domain-undangan-anda.com/?to=Sahabat+Dharu+di+Berau
  ```
- Jika tautan dibuka tanpa parameter `?to=`, maka sistem akan otomatis menampilkan tulisan default: **"Tamu Undangan"**.

---

## 🌐 Panduan Deploy

### Opsi A: Deploy ke VPS / Node.js Hosting (Direkomendasikan)
Cocok untuk: VPS Ubuntu/Debian (DigitalOcean, Niagahoster, DomaiNesia, IDCloudHost), Railway, Render, atau cPanel yang mendukung *Node.js App*.

1. **Unggah Seluruh Folder Proyek** ke server Anda.
2. Buat file `.env` di server dan tentukan port serta password admin Anda.
3. Jalankan instalasi dependensi di server:
   ```bash
   npm install --production
   ```
4. Jalankan aplikasi menggunakan proses manager **PM2** agar tetap hidup 24/7 dan hidup kembali otomatis saat server restart:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "undangan-dharu-widiya"
   pm2 save
   pm2 startup
   ```
5. Konfigurasikan Nginx atau Reverse Proxy ke port `3000`.

### Opsi B: Deploy ke Hosting Statis (GitHub Pages, Netlify, Vercel, cPanel Biasa)
Jika Anda hanya memiliki hosting statis (tanpa Node.js):
1. Cukup unggah seluruh isi folder **`public/`** ke *public_html* atau repositori GitHub Pages Anda.
2. Sistem secara otomatis mendeteksi ketiadaan backend API dan beralih ke penyimpanan **`localStorage`**.
3. *Catatan Penting Hosting Statis*: Ucapan yang dikirim oleh pengunjung akan tersimpan di peramban masing-masing perangkat tamu (tidak terpusat di server).

---

## 📝 Ringkasan Elemen yang Perlu Diisi Manual

Berdasarkan pembacaan pada slide asli proyek, berikut adalah daftar elemen template yang sengaja diberi nilai *placeholder* dan dapat Anda lengkapi di file `public/js/config.js`:

1. **Nama Kedua Orang Tua Mempelai**:
   - *Mempelai Pria*: Di slide asli tertulis `"Putra Ketiga dari Bapak dan Ibu"`. Placeholder di config: `"Putra Ketiga dari Bapak dan Ibu"`. Anda dapat melengkapi nama ayah dan ibu beliau.
   - *Mempelai Wanita*: Di slide template asli sempat tertulis `"Putra Ketiga"`, telah diperbaiki menjadi `"Putri Ketiga dari Bapak dan Ibu"`. Silakan lengkapi nama ayah dan ibu beliau.
2. **Nomor Rekening Bank (Cashless)**:
   - *Bank BCA*: Diberi placeholder `"1234567890"` atas nama Prayoga Imandharu.
   - *Bank Mandiri*: Diberi placeholder `"0987654321"` atas nama Widiya Putri.
3. **Detail Lokasi & Jam Akad Nikah**:
   - Di slide gambar asli tertulis template: *"Nanti hari dan tanggalnya dicari"*, *"Tempatnya juga nanti dicari"*, *"Jamnya juga"*.
   - Telah diisi tanggal resmi: **Selasa, 31 Agustus 2027**.
   - Jam akad sementara: **08.00 s/d 10.00 WITA**. Silakan ganti sesuai jadwal fix.
   - Tempat akad: Diisi placeholder *"Gedung / Tempat Akad Nikah"*. Silakan isi nama gedung/alamat riil.
   - Tautan Google Maps: Diisi placeholder `https://maps.google.com/?q=Akad+Nikah+Prayoga+Widiya`.
4. **Detail Lokasi & Jam Resepsi**:
   - Tanggal resmi: **Selasa, 31 Agustus 2027**.
   - Jam resepsi sementara: **11.00 s/d 14.00 WITA**. Silakan ganti sesuai jadwal fix.
   - Tempat resepsi: Diisi placeholder *"Gedung / Tempat Resepsi"*.
   - Tautan Google Maps: Diisi placeholder `https://maps.google.com/?q=Resepsi+Prayoga+Widiya`.
5. **Kredit Akhir**:
   - Sesuai permintaan, nama studio telah diganti menjadi: **"Dibuat dengan cinta oleh Dharu"**.

---
*Selamat berbahagia untuk Prayoga Imandharu, S.T. & Widiya Putri, S.E. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah!*
# Undanganwidaru
