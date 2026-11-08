// App.screens.book: renders #/book (step 1 of 3: pick a drop-off slot).
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  // Shared header for the three booking steps.
  function stepHeader(backHref, step, titleStart, titleEm) {
    var bars = [];
    for (var i = 1; i <= 3; i++) bars.push(el("i", { className: i <= step ? "on" : "" }));
    return el("div", { className: "top" }, [
      el("a", { className: "back", text: "← Back", attrs: { href: backHref } }),
      el("div", { className: "progress", attrs: { "aria-hidden": "true" } }, bars),
      el("p", { className: "eyebrow", text: "Step " + step + " of 3" }),
      el("h2", null, [titleStart, el("br"), el("em", { text: titleEm })])
    ]);
  }

  function render(root) {
    var R = App.rules;
    var draft = App.router.getDraft();
    var dp = R.defaultDropPoint();
    var days = R.availableSlots(new Date());

    var dayNodes = days.map(function (day) {
      var prefix = day.offset === 0 ? "Today · " : day.offset === 1 ? "Tomorrow · " : "";
      return el("div", { className: "day" }, [
        el("h4", { text: prefix + R.dayLabel(day.date) }),
        el("div", { className: "slots" }, day.slots.map(function (s) {
          var selected = draft.slotDate === day.date && draft.slotId === s.id;
          return el("button", {
            className: "slot" + (selected ? " sel" : ""),
            attrs: { type: "button", "aria-pressed": selected ? "true" : "false" },
            on: {
              click: function () {
                draft.slotDate = day.date;
                draft.slotId = s.id;
                App.router.go("#/details");
              }
            }
          }, [
            el("b", { text: s.label }),
            el("span", { text: "Back by " + R.dateTimeLabel(R.returnDeadline(day.date, s.id)) })
          ]);
        }))
      ]);
    });

    root.appendChild(el("div", { className: "screen" }, [
      stepHeader("#/", 1, "When will you", "drop it off?"),
      el("div", { className: "summary" }, [
        el("div", null, [el("b", { text: dp.name }), el("span", { text: dp.address })])
      ]),
      el("p", { className: "hint pad", text: "Leave your bag at the counter during your slot. You don't need to meet the driver." }),
      draft.prefill ? el("p", { className: "notice", text: "Your details are saved. Just pick a time." }) : null,
      days.length ? el("div", null, dayNodes)
        : el("p", { className: "notice", text: "No drop-off slots are open right now." })
    ]));
  }

  App.screens.book = { render: render, stepHeader: stepHeader };
})();
