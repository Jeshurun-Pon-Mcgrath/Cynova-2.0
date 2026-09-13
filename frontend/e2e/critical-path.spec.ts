import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/privacy",
  "/terms",
  "/onboarding",
  "/dashboard",
  "/quests",
  "/quests/new",
  "/quests/q1",
  "/quests/q1/edit",
  "/character",
  "/skills",
  "/rewards",
  "/inventory",
  "/achievements",
  "/history",
  "/settings",
];
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test("every required route responds", async ({ request }) => {
  for (const route of routes)
    expect((await request.get(route)).status(), route).toBe(200);
});

test("landing, dashboard, and quest archive never overflow at required viewports", async ({
  page,
}) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of ["/", "/dashboard", "/quests"]) {
      await page.goto(route);
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          {
            message: `${route} overflowed at ${viewport.width}x${viewport.height}`,
          },
        )
        .toBe(true);
    }
  }
});

test("mobile sidebar and filter drawer are keyboard accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/dashboard");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  await page.goto("/quests");
  await page.getByRole("button", { name: "Filters" }).click();
  await expect(
    page.getByRole("heading", { name: "Filter quests" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Filter quests" }),
  ).toBeHidden();
});

test("quest completion rewards and failed completion fully rolls back", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page
    .getByRole("button", { name: "Complete Complete two DSA problems" })
    .click();
  await expect(
    page.getByText(/Quest complete\. Gained 90 XP, 35 gold, and 3 Intellect/),
  ).toBeAttached();
  await expect(
    page.getByRole("heading", { name: "Complete two DSA problems" }),
  ).toHaveCount(0);
  await expect(page.getByText("4", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /Test rollback/ }).click();
  await page
    .getByRole("button", { name: "Complete 30-minute strength workout" })
    .click();
  await expect(
    page.getByRole("link", { name: "30-minute strength workout" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Every optimistic reward was rolled back/),
  ).toBeVisible();
  await expect(page.getByText("1,295", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("4", { exact: true }).first()).toBeVisible();
  await page.goto("/character");
  await expect(
    page.getByRole("row", { name: /Strength 52 \/ 100/ }),
  ).toBeVisible();
});

test("real quest CRUD is reachable through the interface", async ({ page }) => {
  await page.goto("/quests/new");
  await page.getByLabel("Quest title").fill("Polish the final pitch");
  await page.getByLabel("Tags (comma separated)").fill("hackathon, focus");
  await page.getByRole("button", { name: "Create quest" }).click();
  await expect(
    page.getByRole("heading", { name: "Polish the final pitch" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit" }).click();
  await page
    .getByLabel("Quest title")
    .fill("Polish and rehearse the final pitch");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Polish and rehearse the final pitch" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Duplicate/ }).click();
  await expect(page.getByRole("heading", { name: /copy/ })).toBeVisible();
  await page.getByRole("button", { name: /Delete/ }).click();
  await page.getByRole("button", { name: "Delete quest" }).click();
  await expect(page).toHaveURL(/\/quests$/);
});

test("purchase appears in inventory and equipment updates character", async ({
  page,
}) => {
  await page.goto("/rewards");
  const moonlit = page
    .getByRole("heading", { name: "Moonlit Realm" })
    .locator("..");
  await moonlit.getByRole("button", { name: "Preview" }).click();
  await page.getByRole("button", { name: "Confirm purchase" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("link", { name: "Inventory", exact: true })
    .first()
    .click();
  await page
    .getByRole("heading", { name: "Moonlit Realm" })
    .locator("..")
    .getByRole("button", { name: "Details" })
    .click();
  await page.getByRole("button", { name: "Equip" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("link", { name: "Character", exact: true })
    .first()
    .click();
  await expect(
    page.locator(".equipment-grid small").filter({ hasText: "Theme" }),
  ).toContainText("Moonlit Realm");
});

test("WebGL and explicit fallback expose truthful render modes", async ({
  page,
}) => {
  await page.goto("/");
  const supportsWebGL = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
  if (supportsWebGL)
    await expect(page.locator('[data-render-mode="webgl"]')).toBeVisible();
  else
    await expect(page.locator('[data-render-mode="fallback"]')).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "cynova-preferences",
      JSON.stringify({
        state: {
          reducedMotion: false,
          highContrast: false,
          graphics: "low",
          sound: false,
        },
        version: 0,
      }),
    ),
  );
  await page.reload();
  await expect(page.locator('[data-render-mode="fallback"]')).toBeVisible();
});

test("reduced motion selects the non-animated fallback", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "cynova-preferences",
      JSON.stringify({
        state: {
          reducedMotion: true,
          highContrast: false,
          graphics: "high",
          sound: false,
        },
        version: 0,
      }),
    ),
  );
  await page.goto("/");
  await expect(page.locator('[data-render-mode="fallback"]')).toBeVisible();
});
