import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

// All POSTs are intercepted. Visual verification never contacts the business.
const out = process.argv[2] || "minimal-final";
if (!/^[a-z0-9-]+$/i.test(out))
  throw new Error("Use a simple output folder name.");
const directory = ".work/visual/" + out;
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
          return (
            rect.width > 0 &&
            rect.bottom > 0 &&
            rect.top < innerHeight &&
            rect.right > 0 &&
            rect.left < innerWidth
          );
        })
        .map((image) => image.decode().catch(() => {})),
    );
  });
}
async function capture(page, name, selector, fullPage = false) {
  if (selector)
    await page.locator(selector).evaluate((element) =>
      scrollTo({
        top: element.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      }),
    );
  await settle(page);
  await page.screenshot({ path: directory + "/" + name + ".png", fullPage });
}
const next = (page) =>
  page
    .getByRole("button", { name: /^(Choose date|Set group|Your details)$/ })
    .click();
const chooseDate = (page) =>
  page
    .getByRole("button", { name: /request only/ })
    .first()
    .click();
const trip = (page, name, mode = "Shoreline Fishing") =>
  page.getByRole("button", { name: name + " — " + mode, exact: true }).click();
async function reachContact(page) {
  await next(page);
  await chooseDate(page);
  await next(page);
  await next(page);
}
for (const [device, viewport] of [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
  await page.route("**/api/bookings", (route) =>
    route.fulfill({
      status: 502,
      json: { message: "Delivery could not be verified. Please try again." },
    }),
  );
  await page.route("**/__forms.html", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 500,
          contentType: "text/html",
          body: "Submission unavailable",
        })
      : route.continue(),
  );
  await page.goto(baseURL + "/");
  await capture(page, device + "-hero", ".service-hero");
  await capture(page, device + "-inline-book", "#book");
  await capture(page, device + "-answers", ".booking-answers");
  await capture(page, device + "-home-full", ".service-hero", true);
  report.push({
    device,
    route: "/",
    height: await page.evaluate(() => document.documentElement.scrollHeight),
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
  await page.goto(baseURL + "/book");
  await capture(page, device + "-book-simcoe");
  await trip(page, "Holland River");
  await capture(page, device + "-book-holland");
  await trip(page, "Nottawasaga River");
  await capture(page, device + "-book-nottawasaga");
  await trip(page, "Lake Simcoe", "Ice Fishing");
  await capture(page, device + "-book-ice");
  await page.getByRole("button", { name: "Choose for me" }).click();
  await capture(page, device + "-book-help");
  await trip(page, "Holland River");
  await next(page);
  await next(page);
  await capture(page, device + "-date-error", "#book");
  await chooseDate(page);
  await capture(page, device + "-date", "#book");
  await next(page);
  await page.getByRole("button", { name: "12 people", exact: true }).click();
  await page.getByRole("button", { name: "12 hours", exact: true }).click();
  await capture(page, device + "-group", "#book");
  await next(page);
  await capture(page, device + "-contact", "#book");
  await capture(page, device + "-contact-full", "#book", true);
  const submit = page.getByRole("button", {
    name: "Submit",
    exact: true,
  });
  await submit.click();
  await capture(page, device + "-contact-errors", "#book", true);
  await page.getByLabel("Full name").fill("Visual QA Visitor");
  await page.getByLabel("Email address").fill("visual-qa@example.com");
  await page.getByLabel("Phone number").fill("+1 416 555 0100");
  await page.getByRole("combobox", { name: "Fishing licence" }).click();
  await page
    .getByRole("option", { name: /required licence before my trip/ })
    .click();
  await page.getByText("Add a note (optional)", { exact: true }).click();
  await page
    .getByLabel("Anything Nikita should know?")
    .fill("Please discuss equipment arrangements.");
  await submit.click();
  await page
    .getByRole("alert")
    .filter({
      hasText: /Delivery could not be verified|couldn.*t be submitted/,
    })
    .waitFor();
  await capture(page, device + "-delivery-error", "#book", true);
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
  await page.route("**/__forms.html", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<html><body>Thank you</body></html>",
        })
      : route.continue(),
  );
  await submit.click();
  await page.getByRole("heading", { name: "Request sent." }).waitFor();
  await capture(page, device + "-sent-mock", "#book");
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: false } }),
  );
  await page.goto(baseURL + "/book");
  await reachContact(page);
  await page
    .getByText("Instagram " + String.fromCharCode(8599), { exact: true })
    .click();
  await capture(page, device + "-instagram", "#book", true);
  await page.getByRole("button", { name: "Open catch gallery" }).click();
  for (let i = 0; i < (await page.locator(".journal-frame").count()); i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next catch", exact: true })
        .click();
    await capture(page, device + "-gallery-" + i);
  }
  await page.keyboard.press("Escape");
  report.push({
    device,
    route: "/book",
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
  await page.close();
}
const motion = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
motion.on("pageerror", (error) => errors.push(error.message));
await motion.goto(baseURL + "/book");
for (const [name, mode] of [
  ["Lake Simcoe", "Shoreline Fishing"],
  ["Holland River", "Shoreline Fishing"],
  ["Nottawasaga River", "Shoreline Fishing"],
  ["Lake Simcoe", "Ice Fishing"],
]) {
  await trip(motion, name, mode);
  await motion.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState === "finished" ||
          animation.effect?.getTiming().iterations === Infinity,
      ),
  );
  await capture(
    motion,
    "motion-" + (await motion.locator("#book").getAttribute("data-backdrop")),
  );
  report.push({
    device: "desktop-motion",
    scene: await motion.locator("#book").getAttribute("data-backdrop"),
    image: await motion
      .locator(".booking-exposure.is-active")
      .getAttribute("src"),
    opacity: await motion
      .locator(".booking-exposure.is-active")
      .evaluate((element) => getComputedStyle(element).opacity),
  });
}
await motion.close();
for (const width of [320, 768, 1024]) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
  for (const route of ["/", "/experiences", "/explore", "/book"]) {
    await page.goto(baseURL + route);
    report.push({
      device: "width-" + width,
      route,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
    if (route === "/book") {
      await capture(page, "width-" + width + "-book");
      await next(page);
      await chooseDate(page);
      await next(page);
      report.push({
        device: "width-" + width,
        step: "group",
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      });
      await next(page);
      await capture(page, "width-" + width + "-contact", "#book", true);
      report.push({
        device: "width-" + width,
        step: "contact",
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      });
    }
  }
  await page.close();
}
const portrait = await browser.newPage({
  viewport: { width: 918, height: 1632 },
  reducedMotion: "reduce",
});
await portrait.goto(baseURL + "/");
await capture(portrait, "portrait-hero", ".service-hero");
await capture(portrait, "portrait-book", "#book");
await portrait.close();
await writeFile(
  directory + "/report.json",
  JSON.stringify({ errors, report }, null, 2),
);
await browser.close();
console.log(JSON.stringify({ directory, errors, report }, null, 2));
if (errors.length || report.some((item) => item.overflow)) process.exitCode = 1;
