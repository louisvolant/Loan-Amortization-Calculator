import { test, expect } from "@playwright/test";

test.describe("Real-time Input Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with clean state
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("shows validation errors when clicking calculate on empty form", async ({ page }) => {
    await page.click('[data-testid="calculate-button"]');

    await expect(page.locator('[data-testid="error-loan-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-interest-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-loan-term"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-summary"]')).toBeVisible();
  });

  test("validates loan amount in real time", async ({ page }) => {
    const loanAmountInput = page.locator('[data-testid="input-loan-amount"]');
    const loanAmountError = page.locator('[data-testid="error-loan-amount"]');

    // Negative amount
    await loanAmountInput.fill("-5000");
    await expect(loanAmountError).toBeVisible();
    await expect(loanAmountError).toHaveText(/must be greater than 0/i);

    // Zero amount
    await loanAmountInput.fill("0");
    await expect(loanAmountError).toBeVisible();
    await expect(loanAmountError).toHaveText(/must be greater than 0/i);

    // Valid amount clears error
    await loanAmountInput.fill("200000");
    await expect(loanAmountError).not.toBeVisible();
  });

  test("validates interest rate in real time", async ({ page }) => {
    const rateInput = page.locator('[data-testid="input-interest-rate"]');
    const rateError = page.locator('[data-testid="error-interest-rate"]');

    // Negative interest rate
    await rateInput.fill("-1");
    await expect(rateError).toBeVisible();
    await expect(rateError).toHaveText(/between 0% and 100%/i);

    // Exceeding 100%
    await rateInput.fill("120");
    await expect(rateError).toBeVisible();
    await expect(rateError).toHaveText(/between 0% and 100%/i);

    // Valid rate clears error
    await rateInput.fill("3.5");
    await expect(rateError).not.toBeVisible();
  });

  test("validates loan term in real time", async ({ page }) => {
    const termInput = page.locator('[data-testid="input-loan-term"]');
    const termError = page.locator('[data-testid="error-loan-term"]');

    // Negative term
    await termInput.fill("-12");
    await expect(termError).toBeVisible();
    await expect(termError).toHaveText(/positive integer/i);

    // Decimal term
    await termInput.fill("12.5");
    await expect(termError).toBeVisible();
    await expect(termError).toHaveText(/positive integer/i);

    // Valid term clears error
    await termInput.fill("240");
    await expect(termError).not.toBeVisible();
  });

  test("calculates successfully when all fields are valid", async ({ page }) => {
    await page.locator('[data-testid="input-loan-amount"]').fill("200000");
    await page.locator('[data-testid="input-interest-rate"]').fill("3.5");
    await page.locator('[data-testid="input-loan-term"]').fill("240");
    await page.locator('[data-testid="input-insurance-rate"]').fill("0.3");

    await page.click('[data-testid="calculate-button"]');

    // Should not show error summary
    await expect(page.locator('[data-testid="error-summary"]')).not.toBeVisible();

    // Should display amortization schedule
    await expect(page.locator("table")).toBeVisible();
  });
});
