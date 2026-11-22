import { test, expect } from "@playwright/test";
test("homepage, experience links and atlas text controls work", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A little further",
  );
  await page
    .getByRole("link", { name: "Explore experiences", exact: true })
    .click();
  await expect(page).toHaveURL(/\/experiences$/);
  await page.getByRole("link", { name: "A different kind of still." }).click();
  await expect(page).toHaveURL(/ice-fishing$/);
  await page
    .getByRole("link", { name: "Request ice fishing", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Ice Fishing", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Holland River", exact: true }),
  ).toHaveCount(0);
  await page.goto("/explore");
  await page
    .getByRole("button", { name: "Nottawasaga River", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Discover Nottawasaga River" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Discover Nottawasaga River" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nottawasaga River",
  );
  await expect(
    page.getByRole("link", { name: /View on Google Maps/ }),
  ).toHaveAttribute("href", /google.com\/maps\/search/);
});
test("booking validates, preserves selections, filters locations and handles delivery failure", async ({
  page,
}) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: true } }),
  );
  await page.goto("/book?experience=shoreline-fishing&location=holland-river");
  await expect(
    page.getByRole("button", { name: "Holland River", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Request your adventure", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("A few details");
  await page.getByRole("button", { name: "Ice Fishing", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Holland River", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Lake Simcoe", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "4+ people" }).click();
  await page.getByLabel("How many people?").fill("6");
  const day = page.getByRole("button", { name: /request only/ }).first();
  await day.click();
  await page
    .getByRole("radio", {
      name: "I’ll get the required licence before my trip.",
    })
    .check();
  await page.getByLabel("Full name").fill("Test Visitor");
  await page.getByLabel("Email address").fill("visitor@example.com");
  await page.getByLabel("Phone number").fill("+1 416 555 0100");
  await page.route("**/api/bookings", (route) =>
    route.fulfill({
      status: 502,
      json: { message: "Delivery could not be verified. Please try again." },
    }),
  );
  await page
    .getByRole("button", { name: "Request your adventure", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Delivery could not be verified",
  );
  await expect(page.getByLabel("Full name")).toHaveValue("Test Visitor");
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  expect(storage).not.toContain("visitor@example.com");
  expect(storage).not.toContain("Test Visitor");
  await page.route("**/api/bookings", async (route) => {
    const data = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      json: {
        requestId: data.requestId,
        status: "pending",
        submittedAt: new Date().toISOString(),
      },
    });
  });
  await page
    .getByRole("button", { name: "Request your adventure", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Adventure requested." }),
  ).toBeVisible();
  await expect(page.getByText(/not yet confirmed or reserved/)).toBeVisible();
});
test("unconfigured delivery displays honest unavailable state", async ({
  page,
}) => {
  await page.route("**/api/booking/status", (route) =>
    route.fulfill({ json: { ready: false } }),
  );
  await page.goto("/book");
  await expect(
    page.getByRole("button", { name: "Request your adventure", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("Online requests are opening soon."),
  ).toBeVisible();
});
test("all routes are readable without image failures or horizontal overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
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
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
    });
    expect(
      await page.evaluate(() =>
        [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src),
      ),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test("mobile navigation, keyboard calendar and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("link", { name: "Our story" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.goto("/book");
  const date = page.getByRole("button", { name: /request only/ }).first();
  await date.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".calendar-grid button:focus")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});
