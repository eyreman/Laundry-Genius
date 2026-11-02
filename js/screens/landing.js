// App.screens.landing: renders #/
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  function render(root) {
    var R = App.rules;
    var cfg = R.config();
    var opt = App.store.priceOption();
    var dp = R.defaultDropPoint();
    var saved = App.store.savedGuest();

    var trackError = el("p", { className: "error", attrs: { role: "alert" } });
    var trackInput = el("input", {
      attrs: { id: "track-code", type: "text", placeholder: "e.g. LM-4HQ7", autocomplete: "off", autocapitalize: "characters" }
    });
    var trackForm = el("form", {
      className: "track",
      on: {
        submit: function (e) {
          e.preventDefault();
          var code = R.normalizeCode(trackInput.value);
          if (code && App.store.hasOrder(code)) {
            App.router.go("#/status/" + code);
          } else {
            trackError.textContent = "No order found with that code. Check the code written on your bag.";
          }
        }
      }
    }, [
      el("label", { text: "Order code", attrs: { for: "track-code" } }),
      el("div", { className: "row" }, [
        trackInput,
        el("button", { className: "btn btn-secondary", text: "Track", attrs: { type: "submit" } })
      ]),
      trackError
    ]);

    root.appendChild(el("div", { className: "screen" }, [
      el("section", { className: "hero" }, [
        el("p", { className: "eyebrow", text: "Milan · same-day laundry" }),
        el("h1", { text: "Get your trip time back." }),
        el("p", {
          className: "lead",
          text: "Drop your bag at " + dp.name + " on Viale Corsica. Get it back clean and folded within " +
            cfg.returnWindowHours + " hours, at the same spot."
        })
      ]),

      el("section", { className: "card price-card" }, [
        el("p", { className: "price" }, [
          el("span", { className: "amount", text: R.money(opt.price) }),
          el("span", { className: "per", text: " per bag" })
        ]),
        el("p", { className: "price-detail", text: opt.label + " · " + opt.sizeHint }),
        el("p", {
          className: "muted small",
          text: "+" + R.money(cfg.overweightPerKg) + " per kg over " + opt.limitKg + " kg, charged after weighing."
        }),
        el("button", {
          className: "btn btn-primary btn-block",
          text: "Book a drop-off",
          attrs: { type: "button" },
          on: { click: function () { App.router.setDraft({}); App.router.go("#/book"); } }
        }),
        saved ? el("button", {
          className: "btn btn-secondary btn-block",
          text: "Book again as " + saved.name,
          attrs: { type: "button" },
          on: { click: function () { App.router.setDraft({ prefill: saved }); App.router.go("#/book"); } }
        }) : null
      ]),

      el("section", null, [
        el("h2", { text: "How it works" }),
        el("ol", { className: "how" }, [
          el("li", null, [el("strong", { text: "Book and pay. " }), "Pick a drop-off time. Takes under 3 minutes."]),
          el("li", null, [el("strong", { text: "Drop your bag at " + dp.name + ". " }), "Leave it at the counter. No need to meet the driver."]),
          el("li", null, [el("strong", { text: "Collect it clean. " }), "Back within " + cfg.returnWindowHours + " hours, with a text at every step."])
        ])
      ]),

      el("p", { className: "note", text: "Every bag is washed separately by a professional laundry." }),

      el("section", { className: "card" }, [
        el("h2", { text: "Track your order" }),
        trackForm
      ]),

      el("section", { className: "terms" }, [
        el("p", { text: "Late back? We refund you in full, with an apology." }),
        el("p", {
          text: "Optional " + R.money(cfg.insurancePrice) + " protection covers lost or damaged items up to " +
            R.money(cfg.insuranceCoverMax) + ". Without it, a refund is the only compensation."
        })
      ])
    ]));
  }

  App.screens.landing = { render: render };
})();
