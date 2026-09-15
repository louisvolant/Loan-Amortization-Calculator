import { test, expect } from "@playwright/test";

test("smoke test loads the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Loan Amortization Calculator/i);
});
