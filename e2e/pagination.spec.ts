import { test, expect } from "@playwright/test";

test.describe("Amortization Schedule Pagination", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Fill in a 30-year (360 months) mortgage
    await page.locator('[data-testid="input-loan-amount"]').fill("250000");
    await page.locator('[data-testid="input-interest-rate"]').fill("3.5");
    await page.locator('[data-testid="input-loan-term"]').fill("360");
    await page.click('[data-testid="calculate-button"]');

    await expect(page.locator("table")).toBeVisible();
  });

  test("defaults to 12 rows per page and displays pagination controls", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(12);

    // Verify first and 12th row ranks
    await expect(rows.first().locator("td").first()).toHaveText("1");
    await expect(rows.last().locator("td").first()).toHaveText("12");

    // Pagination info & indicator
    await expect(page.locator('[data-testid="pagination-info"]')).toContainText("Showing 1 to 12 of 360");
    await expect(page.locator('[data-testid="pagination-page-indicator"]')).toHaveText("Page 1 of 30");

    // First and Prev buttons should be disabled on page 1
    await expect(page.locator('[data-testid="pagination-first"]')).toBeDisabled();
    await expect(page.locator('[data-testid="pagination-prev"]')).toBeDisabled();
    await expect(page.locator('[data-testid="pagination-next"]')).toBeEnabled();
    await expect(page.locator('[data-testid="pagination-last"]')).toBeEnabled();
  });

  test("navigates through pages using next, last, prev, and first buttons", async ({ page }) => {
    const rows = page.locator("table tbody tr");

    // Click Next
    await page.click('[data-testid="pagination-next"]');
    await expect(page.locator('[data-testid="pagination-page-indicator"]')).toHaveText("Page 2 of 30");
    await expect(rows.first().locator("td").first()).toHaveText("13");
    await expect(rows.last().locator("td").first()).toHaveText("24");
    await expect(page.locator('[data-testid="pagination-info"]')).toContainText("Showing 13 to 24 of 360");

    // Click Last
    await page.click('[data-testid="pagination-last"]');
    await expect(page.locator('[data-testid="pagination-page-indicator"]')).toHaveText("Page 30 of 30");
    await expect(rows.last().locator("td").first()).toHaveText("360");
    await expect(page.locator('[data-testid="pagination-next"]')).toBeDisabled();
    await expect(page.locator('[data-testid="pagination-last"]')).toBeDisabled();

    // Click Prev
    await page.click('[data-testid="pagination-prev"]');
    await expect(page.locator('[data-testid="pagination-page-indicator"]')).toHaveText("Page 29 of 30");

    // Click First
    await page.click('[data-testid="pagination-first"]');
    await expect(page.locator('[data-testid="pagination-page-indicator"]')).toHaveText("Page 1 of 30");
    await expect(rows.first().locator("td").first()).toHaveText("1");
  });

  test("changes rows per page selector to 24 and all", async ({ page }) => {
    // Select 24 rows per page
    await page.locator('[data-testid="select-rows-per-page"]').selectOption("24");
    await expect(page.locator("table tbody tr")).toHaveCount(24);
    await expect(page.locator('[data-testid="pagination-page-indicator"]')).toHaveText("Page 1 of 15");

    // Select All
    await page.locator('[data-testid="select-rows-per-page"]').selectOption("all");
    await expect(page.locator("table tbody tr")).toHaveCount(360);
  });
});
