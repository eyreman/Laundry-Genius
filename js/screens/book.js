// App.screens.book: renders #/book (pick a drop-off slot).
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  function render(root) {
    var R = App.rules;
    var draft = App.router.getDraft();
    var dp = R.defaultDropPoint();
    var days = R.availableSlots(new Date());

    var dayNodes = days.map(function (day) {
      var prefix = day.offset === 0 ? "Today · " : day.offset === 1 ? "Tomorrow · " : "";
      return el("div", { className: "day" }, [
        el("h3", { text: prefix + R.dayLabel(day.date) }),
        el("div", { className: "slots" }, day.slots.map(function (s) {
          var selected = draft.slotDate === day.date && draft.slotId === s.id;
          return el("button", {
            className: "slot" + (selected ? " selected" : ""),
            attrs: { type: "button", "aria-pressed": selected ? "true" : "false" },
            on: {
              click: function () {
                draft.slotDate = day.date;
                draft.slotId = s.id;
                App.router.go("#/details");
              }
            }
          }, [
            el("span", { className: "slot-time", text: s.label }),
            el("span", { className: "slot-back", text: "Back by " + R.dateTimeLabel(R.returnDeadline(day.date, s.id)) })
          ]);
        }))
      ]);
    });

    root.appendChild(el("div", { className: "screen" }, [
      el("a", { className: "back", text: "← Back", attrs: { href: "#/" } }),
      el("h1", { text: "Pick a drop-off time" }),
      draft.prefill ? el("p", { className: "notice", text: "Your details are saved. Just pick a time." }) : null,
      el("section", { className: "card drop-point" }, [
        el("p", { className: "dp-name", text: dp.name }),
        el("p", { text: dp.address }),
        el("p", { className: "muted small", text: "Leave your bag at the counter during your slot. You don't need to meet the driver." })
      ]),
      days.length ? el("div", { className: "days" }, dayNodes)
        : el("p", { className: "notice", text: "No drop-off slots are open right now." })
    ]));
  }

  App.screens.book = { render: render };
})();
