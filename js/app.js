// Boot.
(function () {
  App.store.init();
  if (App.demo) App.demo.mountFooter(document.getElementById("demo-footer"));
  App.router.start();
})();
