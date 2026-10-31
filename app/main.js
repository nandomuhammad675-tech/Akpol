// Titik masuk aplikasi: pasang event global lalu jalankan router
document.addEventListener("submit", function (e) {
  var f = e.target.closest("form[data-form]");
  if (!f) return;
  e.preventDefault();
  SG.controllers.Check.submit(f.querySelector("input").value);
});
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-ex]");
  if (b) SG.controllers.Check.submit(b.dataset.ex);
});
window.addEventListener("hashchange", SG.router.render);
SG.router.render();
