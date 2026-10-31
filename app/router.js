// ROUTER: memetakan alamat (#/...) ke controller
SG.router = (function () {
  var C = SG.controllers;
  var routes = {
    "/": {
      title: "SCAMGUARD - Cek Tautan, Hindari Ancaman",
      run: function () {
        return C.Page.home();
      },
    },
    "/periksa": {
      title: "Periksa URL - SCAMGUARD",
      run: function () {
        return C.Check.form();
      },
    },
    "/hasil": {
      title: "Hasil Pemeriksaan - SCAMGUARD",
      run: function (q) {
        return C.Check.result(q);
      },
    },
    "/cara-kerja": {
      title: "Cara Kerja - SCAMGUARD",
      run: function () {
        return C.Page.how();
      },
    },
    "/edukasi": {
      title: "Edukasi - SCAMGUARD",
      run: function () {
        return C.Page.education();
      },
    },
    "/tentang": {
      title: "Tentang - SCAMGUARD",
      run: function () {
        return C.Page.about();
      },
    },
  };
  function render() {
    var h = location.hash.slice(1) || "/",
      p = h.split("?"),
      path = p[0],
      q = {};
    new URLSearchParams(p[1] || "").forEach(function (v, k) {
      q[k] = v;
    });
    var r = routes[path] || routes["/"];
    if (!routes[path]) path = "/";
    document.title = r.title;
    document.getElementById("app").innerHTML = SG.views.layout(path, r.run(q));
    window.scrollTo(0, 0);
  }
  function go(path, force) {
    if (
      location.hash === "#" + path ||
      (force && location.hash === "#" + path)
    ) {
      render();
    } else {
      location.hash = path;
    }
  }
  return { render: render, go: go };
})();
