// CONTROLLER: form pemeriksaan dan hasil
SG.controllers.Check = {
  form: function () {
    var s = SG.state,
      html = SG.views.check(SG.models.Content.examples, s.error, s.value);
    s.error = null;
    s.value = null;
    return html;
  },
  submit: function (raw) {
    // Validasi cepat di browser; analisis utama dilakukan oleh backend.
    var a = SG.models.Url.analyze(raw);
    if (a.err) {
      SG.state.error = a.err;
      SG.state.value = raw;
      SG.router.go("/periksa", true);
      return;
    }
    SG.router.go("/hasil?url=" + encodeURIComponent(raw));
  },
  result: function (query) {
    var raw = query.url || SG.models.Content.demoUrl;
    var local = SG.models.Url.analyze(raw);
    if (local.err) return SG.views.message(local.err);

    // Panggilan ke API bersifat asynchronous: tampilkan animasi scanning dulu,
    // lalu ganti isi halaman setelah hasil datang.
    var token = (SG.state.token = (SG.state.token || 0) + 1);
    function show(html) {
      if (SG.state.token !== token) return;
      if (location.hash.indexOf("#/hasil") !== 0) return;
      document.getElementById("app").innerHTML = SG.views.layout("/hasil", html);
    }
    SG.models.Api.check(raw).then(
      function (r) {
        show(SG.views.result(r));
      },
      function (e) {
        show(
          SG.views.message(
            (e && e.message) || "Terjadi kesalahan. Silakan coba lagi.",
          ),
        );
      },
    );
    return SG.views.loading(raw);
  },
};
