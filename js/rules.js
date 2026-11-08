// App.rules: pure product rules and display formatting. No DOM, no storage.
(function () {
  window.App = window.App || {};
  var D = window.MOCK_DATA;
  var cfg = D.config;
  var HOUR = 3600 * 1000;
  var CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0, O, 1, I

  // All dates and times are Milan wall-clock time, whatever the computer's time zone.
  var TZ = cfg.timeZone;
  var partsFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function milanParts(d) {
    var o = {};
    partsFmt.formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }

  // Milan UTC offset (ms) at instant d.
  function offsetMs(d) {
    var p = milanParts(d);
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    return asUTC - Math.floor(d.getTime() / 60000) * 60000;
  }

  // Date -> Milan "YYYY-MM-DD"
  function toYMD(d) {
    var p = milanParts(d);
    return p.year + "-" + p.month + "-" + p.day;
  }

  // "YYYY-MM-DD" + n days -> "YYYY-MM-DD" (calendar arithmetic, no time zone)
  function addDays(ymd, n) {
    var p = ymd.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n)).toISOString().slice(0, 10);
  }

  // Milan "YYYY-MM-DD" + "HH:MM" -> Date
  function at(ymd, hhmm) {
    var p = ymd.split("-");
    var t = (hhmm || "00:00").split(":");
    var guess = Date.UTC(+p[0], +p[1] - 1, +p[2], +t[0], +t[1]);
    var ts = guess - offsetMs(new Date(guess));
    var off2 = offsetMs(new Date(ts));
    if (guess - off2 !== ts) ts = guess - off2; // crossed a daylight-saving change
    return new Date(ts);
  }

  function isYMD(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s); }

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function bagOption(id) { return find(D.bagOptions, id); }
  function slot(id) { return find(D.slots, id); }
  function dropPoint(id) { return find(D.dropPoints, id); }
  function defaultDropPoint() { return D.dropPoints[0]; }

  function bookingTotal(bagOptionId, insurance) {
    return bagOption(bagOptionId).price + (insurance ? cfg.insurancePrice : 0);
  }

  // +€5 per started kg over the bag's limit. Worked in tenths of a kg to avoid float errors.
  function overweight(weightKg, bagOptionId) {
    var limit10 = bagOption(bagOptionId).limitKg * 10;
    var over10 = Math.round(weightKg * 10) - limit10;
    var extraKg = over10 > 0 ? Math.ceil(over10 / 10) : 0;
    return { extraKg: extraKg, amount: extraKg * cfg.overweightPerKg };
  }

  function returnDeadline(slotDate, slotId) {
    return new Date(at(slotDate, slot(slotId).end).getTime() + cfg.returnWindowHours * HOUR);
  }

  function checkoutAt(checkoutDate) { return at(checkoutDate, cfg.checkoutTime); }

  function isLateReturn(slotDate, slotId, checkoutDate) {
    return returnDeadline(slotDate, slotId).getTime() > checkoutAt(checkoutDate).getTime();
  }

  function isPastDate(ymd, now) { return ymd < toYMD(now || new Date()); }

  // Today + bookingDaysAhead days; a slot is offered until its end time passes.
  function availableSlots(now) {
    now = now || new Date();
    var today = toYMD(now);
    var days = [];
    for (var i = 0; i <= cfg.bookingDaysAhead; i++) {
      var ymd = addDays(today, i);
      var open = D.slots.filter(function (s) { return at(ymd, s.end).getTime() > now.getTime(); });
      if (open.length) days.push({ date: ymd, offset: i, slots: open });
    }
    return days;
  }

  function generateCode(existingCodes) {
    var code;
    do {
      code = "LM-";
      for (var i = 0; i < 4; i++) code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    } while (existingCodes.indexOf(code) !== -1);
    return code;
  }

  // Accepts "lm-4hq7", "4HQ7", " LM 4HQ7 " -> "LM-4HQ7"
  function normalizeCode(input) {
    var s = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (s.indexOf("LM") === 0 && s.length === 6) s = s.slice(2);
    return s.length === 4 ? "LM-" + s : "";
  }

  function isValidPhone(s) {
    s = String(s || "").trim();
    var digits = s.replace(/\D/g, "");
    return /^\+?[\d\s().-]+$/.test(s) && digits.length >= 7 && digits.length <= 15;
  }

  function totalCharged(order) {
    return order.charges.reduce(function (sum, c) { return sum + c.amount; }, 0);
  }

  // ---- Display formatting ----
  function money(n) { return "€" + n; }

  // Accepts a Milan "YYYY-MM-DD" or a Date. -> "Mon 2 Nov"
  function dayLabel(dateOrYMD) {
    var d = typeof dateOrYMD === "string" ? at(dateOrYMD, "12:00") : dateOrYMD;
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).replace(",", "");
  }

  function timeLabel(d) { var p = milanParts(d); return p.hour + ":" + p.minute; }

  function dateTimeLabel(dateOrISO) {
    var d = typeof dateOrISO === "string" ? new Date(dateOrISO) : dateOrISO;
    return dayLabel(d) + ", " + timeLabel(d);
  }

  function slotLabel(slotDate, slotId) { return dayLabel(slotDate) + ", " + slot(slotId).label; }

  function kg(n) { return (Math.round(n * 10) / 10).toFixed(1) + " kg"; }

  App.rules = {
    config: function () { return cfg; },
    toYMD: toYMD,
    addDays: addDays,
    isYMD: isYMD,
    bagOption: bagOption,
    slot: slot,
    slots: function () { return D.slots.slice(); },
    dropPoint: dropPoint,
    defaultDropPoint: defaultDropPoint,
    bookingTotal: bookingTotal,
    overweight: overweight,
    returnDeadline: returnDeadline,
    checkoutAt: checkoutAt,
    isLateReturn: isLateReturn,
    isPastDate: isPastDate,
    availableSlots: availableSlots,
    generateCode: generateCode,
    normalizeCode: normalizeCode,
    isValidPhone: isValidPhone,
    totalCharged: totalCharged,
    money: money,
    dayLabel: dayLabel,
    dateTimeLabel: dateTimeLabel,
    slotLabel: slotLabel,
    kg: kg
  };
})();
