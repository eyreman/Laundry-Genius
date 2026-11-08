// App.router: hash routing, the in-progress booking, and the "not found" view.
(function () {
  window.App = window.App || {};
  var el = App.dom.el;
  var draft = {};

  function parts() {
    return (location.hash || "").replace(/^#/, "").split("/").filter(Boolean);
  }

  function render() {
    var root = document.getElementById("app");
    App.dom.clear(root);
    var p = parts();
    var screens = App.screens;

    switch (p[0]) {
      case undefined:
        screens.landing.render(root);
        break;
      case "book":
        screens.book.render(root);
        break;
      case "details":
        if (!draft.slotDate || !draft.slotId) return go("#/book");
        screens.details.render(root);
        break;
      case "confirm":
        screens.confirm.render(root, decodeURIComponent(p[1] || ""));
        break;
      case "status":
        screens.status.render(root, decodeURIComponent(p[1] || ""));
        break;
      default:
        return go("#/");
    }
    window.scrollTo(0, 0);
  }

  function go(hash) {
    if (location.hash === hash || (hash === "#/" && !location.hash)) render();
    else location.hash = hash;
  }

  function notFound(root) {
    root.appendChild(el("div", { className: "screen" }, [
      el("div", { className: "top" }, [
        el("p", { className: "eyebrow", text: "Hmm" }),
        el("h2", { text: "Order not found" }),
        el("p", { className: "lede", text: "Check the code written on your bag and try again." })
      ]),
      el("div", { className: "actions" }, [el("a", { className: "cta", text: "Back to home", attrs: { href: "#/" } })])
    ]));
  }

  App.router = {
    start: function () {
      window.addEventListener("hashchange", render);
      render();
    },
    render: render,
    go: go,
    notFound: notFound,
    getDraft: function () { return draft; },
    setDraft: function (d) { draft = d || {}; },
    clearDraft: function () { draft = {}; }
  };
})();
