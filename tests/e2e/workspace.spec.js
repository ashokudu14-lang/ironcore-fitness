import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { workspace, gym } from "./fixtures/workspace.js";

test("member directory supports search, filters, sort, pagination and member creation", async ({
  page,
}) => {
  await workspace(page);
  await page.goto("/app/members");
  await expect(page.getByRole("heading", { name: "12 members" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "9–12 of 12" }),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Search members" })
    .fill("Member 03");
  await expect(
    page.getByRole("row").filter({ hasText: "Member 03" }),
  ).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "Member 04" }),
  ).toHaveCount(0);
  await page.getByRole("searchbox").fill("");
  await page.getByLabel("Filter members").selectOption("inactive");
  await expect(
    page.getByRole("row").filter({ hasText: "Member 12" }),
  ).toBeVisible();
  await page.getByLabel("Filter members").selectOption("all");
  await page.getByRole("button", { name: /^Member/ }).click();
  await expect(
    page.getByRole("columnheader", { name: /Member/ }),
  ).toHaveAttribute("aria-sort", "ascending");
  await page.getByLabel("Full name").fill("New Member");
  await page.getByLabel("Phone", { exact: true }).fill("9876543210");
  await page.getByRole("button", { name: "Add member", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Member added successfully." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "13 members" })).toBeVisible();
});
test("payment form saves collections with feedback", async ({ page }) => {
  await workspace(page);
  await page.goto("/app/payments");
  await page
    .getByRole("combobox", { name: "Member", exact: true })
    .selectOption("member-0");
  await page.getByLabel("Amount", { exact: true }).fill("1500");
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Payment recorded successfully." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "3 payments" })).toBeVisible();
});
test("renewal confirmation can be cancelled, then completed", async ({
  page,
}) => {
  await workspace(page);
  await page.goto("/app/renewals");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Renew membership" }).click();
  await expect(page.getByRole("heading", { name: "1 renewals" })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Renew membership" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Membership renewed successfully." }),
  ).toBeVisible();
});
test("settings save and unsaved change warning", async ({ page }) => {
  await workspace(page);
  await page.goto("/app/settings");
  await expect(page.getByLabel("Gym name")).toHaveValue(gym.name);
  await page.getByLabel("Gym name").fill("Updated Training Club");
  await expect(
    page.getByRole("status").filter({ hasText: "Unsaved changes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Gym settings saved." }),
  ).toBeVisible();
  await expect(page.getByText("Unsaved changes ·")).toHaveCount(0);
});
test("workspace shows separate empty and API error states", async ({
  page,
}) => {
  await workspace(page, { empty: true });
  await page.goto("/app");
  await expect(page.getByText("You’re clear for the week.")).toBeVisible();
  await expect(
    page.getByText("Ready for your first collection."),
  ).toBeVisible();
});
test("dashboard API failure offers retry without inventing data", async ({
  page,
}) => {
  await workspace(page, { fail: true });
  await page.goto("/app");
  await expect(page.getByRole("alert")).toContainText(
    "Service temporarily unavailable",
    { timeout: 15000 },
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.getByText("Renewals unavailable")).toBeVisible();
});
for (const width of [360, 390, 768, 1024, 1280, 1440]) {
  test(`workspace routes fit ${width}px and navigation remains usable`, async ({
    page,
  }) => {
    await workspace(page);
    await page.setViewportSize({ width, height: 960 });
    for (const route of [
      "/app",
      "/app/members",
      "/app/payments",
      "/app/renewals",
      "/app/settings",
    ]) {
      await page.goto(route);
      await expect(page.locator(".app-page-heading h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBeTruthy();
    }
    if (width < 761) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      const drawer = page.getByRole("dialog", { name: "Workspace navigation" });
      await expect(drawer).toBeVisible();
      await drawer.getByRole("link", { name: "Members", exact: true }).click();
      await expect(page).toHaveURL(/\/app\/members/);
      await expect(drawer).not.toBeVisible();
    }
  });
}
test("workspace pages have no serious accessibility violations", async ({
  page,
}) => {
  await workspace(page);
  for (const route of [
    "/app",
    "/app/members",
    "/app/payments",
    "/app/renewals",
    "/app/settings",
  ]) {
    await page.goto(route);
    await expect(page.locator(".app-page-heading h1")).toBeVisible();
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toEqual([]);
  }
});

test("unsaved forms block links, browser history and logout until confirmed", async ({
  page,
}) => {
  await workspace(page);
  await page.goto("/app");
  if (test.info().project.name === "mobile-chromium") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Members", exact: true })
      .click();
  } else await page.getByRole("link", { name: "Members", exact: true }).click();
  await page.getByLabel("Full name").fill("Unsaved member");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/\/app\/members/);
  await expect(page.getByLabel("Full name")).toHaveValue("Unsaved member");
  const mobile = test.info().project.name === "mobile-chromium";
  if (mobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  page.once("dialog", (dialog) => dialog.dismiss());
  const navigation = mobile
    ? page.getByRole("dialog")
    : page.locator("aside.app-sidebar");
  await navigation.getByRole("link", { name: "Payments", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/members/);
  await expect(page.getByLabel("Full name")).toHaveValue("Unsaved member");

  if (test.info().project.name === "mobile-chromium")
    await page.getByRole("button", { name: "Open navigation" }).click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: /Log out/ }).click();
  await expect(page).toHaveURL(/\/app\/members/);
  if (test.info().project.name === "mobile-chromium")
    await page.getByRole("button", { name: "Close navigation" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  // A confirmed history navigation returns to the overview without discarding silently.
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/\/app$/);
});
