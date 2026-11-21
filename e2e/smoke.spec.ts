import { expect, test } from "@playwright/test";

/**
 * Smoke: sign-in → invoices → export affordance.
 * Requires API + seeded demo user (Development) and a built frontend.
 * Set PLAYWRIGHT_SKIP_WEBSERVER=1 if the app is already running.
 */
test.describe("smoke", () => {
  test("login → invoices → export link", async ({ page }) => {
    await page.goto("/sk/sign-in");

    const demo = page.getByRole("button", { name: /demo|ukážka|vzor/i });
    if (await demo.isVisible().catch(() => false)) {
      await demo.click();
    } else {
      await page.getByLabel(/e-?mail/i).fill("demo@fakturio.sk");
      await page.getByLabel(/heslo|password/i).fill("Demo123!");
      await page.getByRole("button", { name: /prihlásiť|sign in|anmelden|přihlásit/i }).click();
    }

    await page.waitForURL(/\/(sk|en|cs|de)\/(dashboard|invoices)/, {
      timeout: 30_000,
    });

    await page.goto("/sk/invoices");
    await expect(page.getByRole("heading").first()).toBeVisible({
      timeout: 15_000,
    });

    const exportLink = page.locator('a[href*="/api/exports/invoices"]').first();
    await expect(exportLink).toBeVisible({ timeout: 15_000 });
  });
});
