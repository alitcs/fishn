import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import worker from "../dist/server/index.js";
const routes = [
  "/",
  "/experiences",
  "/experiences/shoreline-fishing",
  "/experiences/ice-fishing",
  "/explore",
  "/explore/lake-simcoe",
  "/explore/holland-river",
  "/explore/nottawasaga-river",
  "/about",
  "/book",
  "/privacy",
];
for (const route of routes) {
  const response = await worker.fetch(
    new Request("https://fishn.test" + route),
    {},
  );
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.ok(html.includes("<h1"), route + " pre-rendered heading");
  assert.ok(html.includes('rel="canonical"'), route + " canonical");
  assert.ok(
    !html.includes("<!--app-html-->"),
    route + " SSR placeholder removed",
  );
}
const image = await worker.fetch(
  new Request("https://fishn.test/images/waterlandscape1-960.webp"),
  {},
);
assert.equal(image.headers.get("Content-Type"), "image/webp");
assert.ok((await image.arrayBuffer()).byteLength > 1000);
const cached = await worker.fetch(
  new Request("https://fishn.test/images/waterlandscape1-960.webp", {
    headers: { "If-None-Match": image.headers.get("ETag") },
  }),
  {},
);
assert.equal(cached.status, 304);
const status = await worker.fetch(
  new Request("https://fishn.test/api/booking/status"),
  {},
);
assert.deepEqual(await status.json(), { ready: false });
assert.equal(
  (await worker.fetch(new Request("https://fishn.test/missing-page"), {}))
    .status,
  404,
);
const images = await readdir("dist/client/images");
assert.ok(!images.some((name) => /inspo|reference/i.test(name)));
const bundle = (await readdir("dist/client/assets")).find((name) =>
  name.endsWith(".js"),
);
const js = await readFile("dist/client/assets/" + bundle, "utf8");
assert.ok(!js.includes("api.resend.com"), "email provider stays server-side");
assert.ok(
  !js.includes("BOOKING_NOTIFICATION_EMAIL"),
  "business inbox config stays server-side",
);
console.log(
  "Production Worker verified: 11 pre-rendered routes, binary image delivery, ETag/304, real status endpoint, 404, reference exclusion, and server-only credentials.",
);
