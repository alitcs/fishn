import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  encodeNetlifyBooking,
  netlifyFormName,
} from "../src/booking/netlify.ts";
import { bookingSchema } from "../src/booking/schema.ts";

function input() {
  const day = new Date();
  day.setUTCDate(day.getUTCDate() + 10);
  return bookingSchema.parse({
    requestId: crypto.randomUUID(),
    clientSubmittedAt: new Date().toISOString(),
    name: "Test Visitor",
    email: "visitor@example.com",
    phone: "+14165550100",
    location: "lake-simcoe",
    experience: "shoreline-fishing",
    groupSize: 12,
    duration: 8,
    preferredDate: day.toISOString().slice(0, 10),
    licenceAcknowledgement: "before-trip",
    website: "",
    specialRequests: "Please discuss equipment & meeting point.",
    destinationAdviceRequested: true,
    analyticsConsent: true,
    attribution: { utm_source: "test", utm_campaign: "winter" },
  });
}
test("Netlify payload matches the deploy-time blueprint and keeps readable trip details", () => {
  const value = input();
  const payload = encodeNetlifyBooking(value);
  const html = readFileSync(
    new URL("../public/__forms.html", import.meta.url),
    "utf8",
  );
  assert.equal(payload.get("form-name"), netlifyFormName);
  for (const key of payload.keys())
    assert.ok(html.includes('name="' + key + '"'), key);
  assert.equal(payload.get("email"), value.email);
  assert.equal(payload.get("locationName"), "Lake Simcoe");
  assert.equal(payload.get("groupSize"), "12");
  assert.equal(payload.get("duration"), "8");
  assert.equal(payload.get("hourlyRate"), "270");
  assert.equal(payload.get("sessionTotal"), "2160");
  assert.equal(payload.get("currency"), "CAD");
  assert.equal(payload.get("destinationAdviceRequested"), "Yes");
  assert.equal(
    new URLSearchParams(payload.toString()).get("specialRequests"),
    value.specialRequests,
  );
});
test("Netlify submissions exclude campaign attribution without consent", () => {
  const payload = encodeNetlifyBooking({ ...input(), analyticsConsent: false });
  assert.equal(payload.has("utm_source"), false);
  assert.equal(payload.has("utm_campaign"), false);
});
test("Netlify submissions carry the updated ice fishing price", () => {
  const payload = encodeNetlifyBooking({
    ...input(), experience: "ice-fishing", groupSize: 4, duration: 8,
  });
  assert.equal(payload.get("hourlyRate"), "150");
  assert.equal(payload.get("sessionTotal"), "1200");
});
