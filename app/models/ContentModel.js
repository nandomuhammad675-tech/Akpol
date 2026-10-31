// MODEL: data konten statis (fitur, langkah, tips, contoh URL)
SG.models.Content = {
  features: [
    {
      icon: "bolt",
      title: "Analisis Cepat",
      desc: "Hasil dalam hitungan detik.",
    },
    {
      icon: "shieldF",
      title: "Deteksi Risiko",
      desc: "Dari berbagai indikator phishing.",
    },
    {
      icon: "db",
      title: "Informasi Lengkap",
      desc: "Kategori risiko, penjelasan, dan rekomendasi.",
    },
    { icon: "lockF", title: "Mudah Digunakan", desc: "Cukup masukkan URL." },
  ],
  steps: [
    {
      icon: "link",
      title: "Masukkan URL",
      desc: "Pengguna memasukkan tautan yang ingin diperiksa melalui halaman pemeriksaan.",
    },
    {
      icon: "doc",
      title: "Validasi & Pengumpulan Data",
      desc: "Sistem memeriksa format URL, lalu mengumpulkan data yang dibutuhkan untuk analisis.",
    },
    {
      icon: "search",
      title: "Analisis Risiko",
      desc: "Data diperiksa berdasarkan indikator risiko, seperti struktur URL, kemiripan domain, dan isi halaman.",
    },
    {
      icon: "shield",
      title: "Hasil Analisis",
      desc: "Pengguna menerima kategori risiko, indikator yang ditemukan, penjelasan, dan rekomendasi keamanan.",
    },
  ],
  tips: [
    {
      icon: "link",
      title: "Jangan Klik Tautan Sembarangan",
      desc: "Periksa sumber tautan sebelum membukanya.",
    },
    {
      icon: "search",
      title: "Periksa Alamat Website",
      desc: "Perhatikan ejaan domain dan pastikan memakai HTTPS.",
    },
    {
      icon: "lock",
      title: "Jangan Bagikan Informasi Pribadi",
      desc: "Kata sandi, OTP, dan PIN tidak pernah diminta lewat tautan.",
    },
    {
      icon: "alert",
      title: "Waspadai Pesan Mencurigakan",
      desc: "Pesan yang mendesak atau menjanjikan hadiah patut dicurigai.",
    },
  ],
  examples: [
    "https://google.com",
    "https://www.bank.com",
    "https://bit.ly/abc123",
    "http://login-update.com/verify",
  ],
  demoUrl: "http://login-update.com/verify",
  about: [
    "SCAMGUARD adalah rancangan sistem berbasis web untuk membantu pengguna memeriksa URL dan mengenali indikasi phishing. Proyek ini disusun oleh Tim Akpoll untuk INCEPTION 2026 Hackathon, Politeknik Negeri Jember.",
    "Versi ini adalah gambaran tampilan (prototipe). Pemeriksaan hanya menilai karakteristik URL; analisis isi halaman dan model Machine Learning termasuk rencana pengembangan berikutnya.",
    "Hasil pemeriksaan adalah informasi pendukung untuk meningkatkan kewaspadaan, bukan bukti mutlak bahwa suatu website aman atau berbahaya.",
  ],
};
