// App.screens.confirm: renders #/confirm/:code
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  function render(root, code) {
    var R = App.rules;
    var order = App.store.getOrder(code);
    if (!order) return App.router.notFound(root);
    var dp = R.dropPoint(order.dropPointId);

    root.appendChild(el("div", { className: "screen" }, [
      el("p", { className: "eyebrow", text: "Booked and paid" }),
      el("h1", { text: "You're all set, " + order.guest.name.split(" ")[0] + "." }),

      el("section", { className: "card code-card" }, [
        el("p", { className: "muted small", text: "Your order code" }),
        el("p", { className: "code", text: order.code }),
        el("p", { text: "Write this code on your bag or tag it." })
      ]),

      el("dl", { className: "facts" }, [
        el("dt", { text: "Drop it at" }),
        el("dd", null, [el("strong", { text: dp.name }), el("br"), dp.address]),
        el("dt", { text: "Drop-off slot" }),
        el("dd", { text: R.slotLabel(order.slotDate, order.slotId) }),
        el("dt", { text: "Back by" }),
        el("dd", { text: R.dateTimeLabel(order.returnDeadline) + ", at the same drop point" }),
        el("dt", { text: "Paid" }),
        el("dd", { text: R.money(R.totalCharged(order)) })
      ]),

      el("p", { className: "muted small", text: "We've texted you these details (see your status page)." }),

      el("a", { className: "btn btn-primary btn-block", text: "Track your order", attrs: { href: "#/status/" + order.code } }),
      el("a", { className: "btn btn-secondary btn-block", text: "Home", attrs: { href: "#/" } })
    ]));
  }

  App.screens.confirm = { render: render };
})();
