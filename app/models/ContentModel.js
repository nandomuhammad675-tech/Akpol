// MODEL: data konten statis (fitur, langkah, tips, contoh URL)
SG.models.Content = {
  features: [
    {
      icon: "bolt",
      title: "Analisis Cepat",
      desc: "Hasil instan dalam hitungan detik.",
    },
    {
      icon: "shieldF",
      title: "Deteksi Risiko",
      desc: "Kombinasi aturan heuristik & AI BERT.",
    },
    {
      icon: "db",
      title: "Informasi Lengkap",
      desc: "Kategori risiko, bukti token, & rekomendasi.",
    },
    {
      icon: "lockF",
      title: "Mudah Digunakan",
      desc: "Cukup masukkan tautan URL yang ingin dicek.",
    },
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
      desc: "Sistem memeriksa format URL, lalu mengumpulkan metadata dan konten halaman web secara live.",
    },
    {
      icon: "search",
      title: "Analisis Risiko Multi-Layer",
      desc: "Data diperiksa menggunakan model Deep Learning Transformer/BERT yang dikombinasikan dengan aturan heuristik.",
    },
    {
      icon: "shield",
      title: "Hasil & Rekomendasi Keamanan",
      desc: "Pengguna menerima skor risiko, kategori bahaya, indikator temuan, evidence token, dan saran keamanan.",
    },
  ],
  tips: [
    {
      icon: "link",
      title: "Jangan Klik Tautan Sembarangan",
      desc: "Periksa sumber tautan sebelum membukanya pada browser atau aplikasi.",
    },
    {
      icon: "search",
      title: "Periksa Alamat Website",
      desc: "Perhatikan ejaan domain (typosquatting) dan pastikan memakai protokol HTTPS.",
    },
    {
      icon: "lock",
      title: "Jangan Bagikan Informasi Pribadi",
      desc: "Kata sandi, kode OTP, dan nomor kartu rahasia tidak pernah diminta lewat tautan.",
    },
    {
      icon: "alert",
      title: "Waspadai Pesan Mencurigakan",
      desc: "Pesan yang mendesak atau menjanjikan bonus/hadiah instan patut dicurigai.",
    },
  ],
  examples: [
    "https://google.com",
    "https://www.bank.com",
    "https://bit.ly/abc123",
    "https://888truecasino.com/free-slots",
    "http://login-update.com/verify",
  ],
  demoUrl: "http://login-update.com/verify",
  about: [
    "SCAMGUARD adalah platform sistem berbasis web untuk membantu pengguna memeriksa URL dan mendeteksi potensi ancaman phishing serta perjudian online. Proyek ini dikembangkan oleh Tim Akpoll untuk INCEPTION 2026 Hackathon, Politeknik Negeri Jember.",
    "Sistem ini menggabungkan dua lapis pertahanan terintegrasi: analisis karakteristik struktur URL (aturan heuristik) dan analisis representasi teks berbasis Transformer/BERT (Deep Learning) secara langsung dari konten halaman web.",
    "Mengedepankan prinsip transparansi (Explainable AI & Security), hasil pemeriksaan disajikan secara komprehensif mencakup skor risiko, rincian indikator bahaya, penjelasan bahasa manusia, serta penyorotan bukti token (Evidence & Token Highlighting).",
  ],
};
