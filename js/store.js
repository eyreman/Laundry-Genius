// App.store: the only file that reads or writes localStorage.
(function () {
  window.App = window.App || {};
  var D = window.MOCK_DATA;
  var R = App.rules;
  var S = App.statuses;
  var KEY = "laundryProto.v1";
  var state = null;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      return s && s.version === D.version && Array.isArray(s.orders) ? s : null;
    } catch (e) {
      return null;
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* in-memory only */ }
  }

  function seed() {
    state = {
      version: D.version,
      priceOptionId: Math.random() < 0.5 ? "small" : "standard",
      orders: clone(D.orders),
      savedGuest: null
    };
    save();
  }

  function init() {
    state = load();
    if (!state) seed();
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    seed();
  }

  function findOrder(code) {
    for (var i = 0; i < state.orders.length; i++) if (state.orders[i].code === code) return state.orders[i];
    return null;
  }

  function getOrder(code) {
    var o = findOrder(code);
    return o ? clone(o) : null;
  }

  // input: { slotDate, slotId, guest: {name, phone}, checkoutDate, careNotes, insurance,
  //          disclaimerAccepted, overweightApproved }
  function createOrder(input) {
    var now = new Date();
    var nowISO = now.toISOString();
    if (!R.slot(input.slotId) || !R.isYMD(input.slotDate)) throw new Error("Pick a drop-off slot.");
    if (!input.guest || !String(input.guest.name || "").trim()) throw new Error("Enter your name.");
    if (!R.isValidPhone(input.guest.phone)) throw new Error("Enter a valid phone number.");
    if (!R.isYMD(input.checkoutDate) || R.isPastDate(input.checkoutDate, now)) throw new Error("Checkout date can't be in the past.");
    if (R.isLateReturn(input.slotDate, input.slotId, input.checkoutDate)) throw new Error("This slot can't be returned before checkout.");
    if (!input.insurance && !input.disclaimerAccepted) throw new Error("Accept the refund-only disclaimer or add protection.");
    if (!input.overweightApproved) throw new Error("Approve the overweight charge.");

    var cfg = R.config();
    var bagOptionId = state.priceOptionId;
    var order = {
      code: R.generateCode(state.orders.map(function (o) { return o.code; })),
      createdAt: nowISO,
      bagOptionId: bagOptionId,
      dropPointId: R.defaultDropPoint().id,
      slotDate: input.slotDate,
      slotId: input.slotId,
      returnDeadline: R.returnDeadline(input.slotDate, input.slotId).toISOString(),
      guest: { name: String(input.guest.name).trim(), phone: String(input.guest.phone).trim() },
      checkoutDate: input.checkoutDate,
      careNotes: {
        coldWash: !!(input.careNotes && input.careNotes.coldWash),
        noDryer: !!(input.careNotes && input.careNotes.noDryer),
        delicates: !!(input.careNotes && input.careNotes.delicates)
      },
      specialRequests: String(input.specialRequests || "").trim().slice(0, cfg.specialRequestsMaxLength),
      insurance: !!input.insurance,
      disclaimerAccepted: !!input.disclaimerAccepted,
      overweightApproved: true,
      weightKg: null,
      charges: [{ type: "bag", amount: R.bagOption(bagOptionId).price, at: nowISO }],
      status: "received",
      statusLog: [{ status: "received", at: nowISO }],
      texts: []
    };
    if (order.insurance) order.charges.push({ type: "insurance", amount: cfg.insurancePrice, at: nowISO });
    order.texts.push({ at: nowISO, status: "received", body: S.textFor("received", order) });

    state.orders.push(order);
    state.savedGuest = {
      name: order.guest.name,
      phone: order.guest.phone,
      checkoutDate: order.checkoutDate,
      careNotes: clone(order.careNotes),
      insurance: order.insurance
    };
    save();
    return clone(order);
  }

  // Moves an order one status forward. weightKg is required when the next status is Picked up.
  function advance(code, weightKg) {
    var order = findOrder(code);
    if (!order) throw new Error("Order not found.");
    var next = S.next(order.status);
    if (!next) throw new Error("This order is already collected.");
    var nowISO = new Date().toISOString();

    if (next === "picked_up") {
      var w = Number(weightKg);
      if (!(w > 0) || w > 50) throw new Error("Enter the bag weight in kg.");
      order.weightKg = Math.round(w * 10) / 10;
      var ow = R.overweight(order.weightKg, order.bagOptionId);
      if (ow.amount > 0) order.charges.push({ type: "overweight", amount: ow.amount, at: nowISO, extraKg: ow.extraKg });
    }

    order.status = next;
    order.statusLog.push({ status: next, at: nowISO });
    order.texts.push({ at: nowISO, status: next, body: S.textFor(next, order) });
    save();
    return clone(order);
  }

  App.store = {
    init: init,
    reset: reset,
    priceOption: function () { return R.bagOption(state.priceOptionId); },
    getOrder: getOrder,
    hasOrder: function (code) { return !!findOrder(code); },
    savedGuest: function () { return state.savedGuest ? clone(state.savedGuest) : null; },
    createOrder: createOrder,
    advance: advance
  };
})();
