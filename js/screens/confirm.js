// App.screens.confirm: renders #/confirm/:code (step 3 of 3).
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
      el("div", { className: "done" }, [
        el("div", { className: "seal", text: "Grazie", attrs: { "aria-hidden": "true" } }),
        el("h2", { text: "You're booked, " + order.guest.name.split(" ")[0] + "." }),
        el("p", { className: "lede", text: "Write this code on your bag or tag it." }),
        el("div", { className: "code", text: order.code })
      ]),

      el("div", { className: "card" }, [
        el("dl", { className: "kv" }, [
          el("dt", { text: "Drop at" }),
          el("dd", null, [el("b", { text: dp.name }), el("br"), dp.address]),
          el("dt", { text: "Slot" }),
          el("dd", { text: R.slotLabel(order.slotDate, order.slotId) }),
          el("dt", { text: "Back by" }),
          el("dd", { text: R.dateTimeLabel(order.returnDeadline) + ", same counter" }),
          el("dt", { text: "Paid" }),
          el("dd", { text: R.money(R.totalCharged(order)) })
        ])
      ]),

      el("p", { className: "fine pad", text: "We've texted you these details. See them on your status page." }),

      el("div", { className: "actions" }, [
        el("a", { className: "cta", attrs: { href: "#/status/" + order.code } }, ["Track your order ", el("span", { className: "arrow", text: "→" })]),
        el("a", { className: "ghost block", text: "Back to home", attrs: { href: "#/" } })
      ])
    ]));
  }

  App.screens.confirm = { render: render };
})();
