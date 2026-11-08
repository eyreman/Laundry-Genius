// App.screens.status: renders #/status/:code
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  var CHARGE_LABELS = { bag: "Bag", insurance: "Protection", overweight: "Extra weight" };

  function render(root, code) {
    var R = App.rules;
    var S = App.statuses;
    var order = App.store.getOrder(code);
    if (!order) return App.router.notFound(root);
    var dp = R.dropPoint(order.dropPointId);
    var bag = R.bagOption(order.bagOptionId);
    var currentIdx = S.indexOf(order.status);

    var reachedAt = {};
    order.statusLog.forEach(function (e) { reachedAt[e.status] = e.at; });

    var timeline = el("ol", { className: "timeline" }, S.list().map(function (s, i) {
      var cls = i < currentIdx ? "did" : i === currentIdx ? "now" : "";
      return el("li", { className: cls, attrs: { "aria-current": i === currentIdx ? "step" : false } }, [
        el("b", { text: s.label }),
        reachedAt[s.id] ? R.dateTimeLabel(reachedAt[s.id]) : null,
        i === currentIdx ? el("p", { className: "blurb", text: s.blurb }) : null
      ]);
    }));

    var careList = [];
    if (order.careNotes.coldWash) careList.push("Cold wash");
    if (order.careNotes.noDryer) careList.push("No dryer");
    if (order.careNotes.delicates) careList.push("Delicates");

    var bill = el("div", { className: "bill" }, order.charges.map(function (c) {
      var lbl = CHARGE_LABELS[c.type] || c.type;
      if (c.type === "overweight") lbl += " (" + c.extraKg + " kg over)";
      return el("div", { className: "line" }, [el("span", { text: lbl }), el("span", { text: R.money(c.amount) })]);
    }).concat([
      el("div", { className: "line tot" }, [el("span", { text: "Total charged" }), el("span", { text: R.money(R.totalCharged(order)) })])
    ]));

    var texts = el("ul", { className: "texts" }, order.texts.map(function (t) {
      return el("li", { className: "bubble" }, [
        el("p", { text: t.body }),
        el("p", { className: "when", text: R.dateTimeLabel(t.at) })
      ]);
    }));

    var demoSlot = el("div");

    root.appendChild(el("div", { className: "screen" }, [
      el("div", { className: "top" }, [
        el("a", { className: "back", text: "← Home", attrs: { href: "#/" } }),
        el("p", { className: "eyebrow", text: "Order " + order.code }),
        el("h2", { text: S.label(order.status) })
      ]),
      timeline,
      demoSlot,

      el("div", { className: "card" }, [
        el("dl", { className: "kv" }, [
          el("dt", { text: "Drop point" }),
          el("dd", null, [el("b", { text: dp.name }), el("br"), dp.address]),
          el("dt", { text: "Slot" }),
          el("dd", { text: R.slotLabel(order.slotDate, order.slotId) }),
          el("dt", { text: "Back by" }),
          el("dd", { text: R.dateTimeLabel(order.returnDeadline) }),
          el("dt", { text: "Bag" }),
          el("dd", { text: bag.label + ", " + bag.sizeHint }),
          el("dt", { text: "Weight" }),
          el("dd", { text: order.weightKg != null ? R.kg(order.weightKg) : "Weighed at pickup" }),
          el("dt", { text: "Care" }),
          el("dd", { text: careList.length ? careList.join(", ") : "None" }),
          el("dt", { text: "Requests" }),
          el("dd", { text: order.specialRequests || "None" }),
          el("dt", { text: "Protection" }),
          el("dd", { text: order.insurance ? "Yes, up to " + R.money(R.config().insuranceCoverMax) : "No (refund only)" })
        ])
      ]),

      el("h3", { className: "sec-title", text: "Charges" }),
      el("div", { className: "pad" }, [bill]),

      el("h3", { className: "sec-title", text: "Texts to " + order.guest.phone }),
      texts,

      el("div", { className: "actions" }, [
        el("button", {
          className: "cta",
          attrs: { type: "button" },
          on: {
            click: function () {
              App.router.setDraft({
                prefill: {
                  name: order.guest.name,
                  phone: order.guest.phone,
                  checkoutDate: order.checkoutDate,
                  careNotes: order.careNotes,
                  insurance: order.insurance
                }
              });
              App.router.go("#/book");
            }
          }
        }, ["Book again ", el("span", { className: "arrow", text: "→" })])
      ])
    ]));

    if (App.demo) App.demo.mountControl(demoSlot, order);
  }

  App.screens.status = { render: render };
})();
