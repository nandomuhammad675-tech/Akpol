// VIEW: kerangka halaman (navbar + footer)
SG.views.layout = function (route, content) {
  var nav = [
    ["/", "Beranda"],
    ["/cara-kerja", "Cara Kerja"],
    ["/edukasi", "Edukasi"],
    ["/tentang", "Tentang"],
  ];
  var links = nav
    .map(function (n) {
      return (
        '<a href="#' +
        n[0] +
        '"' +
        (n[0] === route ? ' class="on"' : "") +
        ">" +
        n[1] +
        "</a>"
      );
    })
    .join("");
  return (
    "<nav><div class=\"nav\"><a class=\"logo\" href=\"#/\">" +
    SG.views.icon("shield") +
    "<span>SCAMGUARD</span></a><div class=\"links\">" +
    links +
    '</div><a class="btn nav-btn" href="#/periksa">' +
    SG.views.icon("link") +
    "<span>Periksa URL</span></a></div></nav>" +
    content +
    "<footer><div class=\"wrap\"><p>&copy; 2026 <b>SCAMGUARD</b> &middot; Tim Akpoll &middot; Politeknik Negeri Jember</p><p class=\"foot-sub\">Sistem Analisis Risiko Phishing &amp; Konten Website Berbasis Transformer/BERT</p></div></footer>"
  );
};
