import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingSchema } from "../src/booking/schema.ts";
import {
  availability,
  isRequestDateAllowed,
  ontarioToday,
  browserToday,
} from "../src/data/config.ts";
import { tripPrice } from "../src/data/pricing.ts";
function futureDate(days = 10) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const valid = () => ({
  requestId: crypto.randomUUID(),
  clientSubmittedAt: new Date().toISOString(),
  name: "Test Visitor",
  email: "visitor@example.com",
  phone: "+1 416 555 0100",
  experience: "shoreline-fishing",
  location: "lake-simcoe",
  groupSize: 2,
  duration: 2,
  preferredDate: futureDate(),
  licenceAcknowledgement: "before-trip",
  website: "",
  analyticsConsent: false,
});
test("Ontario date uses Toronto rather than the host timezone", () => {
  assert.equal(ontarioToday(new Date("2026-11-22T02:00:00Z")), "2026-11-21");
});
test("request calendar rejects today, past, invalid and far-future dates", () => {
  const now = new Date("2026-11-21T16:00:00Z");
  for (const date of [
    "2026-11-21",
    "2026-11-20",
    "2026-02-30",
    "2026-11-99",
    "2028-01-01",
    "garbage",
  ])
    assert.equal(
      isRequestDateAllowed(date, "shoreline-fishing", now),
      false,
      date,
    );
  assert.equal(
    isRequestDateAllowed("2026-11-22", "shoreline-fishing", now),
    true,
  );
});
test("configured blocked dates apply to the request-date policy", () => {
  const date = futureDate();
  availability["ice-fishing"].blockedDates.push(date);
  try {
    assert.equal(isRequestDateAllowed(date, "ice-fishing"), false);
  } finally {
    availability["ice-fishing"].blockedDates.pop();
  }
});
test("ice requests cannot target rivers; licence acknowledgement is required", () => {
  assert.equal(
    bookingSchema.safeParse({
      ...valid(),
      experience: "ice-fishing",
      location: "holland-river",
    }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...valid(), licenceAcknowledgement: "" }).success,
    false,
  );
  assert.equal(bookingSchema.safeParse(valid()).success, true);
});
test("campaign attribution requires consent", () => {
  assert.equal(
    bookingSchema.safeParse({
      ...valid(),
      attribution: { utm_source: "instagram" },
    }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({
      ...valid(),
      analyticsConsent: true,
      attribution: { utm_source: "instagram" },
    }).success,
    true,
  );
});
test("conversation fields are bounded and do not permit unknown preference values", () => {
  assert.equal(
    bookingSchema.safeParse({ ...valid(), tripIntent: "boat-charter" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...valid(), fishingLevel: "expert-guide" })
      .success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...valid(), specialRequests: "x".repeat(1501) })
      .success,
    false,
  );
});

test("trips allow only 2, 4, 6, or 8 hours and any positive whole group size", () => {
  for (const duration of [2, 4, 6, 8])
    for (const groupSize of [1, 4, 12, 25])
      assert.equal(bookingSchema.safeParse({ ...valid(), groupSize, duration }).success, true);
  for (const duration of [0, 1, 3, 5, 7, 9, 12, 2.5])
    assert.equal(bookingSchema.safeParse({ ...valid(), duration }).success, false);
  for (const groupSize of [0, -1, 2.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(bookingSchema.safeParse({ ...valid(), groupSize }).success, false);
});
test("prices match every supplied shoreline and ice table entry", () => {
  const shoreline = [[100, 140, 180, 220], [200, 280, 360, 440], [300, 420, 540, 660], [400, 560, 720, 880]];
  const ice = [[150, 200, 250, 300], [300, 400, 500, 600], [450, 600, 750, 900], [600, 800, 1000, 1200]];
  for (const [index, duration] of [2, 4, 6, 8].entries())
    for (const people of [1, 2, 3, 4]) {
      assert.equal(tripPrice("shoreline-fishing", people, duration).total, shoreline[index][people - 1]);
      assert.equal(tripPrice("ice-fishing", people, duration).total, ice[index][people - 1]);
    }
  assert.equal(tripPrice("shoreline-fishing", 25, 8).total, 4240);
  assert.equal(tripPrice("ice-fishing", 25, 8).total, 5400);
});
test("browser date follows the local date components across month boundaries", () => {
  assert.equal(browserToday(new Date(2027, 0, 1, 0, 1)), "2027-01-01");
  assert.equal(browserToday(new Date(2027, 11, 31, 23, 59)), "2027-12-31");
});
