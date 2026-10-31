// VIEW: Beranda
SG.views.home = function (features) {
  var i = SG.views.icon;
  return (
    '<div class="hero"><div class="wrap"><div>' +
    "<h1>Cek Tautan,<br>Hindari <em>Ancaman</em></h1>" +
    "<p>SCAMGUARD membantu Anda memeriksa keamanan URL dan mendeteksi potensi phishing sebelum Anda mengaksesnya.</p>" +
    '<form class="field" data-form><span class="lead">' +
    i("link") +
    '</span><input type="text" name="url" aria-label="URL yang ingin diperiksa" placeholder="Masukkan URL yang ingin diperiksa..." autocomplete="off"><button class="btn">Periksa URL</button></form>' +
    '<div class="safe">' +
    i("shield") +
    "Cek sekarang, hindari risiko!</div></div>" +
    '<svg class="shield" viewBox="0 0 400 255" aria-hidden="true">' +
    "<defs>" +
    '<radialGradient id="gl" cx="50%" cy="48%" r="50%"><stop offset="0" stop-color="#2f9de8" stop-opacity=".4"/><stop offset="1" stop-color="#2f9de8" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="fr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a96ee"/><stop offset="1" stop-color="#2273cf"/></linearGradient>' +
    '<linearGradient id="ba" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b8be6"/><stop offset="1" stop-color="#1f6fc6"/></linearGradient>' +
    '<linearGradient id="lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#43c1f2"/><stop offset="1" stop-color="#2388dc"/></linearGradient>' +
    "</defs>" +
    '<ellipse cx="200" cy="118" rx="196" ry="120" fill="url(#gl)"/>' +
    '<g stroke="#3b9cf0" stroke-width="1.2" stroke-linecap="round" opacity=".75"><path d="M150 6v32M142 22h16M167 4v34M159 18h16"/><path d="M34 103h30M346 66v18M338 75h16M348 160v16M341 168h14"/></g>' +
    '<path d="M0 -8Q1.5 -1.5 8 0Q1.5 1.5 0 8Q-1.5 1.5 -8 0Q-1.5 -1.5 0 -8Z" transform="translate(352 41)" fill="#4db3f5" opacity=".9"/><path d="M0 -8Q1.5 -1.5 8 0Q1.5 1.5 0 8Q-1.5 1.5 -8 0Q-1.5 -1.5 0 -8Z" transform="translate(62 120) scale(.9)" fill="#4db3f5" opacity=".9"/>' +
    '<rect x="86" y="34" width="233" height="172" rx="10" fill="url(#fr)"/>' +
    '<rect x="96" y="46" width="213" height="148" rx="4" fill="#0e3866"/>' +
    '<circle cx="202" cy="40" r="1.5" fill="#0e3866"/>' +
    '<rect x="268" y="224" width="102" height="9" rx="4.5" fill="#1d68c0" transform="rotate(3 319 228)"/>' +
    '<rect x="30" y="200" width="342" height="22" rx="10" fill="url(#ba)" transform="rotate(2.5 200 211)"/>' +
    '<rect x="60" y="205" width="250" height="3" rx="1.5" fill="#5fb6f7" opacity=".55" transform="rotate(2.5 200 211)"/>' +
    '<path d="M128 140c-4 5-5 8-5 10a5 5 0 0 0 10 0c0-2-1-5-5-10z" fill="#27c4b5"/><ellipse cx="117" cy="165" rx="7" ry="3" fill="#27c4b5" opacity=".85"/><ellipse cx="140" cy="168" rx="7" ry="3" fill="#27c4b5" opacity=".85"/>' +
    '<path d="M262 170h22M273 162v18M266 174h14" stroke="#27c4b5" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>' +
    
    // --- SHIELD & LINK ICON UPDATE ---
    '<path d="M202 60 259 81v41c0 32-23 52-57 64-34-12-59-32-59-64V81z" fill="#e6fcf8"/>' +
    '<path d="M202 69 252 87v34c0 28-20 45-50 56-30-11-52-28-52-56V87z" fill="#07987A"/>' +
    '<path d="M202 69 150 87v34c0 28 22 45 52 56z" fill="#1CD3A2"/>' +
    '<g transform="translate(202 122) rotate(-45) scale(2.8) translate(-12 -12)" fill="#FFFFFF">' +
    '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>' +
    '</g>' +
    // --- END SHIELD UPDATE ---
    
    '<path d="M53 49v-3a5 5 0 0 1 5-5h47a5 5 0 0 1 5 5v3z" fill="#3b9cf0"/><path d="M53 49h57v29a5 5 0 0 1-5 5H58a5 5 0 0 1-5-5z" fill="#f2f7ff"/>' +
    '<circle cx="58" cy="45" r="1.3" fill="#fff"/><circle cx="62.5" cy="45" r="1.3" fill="#fff"/><circle cx="67" cy="45" r="1.3" fill="#fff"/>' +
    '<circle cx="66" cy="66" r="8" fill="#1db7a6"/><path d="m62 66 3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="80" y="59" width="22" height="3.5" rx="1.75" fill="#3b9cf0"/><rect x="80" y="66" width="20" height="3.5" rx="1.75" fill="#3b9cf0"/><rect x="80" y="73" width="14" height="3.5" rx="1.75" fill="#3b9cf0"/>' +
    '<path d="M295 110v-7a5 5 0 0 1 5-5h67a5 5 0 0 1 5 5v7z" fill="#3b9cf0"/><path d="M295 110h77v36a6 6 0 0 1-6 6h-65a6 6 0 0 1-6-6z" fill="#f2f7ff"/>' +
    '<circle cx="301" cy="104" r="1.4" fill="#fff"/><circle cx="306" cy="104" r="1.4" fill="#fff"/><circle cx="311" cy="104" r="1.4" fill="#fff"/>' +
    '<circle cx="315" cy="130" r="10" fill="#1db7a6"/><path d="m310.5 130 3.5 3.5 6-7" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="333" y="122" width="27" height="4" rx="2" fill="#3b9cf0"/><rect x="333" y="130" width="27" height="4" rx="2" fill="#3b9cf0"/><rect x="333" y="138" width="17" height="4" rx="2" fill="#3b9cf0"/>' +
    '<path d="M70 202C52 192 40 166 50 143c16 13 24 35 20 59z" fill="url(#lf)"/><path d="M74 204c-4-22 4-38 16-46 6 18 0 34-16 46z" fill="#3fb6ee"/><path d="M38 188c14-4 28 2 36 14-16 4-30-2-36-14z" fill="#2a95e3"/>' +
    '<path d="M326 226c-6-18 4-34 20-42 6 16 0 32-20 42z" fill="#3fb6ee"/><path d="M340 226c12-14 26-20 36-18-4 12-16 20-36 18z" fill="url(#lf)"/><path d="M314 228c6-12 16-16 28-14-4 12-16 16-28 14z" fill="#2a95e3"/>' +
    "</svg>" +
    "</div></div>" +
    '<div class="wrap"><div class="feat">' +
    features
      .map(function (f) {
        return (
          '<div><span class="ico">' +
          i(f.icon) +
          "</span><b>" +
          f.title +
          '</b><span class="d">' +
          f.desc +
          "</span></div>"
        );
      })
      .join("") +
    '</div></div><div style="height:56px"></div>'
  );
};