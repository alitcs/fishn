import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

// Every booking POST is intercepted. No screenshot sends a real enquiry.
const out = process.argv[2] || "conversion-final";
if (!/^[a-z0-9-]+$/i.test(out))
  throw new Error("Use a simple output folder name.");
const directory = `.work/visual/${out}`;
await mkdir(directory, { recursive: true });
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  headless: true,
});
const errors = [],
  report = [];
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;
        })
        .map((image) => image.decode().catch(() => {})),
    );
  });
}
async function capture(page, name, selector) {
  if (selector)
    await page.locator(selector).evaluate((element) =>
      scrollTo({
        top: element.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      }),
    );
  await settle(page);
  await page.screenshot({ path: `${directory}/${name}.png` });
}
const next = (page) =>
  page.getByRole("button", { name: "Continue", exact: true }).click();
for (const [device, viewport] of [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/bookings", (route) =>
    route.fulfill({
      status: 502,
      json: { message: "Delivery could not be verified. Please try again." },
    }),
  );
  await page.goto(`${baseURL}/`);
  for (const [name, selector] of [
    ["arrival", ".arrival"],
    ["discovery", ".threshold"],
    ["simcoe-shore", '[data-scene="0"]'],
    ["holland", '[data-scene="1"]'],
    ["nottawasaga", '[data-scene="2"]'],
    ["simcoe-ice", '[data-scene="3"]'],
    ["experience", ".day-story"],
    ["guide", ".together-story"],
    ["invitation", ".commitment"],
    ["embedded-book", "#book"],
  ]) {
    await capture(page, `${device}-${name}`, selector);
  }
  report.push({
    device,
    route: "/",
    heroSource: await page
      .locator(".arrival>img")
      .evaluate((image) => image.currentSrc),
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
  await page.goto(`${baseURL}/book`);
  await capture(page, `${device}-book-intent`);
  await page.getByRole("button", { name: /A peaceful escape/ }).click();
  await capture(page, `${device}-book-experience-level`);
  await page.getByRole("button", { name: /I’m completely new/ }).click();
  await capture(page, `${device}-book-simcoe-shore`);
  for (const [location, name] of [
    ["Holland River", "holland"],
    ["Nottawasaga River", "nottawasaga"],
  ]) {
    await page
      .getByRole("button", {
        name: `${location} — Shoreline Fishing`,
        exact: true,
      })
      .click();
    await capture(page, `${device}-book-${name}`);
  }
  await page
    .getByRole("button", { name: "Lake Simcoe — Ice Fishing", exact: true })
    .click();
  await capture(page, `${device}-book-simcoe-ice`);
  await page
    .getByRole("button", { name: /I’m not sure — help me choose/ })
    .click();
  await capture(page, `${device}-book-help-choosing`);
  await page
    .getByRole("button", {
      name: "Nottawasaga River — Shoreline Fishing",
      exact: true,
    })
    .click();
  await next(page);
  await page.getByRole("button", { name: "4+ people", exact: true }).click();
  await page.getByLabel("How many people?").fill("6");
  await capture(page, `${device}-book-people`);
  await next(page);
  await next(page);
  await capture(page, `${device}-book-date-validation`);
  await page
    .getByRole("button", { name: /request only/ })
    .first()
    .click();
  await capture(page, `${device}-book-date`);
  await next(page);
  await capture(page, `${device}-book-duration`);
  await page.getByRole("button", { name: "3 hours", exact: true }).click();
  await page
    .getByRole("textbox", { name: /Any special requests/ })
    .fill("Please discuss equipment arrangements for our group.");
  await capture(page, `${device}-book-notes-licence`);
  await page
    .getByRole("radio", {
      name: "I’ll get the required licence before my trip.",
    })
    .check();
  await next(page);
  await capture(page, `${device}-book-contact`);
  const submit = page.getByRole("button", {
    name: "Request my fishing trip",
    exact: true,
  });
  await submit.click();
  await capture(page, `${device}-book-contact-validation`);
  await page.getByLabel("Full name").fill("Visual QA Visitor");
  await page.getByLabel("Email address").fill("visual-qa@example.com");
  await page.getByLabel("Phone number").fill("+1 416 555 0100");
  await submit.click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Delivery could not be verified" })
    .waitFor();
  await capture(page, `${device}-book-delivery-error`);
  await page.route("**/api/bookings", (route) => {
    const data = route.request().postDataJSON();
    return route.fulfill({
      status: 201,
      json: {
        requestId: data.requestId,
        status: "pending",
        submittedAt: new Date().toISOString(),
      },
    });
  });
  await submit.click();
  await page.getByRole("heading", { name: "Adventure requested." }).waitFor();
  await capture(page, `${device}-book-submitted-mock`);
  report.push({
    device,
    route: "/book",
    confirmationTop: (await page.locator("#confirmation-title").boundingBox())
      .y,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
  await page.close();
}

// Record the actual sticky/crossfade behavior with motion enabled as well.
const motionPage = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
motionPage.on("pageerror", (error) => errors.push(error.message));
await motionPage.goto(`${baseURL}/`);
for (let index = 0; index < 4; index++) {
  await motionPage.locator(`[data-scene="${index}"]`).evaluate((element) =>
    scrollTo({
      top: element.getBoundingClientRect().top + scrollY + 50,
      behavior: "instant",
    }),
  );
  await motionPage.waitForFunction(
    (index) =>
      document
        .querySelector(".water-journey")
        ?.getAttribute("data-active-scene") ===
      ["simcoe-shore", "holland-shore", "nottawasaga-shore", "simcoe-ice"][
        index
      ],
    index,
  );
  await settle(motionPage);
  await motionPage.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState === "finished" ||
          animation.effect?.getTiming().iterations === Infinity,
      ),
  );
  await capture(motionPage, `motion-water-${index + 1}`);
  report.push({
    device: "desktop-motion",
    scene: index,
    activeImage: await motionPage
      .locator(".water-exposure.is-active img")
      .getAttribute("src"),
    stagePosition: await motionPage
      .locator(".water-stage")
      .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
  });
}
await motionPage.close();

for (const width of [320, 768, 1024]) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: "reduce",
  });
  for (const route of ["/", "/experiences", "/explore", "/book"]) {
    await page.goto(`${baseURL}${route}`);
    report.push({
      device: `width-${width}`,
      route,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
  }
  await page.close();
}
const portrait = await browser.newPage({
  viewport: { width: 918, height: 1632 },
  reducedMotion: "reduce",
});
await portrait.goto(`${baseURL}/`);
await capture(portrait, "reference-portrait-arrival", ".arrival");
await capture(portrait, "reference-portrait-experience", ".day-story");
await capture(portrait, "reference-portrait-water", '[data-scene="1"]');
await portrait.close();
await writeFile(
  `${directory}/report.json`,
  JSON.stringify({ errors, report }, null, 2),
);
await browser.close();
console.log(JSON.stringify({ directory, errors, report }, null, 2));
if (errors.length || report.some((item) => item.overflow)) process.exitCode = 1;
