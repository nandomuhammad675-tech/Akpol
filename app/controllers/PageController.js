// CONTROLLER: halaman statis (Beranda, Cara Kerja, Edukasi, Tentang)
SG.controllers.Page = {
  home: function () {
    return SG.views.home(SG.models.Content.features);
  },
  how: function () {
    return SG.views.how(SG.models.Content.steps);
  },
  education: function () {
    return SG.views.education(SG.models.Content.tips);
  },
  about: function () {
    return SG.views.about(SG.models.Content.about);
  },
};
