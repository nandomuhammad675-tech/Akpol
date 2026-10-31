// VIEW: halaman hasil pemeriksaan
SG.views.result = function (r) {
  var i = SG.views.icon,
    esc = SG.util.esc,
    C = 2 * Math.PI * 44,
    off = C * (1 - r.score / 100);
  var displayLevel = r.level === "gb" ? "hi" : r.level;

  // Daftar indikator (mendukung status 'ok' warna hijau dan 'x' warna merah)
  var list = r.indicators.length
    ? r.indicators
        .map(function (x) {
          var isOk = x.ok === true || (x.ok !== false && r.level === "lo");
          var iconName = isOk ? "ok" : "x";
          var itemClass = isOk ? ' class="ok"' : "";
          return (
            "<li" +
            itemClass +
            ">" +
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
      '<div class="warn" style="margin-top:14px; margin-bottom:6px;">' +
      "<strong>Terindikasi aktivitas perjudian online.</strong><br>" +
      "<span>Frasa terdeteksi: " +
      esc(r.detected_phrases.join(", ")) +
      ".</span><br>" +
      '<span style="color:var(--mut); font-size:13px;">Situs perjudian tidak otomatis dikategorikan sebagai phishing.</span>' +
      "</div>";
  }

  // Section Evidence & Token Highlighting (tampil untuk semua status analisis konten)
  var evidenceSection = "";
  if (r.detected_phrases && r.detected_phrases.length) {
    var subtitle =
      r.level === "lo"
        ? "Kata kunci dan token yang terverifikasi pada konten halaman:"
        : "Frasa berikut ditemukan pada judul atau isi halaman:";

    evidenceSection =
      '<div class="sect">' +
      "<h3>Evidence &amp; Token Highlighting</h3>" +
      '<div class="box">' +
      '<p class="note" style="margin-bottom:8px">' +
      subtitle +
      "</p>" +
      '<div style="font-family:ui-monospace, monospace; font-size:14px; color:#1e293b; background:#f1f5f9; padding:8px 12px; border-radius:6px; word-break:break-word;">' +
      esc(r.detected_phrases.join(" ")) +
      "</div>" +
      "</div>" +
      "</div>";
  }

  // Section Penjelasan
  var explanationSection = "";
  if (r.level !== "gb") {
    explanationSection =
      '<div class="sect"><h3>Penjelasan</h3><div class="box">' +
      r.exp +
      "</div></div>";
  }

  return (
    '<div class="wrap pg"><div class="narrow"><a class="back" href="#/periksa">&larr; Kembali</a>' +
    '<div class="head ' +
    displayLevel +
    '"><span class="ico">' +
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
    '<div class="note">Diperiksa pada ' +
    r.checkedAt +
    "</div></div>" +
    '<div class="ring"><svg viewBox="0 0 108 108">' +
    '<circle cx="54" cy="54" r="44" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="9"/>' +
    '<circle cx="54" cy="54" r="44" fill="none" stroke="var(--c)" stroke-width="9" stroke-linecap="round" stroke-dasharray="' +
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

SG.views.message = function (text) {
  return (
    '<div class="wrap pg"><div class="narrow"><a class="back" href="#/periksa">&larr; Kembali</a><div class="card"><p>' +
    SG.util.esc(text) +
    "</p></div></div></div>"
  );
};
