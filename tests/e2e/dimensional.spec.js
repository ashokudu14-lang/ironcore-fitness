import { chromium, expect, test } from "@playwright/test";

function recordErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("3D sculpture renders, pauses, responds to reduced motion, and cleans up between routes", async ({
  baseURL,
}) => {
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
      "--use-angle=swiftshader",
    ],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      isMobile: false,
      hasTouch: false,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = recordErrors(page);
    await page.goto(baseURL + "/");
    const sculpture = page.locator(".core-sculpture");
    await expect(sculpture).toHaveAttribute("data-ready", "true", {
      timeout: 10000,
    });
    await expect(sculpture.locator("canvas")).toHaveCount(1);
    const size = await sculpture
      .locator("canvas")
      .evaluate((canvas) => ({ width: canvas.width, height: canvas.height }));
    expect(size.width).toBeGreaterThan(100);
    expect(size.height).toBeGreaterThan(100);
    await page.getByRole("button", { name: "Pause motion" }).click();
    await expect(
      page.getByRole("button", { name: "Resume motion" }),
    ).toHaveAttribute("aria-pressed", "true");
    await sculpture.locator("canvas").evaluate((canvas) => {
      window.__coreDraws = 0;
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      for (const method of ["drawArrays", "drawElements"]) {
        const original = gl[method].bind(gl);
        gl[method] = (...args) => {
          window.__coreDraws++;
          return original(...args);
        };
      }
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect
      .poll(() => page.evaluate(() => window.__coreDraws))
      .toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(sculpture.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".sculpture-fallback")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(sculpture.locator("canvas")).toHaveCount(1);
    await page.getByRole("link", { name: "Pricing", exact: true }).click();
    await expect(page.locator(".core-sculpture canvas")).toHaveCount(0);
    await page.getByRole("link", { name: "Product", exact: true }).click();
    await expect(page.locator(".core-sculpture canvas")).toHaveCount(1);
    await expect(page.locator(".core-sculpture")).toHaveAttribute(
      "data-ready",
      "true",
    );
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

test("unavailable WebGL preserves the static sculpture and working product links", async ({
  page,
}) => {
  const errors = recordErrors(page);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return ["webgl", "webgl2", "experimental-webgl"].includes(type)
        ? null
        : getContext.call(this, type, ...args);
    };
  });
  await page.goto("/");
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page.locator(".core-sculpture canvas")).toHaveCount(0);
  await page.getByRole("link", { name: "Build your workspace" }).click();
  await expect(page).toHaveURL(/\/signup/);
  await expect(
    page.getByRole("heading", { name: "Set up your gym workspace." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced motion avoids loading Three.js and preserves a flat readable product view", async ({
  page,
}) => {
  const heavy = [];
  page.on("request", (request) => {
    if (/createCoreScene|three\.module/.test(request.url()))
      heavy.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await expect(page.locator(".core-sculpture canvas")).toHaveCount(0);
  expect(heavy).toEqual([]);
  expect(
    await page
      .locator(".product-stage-screen")
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe("none");
  await page.getByRole("link", { name: "Explore the product" }).click();
  await expect(page).toHaveURL(/#product-preview/);
});

for (const width of [360, 390, 768, 1024, 1280, 1440]) {
  test(`dimensional public layout fits ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("link", { name: "Privacy Policy" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    if (width <= 390)
      await expect(page.locator(".core-sculpture canvas")).toHaveCount(0);
  });
}
