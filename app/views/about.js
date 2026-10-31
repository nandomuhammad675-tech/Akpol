// VIEW: Tentang
SG.views.about = function (paragraphs) {
  return (
    '<div class="wrap pg"><div class="mid"><div class="card about"><h2>Tentang SCAMGUARD</h2>' +
    paragraphs
      .map(function (p) {
        return "<p>" + p + "</p>";
      })
      .join("") +
    "</div></div></div>"
  );
};
