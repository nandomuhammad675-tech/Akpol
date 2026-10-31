// Namespace global MVC: SG.models, SG.views, SG.controllers
window.SG = {
  models: {},
  views: {},
  controllers: {},
  state: {},
  util: {
    esc: function (t) {
      return String(t).replace(/[&<>"']/g, function (c) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c];
      });
    },
  },
};
