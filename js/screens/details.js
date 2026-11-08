// App.screens.details: renders #/details (step 2 of 3) and submits the booking.
(function () {
  window.App = window.App || {};
  App.screens = App.screens || {};
  var el = App.dom.el;

  // Pill-shaped checkbox (care notes).
  function chip(id, text, checked) {
    var input = el("input", { className: "sr", attrs: { id: id, type: "checkbox", checked: !!checked } });
    return { input: input, wrap: el("label", { className: "chip", attrs: { for: id } }, [input, el("span", { text: text })]) };
  }

  // Card-shaped checkbox with a title and small print (protection, consents).
  function toggle(id, title, small, checked) {
    var input = el("input", { className: "sr", attrs: { id: id, type: "checkbox", checked: !!checked } });
    return {
      input: input,
      wrap: el("label", { className: "toggle", attrs: { for: id } }, [
        input,
        el("span", { className: "box", text: "✓", attrs: { "aria-hidden": "true" } }),
        el("span", { className: "txt" }, [el("b", { text: title }), small ? el("small", { text: small }) : null])
      ])
    };
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

    var name = el("input", { className: "field", attrs: { id: "f-name", type: "text", autocomplete: "name", placeholder: "Giulia Rossi", value: v.name || "" } });
    var phone = el("input", { className: "field", attrs: { id: "f-phone", type: "tel", autocomplete: "tel", placeholder: "+39 333 123 4567", value: v.phone || "" } });
    var checkout = el("input", { className: "field", attrs: { id: "f-checkout", type: "date", min: today, value: v.checkoutDate || "" } });

    var cold = chip("f-cold", "Cold wash", care.coldWash);
    var noDryer = chip("f-nodryer", "No dryer", care.noDryer);
    var delicates = chip("f-delicates", "Delicates", care.delicates);
    var maxRequests = App.rules.config().specialRequestsMaxLength;
    var requests = el("textarea", {
      className: "field",
      attrs: { id: "f-requests", rows: "3", maxlength: String(maxRequests), placeholder: "e.g. The white linen shirt needs a gentle wash. Fold jeans, don't hang." }
    });
    requests.value = v.specialRequests || "";
    var requestsCount = el("p", { className: "count", attrs: { "aria-live": "polite" } });
    var insurance = toggle("f-insurance",
      "Add protection, +" + R.money(cfg.insurancePrice),
      "Lost or damaged items covered up to " + R.money(cfg.insuranceCoverMax) + ".",
      v.insurance);
    var disclaimer = toggle("f-disclaimer",
      "I understand the refund-only policy",
      "Without protection, a refund of what I paid is the only compensation for lost or damaged items.",
      v.disclaimerAccepted);
    var approve = toggle("f-approve",
      "I approve extra-weight charges",
      R.money(cfg.overweightPerKg) + " per kg over " + opt.limitKg + " kg, charged to my saved card after weighing. We text you the weight first.",
      v.overweightApproved);

    var lateBox = el("div", { className: "alert", attrs: { role: "alert", hidden: true } });
    var protectionLine = el("div", { className: "line" }, [el("span", { text: "Protection" }), el("span", { text: R.money(cfg.insurancePrice) })]);
    var totalAmount = el("span");
    var payLabel = el("span");
    var payBtn = el("button", { className: "cta brass", attrs: { type: "submit" } }, [payLabel, " ", el("span", { className: "arrow", text: "→" })]);
    var missingList = el("ul", { className: "missing" });
    var submitError = el("p", { className: "error", attrs: { role: "alert" } });

    function values() {
      return {
        name: name.value,
        phone: phone.value,
        checkoutDate: checkout.value,
        careNotes: { coldWash: cold.input.checked, noDryer: noDryer.input.checked, delicates: delicates.input.checked },
        specialRequests: requests.value,
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
      if (!f.insurance && !f.disclaimerAccepted) missing.push("Add protection or accept the refund-only policy");
      if (!f.overweightApproved) missing.push("Approve extra-weight charges");

      lateBox.hidden = !late;
      App.dom.clear(lateBox);
      if (late) {
        App.dom.append(lateBox, [
          el("p", {
            text: "Your bag wouldn't be back before you check out. This slot returns by " +
              R.dateTimeLabel(R.returnDeadline(draft.slotDate, draft.slotId)) + ", and checkout is " +
              R.dateTimeLabel(R.checkoutAt(f.checkoutDate)) + "."
          }),
          el("a", { text: "Pick an earlier slot →", attrs: { href: "#/book" } })
        ]);
      }

      requestsCount.textContent = f.specialRequests.length + "/" + maxRequests;
      disclaimer.wrap.hidden = f.insurance;
      protectionLine.hidden = !f.insurance;

      var total = R.bookingTotal(opt.id, f.insurance);
      totalAmount.textContent = R.money(total);
      payLabel.textContent = "Pay " + R.money(total);
      payBtn.disabled = missing.length > 0;

      App.dom.clear(missingList);
      // Only the next thing to fix, so the pinned pay bar stays short on phones.
      if (missing.length) missingList.appendChild(el("li", { text: "Next: " + missing[0] }));
      missingList.hidden = missing.length === 0;
      return missing.length === 0;
    }

    var form = el("form", {
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
              specialRequests: f.specialRequests,
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
      el("div", { className: "summary" }, [
        el("div", null, [
          el("b", { text: R.slotLabel(draft.slotDate, draft.slotId) }),
          el("span", { text: dp.name + " · back by " + R.dateTimeLabel(R.returnDeadline(draft.slotDate, draft.slotId)) })
        ]),
        el("a", { text: "Change", attrs: { href: "#/book" } })
      ]),

      el("div", { className: "form" }, [
        el("h3", { text: "About you" }),
        el("label", { className: "lbl", text: "Name", attrs: { for: "f-name" } }),
        name,
        el("label", { className: "lbl", text: "Phone", attrs: { for: "f-phone" } }),
        phone,
        el("p", { className: "hint", text: "We text you at every step. Include your country code." }),
        el("label", { className: "lbl", text: "Checkout date", attrs: { for: "f-checkout" } }),
        checkout,
        el("p", { className: "hint", text: "So your bag is back before you leave." }),
        lateBox,

        el("h3", { text: "Care notes" }),
        el("div", { className: "chips" }, [cold.wrap, noDryer.wrap, delicates.wrap]),
        el("label", { className: "lbl", text: "Anything else for the laundry? (optional)", attrs: { for: "f-requests" } }),
        requests,
        el("p", { className: "hint", text: "Special requests for this bag. Please don't include personal details." }),
        requestsCount,

        el("h3", { text: "Protection" }),
        insurance.wrap,
        disclaimer.wrap,

        el("h3", { text: "Payment" }),
        el("div", { className: "bill" }, [
          el("div", { className: "line" }, [el("span", { text: opt.label + ", " + opt.sizeHint }), el("span", { text: R.money(opt.price) })]),
          protectionLine,
          el("div", { className: "line tot" }, [el("span", { text: "Total today" }), totalAmount])
        ]),
        el("p", { className: "hint", text: "Your card is saved for any extra-weight charge." }),
        approve.wrap
      ]),

      el("div", { className: "sticky" }, [
        payBtn,
        missingList,
        submitError,
        el("p", { className: "fine", text: "Trial version. You won't be charged." })
      ])
    ]);

    root.appendChild(el("div", { className: "screen" }, [
      App.screens.book.stepHeader("#/book", 2, "Details and", "checkout"),
      form
    ]));

    update();
  }

  App.screens.details = { render: render };
})();
