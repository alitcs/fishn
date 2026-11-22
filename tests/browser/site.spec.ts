import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
const next = (page: Page) =>
  page.getByRole("button", { name: /^(Continue|Skip for now)$/ }).click();
const tripButton = (
  page: Page,
  place = "Lake Simcoe",
  experience = "Shoreline Fishing",
) =>
  page.getByRole("button", { name: `${place} — ${experience}`, exact: true });
const submitButton = (page: Page) =>
  page.getByRole("button", { name: "Request my fishing trip", exact: true });
async function reachWater(page: Page) {
  while (Number(await page.locator("#book").getAttribute("data-step")) < 2)
    await next(page);
}
async function reachContact(page: Page) {
  await reachWater(page);
  await next(page);
  await next(page);
  await page
    .getByRole("button", { name: /request only/ })
    .first()
    .click();
  await next(page);
  await page.getByRole("button", { name: "2 hours", exact: true }).click();
  await page
    .getByRole("radio", {
      name: "I’ll get the required licence before my trip.",
    })
    .check();
  await next(page);
}
async function fillContact(page: Page) {
  await page.getByLabel("Full name").fill("Test Visitor");
  await page.getByLabel("Email address").fill("visitor@example.com");
  await page.getByLabel("Phone number").fill("+1 416 555 0100");
}

test("hero explains guided fishing and offers immediate booking while the scroll journey remains intact", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A little further",
  );
  await expect(page.locator(".arrival-service")).toContainText(
    "Private guided fishing",
  );
  await expect(page.locator(".arrival-fishing img")).toBeVisible();
  await page.locator(".hero-plan").click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(
    page.getByRole("heading", {
      name: "What kind of day are you looking for?",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Go straight to trip details", exact: true })
    .click();
  await expect(page.locator("#book")).toHaveAttribute("data-step", "2");
  await page.goto("/");
  for (const [i, id] of [
    "simcoe-shore",
    "holland-shore",
    "nottawasaga-shore",
    "simcoe-ice",
  ].entries()) {
    await page.locator(`[data-scene="${i}"]`).evaluate((element) =>
      scrollTo({
        top: element.getBoundingClientRect().top + scrollY + 100,
        behavior: "instant",
      }),
    );
    await expect(page.locator(".water-journey")).toHaveAttribute(
      "data-active-scene",
      id,
    );
    await expect(page.locator(".water-exposure.is-active img")).toBeVisible();
  }
  await page.locator("#book").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("heading", {
      name: "What kind of day are you looking for?",
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("existing experience, source, Maps, and preselection routes remain available", async ({
  page,
}) => {
  await page.goto("/experiences");
  await page.getByRole("link", { name: "A different kind of still." }).click();
  await page
    .getByRole("link", { name: "Request ice fishing", exact: true })
    .click();
  await reachWater(page);
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

test("all four available destination/experience combinations keep the correct photograph and outline", async ({
  page,
}) => {
  await page.goto("/book");
  await reachWater(page);
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
      new RegExp(`/images/${image}-`),
    );
    await expect(page.locator(".booking-outlines .is-active")).toHaveAttribute(
      "data-location",
      id,
    );
  }
  await expect(page.locator(".destination-choices>button")).toHaveCount(4);
  await expect(
    page.getByRole("button", {
      name: "Holland River — Ice Fishing",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("first-time visitors avoid a repeated experience question and can ask for destination help", async ({
  page,
}) => {
  await page.goto("/book");
  await page
    .getByRole("button", { name: /My first fishing experience/ })
    .click();
  await expect(page.locator("#book")).toHaveAttribute("data-step", "2");
  await expect(page.locator(".personalized-guidance")).toContainText(
    "First time?",
  );
  await page
    .getByRole("button", { name: /I’m not sure — help me choose/ })
    .click();
  await expect(page.locator(".choice-advice")).toContainText("starting point");
  await expect(page.locator("#book")).toHaveAttribute(
    "data-backdrop",
    "simcoe-shore",
  );
  await tripButton(page, "Holland River").click();
  await expect(page.locator(".choice-advice")).toHaveCount(0);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator("#book")).toHaveAttribute("data-step", "0");
  await expect(
    page.getByRole("button", { name: /My first fishing experience/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("conversation validates, retains answers and optional notes, and retries the same real request", async ({
  page,
}) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/bookings", (route) => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({
      status: 502,
      json: { message: "Delivery could not be verified. Please try again." },
    });
  });
  await page.goto("/book?experience=shoreline-fishing&location=holland-river");
  await page.getByRole("button", { name: /A peaceful escape/ }).click();
  await page.getByRole("button", { name: /I’m completely new/ }).click();
  await expect(tripButton(page, "Holland River")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await tripButton(page, "Lake Simcoe", "Ice Fishing").click();
  await next(page);
  await page.getByRole("button", { name: "4+ people", exact: true }).click();
  await page.getByLabel("How many people?").fill("6");
  await next(page);
  await next(page);
  await expect(page.getByRole("alert")).toContainText("A little detail");
  await page
    .getByRole("button", { name: /request only/ })
    .first()
    .click();
  await next(page);
  await page.getByRole("button", { name: "3 hours", exact: true }).click();
  await page
    .getByRole("textbox", { name: /Any special requests/ })
    .fill("Please discuss equipment for our group.");
  await next(page);
  await expect(
    page.getByText("Please acknowledge the fishing licence requirements."),
  ).toBeVisible();
  await page
    .getByRole("radio", {
      name: "I’ll get the required licence before my trip.",
    })
    .check();
  await next(page);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await expect(page.locator(".conversation-summary")).toContainText("6 people");
  await expect(page.locator(".conversation-summary")).toContainText(
    "No payment now",
  );
  await submitButton(page).click();
  await expect(page.getByRole("alert")).toContainText("A few details");
  await fillContact(page);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: /Any special requests/ }),
  ).toHaveValue("Please discuss equipment for our group.");
  await next(page);
  await expect(page.getByLabel("Full name")).toHaveValue("Test Visitor");
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await submitButton(page).click();
  await expect(page.getByRole("alert")).toContainText(
    "Delivery could not be verified",
  );
  await expect(page.getByLabel("Full name")).toHaveValue("Test Visitor");
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  for (const text of [
    "visitor@example.com",
    "Test Visitor",
    "Please discuss equipment",
  ])
    expect(storage).not.toContain(text);
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
    page.getByRole("heading", { name: "Adventure requested." }),
  ).toBeVisible();
  await expect(page.getByText(/not yet confirmed or reserved/)).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[0].requestId).toBe(requests[1].requestId);
  expect(requests[1]).toMatchObject({
    groupSize: 6,
    duration: 3,
    location: "lake-simcoe",
    experience: "ice-fishing",
    tripIntent: "escape",
    fishingLevel: "new",
    specialRequests: "Please discuss equipment for our group.",
  });
  expect(
    (await page.locator("#confirmation-title").boundingBox())!.y,
  ).toBeGreaterThan(88);
});

test("optional questions can be skipped and unconfigured delivery never claims a submission", async ({
  page,
}) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: false } }),
  );
  await page.goto("/book");
  await expect(
    page.getByText("Online requests are opening soon."),
  ).toBeVisible();
  await reachContact(page);
  await expect(submitButton(page)).toBeDisabled();
  await expect(
    page.getByRole("link", { name: /contact Nikita on Instagram/ }),
  ).toHaveAttribute("href", /instagram.com/);
});

test("the entire request still works inline on the homepage", async ({
  page,
}) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
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
  await page.goto("/");
  await page.locator("#book").scrollIntoViewIfNeeded();
  await reachContact(page);
  await fillContact(page);
  await submitButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Adventure requested." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("main h1")).toHaveCount(1);
});

test("consented funnel measurement uses selected options and excludes contact details and notes", async ({
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
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
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
  await page.goto("/book");
  await page.getByRole("button", { name: /A peaceful escape/ }).click();
  await page.getByRole("button", { name: /I’m completely new/ }).click();
  await tripButton(page, "Holland River").click();
  await next(page);
  await next(page);
  await page
    .getByRole("button", { name: /request only/ })
    .first()
    .click();
  await next(page);
  await page.getByRole("button", { name: "2 hours", exact: true }).click();
  await page
    .getByRole("textbox", { name: /Any special requests/ })
    .fill("Private customer note.");
  await page
    .getByRole("radio", {
      name: "I’ll get the required licence before my trip.",
    })
    .check();
  await next(page);
  await fillContact(page);
  await submitButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Adventure requested." }),
  ).toBeVisible();
  const events = await page.evaluate(
    () => (window as typeof window & { funnel: unknown[][] }).funnel,
  );
  const names = events.map((event) => event[1]);
  for (const name of [
    "BookingStarted",
    "TripPreferenceSelected",
    "DestinationSelected",
    "BookingDetailsCompleted",
    "ContactStepReached",
    "Lead",
  ])
    expect(names).toContain(name);
  for (const text of [
    "Test Visitor",
    "visitor@example.com",
    "Private customer note",
    "416 555",
  ])
    expect(JSON.stringify(events)).not.toContain(text);
});

test("mobile routes retain image loading and do not overflow", async ({
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

test("reduced motion and keyboard date selection remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".scene-static-photo").first()).toHaveCSS(
    "display",
    "block",
  );
  await expect(page.locator(".water-stage")).toHaveCSS("display", "none");
  await page.goto("/book");
  await reachWater(page);
  await next(page);
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
});
