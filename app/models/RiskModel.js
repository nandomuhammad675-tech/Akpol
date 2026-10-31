// MODEL: skor risiko 0-100 dan kategori
SG.models.Risk = (function () {
  var CAT = {
    hi: {
      name: "Risiko Tinggi",
      tag: "Phishing",
      exp: "URL ini memiliki beberapa indikator yang umum ditemukan pada situs phishing. Meskipun tidak dapat dipastikan secara mutlak, kombinasi indikator tersebut menunjukkan potensi ancaman yang perlu diwaspadai.",
      rec: "Jangan lanjutkan akses atau memasukkan data pribadi maupun kredensial akun pada website ini.",
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
      exp: "Indikator phishing yang teridentifikasi relatif sedikit berdasarkan pemeriksaan karakteristik URL. Hasil ini tidak menjamin bahwa situs sepenuhnya aman.",
      rec: "Tetap pastikan keaslian website sebelum memberikan informasi pribadi.",
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
  return { build: build };
})();
