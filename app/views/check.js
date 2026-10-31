// VIEW: halaman Periksa URL
SG.views.check = function (examples, error, value) {
  var i = SG.views.icon,
    esc = SG.util.esc;
  return (
    '<div class="wrap pg"><div class="mid"><div class="card check"><div class="check-grid"><div>' +
    '<div class="title-row"><span class="ico">' +
    i("link") +
    "</span><h2>Periksa URL</h2></div>" +
    '<p class="sub">Masukkan URL yang ingin Anda periksa untuk mengetahui apakah aman atau berisiko.</p>' +
    '<form class="field" data-form><span class="lead">' +
    i("link") +
    '</span><input type="text" name="url" value="' +
    esc(value || "") +
    '" aria-label="URL yang ingin diperiksa" placeholder="https://contoh-website.com" autocomplete="off"><button class="btn">Periksa URL</button></form>' +
    '<div class="err" role="alert">' +
    esc(error || "") +
    "</div></div>" +
    
    // --- ILUSTRASI KACA PEMBESAR DIPERBESAR ---
    '<svg class="illus" viewBox="0 0 250 200" aria-hidden="true">' +
    '<rect x="20" y="20" width="170" height="125" rx="12" fill="#e8f1fa" stroke="#c5d9ec" stroke-width="2"/>' +
    '<rect x="36" y="42" width="90" height="9" rx="4.5" fill="#c5d9ec"/>' +
    '<rect x="36" y="62" width="124" height="9" rx="4.5" fill="#d6e5f3"/>' +
    '<rect x="36" y="82" width="70" height="9" rx="4.5" fill="#d6e5f3"/>' +
    // Radius lingkaran (r) diperbesar dari 38 ke 55, tebal garis ditambah
    '<circle cx="150" cy="115" r="55" fill="#fff" fill-opacity=".85" stroke="#0b2a4a" stroke-width="11"/>' +
    '<path d="m189 154 35 35" stroke="#0b2a4a" stroke-width="16" stroke-linecap="round"/>' +
    '<path d="M125 115l14 14 26-30" stroke="#1db7a6" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg></div>' +
    // --- END ILUSTRASI ---
    
    '<div class="chips"><small>' +
    i("ok") +
    "Contoh URL yang bisa dicek:</small>" +
    examples
      .map(function (u) {
        return (
          '<button type="button" class="chip" data-ex="' +
          u +
          '">' +
          u +
          "</button>"
        );
      })
      .join("") +
    "</div></div></div></div>"
  );
};