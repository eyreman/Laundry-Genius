// App.statuses: the six order statuses (single source of truth) and the text for each.
(function () {
  window.App = window.App || {};
  var R = App.rules;

  var LIST = [
    { id: "received", label: "Received", blurb: "Booking paid. Drop your bag at the drop point during your slot." },
    { id: "picked_up", label: "Picked up", blurb: "The driver has collected and weighed your bag." },
    { id: "washing", label: "Washing", blurb: "Your bag is at the partner laundry, washed separately." },
    { id: "out_for_delivery", label: "Out for delivery", blurb: "Your bag is on its way back to the drop point." },
    { id: "ready_to_collect", label: "Ready to collect", blurb: "Your bag is waiting at the drop point." },
    { id: "collected", label: "Collected", blurb: "You've picked up your bag. Enjoy your clean clothes." }
  ];

  function indexOf(id) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) return i;
    return -1;
  }

  function get(id) { return LIST[indexOf(id)] || null; }
  function label(id) { var s = get(id); return s ? s.label : id; }

  function next(id) {
    var i = indexOf(id);
    return i >= 0 && i < LIST.length - 1 ? LIST[i + 1].id : null;
  }

  // One text per status change.
  function textFor(statusId, order) {
    var dp = R.dropPoint(order.dropPointId);
    var head = "Order " + order.code + " — " + label(statusId) + ". ";
    switch (statusId) {
      case "received":
        return head + "Drop your bag at " + dp.name + ", " + dp.address + ", " +
          R.slotLabel(order.slotDate, order.slotId) + ". Write " + order.code +
          " on the bag. Back by " + R.dateTimeLabel(order.returnDeadline) + ".";
      case "picked_up": {
        var bag = R.bagOption(order.bagOptionId);
        var ow = R.overweight(order.weightKg, order.bagOptionId);
        return head + "Your bag weighed " + R.kg(order.weightKg) +
          (ow.amount > 0
            ? ", " + ow.extraKg + " kg over the " + bag.limitKg + " kg limit, so " + R.money(ow.amount) + " was charged to your saved card."
            : ". No extra charge.");
      }
      case "washing":
        return head + "Your bag is at our partner laundry and is washed separately.";
      case "out_for_delivery":
        return head + "Your bag is on its way back to " + dp.name + ".";
      case "ready_to_collect":
        return head + "Your bag is waiting at " + dp.name + ", " + dp.address + ". Give code " + order.code + " at the counter.";
      case "collected":
        return head + "Thanks! Need another bag before you leave? Book again in one tap from your status page.";
    }
    return head;
  }

  App.statuses = {
    list: function () { return LIST.slice(); },
    get: get,
    label: label,
    indexOf: indexOf,
    next: next,
    textFor: textFor
  };
})();
