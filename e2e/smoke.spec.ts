import { test, expect } from "@playwright/test";

test("smoke test loads the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Loan Amortization Calculator/i);
});

test("renders external footer links with updated portfolio URLs for Whois and Currency Converter", async ({ page }) => {
  await page.goto("/");
  const whoisLink = page.locator('footer a:has-text("Whois")');
  await expect(whoisLink).toBeVisible();
  await expect(whoisLink).toHaveAttribute("href", "https://whois.louisvolant.com");

  const currencyLink = page.locator('footer a:has-text("Currency Converter")');
  await expect(currencyLink).toBeVisible();
  await expect(currencyLink).toHaveAttribute("href", "https://currency-converter.louisvolant.com");
});

