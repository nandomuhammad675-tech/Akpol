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
    var a = SG.models.Url.analyze(query.url || SG.models.Content.demoUrl);
    if (a.err) return SG.views.message(a.err);
    return SG.views.result(SG.models.Risk.build(a));
  },
};
