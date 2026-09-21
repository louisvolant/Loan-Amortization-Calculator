import { test, expect } from "@playwright/test";

test("smoke test loads the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Loan Amortization Calculator/i);
});

test("renders compact footer with Personal Page and Portfolio links", async ({ page }) => {
  await page.goto("/");
  const personalLink = page.locator('footer a:has-text("Personal Page")');
  await expect(personalLink).toBeVisible();
  await expect(personalLink).toHaveAttribute("href", "https://www.louisvolant.com");

  const portfolioLink = page.locator('footer a:has-text("Portfolio")');
  await expect(portfolioLink).toBeVisible();
  await expect(portfolioLink).toHaveAttribute("href", "https://www.louisvolant.com/portfolio");
});

