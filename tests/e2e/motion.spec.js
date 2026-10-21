import { expect, test } from "@playwright/test";
async function desktop(browser, baseURL) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("ironcore:launch-seen", "1"),
  );
  const page = await context.newPage();
  await page.goto(baseURL + "/");
  await expect(page.locator("h1")).toBeVisible();
  await page.waitForTimeout(1100);
  return { context, page };
}

test("launch finishes promptly and runs once per tab", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".launch-intro")).toHaveCount(0, { timeout: 2500 });
  expect(
    await page.evaluate(() => sessionStorage.getItem("ironcore:launch-seen")),
  ).toBe("1");
  expect(
    await page.locator("#main-content").evaluate((main) => main.inert),
  ).toBe(false);
  await page.reload();
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".launch-intro")).toHaveCount(0);
});

test("keyboard input immediately dismisses launch and reveals navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".launch-intro").waitFor({ state: "attached" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".launch-intro")).toHaveCount(0);
  await expect(page.locator(".hero-actions")).toHaveCSS("opacity", "1");
  await page.getByRole("link", { name: "Build your workspace" }).click();
  await expect(page).toHaveURL(/\/signup/);
});

test("reduced motion skips launch and cursor enhancement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".launch-intro")).toHaveCount(0);
  await page.mouse.move(150, 200);
  await expect(page.locator(".public-cursor")).toHaveCSS("display", "none");
  expect(
    await page.locator(".marketing-site").getAttribute("data-pointer-motion"),
  ).toBeNull();
  await expect(page.locator(".hero-line").first()).toHaveCSS("opacity", "1");
});

test("cursor follows without replacing native pointer and magnetic CTAs still navigate", async ({
  browser,
  baseURL,
}) => {
  const { context, page } = await desktop(browser, baseURL);
  try {
    const cta = page.getByRole("link", { name: "Build your workspace" });
    const rect = await cta.boundingBox();
    await page.mouse.move(
      rect.x + rect.width * 0.8,
      rect.y + rect.height * 0.7,
    );
    await expect(page.locator(".public-cursor")).toHaveAttribute(
      "data-visible",
      "true",
    );
    await expect(page.locator(".public-cursor")).toHaveAttribute(
      "data-interactive",
      "true",
    );
    await expect(page.locator(".public-cursor")).toHaveCSS(
      "pointer-events",
      "none",
    );
    expect(
      await cta.evaluate((element) => getComputedStyle(element).cursor),
    ).not.toBe("none");
    const magnet = await cta.evaluate((element) => ({
      x: parseFloat(element.style.getPropertyValue("--magnet-x")),
      y: parseFloat(element.style.getPropertyValue("--magnet-y")),
    }));
    expect(magnet.x).toBeGreaterThan(0);
    expect(Math.abs(magnet.x)).toBeLessThanOrEqual(5);
    expect(Math.abs(magnet.y)).toBeLessThanOrEqual(3);
    await cta.click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator(".public-cursor")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("card motion and cursor reset immediately when reduced motion is enabled", async ({
  browser,
  baseURL,
}) => {
  const { context, page } = await desktop(browser, baseURL);
  try {
    const card = page.locator(".bento-card").first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
    const rect = await card.boundingBox();
    await page.mouse.move(
      rect.x + rect.width * 0.8,
      rect.y + rect.height * 0.3,
    );
    await expect
      .poll(() =>
        card.evaluate((element) => element.style.getPropertyValue("--card-ry")),
      )
      .not.toBe("");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(card).toHaveCSS("transform", "none");
    expect(
      await card.evaluate((element) =>
        element.style.getPropertyValue("--card-ry"),
      ),
    ).toBe("");
    await expect(page.locator(".public-cursor")).toHaveCSS("display", "none");
  } finally {
    await context.close();
  }
});

test("touch devices keep native interaction without a cursor overlay", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(baseURL + "/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".public-cursor")).toHaveCSS("display", "none");
    expect(
      await page.locator(".marketing-site").getAttribute("data-pointer-motion"),
    ).toBeNull();
    await page.getByRole("button", { name: "Open menu" }).tap();
    await expect(
      page.getByRole("dialog", { name: "Site navigation" }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test("blocked storage does not break launch or cause replay on public route navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".launch-intro")).toHaveCount(0, { timeout: 2500 });
  if (await page.getByRole("button", { name: "Open menu" }).isVisible()) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Pricing", exact: true })
      .click();
  } else await page.getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(page).toHaveURL(/\/pricing/);
  await page
    .getByRole("link", { name: /IronCore OS/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".launch-intro")).toHaveCount(0);
  await expect(page.locator(".public-cursor")).toHaveCount(1);
});

test("direct product links skip the launch animation", async ({ page }) => {
  await page.goto("/#product-preview");
  await expect(page.locator("#workspace-heading")).toBeVisible();
  await expect(page.locator(".launch-intro")).toHaveCount(0);
  await expect(page.locator(".product-stage")).toBeVisible();
});
