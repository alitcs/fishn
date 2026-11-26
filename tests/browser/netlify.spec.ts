import { test, expect } from "@playwright/test";

// Run against npm run build:netlify and a static preview. Every POST is intercepted.
test("Netlify build submits the full URL-encoded session, handles failures, and preserves its reference", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const bodies: URLSearchParams[] = [];
  await page.route("**/__forms.html", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    expect(route.request().headers()["content-type"]).toContain(
      "application/x-www-form-urlencoded",
    );
    bodies.push(new URLSearchParams(route.request().postData() || ""));
    return route.fulfill({ status: 500, body: "Could not accept submission" });
  });
  await page.goto("/book");
  await page
    .getByRole("button", { name: /^(Choose date|Set group|Your details)$/ })
    .click();
  await page
    .getByRole("button", { name: /request only/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: /^(Choose date|Set group|Your details)$/ })
    .click();
  await page.getByLabel("Number of people", { exact: true }).fill("25");
  await page.getByRole("button", { name: "8 hours", exact: true }).click();
  await page
    .getByRole("button", { name: /^(Choose date|Set group|Your details)$/ })
    .click();
  await page.getByLabel("Full name").fill("Netlify QA Visitor");
  await page.getByLabel("Email address").fill("netlify-qa@example.com");
  await page.getByLabel("Phone number").fill("+14165550100");
  await page.getByRole("combobox", { name: "Fishing licence" }).click();
  await page
    .getByRole("option", { name: /required licence before my trip/ })
    .click();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("couldn’t be submitted");
  await expect(page.getByLabel("Full name")).toHaveValue("Netlify QA Visitor");
  await page.route("**/__forms.html", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body data-fishn-form-blueprint>Unprocessed static form</body></html>",
    }),
  );
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("couldn’t be submitted");
  await expect(
    page.getByRole("heading", { name: "Request sent." }),
  ).toHaveCount(0);
  await page.route("**/__forms.html", (route) => {
    bodies.push(new URLSearchParams(route.request().postData() || ""));
    return route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>Thank you</body></html>",
    });
  });
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Request sent." }),
  ).toBeVisible();
  expect(bodies[0].get("requestId")).toBe(bodies[1].get("requestId"));
  for (const [key, value] of [
    ["form-name", "fishing-session"],
    ["groupSize", "25"],
    ["duration", "8"],
    ["hourlyRate", "530"],
    ["sessionTotal", "4240"],
    ["currency", "CAD"],
    ["name", "Netlify QA Visitor"],
  ])
    expect(bodies[1].get(key)).toBe(value);
  expect(errors).toEqual([]);
});
