/**
 * =========================================================================
 * CONFIG.JS - Konfigurasi Utama Undangan Pernikahan Digital Dharu & Widiya
 * =========================================================================
 * Seluruh data teks, tanggal, lokasi, jam, nomor rekening, dan pengaturan
 * berada di file ini agar sangat mudah diedit dan disesuaikan.
 */

const WEDDING_CONFIG = {
  // Informasi Pasangan Mempelai
  couple: {
    // Mempelai Pria
    groom: {
      fullName: "Prayoga Imandharu, S.T.",
      shortName: "Dharu",
      parents: "Putra Ketiga dari Bapak dan Ibu", // [CATATAN]: Nama ayah & ibu belum tercantum di slide, silakan ganti misal: "Putra Ketiga dari Bapak [Nama Ayah] & Ibu [Nama Ibu]"
      accountBank: "Bank BCA",
      accountNumber: "1234567890", // [PLACEHOLDER]: Silakan isi nomor rekening BCA mempelai pria
      accountHolder: "Prayoga Imandharu",
      photo: "assets/images/Mempelai pria.png",
      photoAsset: "assets/images/pria.png"
    },
    // Mempelai Wanita
    bride: {
      fullName: "Widiya Putri, S.E.",
      shortName: "Widiya",
      parents: "Putri Ketiga dari Bapak dan Ibu", // [CATATAN]: Di gambar slide tertulis 'Putra', di sini sudah diperbaiki menjadi 'Putri'. Silakan lengkapi nama orang tua jika ada.
      accountBank: "Bank Mandiri",
      accountNumber: "0987654321", // [PLACEHOLDER]: Silakan isi nomor rekening Mandiri mempelai wanita
      accountHolder: "Widiya Putri",
      photo: "assets/images/Mempelai wanita.png",
      photoAsset: "assets/images/wanita.png"
    },
    titleName: "Widiya & Dharu",
    coverDateText: "31 Agustus 2027", // Pengganti template 'tanggalnya nanti'
    weddingDateText: "31 Agustus 2027"
  },

  // Target Waktu untuk Countdown Real-time (ISO format)
  // 31 Agustus 2027 Pukul 08:00:00 (WITA / UTC+8)
  countdownTarget: "2027-08-31T08:00:00+08:00",

  // Ayat Al-Qur'an / Surah
  surah: {
    title: "Q.S Ar Rum : 21",
    ayah: "Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari (jenis) dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang."
  },

  // Teks Salam Pembuka
  salam: {
    line1: "with the grace and blessings from",
    line2: "Allah SWT, we warmly invite you to",
    line3: "the wedding of :"
  },

  // Detail Acara: Akad Nikah
  akad: {
    title: "Akad Nikah",
    dayAndDate: "Selasa, 31 Agustus 2027",
    time: "08.00 s/d 10.00 WITA", // [PLACEHOLDER]: Ganti sesuai jam akad yang ditentukan
    locationName: "Gedung Pertemuan / Kediaman Mempelai", // [PLACEHOLDER]: Ganti dengan nama tempat akad nikah
    address: "Jl. Pemuda No. 123, Kabupaten Berau, Kalimantan Timur", // [PLACEHOLDER]: Alamat lengkap
    mapsUrl: "https://maps.google.com/?q=Akad+Nikah+Dharu+Widiya" // [PLACEHOLDER]: Link Google Maps
  },

  // Detail Acara: Resepsi
  resepsi: {
    title: "Resepsi",
    dayAndDate: "Selasa, 31 Agustus 2027",
    time: "11.00 s/d 14.00 WITA", // [PLACEHOLDER]: Ganti sesuai jam resepsi yang ditentukan
    locationName: "Convention Hall / Gedung Resepsi", // [PLACEHOLDER]: Ganti dengan nama gedung resepsi
    address: "Jl. Pemuda No. 123, Kabupaten Berau, Kalimantan Timur", // [PLACEHOLDER]: Alamat lengkap
    mapsUrl: "https://maps.google.com/?q=Resepsi+Dharu+Widiya" // [PLACEHOLDER]: Link Google Maps
  },

  // Galeri Foto
  gallery: [
    { src: "assets/images/galeri/foto_1.jpg", caption: "Prayoga Imandharu & Widiya Putri" },
    { src: "assets/images/galeri/foto_2.jpg", caption: "Genggaman Tangan Penuh Kasih" },
    { src: "assets/images/galeri/foto_3.jpg", caption: "Widiya Putri, S.E." },
    { src: "assets/images/galeri/foto_4.jpg", caption: "Melangkah Bersama Menuju Masa Depan" },
    { src: "assets/images/galeri/foto_5.jpg", caption: "Cinta Dalam Kesederhanaan" },
    { src: "assets/images/galeri/foto_6.jpg", caption: "Duduk Berdampingan Mengukir Bahagia" }
  ],

  // Cashless / Amplop Digital
  cashless: {
    title: "Cashless",
    subtitle: "Sharing the joy with u is our greatest gift",
    copySuccessToast: "Nomor rekening berhasil disalin!"
  },

  // Foto untuk Animasi Film Strip Polaroid di Bagian Penutup
  polaroidPhotos: [
    "assets/images/galeri/foto_1.jpg",
    "assets/images/galeri/foto_4.jpg",
    "assets/images/galeri/foto_6.jpg"
  ],

  // Kredit & Penutup
  closing: {
    heading: "See you on our Wedding Day",
    creditText: "Dibuat dengan cinta oleh Dharu"
  },

  // Musik Latar
  music: {
    src: "assets/music/lagu.mp3",
    autoplayOnOpen: true
  },

  // Parameter Tamu Undangan
  guest: {
    queryParam: "to",
    defaultName: "Tamu Undangan"
  }
};

// Ekspor untuk browser (window) dan Node.js jika dibutuhkan
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WEDDING_CONFIG;
}
if (typeof window !== 'undefined') {
  window.WEDDING_CONFIG = WEDDING_CONFIG;
}
