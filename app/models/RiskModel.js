// MODEL: skor risiko 0-100 dan kategori
SG.models.Risk = (function () {
  var CAT = {
    hi: {
      name: "Risiko Tinggi",
      tag: "Phishing",
      exp: "URL ini memiliki beberapa indikator yang umum ditemukan pada situs phishing. Meskipun tidak dapat dipastikan secara mutlak, kombinasi indikator tersebut menunjukkan potensi ancaman yang perlu diwaspadai.",
      rec: "Jangan lanjutkan akses atau memasukkan data pribadi maupun kredensial akun pada website ini.",
    },
    gb: {
      name: "Risiko Tinggi",
      tag: "Indikasi Perjudian",
      exp: "Terindikasi aktivitas perjudian online berdasarkan analisis konten halaman website. Situs perjudian tidak otomatis dikategorikan sebagai phishing, namun tetap berisiko tinggi.",
      rec: "Akses situs perjudian online dapat melanggar hukum di Indonesia. Hindari memberikan data pribadi atau melakukan transaksi keuangan di situs ini.",
    },
    md: {
      name: "Risiko Sedang",
      tag: "Waspada",
      exp: "Ditemukan sejumlah indikator yang perlu diperhatikan lebih lanjut. Indikator ini belum tentu berarti situs berbahaya, tetapi sebaiknya Anda berhati-hati.",
      rec: "Periksa kembali alamat domain dan hindari memasukkan informasi sensitif sebelum Anda memastikan keamanannya.",
    },
    lo: {
      name: "Risiko Rendah",
      tag: "Minim indikator",
      exp: "Tidak ditemukan indikator yang mencurigakan secara signifikan. Hasil ini tidak menjamin bahwa situs sepenuhnya aman.",
      rec: "Tetap pastikan keaslian website sebelum memberikan informasi pribadi.",
    },
    not_found: {
      name: "Halaman Tidak Ditemukan",
      tag: "HTTP 404",
      exp: "Halaman web yang diperiksa mengembalikan status HTTP 404 (Halaman tidak ditemukan). Konten tidak tersedia untuk dianalisis, sehingga situs ini tidak dapat disimpulkan sebagai aman atau sah (legitimate).",
      rec: "Pastikan kembali penulisan URL. Tautan mungkin rusak, kedaluwarsa, atau konten telah dihapus oleh pemilik situs.",
    },
    unknown: {
      name: "Tidak Dapat Dianalisis",
      tag: "Unknown",
      exp: "Halaman web menampilkan indikasi galat/error atau akses ditolak. Karena konten fungsional tidak dapat dimuat, sistem tidak dapat menyimpulkan bahwa situs ini aman.",
      rec: "Hindari memasukkan informasi pribadi pada halaman yang bermasalah atau menampilkan akses ditolak. Pastikan situs resmi dan dapat diakses normal.",
    },
  };
  function build(a) {
    var score = Math.min(
      100,
      a.indicators.reduce(function (s, i) {
        return s + i.weight;
      }, 0),
    );
    var level = score >= 55 ? "hi" : score >= 25 ? "md" : "lo";
    return Object.assign({}, a, CAT[level], {
      score: score,
      level: level,
      checkedAt: new Date().toLocaleString("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
      }),
    });
  }
  return { build: build, CAT: CAT };
})();
