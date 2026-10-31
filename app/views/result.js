// VIEW: halaman hasil pemeriksaan & animasi pemindaian (loading)
SG.views.result = function (r) {
  var i = SG.views.icon,
    esc = SG.util.esc,
    C = 2 * Math.PI * 44,
    off = C * (1 - r.score / 100);
  var displayLevel = r.level === "gb" ? "hi" : r.level;

  // Daftar indikator (mendukung status 'ok' warna hijau dan 'x' warna merah)
  var list = r.indicators.length
    ? r.indicators
        .map(function (x, idx) {
          var isOk = x.ok === true || (x.ok !== false && r.level === "lo");
          var iconName = isOk ? "ok" : "x";
          var itemClass = isOk ? ' class="ok"' : "";
          return (
            "<li" +
            itemClass +
            ' style="animation-delay:' +
            idx * 0.08 +
            's">' +
            i(iconName) +
            "<span>" +
            esc(x.text) +
            "</span></li>"
          );
        })
        .join("")
    : '<li class="ok">' +
      i("ok") +
      "<span>Tidak ditemukan indikator mencurigakan pada struktur URL.</span></li>";

  // Banner khusus jika terindikasi perjudian
  var gamblingBanner = "";
  if (r.level === "gb" && r.detected_phrases && r.detected_phrases.length) {
    gamblingBanner =
      '<div class="warn anim-fade-in" style="margin-top:14px; margin-bottom:10px;">' +
      '<div class="warn-title">' +
      i("alert") +
      "<strong>Terindikasi aktivitas perjudian online.</strong></div>" +
      "<p style=\"margin: 4px 0 6px;\">Frasa terdeteksi: <b>" +
      esc(r.detected_phrases.join(", ")) +
      "</b>.</p>" +
      '<span class="warn-note">Situs perjudian tidak otomatis dikategorikan sebagai phishing.</span>' +
      "</div>";
  }

  // Section Evidence & Token Highlighting (tampil interaktif dengan pill chips)
  var evidenceSection = "";
  if (r.detected_phrases && r.detected_phrases.length) {
    var subtitle =
      r.level === "lo"
        ? "Kata kunci dan token yang terverifikasi pada konten halaman:"
        : "Frasa berikut ditemukan pada judul atau isi halaman:";

    var tokenPills = r.detected_phrases
      .map(function (phrase) {
        var pillClass = r.level === "lo" ? "token-chip token-safe" : "token-chip token-warn";
        return '<span class="' + pillClass + '">' + esc(phrase) + "</span>";
      })
      .join("");

    evidenceSection =
      '<div class="sect anim-fade-in">' +
      "<h3>Evidence &amp; Token Highlighting</h3>" +
      '<div class="box evidence-box">' +
      '<p class="note" style="margin-bottom:10px">' +
      subtitle +
      "</p>" +
      '<div class="token-container">' +
      tokenPills +
      "</div>" +
      "</div>" +
      "</div>";
  }

  // Section Penjelasan
  var explanationSection = "";
  if (r.level !== "gb") {
    explanationSection =
      '<div class="sect anim-fade-in"><h3>Penjelasan</h3><div class="box explanation-box">' +
      r.exp +
      "</div></div>";
  }

  // Label sumber analisis
  var sourceText = "Metode: Analisis Heuristik & Aturan URL";
  if (r.source === "bert") {
    sourceText = "Metode: Model Transformer/BERT (Konten Scraping)";
  } else if (r.source === "rules+bert") {
    sourceText = "Metode: Hybrid (Model BERT 60% + Heuristik URL 40%)";
  }

  return (
    '<div class="wrap pg"><div class="narrow"><a class="back" href="#/periksa">&larr; Kembali</a>' +
    '<div class="head ' +
    displayLevel +
    ' anim-slide-down"><span class="ico">' +
    i("alert") +
    "</span>" +
    '<div class="t"><h2>' +
    r.name +
    '<span class="tag">' +
    r.tag +
    "</span></h2>" +
    '<div class="u">' +
    esc(r.url) +
    "</div>" +
    '<div class="meta-row"><span class="note">Diperiksa pada ' +
    r.checkedAt +
    '</span><span class="source-badge">' +
    sourceText +
    "</span></div></div>" +
    '<div class="ring"><svg viewBox="0 0 108 108">' +
    '<circle cx="54" cy="54" r="44" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="9"/>' +
    '<circle class="ring-fill" cx="54" cy="54" r="44" fill="none" stroke="var(--c)" stroke-width="9" stroke-linecap="round" stroke-dasharray="' +
    C +
    '" stroke-dashoffset="' +
    off +
    '"/>' +
    "</svg><b>" +
    r.score +
    "<small>Skor Risiko<br>" +
    r.name.replace("Risiko ", "") +
    "</small></b></div></div>" +
    '<div class="body">' +
    gamblingBanner +
    '<div class="sect"><h3>Indikator yang Ditemukan</h3><ul class="ind">' +
    list +
    "</ul></div>" +
    explanationSection +
    evidenceSection +
    '<div class="sect"><div class="rekom ' +
    displayLevel +
    '"><h3>Rekomendasi Keamanan</h3><p>' +
    r.rec +
    "</p></div></div>" +
    "</div></div></div>"
  );
};

// VIEW: Tampilan Scanner Loading Interaktif
SG.views.loading = function (url) {
  var esc = SG.util.esc,
    i = SG.views.icon;
  return (
    '<div class="wrap pg"><div class="narrow">' +
    '<a class="back" href="#/periksa">&larr; Kembali</a>' +
    '<div class="card scan-card anim-slide-down">' +
    '<div class="radar-box">' +
    '<div class="radar-circle circle-1"></div>' +
    '<div class="radar-circle circle-2"></div>' +
    '<div class="radar-circle circle-3"></div>' +
    '<div class="radar-sweep"></div>' +
    '<div class="radar-icon">' +
    i("shield") +
    "</div>" +
    "</div>" +
    '<div class="scan-info">' +
    "<h2>Memindai Keamanan Tautan...</h2>" +
    '<p class="sub">Sistem sedang memeriksa struktur URL dan menganalisis konten halaman secara live.</p>' +
    '<div class="scan-target"><span class="lead-icon">' +
    i("link") +
    "</span><code>" +
    esc(url) +
    "</code></div>" +
    '<div class="scan-steps">' +
    '<div class="scan-step-item step-active">' +
    '<span class="step-spinner"></span>' +
    "<span>1. Validasi struktur leksikal &amp; protokol domain</span>" +
    "</div>" +
    '<div class="scan-step-item step-pending">' +
    '<span class="step-dot"></span>' +
    "<span>2. Pengikisan konten HTML &amp; ekstraksi token</span>" +
    "</div>" +
    '<div class="scan-step-item step-pending">' +
    '<span class="step-dot"></span>' +
    "<span>3. Inferensi klasifikasi Deep Learning (BERT AI)</span>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div></div></div>"
  );
};

// VIEW: Pesan Error / Notifikasi
SG.views.message = function (text) {
  return (
    '<div class="wrap pg"><div class="narrow"><a class="back" href="#/periksa">&larr; Kembali</a><div class="card anim-fade-in"><p>' +
    SG.util.esc(text) +
    "</p></div></div></div>"
  );
};
