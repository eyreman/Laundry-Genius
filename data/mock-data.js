// Seed data and config for the prototype. Data only, no functions.
// Times are ISO strings in UTC; Milan is UTC+1 in November.
window.MOCK_DATA = {
  version: 2, // bump when seed data changes in a way old saved browser data can't handle
  config: {
    currency: "EUR",
    insurancePrice: 3,
    insuranceCoverMax: 100,
    overweightPerKg: 5,
    returnWindowHours: 16,
    checkoutTime: "10:00",
    timeZone: "Europe/Rome",  // Milan; all times shown and computed in this zone
    bookingDaysAhead: 6,
    specialRequestsMaxLength: 200,
    showDemoControls: false   // true shows team-only tools: the Demo panel on status pages and "Reset demo data" in the footer
  },
  // One price for everyone. The €22 vs €29 price test was dropped on 2026-11-08.
  bagOptions: [
    { id: "small", label: "Small bag", price: 22, limitKg: 3, sizeHint: "up to 3 kg" }
  ],
  dropPoints: [
    { id: "co99", name: "CO99", address: "Viale Corsica, 99, 20133 Milano MI" }
  ],
  slots: [
    { id: "morning", label: "08:00–10:00", start: "08:00", end: "10:00" },
    { id: "midday", label: "12:00–14:00", start: "12:00", end: "14:00" }
  ],
  orders: [
    {
      code: "LM-4HQ7",
      createdAt: "2026-11-01T18:20:00.000Z",
      bagOptionId: "small",
      dropPointId: "co99",
      slotDate: "2026-11-02",
      slotId: "morning",
      returnDeadline: "2026-11-03T01:00:00.000Z",
      guest: { name: "Maya Chen", phone: "+44 7700 900123" },
      checkoutDate: "2026-11-06",
      careNotes: { coldWash: true, noDryer: false, delicates: false },
      specialRequests: "",
      insurance: true,
      disclaimerAccepted: false,
      overweightApproved: true,
      weightKg: 2.8,
      charges: [
        { type: "bag", amount: 22, at: "2026-11-01T18:20:00.000Z" },
        { type: "insurance", amount: 3, at: "2026-11-01T18:20:00.000Z" }
      ],
      status: "washing",
      statusLog: [
        { status: "received", at: "2026-11-01T18:20:00.000Z" },
        { status: "picked_up", at: "2026-11-02T09:05:00.000Z" },
        { status: "washing", at: "2026-11-02T10:30:00.000Z" }
      ],
      texts: [
        { at: "2026-11-01T18:20:00.000Z", status: "received", body: "Order LM-4HQ7 — Received. Drop your bag at CO99, Viale Corsica, 99, 20133 Milano MI, Mon 2 Nov, 08:00–10:00. Write LM-4HQ7 on the bag. Back by Tue 3 Nov, 02:00." },
        { at: "2026-11-02T09:05:00.000Z", status: "picked_up", body: "Order LM-4HQ7 — Picked up. Your bag weighed 2.8 kg. No extra charge." },
        { at: "2026-11-02T10:30:00.000Z", status: "washing", body: "Order LM-4HQ7 — Washing. Your bag is at our partner laundry and is washed separately." }
      ]
    },
    {
      code: "LM-9TRW",
      createdAt: "2026-10-31T20:02:00.000Z",
      bagOptionId: "small",
      dropPointId: "co99",
      slotDate: "2026-11-01",
      slotId: "midday",
      returnDeadline: "2026-11-02T05:00:00.000Z",
      guest: { name: "Jonas Weber", phone: "+49 151 2345 6789" },
      checkoutDate: "2026-11-04",
      careNotes: { coldWash: false, noDryer: false, delicates: true },
      specialRequests: "The blue silk scarf is hand-wash only, please.",
      insurance: false,
      disclaimerAccepted: true,
      overweightApproved: true,
      weightKg: 3.4,
      charges: [
        { type: "bag", amount: 22, at: "2026-10-31T20:02:00.000Z" },
        { type: "overweight", amount: 5, at: "2026-11-01T13:10:00.000Z", extraKg: 1 }
      ],
      status: "ready_to_collect",
      statusLog: [
        { status: "received", at: "2026-10-31T20:02:00.000Z" },
        { status: "picked_up", at: "2026-11-01T13:10:00.000Z" },
        { status: "washing", at: "2026-11-01T14:00:00.000Z" },
        { status: "out_for_delivery", at: "2026-11-01T19:30:00.000Z" },
        { status: "ready_to_collect", at: "2026-11-01T20:15:00.000Z" }
      ],
      texts: [
        { at: "2026-10-31T20:02:00.000Z", status: "received", body: "Order LM-9TRW — Received. Drop your bag at CO99, Viale Corsica, 99, 20133 Milano MI, Sun 1 Nov, 12:00–14:00. Write LM-9TRW on the bag. Back by Mon 2 Nov, 06:00." },
        { at: "2026-11-01T13:10:00.000Z", status: "picked_up", body: "Order LM-9TRW — Picked up. Your bag weighed 3.4 kg, 1 kg over the 3 kg limit, so €5 was charged to your saved card." },
        { at: "2026-11-01T14:00:00.000Z", status: "washing", body: "Order LM-9TRW — Washing. Your bag is at our partner laundry and is washed separately." },
        { at: "2026-11-01T19:30:00.000Z", status: "out_for_delivery", body: "Order LM-9TRW — Out for delivery. Your bag is on its way back to CO99." },
        { at: "2026-11-01T20:15:00.000Z", status: "ready_to_collect", body: "Order LM-9TRW — Ready to collect. Your bag is waiting at CO99, Viale Corsica, 99, 20133 Milano MI. Give code LM-9TRW at the counter." }
      ]
    }
  ]
};
