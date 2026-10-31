// VIEW: Tentang
SG.views.about = function (paragraphs) {
  var i = SG.views.icon;
  return (
    '<div class="wrap pg"><div class="mid">' +
    '<div class="card about anim-slide-down">' +
    '<div class="title-row"><span class="ico">' +
    i("shield") +
    "</span><h2>Tentang SCAMGUARD</h2></div>" +
    '<p class="sub">Platform Keamanan Web Interaktif untuk Deteksi Dini Ancaman Phishing dan Perjudian Online.</p>' +
    '<div class="about-content">' +
    paragraphs
      .map(function (p) {
        return "<p>" + p + "</p>";
      })
      .join("") +
    "</div>" +
    '<div class="sect team-sect">' +
    "<h3>Tim Pengembang &middot; Akpoll</h3>" +
    '<div class="team-grid">' +
    '<div class="team-card">' +
    '<div class="team-avatar">ADF</div>' +
    '<div class="team-info"><b>Arief Dwi Firmansyah</b><span>Angkatan 2025</span><small>Politeknik Negeri Jember</small></div>' +
    "</div>" +
    '<div class="team-card">' +
    '<div class="team-avatar">DAN</div>' +
    '<div class="team-info"><b>Dicky Ade Novendy</b><span>Angkatan 2025</span><small>Politeknik Negeri Jember</small></div>' +
    "</div>" +
    '<div class="team-card">' +
    '<div class="team-avatar">MVS</div>' +
    '<div class="team-info"><b>Muhammad Vernando S</b><span>Angkatan 2025</span><small>Politeknik Negeri Jember</small></div>' +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="sect tech-sect">' +
    "<h3>Arsitektur Teknologi</h3>" +
    '<div class="tech-chips">' +
    '<span class="tech-chip">Transformer / BERT Deep Learning</span>' +
    '<span class="tech-chip">FastAPI Python Backend</span>' +
    '<span class="tech-chip">Web Scraper MCP Pipeline</span>' +
    '<span class="tech-chip">Vanilla JS &amp; Modern CSS</span>' +
    '<span class="tech-chip">Pemeriksaan Heuristik URL</span>' +
    "</div>" +
    "</div>" +
    "</div></div></div>"
  );
};
