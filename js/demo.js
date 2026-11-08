// App.demo: demo-only controls. Removing this file and its script tag leaves the app working.
(function () {
  window.App = window.App || {};
  var el = App.dom.el;

  // "Advance to next status" on the status page. Asks for the weight before Picked up.
  function mountControl(container, order) {
    if (!App.rules.config().showDemoControls) return;
    var S = App.statuses;
    var next = S.next(order.status);
    if (!next) return;

    var error = el("p", { className: "error", attrs: { role: "alert" } });
    var children = [el("p", { className: "demo-tag", text: "Demo" })];

    if (next === "picked_up") {
      var bag = App.rules.bagOption(order.bagOptionId);
      var weight = el("input", {
        className: "field",
        attrs: { id: "demo-weight", type: "number", step: "0.1", min: "0.1", max: "50", inputmode: "decimal", placeholder: "e.g. 4.2" }
      });
      children.push(
        el("form", {
          on: {
            submit: function (e) {
              e.preventDefault();
              try {
                App.store.advance(order.code, parseFloat(weight.value));
                App.router.render();
              } catch (err) {
                error.textContent = err.message;
              }
            }
          }
        }, [
          el("label", { text: "Bag weight at pickup (kg). Limit for this bag: " + bag.limitKg + " kg", attrs: { for: "demo-weight" } }),
          el("div", { className: "row" }, [
            weight,
            el("button", { className: "ghost", text: "Mark " + S.label(next), attrs: { type: "submit" } })
          ])
        ])
      );
    } else {
      children.push(el("button", {
        className: "ghost block",
        text: "Advance to " + S.label(next),
        attrs: { type: "button" },
        on: {
          click: function () {
            try {
              App.store.advance(order.code);
              App.router.render();
            } catch (err) {
              error.textContent = err.message;
            }
          }
        }
      }));
    }
    children.push(error);
    container.appendChild(el("section", { className: "demo-panel" }, children));
  }

  // "Reset demo data" in the footer. Asks for a second tap instead of a confirm() dialog.
  function mountFooter(container) {
    if (!App.rules.config().showDemoControls) return;
    var armed = false;
    var btn = el("button", {
      className: "btn-link",
      text: "Reset demo data",
      attrs: { type: "button" },
      on: {
        click: function () {
          if (!armed) {
            armed = true;
            btn.textContent = "Tap again to reset all demo orders";
            setTimeout(function () { armed = false; btn.textContent = "Reset demo data"; }, 4000);
            return;
          }
          armed = false;
          btn.textContent = "Reset demo data";
          App.store.reset();
          App.router.clearDraft();
          App.router.go("#/");
        }
      }
    });
    container.appendChild(btn);
  }

  App.demo = { mountControl: mountControl, mountFooter: mountFooter };
})();
