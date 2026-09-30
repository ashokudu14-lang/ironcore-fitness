import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = ["/", "/pricing", "/privacy", "/terms", "/login", "/signup"];

for (const route of publicRoutes) {
  test(`${route} loads without console errors`, async ({ page }) => {
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    expect(serious).toEqual([]);
  });

  test(`${route} does not overflow horizontally`, async ({ page }) => {
    await page.goto(route);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );

    expect(hasOverflow).toBeFalsy();
  });
}

test("homepage uses specific product copy and legal footer links", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /manage your gym members, payments, and renewals in one place/i,
    }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Terms and Conditions" }),
  ).toBeVisible();
});

test("protected app route redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/app/members");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /log in to ironcore os/i })).toBeVisible();
});

test("reduced motion disables authored transition durations", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();

  await page.goto("/");

  const duration = await page.locator(".button-primary").first().evaluate((element) => {
    return getComputedStyle(element).transitionDuration;
  });

  expect(duration).toMatch(/0\.01ms|0s/);
  await context.close();
});
