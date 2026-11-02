// App.screens.details: renders #/details and submits the booking.
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  function checkbox(id, labelText, checked) {
    var input = el("input", { attrs: { id: id, type: "checkbox", checked: !!checked } });
    var wrap = el("label", { className: "check", attrs: { for: id } }, [input, el("span", { text: labelText })]);
    return { input: input, wrap: wrap };
  }

  function field(id, labelText, input, hint) {
    return el("div", { className: "field" }, [
      el("label", { text: labelText, attrs: { for: id } }),
      input,
      hint ? el("p", { className: "muted small", text: hint }) : null
    ]);
  }

  function render(root) {
    var R = App.rules;
    var cfg = R.config();
    var draft = App.router.getDraft();
    var opt = App.store.priceOption();
    var dp = R.defaultDropPoint();
    var today = R.toYMD(new Date());
    // Values typed earlier in this booking win over Book again prefill.
    var v = draft.form || draft.prefill || {};
    var care = v.careNotes || {};

    var name = el("input", { attrs: { id: "f-name", type: "text", autocomplete: "name", value: v.name || "" } });
    var phone = el("input", { attrs: { id: "f-phone", type: "tel", autocomplete: "tel", placeholder: "+39 333 123 4567", value: v.phone || "" } });
    var checkout = el("input", { attrs: { id: "f-checkout", type: "date", min: today, value: v.checkoutDate || "" } });

    var cold = checkbox("f-cold", "Cold wash", care.coldWash);
    var noDryer = checkbox("f-nodryer", "No dryer", care.noDryer);
    var delicates = checkbox("f-delicates", "Delicates", care.delicates);
    var insurance = checkbox("f-insurance",
      "Add protection (+" + R.money(cfg.insurancePrice) + "). Covers lost or damaged items up to " + R.money(cfg.insuranceCoverMax) + ".",
      v.insurance);
    var disclaimer = checkbox("f-disclaimer",
      "I understand that without protection, a refund of what I paid is the only compensation for lost or damaged items.",
      v.disclaimerAccepted);
    var approve = checkbox("f-approve",
      "I approve " + R.money(cfg.overweightPerKg) + " per kg over " + opt.limitKg + " kg, charged to my saved card after weighing.",
      v.overweightApproved);

    var lateBox = el("div", { className: "alert", attrs: { role: "alert", hidden: true } });
    var protectionLine = el("div", { className: "line" });
    var totalLine = el("div", { className: "line total" });
    var payBtn = el("button", { className: "btn btn-primary btn-block", attrs: { type: "submit" } });
    var todo = el("ul", { className: "missing muted small" });
    var submitError = el("p", { className: "error", attrs: { role: "alert" } });

    function values() {
      return {
        name: name.value,
        phone: phone.value,
        checkoutDate: checkout.value,
        careNotes: { coldWash: cold.input.checked, noDryer: noDryer.input.checked, delicates: delicates.input.checked },
        insurance: insurance.input.checked,
        disclaimerAccepted: disclaimer.input.checked,
        overweightApproved: approve.input.checked
      };
    }

    function update() {
      var f = values();
      draft.form = f;
      var missing = [];
      var late = false;

      if (!f.name.trim()) missing.push("Enter your name");
      if (!R.isValidPhone(f.phone)) missing.push("Enter a phone number we can text");
      if (!R.isYMD(f.checkoutDate)) {
        missing.push("Pick your checkout date");
      } else if (R.isPastDate(f.checkoutDate)) {
        missing.push("Checkout date can't be in the past");
      } else if (R.isLateReturn(draft.slotDate, draft.slotId, f.checkoutDate)) {
        late = true;
        missing.push("Pick an earlier drop-off slot");
      }
      if (!f.insurance && !f.disclaimerAccepted) missing.push("Add protection or accept the refund-only disclaimer");
      if (!f.overweightApproved) missing.push("Approve the overweight charge");

      lateBox.hidden = !late;
      App.dom.clear(lateBox);
      if (late) {
        App.dom.append(lateBox, [
          el("p", {
            text: "Your bag wouldn't be back before you check out. This slot returns by " +
              R.dateTimeLabel(R.returnDeadline(draft.slotDate, draft.slotId)) + ", and checkout is " +
              R.dateTimeLabel(R.checkoutAt(f.checkoutDate)) + "."
          }),
          el("a", { text: "Pick an earlier slot", attrs: { href: "#/book" } })
        ]);
      }

      disclaimer.wrap.hidden = f.insurance;

      App.dom.clear(protectionLine);
      if (f.insurance) {
        App.dom.append(protectionLine, [el("span", { text: "Protection" }), el("span", { text: R.money(cfg.insurancePrice) })]);
      }
      protectionLine.hidden = !f.insurance;

      var total = R.bookingTotal(opt.id, f.insurance);
      App.dom.clear(totalLine);
      App.dom.append(totalLine, [el("span", { text: "Total today" }), el("span", { text: R.money(total) })]);

      payBtn.textContent = "Pay " + R.money(total) + " (demo, no real charge)";
      payBtn.disabled = missing.length > 0;

      App.dom.clear(todo);
      missing.forEach(function (m) { todo.appendChild(el("li", { text: m })); });
      todo.hidden = missing.length === 0;
      return missing.length === 0;
    }

    var form = el("form", {
      className: "form",
      attrs: { novalidate: true },
      on: {
        input: update,
        change: update,
        submit: function (e) {
          e.preventDefault();
          if (!update()) return;
          var f = values();
          try {
            var order = App.store.createOrder({
              slotDate: draft.slotDate,
              slotId: draft.slotId,
              guest: { name: f.name, phone: f.phone },
              checkoutDate: f.checkoutDate,
              careNotes: f.careNotes,
              insurance: f.insurance,
              disclaimerAccepted: f.disclaimerAccepted,
              overweightApproved: f.overweightApproved
            });
            App.router.clearDraft();
            App.router.go("#/confirm/" + order.code);
          } catch (err) {
            submitError.textContent = err.message;
          }
        }
      }
    }, [
      el("section", { className: "card summary" }, [
        el("div", { className: "line" }, [
          el("span", null, [el("strong", { text: dp.name }), el("br"), R.slotLabel(draft.slotDate, draft.slotId)]),
          el("a", { text: "Change", attrs: { href: "#/book" } })
        ])
      ]),

      el("h2", { text: "Your details" }),
      field("f-name", "Name", name),
      field("f-phone", "Phone", phone, "We text you at every step. Include your country code."),
      field("f-checkout", "Checkout date", checkout, "So we can make sure your bag is back before you leave."),
      lateBox,

      el("h2", { text: "Care notes" }),
      el("div", { className: "checks" }, [cold.wrap, noDryer.wrap, delicates.wrap]),

      el("h2", { text: "Protection" }),
      el("div", { className: "checks" }, [insurance.wrap, disclaimer.wrap]),

      el("h2", { text: "Payment" }),
      el("section", { className: "card bill" }, [
        el("div", { className: "line" }, [el("span", { text: opt.label + " (" + opt.sizeHint + ")" }), el("span", { text: R.money(opt.price) })]),
        protectionLine,
        totalLine,
        el("p", { className: "muted small", text: "Your card is saved for any overweight charge." })
      ]),
      el("div", { className: "checks" }, [approve.wrap]),

      payBtn,
      todo,
      submitError
    ]);

    root.appendChild(el("div", { className: "screen" }, [
      el("a", { className: "back", text: "← Back", attrs: { href: "#/book" } }),
      el("h1", { text: "Details and checkout" }),
      form
    ]));

    update();
  }

  App.screens.details = { render: render };
})();
