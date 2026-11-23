import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const next = (page: Page) =>
  page
    .getByRole("button", { name: /^(Choose date|Set group|Your details)$/ })
    .click();
const tripButton = (
  page: Page,
  place = "Lake Simcoe",
  experience = "Shoreline Fishing",
) =>
  page.getByRole("button", { name: place + " — " + experience, exact: true });
const submitButton = (page: Page) =>
  page.getByRole("button", { name: "Submit", exact: true });
const chooseDate = (page: Page) =>
  page
    .getByRole("button", { name: /request only/ })
    .first()
    .click();
async function reachContact(page: Page) {
  await next(page);
  await chooseDate(page);
  await next(page);
  await next(page);
}
async function fillContact(page: Page) {
  await page.getByLabel("Full name").fill("Test Visitor");
  await page.getByLabel("Email address").fill("visitor@example.com");
  await page.getByLabel("Phone number").fill("+1 416 555 0100");
  await page.getByRole("combobox", { name: "Fishing licence" }).click();
  await page
    .getByRole("option", { name: /required licence before my trip/ })
    .click();
}
async function mockSuccess(page: Page) {
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
}
test.beforeEach(async ({ page }) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
});

test("the service is explicit and the hero leads directly into the inline four-step flow", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Guided fishingin Ontario.",
  );
  await expect(page.locator(".service-description")).toContainText(
    "Private sessions. Beginners welcome.",
  );
  await expect(page.locator(".hero-plan")).toBeVisible();
  await expect(page.locator(".service-catch img")).toBeVisible();
  await page.locator(".hero-plan").click();
  await expect(page).toHaveURL(/\/#book$/);
  await expect(page.locator(".booking-progress")).toHaveAttribute(
    "aria-label",
    "Step 1 of 4: Session",
  );
  await expect(
    page.getByRole("heading", { name: "Choose your water." }),
  ).toBeVisible();
  expect(
    await page
      .locator(".service-hero")
      .evaluate((el) => el.nextElementSibling?.id),
  ).toBe("book");
  await expect(page.locator("main h1")).toHaveCount(1);
});

test("existing detail, Maps, and experience preselection routes work", async ({
  page,
}) => {
  await page.goto("/experiences");
  await page.getByRole("link", { name: "A different kind of still." }).click();
  await page
    .getByRole("link", { name: "Request ice fishing", exact: true })
    .click();
  await expect(tripButton(page, "Lake Simcoe", "Ice Fishing")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#book")).toHaveAttribute(
    "data-backdrop",
    "simcoe-ice",
  );
  await page.goto("/explore");
  await page
    .getByRole("button", { name: "Nottawasaga River", exact: true })
    .click();
  await page.getByRole("link", { name: "Discover Nottawasaga River" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nottawasaga River",
  );
  await expect(
    page.getByRole("link", { name: /View on Google Maps/ }),
  ).toHaveAttribute("href", /google.com\/maps\/search/);
});

test("all four session choices retain their real photograph and geographic outline", async ({
  page,
}) => {
  await page.goto("/book");
  for (const [place, experience, id, image] of [
    ["Lake Simcoe", "Shoreline Fishing", "lake-simcoe", "lake-simcoe"],
    ["Holland River", "Shoreline Fishing", "holland-river", "HollandRiver"],
    [
      "Nottawasaga River",
      "Shoreline Fishing",
      "nottawasaga-river",
      "Nottawasaga-River",
    ],
    ["Lake Simcoe", "Ice Fishing", "lake-simcoe", "Lake-simcoe-ice"],
  ]) {
    await tripButton(page, place, experience).click();
    await expect(page.locator(".booking-exposure.is-active")).toHaveAttribute(
      "src",
      new RegExp("/images/" + image + "-"),
    );
    await expect(page.locator(".booking-outlines .is-active")).toHaveAttribute(
      "data-location",
      id,
    );
  }
  await expect(page.locator(".destination-choices > button")).toHaveCount(4);
  await expect(
    page.getByRole("button", {
      name: "Holland River — Ice Fishing",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("uncertain visitors can ask Nikita to choose without extra preference questions", async ({
  page,
}) => {
  await page.goto("/book");
  await page.getByRole("button", { name: "Choose for me" }).click();
  await expect(page.locator(".choice-advice")).toContainText(
    "Location confirmed with Nikita.",
  );
  await expect(page.locator("#book")).toHaveAttribute(
    "data-backdrop",
    "simcoe-shore",
  );
  await reachContact(page);
  await expect(page.locator(".session-review")).toContainText(
    "Location with Nikita",
  );
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.locator(".help-choose")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await tripButton(page, "Holland River").click();
  await expect(page.locator(".choice-advice")).toHaveCount(0);
  await expect(page.locator(".help-choose")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("four-step request validates, preserves answers, and safely retries delivery", async ({
  page,
}) => {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/bookings", (route) => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({
      status: 502,
      json: { message: "Delivery could not be verified. Please try again." },
    });
  });
  await page.goto("/book?experience=shoreline-fishing&location=holland-river");
  await expect(tripButton(page, "Holland River")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await tripButton(page, "Lake Simcoe", "Ice Fishing").click();
  await next(page);
  await next(page);
  await expect(
    page.getByText("Please choose a preferred request date."),
  ).toBeVisible();
  await chooseDate(page);
  await next(page);
  await page.getByLabel("Number of people", { exact: true }).fill("25");
  await page.getByRole("button", { name: "8 hours", exact: true }).click();
  await expect(page.locator(".number-options > button")).toHaveCount(8);
  await expect(page.locator("input[type=number]")).toHaveCount(1);
  await next(page);
  await expect(page.locator(".booking-progress")).toHaveAttribute(
    "aria-label",
    "Step 4 of 4: Your details",
  );
  await expect(page.locator(".session-review")).toContainText("25 people");
  expect(requests).toHaveLength(0);
  await submitButton(page).click();
  await expect(
    page.getByText("Please acknowledge the fishing licence requirements."),
  ).toBeVisible();
  await fillContact(page);
  await page.getByText("Add a note (optional)", { exact: true }).click();
  await page
    .getByLabel("Anything Nikita should know?")
    .fill("Please discuss equipment for our group.");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByLabel("Number of people", { exact: true }),
  ).toHaveValue("25");
  await next(page);
  await expect(page.getByLabel("Full name")).toHaveValue("Test Visitor");
  await page.getByText("Add a note (optional)", { exact: true }).click();
  await expect(page.getByLabel("Anything Nikita should know?")).toHaveValue(
    "Please discuss equipment for our group.",
  );
  expect(requests).toHaveLength(0);
  await submitButton(page).click();
  await expect(page.getByRole("alert")).toContainText(
    "Delivery could not be verified",
  );
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  for (const value of [
    "visitor@example.com",
    "Test Visitor",
    "Please discuss equipment",
  ])
    expect(storage).not.toContain(value);
  await page.route("**/api/bookings", (route) => {
    const data = route.request().postDataJSON();
    requests.push(data);
    return route.fulfill({
      status: 201,
      json: {
        requestId: data.requestId,
        status: "pending",
        submittedAt: new Date().toISOString(),
      },
    });
  });
  await submitButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Request sent." }),
  ).toBeVisible();
  await expect(
    page.getByText(/No payment taken. Nikita will confirm/),
  ).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[0].requestId).toBe(requests[1].requestId);
  expect(requests[1]).toMatchObject({
    groupSize: 25,
    duration: 8,
    location: "lake-simcoe",
    experience: "ice-fishing",
    specialRequests: "Please discuss equipment for our group.",
  });
  expect(requests[1]).not.toHaveProperty("tripIntent");
  expect(
    (await page.locator("#confirmation-title").boundingBox())!.y,
  ).toBeGreaterThan(88);
});

test("submission remains available alongside the optional Instagram route", async ({
  page,
}) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: false } }),
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { copiedPlan: string }).copiedPlan = value;
        },
      },
    });
  });
  let submissions = 0;
  await page.route("**/api/bookings", (route) => {
    submissions++;
    return route.abort();
  });
  await page.goto("/book");
  await reachContact(page);
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(submitButton(page)).toBeEnabled();
  await page
    .locator(".instagram-option > summary")
    .click();
  await page
    .getByRole("button", { name: "Copy session details", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Copied." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as typeof window & { copiedPlan: string }).copiedPlan,
    ),
  ).toContain("Lake Simcoe");
  await expect(
    page.getByRole("link", { name: "Open Instagram" }),
  ).toHaveAttribute("href", /instagram.com/);
  await expect(
    page.getByRole("heading", { name: "Request sent." }),
  ).toHaveCount(0);
  expect(submissions).toBe(0);
});

test("clipboard denial still leaves a selectable plan for the Instagram message", async ({
  page,
}) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: false } }),
  );
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard unavailable");
        },
      },
    }),
  );
  await page.goto("/book");
  await reachContact(page);
  await page
    .locator(".instagram-option > summary")
    .click();
  await page
    .getByRole("button", { name: "Copy session details", exact: true })
    .click();
  await expect(page.getByLabel("Copy this into your message")).toHaveValue(
    /Hi Nikita/,
  );
  await expect(
    page.getByRole("link", { name: "Open Instagram" }),
  ).toBeVisible();
});

test("the complete request works inline without a page change or premature submission", async ({
  page,
}) => {
  await mockSuccess(page);
  await page.goto("/");
  await page.locator(".hero-plan").click();
  await reachContact(page);
  await fillContact(page);
  await submitButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Request sent." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/#book$/);
  await expect(page.locator("main h1")).toHaveCount(1);
});

test("consented funnel measurement excludes personal details and notes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("fishn-analytics-consent", "yes");
    const target = window as typeof window & { funnel: unknown[][] };
    target.funnel = [];
    target.fbq = (...args: unknown[]) => {
      target.funnel.push(args);
    };
  });
  await mockSuccess(page);
  await page.goto("/book");
  await tripButton(page, "Holland River").click();
  await reachContact(page);
  await fillContact(page);
  await page.getByText("Add a note (optional)", { exact: true }).click();
  await page
    .getByLabel("Anything Nikita should know?")
    .fill("Private customer note.");
  await submitButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Request sent." }),
  ).toBeVisible();
  const events = await page.evaluate(
    () => (window as typeof window & { funnel: unknown[][] }).funnel,
  );
  for (const name of [
    "BookingStarted",
    "DestinationSelected",
    "BookingDetailsCompleted",
    "ContactStepReached",
    "Lead",
  ])
    expect(events.map((event) => event[1])).toContain(name);
  for (const value of [
    "Test Visitor",
    "visitor@example.com",
    "Private customer note",
    "416 555",
  ])
    expect(JSON.stringify(events)).not.toContain(value);
});

test("mobile routes load their photography without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/",
    "/experiences",
    "/experiences/shoreline-fishing",
    "/experiences/ice-fishing",
    "/explore",
    "/explore/holland-river",
    "/explore/nottawasaga-river",
    "/about",
    "/book",
    "/privacy",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
    await page.evaluate(async () => {
      document
        .querySelectorAll("img")
        .forEach((image) => (image.loading = "eager"));
      await Promise.all(
        [...document.images].map((image) => image.decode().catch(() => {})),
      );
    });
    expect(
      await page.evaluate(() =>
        [...document.images]
          .filter((image) => !image.naturalWidth)
          .map((image) => image.src),
      ),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("reduced motion and keyboard navigation remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/book");
  await next(page);
  await page
    .getByRole("button", { name: /request only/ })
    .first()
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".calendar-grid button:focus")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  await page.keyboard.press("Enter");
  await next(page);
  await expect(
    page.getByRole("button", { name: "2 hours", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "3 people", exact: true }).click();
  await expect(page.locator("#book")).toHaveAttribute("data-step", "2");
  await next(page);
  await expect(page.locator("#booking-step-title")).toBeFocused();
});

test("the optional gallery preserves the session, traps focus, and supports keyboard browsing", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".hero-plan").click();
  await next(page);
  await chooseDate(page);
  const selectedDate = await page
    .locator(".calendar-grid button[aria-pressed=true]")
    .getAttribute("data-date");
  await page.getByRole("button", { name: "Open catch gallery" }).click();
  const dialog = page.getByRole("dialog", { name: "Journal" });
  await expect(dialog).toBeVisible();
  await expect(page.locator(".journal-frame")).toHaveCount(23);
  expect(
    await page.locator(".journal-frame img").evaluateAll(async (nodes) => {
      const images = nodes as HTMLImageElement[];
      images.forEach((image) => (image.loading = "eager"));
      await Promise.all(images.map((image) => image.decode().catch(() => {})));
      return images
        .filter((image) => !image.naturalWidth)
        .map((image) => image.src);
    }),
  ).toEqual([]);
  await page.getByRole("button", { name: "Next catch", exact: true }).click();
  await expect(page.locator(".gallery-controls > span")).toHaveText("02 / 23");
  await expect(
    page.locator(".journal-frame[aria-pressed=true] img"),
  ).toHaveAttribute("src", /monsterfish2/);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".gallery-controls > span")).toHaveText("01 / 23");
  await page.keyboard.press("End");
  await expect(page.locator(".gallery-controls > span")).toHaveText("23 / 23");
  await expect(
    page.locator(".journal-frame[aria-pressed=true] img"),
  ).toHaveAttribute("src", /icefishtail1/);
  await page.keyboard.press("Home");
  await expect(page.locator(".gallery-controls > span")).toHaveText("01 / 23");
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      Boolean(document.activeElement?.closest("dialog")),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#book")).toHaveAttribute("data-step", "1");
  await expect(
    page.locator(".calendar-grid button[aria-pressed=true]"),
  ).toHaveAttribute("data-date", selectedDate!);
  await expect(
    page.getByRole("button", { name: "Open catch gallery" }),
  ).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("the three homepage chapters snap in order while the contact form remains scrollable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveCSS(
    "scroll-snap-type",
    "y mandatory",
  );
  await page.mouse.move(400, 450);
  await page.mouse.wheel(0, 750);
  await expect
    .poll(() =>
      page
        .locator("#book")
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(3);
  await page.mouse.wheel(0, 750);
  await expect
    .poll(() =>
      page
        .locator("#good-to-know")
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(3);
  await expect(
    page.getByRole("heading", { name: "Good to know." }),
  ).toBeVisible();
  await page.locator(".answers-book").click();
  await expect
    .poll(() =>
      page
        .locator("#book")
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(3);
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/");
  await page.locator(".hero-plan").click();
  await reachContact(page);
  await fillContact(page);
  await submitButton(page).scrollIntoViewIfNeeded();
  await expect(submitButton(page)).toBeInViewport();
  await expect(page.locator("#book")).toHaveAttribute("data-step", "3");
  const activeBounds = await page.locator("#book").boundingBox();
  expect(Math.abs(activeBounds!.y)).toBeLessThan(3);
  expect(activeBounds!.y + activeBounds!.height).toBeGreaterThan(0);
});

test("booking fits one screen with its total and actions visible at every step", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
    { width: 390, height: 700 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.locator(".hero-plan").click();
    for (let step = 0; step < 4; step++) {
      if (step === 0 && viewport.width <= 700) {
        for (const choice of await page.locator(".destination-choices > button").all())
          await expect(choice).toBeInViewport({ ratio: 1 });
        const scroll = page.locator(".booking-step-scroll");
        expect(await scroll.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
      }
      await expect(page.locator(".booking-panel")).toBeInViewport({ ratio: 1 });
      await expect(page.locator(".trip-estimate")).toBeInViewport({ ratio: 1 });
      await expect(page.locator(".booking-step-actions")).toBeInViewport({ ratio: 1 });
      const bounds = await page.locator("#book").boundingBox();
      expect(Math.abs(bounds!.height - viewport.height)).toBeLessThan(2);
      if (step === 1) await chooseDate(page);
      if (step < 3) await next(page);
    }
    await fillContact(page);
    await expect(submitButton(page)).toBeInViewport({ ratio: 1 });
  }
});

test("licence menu supports keyboard selection, dismissal, and retained values", async ({
  page,
}) => {
  await page.goto("/book");
  await reachContact(page);
  const select = page.getByRole("combobox", { name: "Fishing licence" });
  await select.focus();
  await page.keyboard.press("Enter");
  await expect(select).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("End");
  await expect(select).toHaveAttribute(
    "aria-activedescendant",
    "licence-option-before-trip",
  );
  await page.keyboard.press("Enter");
  await expect(select).toContainText("required licence before my trip");
  await expect(
    page.locator('input[name="licenceAcknowledgement"]'),
  ).toHaveValue("before-trip");
  await select.click();
  await page.keyboard.press("Escape");
  await expect(select).toHaveAttribute("aria-expanded", "false");
  await expect(select).toBeFocused();
  await select.click();
  await page
    .getByRole("heading", { name: "Your details.", exact: true })
    .click();
  await expect(select).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await next(page);
  await expect(select).toContainText("required licence before my trip");
});

test("pricing stays visible through the flow and updates for the trip and any group size", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fishn-trip-preferences-v2", JSON.stringify({
    experience: "ice-fishing", location: "lake-simcoe", groupSize: 4, duration: 8,
  })));
  await page.goto("/book");
  const quote = page.locator(".trip-estimate");
  await expect(quote.locator("strong")).toHaveText("$100");
  await expect(quote).toContainText("1 person · 2 hours · Shoreline fishing");
  await tripButton(page, "Lake Simcoe", "Ice Fishing").click();
  await expect(quote.locator("strong")).toHaveText("$150");
  await next(page);
  await expect(quote.locator("strong")).toHaveText("$150");
  await chooseDate(page);
  await next(page);
  await page.getByRole("button", { name: "4 people", exact: true }).click();
  await page.getByRole("button", { name: "8 hours", exact: true }).click();
  await expect(quote.locator("strong")).toHaveText("$1,200");
  await page.getByLabel("Number of people", { exact: true }).fill("25");
  await expect(quote.locator("strong")).toHaveText("$5,400");
  await expect(quote).not.toContainText("/hr");
  await page.getByLabel("Number of people", { exact: true }).fill("");
  await next(page);
  await expect(page.locator("#book")).toHaveAttribute("data-step", "2");
  await expect(page.locator("#groupSize-error")).toBeVisible();
  await expect(quote).not.toContainText("$5,400");
  await page.getByLabel("Number of people", { exact: true }).fill("25");
  await next(page);
  await expect(quote.locator("strong")).toHaveText("$5,400");
  await expect(page.locator(".submit-note")).toContainText("No payment now");
});

test("Good to know shows compact rate formulas and included equipment on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/#good-to-know");
  await page.getByText("Equipment", { exact: true }).click();
  await expect(page.locator(".booking-questions")).toContainText("Dress for the weather and conditions. All fishing gear and equipment is provided.");
  await page.getByText("Pricing", { exact: true }).click();
  const rates = page.locator(".trip-rates");
  await expect(rates).toContainText("$50/hour for one person + $20/hour per extra person.");
  await expect(rates).toContainText("$75/hour for one person + $25/hour per extra person.");
  await expect(rates.locator("table")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.describe("calendar follows the visitor's browser clock", () => {
  test.use({ timezoneId: "Pacific/Kiritimati" });
  test("opens months after deployment, discards stale saved dates, and refreshes on return", async ({ page }) => {
    // February locally while it is still January in Ontario.
    await page.clock.install({ time: new Date("2027-01-31T10:05:00Z") });
    await page.addInitScript(() => {
      localStorage.setItem("fishn-trip-preferences-v2", JSON.stringify({
        preferredDate: "2026-11-24", groupSize: 25, duration: 12,
      }));
    });
    await page.goto("/book");
    await expect(page.locator(".trip-estimate")).toContainText("1 person · 2 hours");
    await next(page);
    await expect(page.locator("#calendar-title")).toHaveText("February 2027");
    await expect(page.locator('.calendar-grid button[aria-current="date"]')).toHaveAttribute("data-date", "2027-02-01");
    await expect(page.locator('.calendar-grid button[aria-pressed="true"]')).toHaveCount(0);
    await page.clock.setSystemTime(new Date("2027-02-28T10:05:00Z"));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.locator("#calendar-title")).toHaveText("March 2027");
    await expect(page.locator('.calendar-grid button[aria-current="date"]')).toHaveAttribute("data-date", "2027-03-01");
  });
});

test.describe("mobile full-screen chapters", () => {
  test.use({ isMobile: true, hasTouch: true });
  test("each snap fills the viewport and stays aligned after resizing", async ({ page }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      const scroller = page.locator(".booking-home");
      async function fillsScreen(id: string) {
        await expect.poll(async () => {
          const bounds = await page.locator(id).boundingBox();
          return Math.abs(bounds!.y) + Math.abs(bounds!.height - page.viewportSize()!.height);
        }).toBeLessThan(2);
        expect(await page.locator(id).evaluate((element) => {
          const image = element.querySelector(".chapter-photo, .booking-exposure.is-active")!;
          const bounds = image.getBoundingClientRect();
          const section = element.getBoundingClientRect();
          return bounds.top <= section.top + 1 && bounds.bottom >= section.bottom - 1 &&
            bounds.left <= section.left + 1 && bounds.right >= section.right - 1;
        })).toBe(true);
      }
      await fillsScreen("#intro");
      await scroller.evaluate((element) => element.scrollBy({ top: element.clientHeight * 0.75, behavior: "smooth" }));
      await fillsScreen("#book");
      await page.setViewportSize({ width: viewport.width, height: viewport.height - 60 });
      await fillsScreen("#book");
      await scroller.evaluate((element) => element.scrollBy({ top: element.clientHeight * 0.75, behavior: "smooth" }));
      await fillsScreen("#good-to-know");
      await page.getByText("Pricing", { exact: true }).click();
      await page.getByText("Equipment", { exact: true }).click();
      await fillsScreen("#good-to-know");
      await page.locator(".answers-book").click();
      await fillsScreen("#book");
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    }
  });
});
