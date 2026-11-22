import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingSchema } from "../src/booking/schema.ts";
import {
  availability,
  isRequestDateAllowed,
  ontarioToday,
} from "../src/data/config.ts";
import { handleBooking } from "../server/booking.ts";
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
const env = {
  RESEND_API_KEY: "test-only-not-real",
  BOOKING_NOTIFICATION_EMAIL: "owner@example.com",
  BOOKING_FROM_EMAIL: "fishn@example.com",
};
function request(data = valid(), origin = "https://fishn.test") {
  return new Request("https://fishn.test/api/bookings", {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "Idempotency-Key": data.requestId,
    },
    body: JSON.stringify(data),
  });
}
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
test("configured blocked dates apply to the server-side policy", () => {
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
test("unconfigured submission fails honestly and never calls email provider", async () => {
  let sent = false;
  const result = await handleBooking(request(), {}, async () => {
    sent = true;
    return Response.json({ id: "fake" });
  });
  assert.equal(result.status, 503);
  assert.equal(sent, false);
});
test("cross-origin submissions and invalid fields are rejected before delivery", async () => {
  assert.equal(
    (await handleBooking(request(valid(), "https://other.test"), env)).status,
    403,
  );
  assert.equal(
    (await handleBooking(request({ ...valid(), phone: "x" }), env)).status,
    422,
  );
});
test("delivery failures never become successful submissions", async () => {
  const result = await handleBooking(request(), env, async () =>
    Response.json({ error: "provider failed" }, { status: 500 }),
  );
  assert.equal(result.status, 502);
  assert.equal((await result.json()).status, undefined);
});
test("successful delivery includes a stable provider idempotency key and private server credentials", async () => {
  const data = valid();
  const bodies: string[] = [];
  for (let i = 0; i < 2; i++) {
    const result = await handleBooking(
      request(data),
      env,
      async (url, init) => {
        assert.equal(url, "https://api.resend.com/emails");
        const headers = new Headers(init?.headers);
        assert.equal(
          headers.get("Idempotency-Key"),
          `fishn-booking/${data.requestId}`,
        );
        bodies.push(String(init?.body));
        return Response.json({ id: "provider-receipt-test" });
      },
    );
    assert.equal(result.status, 201);
    assert.equal((await result.json()).requestId, data.requestId);
  }
  assert.equal(bodies[0], bodies[1]);
  const email = JSON.parse(bodies[0]);
  assert.equal(email.reply_to, data.email);
  assert.ok(email.text.includes(data.phone));
  assert.ok(email.text.includes("Pending — not confirmed"));
});
test("missing provider receipt is not treated as success", async () => {
  const result = await handleBooking(request(), env, async () =>
    Response.json({}),
  );
  assert.equal(result.status, 502);
});
