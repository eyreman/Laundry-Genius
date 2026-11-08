// App.screens.landing: renders #/
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  var DIVIDER_1 = '<div class="divider" aria-hidden="true"><svg viewBox="0 0 58 28" fill="none" stroke="currentColor" stroke-width="1"><path d="M8 28V16Q8 6 16 2Q24 6 24 16V28"/><path d="M34 28V16Q34 6 42 2Q50 6 50 16V28"/><path d="M29 10l2 3-2 3-2-3z" fill="currentColor"/></svg></div>';
  var DIVIDER_2 = '<div class="divider" aria-hidden="true"><svg viewBox="0 0 58 28" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 28V14Q21 4 29 0Q37 4 37 14V28"/><path d="M25 28V16Q25 9 29 6Q33 9 33 16V28"/><path d="M10 14l2 3-2 3-2-3zM48 14l2 3-2 3-2-3z" fill="currentColor"/></svg></div>';

  // Hand-drawn neighbourhood sketch around Viale Corsica (decorative, not to scale).
  var MAP_SVG = '<svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<defs><pattern id="blk" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="18" height="18" fill="none" stroke="rgba(255,255,255,.04)"/></pattern></defs>' +
    '<rect width="400" height="190" fill="url(#blk)"/>' +
    '<path d="M40 120 Q70 95 110 105 L130 150 Q90 165 55 150Z" fill="rgba(110,160,120,.16)"/>' +
    '<g stroke="rgba(255,255,255,.09)" stroke-width="5" fill="none" stroke-linecap="round"><path d="M-10 40 L410 10"/><path d="M-10 175 L410 140"/><path d="M90 -10 L150 200"/><path d="M330 -10 L300 200"/></g>' +
    '<g stroke="rgba(255,255,255,.05)" stroke-width="2" fill="none"><path d="M-10 80 L410 55"/><path d="M-10 128 L410 100"/><path d="M190 -10 L215 200"/><path d="M40 -10 L80 200"/><path d="M370 -10 L360 200"/></g>' +
    '<path d="M-10 115 C120 100 200 92 410 72" stroke="rgba(212,176,122,.55)" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<path d="M-10 115 C120 100 200 92 410 72" stroke="#17302A" stroke-width="1.5" fill="none" stroke-dasharray="5 6" opacity=".7"/>' +
    '<path d="M-10 160 L410 20" stroke="rgba(255,255,255,.14)" stroke-width="1.5" stroke-dasharray="1 7" stroke-linecap="round" fill="none"/>' +
    '<text x="40" y="106" fill="rgba(241,211,158,.65)" font-family="Fraunces,Georgia,serif" font-style="italic" font-size="12" transform="rotate(-5 40 106)">Viale Corsica</text>' +
    '<text x="60" y="140" fill="rgba(160,200,170,.5)" font-family="DM Sans,sans-serif" font-size="8" letter-spacing="2">PARCO FORMENTANO</text>' +
    '</svg>';

  // "Viale Corsica, 99, 20133 Milano MI" -> "Viale Corsica 99"
  function shortAddress(address) {
    return address.split(",").slice(0, 2).join("").trim();
  }

  function render(root) {
    var R = App.rules;
    var cfg = R.config();
    var opt = App.store.priceOption();
    var dp = R.defaultDropPoint();
    var saved = App.store.savedGuest();
    var street = shortAddress(dp.address);

    // Track your order
    var trackError = el("p", { className: "error", attrs: { role: "alert" } });
    var trackInput = el("input", {
      className: "field",
      attrs: { id: "track-code", type: "text", placeholder: "LM-4HQ7", autocomplete: "off", autocapitalize: "characters", "aria-label": "Order code" },
      on: { input: function () { trackError.textContent = ""; } }
    });
    var trackForm = el("form", {
      on: {
        submit: function (e) {
          e.preventDefault();
          var code = R.normalizeCode(trackInput.value);
          if (code && App.store.hasOrder(code)) App.router.go("#/status/" + code);
          else trackError.textContent = "We couldn't find that code. Check the code on your bag or your confirmation text.";
        }
      }
    }, [
      el("div", { className: "row" }, [trackInput, el("button", { className: "ghost", text: "Track", attrs: { type: "submit" } })]),
      trackError
    ]);

    var marqueeWords = ["Lava · wash", "Asciuga · dry", "Piega · fold", "Same-day", street];
    var marqueeLine = el("div");
    for (var rep = 0; rep < 2; rep++) {
      marqueeWords.forEach(function (w) {
        marqueeLine.appendChild(document.createTextNode(w + " "));
        marqueeLine.appendChild(el("span", { text: "✦" }));
        marqueeLine.appendChild(document.createTextNode(" "));
      });
    }

    var screen = el("div", { className: "screen" }, [
      el("div", { className: "hero" }, [
        el("span", { className: "label", text: street + " · Milano" }),
        el("h1", null, [
          el("span", { className: "l", text: "Your trip," }),
          el("span", { className: "l l2" }, [el("em", { text: "not the" })]),
          el("span", { className: "l", text: "laundromat." })
        ]),
        el("p", {
          className: "lede",
          text: "Drop your bag at " + dp.name + " on your morning walk. Get it back clean and folded within " +
            cfg.returnWindowHours + " hours, at the same counter."
        })
      ]),

      el("div", { className: "arches", attrs: { "aria-hidden": "true" } }, [
        ["lava", "wash"], ["asciuga", "dry"], ["piega", "fold"]
      ].map(function (w) {
        return el("div", { className: "arch" }, [el("span", null, [w[0], el("small", { text: w[1] })])]);
      })),

      el("div", { className: "ticket" }, [
        el("div", { className: "serial" }, [el("span", { text: "Corsa singola · Milano" }), el("b", { text: "N° 0099" })]),
        el("div", { className: "ticket-top" }, [
          el("div", { className: "punch", attrs: { "aria-hidden": "true" } }, [
            el("span", null, ["Valid", el("br"), cfg.returnWindowHours + " ore"])
          ]),
          el("div", { className: "size", text: opt.label + " · " + opt.sizeHint }),
          el("div", { className: "price" }, [
            el("sup", { text: "€" }), String(opt.price), el("small", { text: "per bag" })
          ])
        ]),
        el("div", { className: "badge-row" }, [el("span", { className: "badge", text: "Back within " + cfg.returnWindowHours + " hours" })]),
        el("div", { className: "perf" }),
        el("div", { className: "ticket-bot" }, [
          el("div", { className: "ticket-facts" }, [
            el("div", null, [el("b", { text: cfg.returnWindowHours + "h" }), "or your money back"]),
            el("div", null, [el("b", { text: "+" + R.money(cfg.overweightPerKg) }), "per kg over " + opt.limitKg + " kg"]),
            el("div", null, [el("b", { text: R.money(cfg.insurancePrice) }), "optional protection"])
          ]),
          el("button", {
            className: "cta",
            attrs: { type: "button" },
            on: { click: function () { App.router.setDraft({}); App.router.go("#/book"); } }
          }, ["Book a drop-off ", el("span", { className: "arrow", text: "→" })]),
          saved ? el("button", {
            className: "ghost block",
            text: "Book again as " + saved.name,
            attrs: { type: "button" },
            on: { click: function () { App.router.setDraft({ prefill: saved }); App.router.go("#/book"); } }
          }) : null,
          el("p", { className: "fine", text: "Takes under 3 minutes. No account needed." })
        ])
      ]),

      el("div", { className: "marquee", attrs: { "aria-hidden": "true" } }, [marqueeLine]),

      App.dom.markup(DIVIDER_1),

      el("div", { className: "sec" }, [
        el("p", { className: "eyebrow", text: "Come funziona" }),
        el("h2", null, ["Three steps.", el("br"), el("em", { text: "Zero" }), " hours lost."]),
        el("ol", { className: "how" }, [
          el("li", null, [el("span", { className: "num", text: "i." }), el("div", null, [
            el("b", { text: "Book and pay" }),
            el("p", { text: "Pick a morning or midday drop-off slot." })
          ])]),
          el("li", null, [el("span", { className: "num", text: "ii." }), el("div", null, [
            el("b", { text: "Leave it at the counter" }),
            el("p", { text: "Hand your bag in at " + dp.name + " during your slot. You don't need to meet the driver." })
          ])]),
          el("li", null, [el("span", { className: "num", text: "iii." }), el("div", null, [
            el("b", { text: "Collect it clean" }),
            el("p", { text: "Every bag is washed separately by a professional laundry, then folded and back at " + dp.name +
              " within " + cfg.returnWindowHours + " hours. We text you at every step." })
          ])])
        ])
      ]),

      App.dom.markup(DIVIDER_2),

      el("div", { className: "sec" }, [
        el("p", { className: "eyebrow", text: "Your drop point" }),
        el("div", { className: "place" }, [
          el("div", { className: "place-map" }, [
            App.dom.markup(MAP_SVG),
            el("span", { className: "compass", text: "N" }),
            el("span", { className: "pin" }),
            el("span", { className: "pin-tag", text: dp.name + " · Drop here" })
          ]),
          el("div", { className: "place-body" }, [
            el("h3", { text: dp.name }),
            el("p", { text: dp.address }),
            el("div", { className: "hours" }, R.slots().map(function (s) {
              return el("span", { text: "Drop " + s.label });
            }))
          ])
        ])
      ]),

      el("div", { className: "card" }, [
        el("h3", { text: "Track your order" }),
        trackForm
      ]),

      el("div", { className: "terms" }, [
        el("p", { text: "Late back? We refund you in full, with an apology." }),
        el("p", {
          text: "Optional " + R.money(cfg.insurancePrice) + " protection covers lost or damaged items up to " +
            R.money(cfg.insuranceCoverMax) + ". Without it, a refund is the only compensation."
        })
      ])
    ]);

    root.appendChild(screen);
  }

  App.screens.landing = { render: render };
})();
