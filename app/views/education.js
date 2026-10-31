// VIEW: Edukasi
SG.views.education = function (tips) {
  var i = SG.views.icon;
  
  // Custom SVG: Outline Shield tebal dengan Outline Link di tengahnya (Sesuai referensi baru)
  var customShieldLinkIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="i">' +
    '<!-- Garis Luar Perisai (Ketebalan disesuaikan menjadi tebal/bold) -->' +
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' +
    '<!-- Ikon Rantai (Dimiringkan persis dari kiri bawah ke kanan atas) -->' +
    '<g transform="translate(12, 12) scale(0.6) rotate(90) translate(-12, -12)">' +
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>' +
    '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>' +
    '</g>' +
    '</svg>';

  return (
    '<div class="wrap pg"><div class="mid"><div class="card"><div class="edu-head"><span class="ico big circle-icon">' +
    customShieldLinkIcon +
    "</span><div><h2>Edukasi Keamanan</h2><p>Kenali tanda-tanda phishing dan tingkatkan kewaspadaan Anda di internet.</p></div></div>" +
    '<h3>Tips Menghindari Phishing</h3><div class="tips">' +
    tips
      .map(function (t) {
        return (
          '<div class="tip"><span class="ico">' +
          i(t.icon) +
          "</span><div><b>" +
          t.title +
          '</b><span class="d">' +
          t.desc +
          "</span></div></div>"
        );
      })
      .join("") +
    '</div><div class="ingat">' +
    customShieldLinkIcon +
    "<div><b>Ingat!</b> Jika ragu, jangan klik. Cek dulu dengan SCAMGUARD.</div></div></div></div></div>"
  );
};