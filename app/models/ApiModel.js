// MODEL: komunikasi dengan backend SCAMGUARD (POST /api/check)
// Alamat backend bisa diganti dengan mengisi window.SG_API_BASE sebelum script ini dimuat.
SG.models.Api = (function () {
  var BASE = window.SG_API_BASE || "http://127.0.0.1:8000";
  var TIMEOUT_MS = 15000;

  // Ubah respons API menjadi bentuk data yang dipakai SG.views.result
  function toView(d) {
    return {
      url: d.url,
      indicators: d.indicators || [],
      name: d.name,
      tag: d.tag,
      exp: d.explanation,
      rec: d.recommendation,
      level: d.level,
      score: d.score,
      source: d.source,
      detected_phrases: d.detected_phrases || [],
      evidence: d.evidence || [],
      checkedAt: new Date(d.checkedAt).toLocaleString("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
      }),
    };
  }

  // Cadangan: bila backend tidak bisa dihubungi, analisis lokal di browser.
  function fallback(raw) {
    var a = SG.models.Url.analyze(raw);
    if (a.err) return Promise.reject({ validation: true, message: a.err });
    var r = SG.models.Risk.build(a);
    r.source = "local";
    r.detected_phrases = a.url_gambling || [];
    r.evidence = [];
    r.exp +=
      " (Server analisis tidak dapat dihubungi, sehingga pemeriksaan dilakukan secara lokal di perangkat Anda.)";
    return Promise.resolve(r);
  }

  function check(raw) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () {
      ctrl.abort();
    }, TIMEOUT_MS);
    return fetch(BASE + "/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: raw }),
      signal: ctrl.signal,
    })
      .then(function (res) {
        clearTimeout(timer);
        if (res.status === 422) {
          return res.json().then(function (j) {
            throw { validation: true, message: j.detail };
          });
        }
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json().then(toView);
      })
      .catch(function (e) {
        clearTimeout(timer);
        if (e && e.validation) throw e;
        return fallback(raw); // jaringan/server bermasalah
      });
  }

  return { check: check };
})();
