// VIEW: Cara Kerja
SG.views.how = function (steps) {
  var i = SG.views.icon;
  return (
    '<div class="wrap pg"><div class="mid"><div class="card"><span class="eyebrow">Cara Kerja</span><h2>Bagaimana SCAMGUARD Bekerja?</h2>' +
    '<p class="sub">SCAMGUARD menganalisis URL dan konten website melalui beberapa tahapan untuk mendeteksi potensi phishing.</p><div class="steps">' +
    steps
      .map(function (s, n) {
        return (
          '<div class="step"><div class="n">' +
          (n + 1) +
          '</div><span class="ico sq">' +
          i(s.icon) +
          "</span><div><b>" +
          s.title.replace("&", "&amp;") +
          '</b><span class="d">' +
          s.desc +
          "</span></div></div>"
        );
      })
      .join("") +
    '</div><div class="note-box">' +
    i("zap") +
    "Proses analisis dilakukan secara otomatis dan dalam waktu singkat.</div></div></div></div>"
  );
};
