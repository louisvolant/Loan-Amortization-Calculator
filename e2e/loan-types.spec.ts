import { test, expect } from "@playwright/test";

test.describe("Loan Types and Variable Interest Rates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("calculates interest-only loan correctly during and after interest-only period", async ({ page }) => {
    await page.locator('[data-testid="input-loan-amount"]').fill("120000");
    await page.locator('[data-testid="input-interest-rate"]').fill("3.0");
    await page.locator('[data-testid="input-loan-term"]').fill("120");

    // Select interest-only loan type
    await page.locator('[data-testid="select-loan-type"]').selectOption("interest_only");
    await expect(page.locator('[data-testid="interest-only-config"]')).toBeVisible();

    // Set 24 months interest-only period
    await page.locator('[data-testid="input-interest-only-months"]').fill("24");

    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator("table")).toBeVisible();

    // Check first row (Month 1): principal should be 0.00, interest = 300.00, balance = 120000.00
    const firstRowCells = page.locator("table tbody tr").first().locator("td");
    await expect(firstRowCells.nth(0)).toHaveText("1");
    await expect(firstRowCells.nth(2)).toHaveText("300.00"); // Payment
    await expect(firstRowCells.nth(3)).toHaveText("0.00");   // Principal
    await expect(firstRowCells.nth(4)).toHaveText("300.00"); // Interest
    await expect(firstRowCells.nth(6)).toHaveText("120000.00"); // Remaining Balance
  });

  test("calculates variable interest rates with scheduled adjustment", async ({ page }) => {
    await page.locator('[data-testid="input-loan-amount"]').fill("100000");
    await page.locator('[data-testid="input-interest-rate"]').fill("2.0");
    await page.locator('[data-testid="input-loan-term"]').fill("60");

    // Select variable rate
    await page.locator('[data-testid="select-rate-type"]').selectOption("variable");
    await expect(page.locator('[data-testid="variable-rate-config"]')).toBeVisible();

    // Add adjustment
    await page.click('[data-testid="add-rate-adjustment-button"]');
    await expect(page.locator('[data-testid="rate-adjustment-row-0"]')).toBeVisible();

    // Set adjustment: starting month 2 at 5.0%
    await page.locator('[data-testid="adj-start-month-0"]').fill("2");
    await page.locator('[data-testid="adj-rate-0"]').fill("5.0");

    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator("table")).toBeVisible();

    const rows = page.locator("table tbody tr");
    const row1PaymentText = await rows.nth(0).locator("td").nth(2).innerText();
    const row2PaymentText = await rows.nth(1).locator("td").nth(2).innerText();

    const paymentMonth1 = parseFloat(row1PaymentText);
    const paymentMonth2 = parseFloat(row2PaymentText);

    // Interest rate increased from 2% to 5% at month 2, so monthly payment must increase
    expect(paymentMonth2).toBeGreaterThan(paymentMonth1);
  });

  test("supports full-term interest-only with balloon payoff", async ({ page }) => {
    await page.locator('[data-testid="input-loan-amount"]').fill("50000");
    await page.locator('[data-testid="input-interest-rate"]').fill("4.0");
    await page.locator('[data-testid="input-loan-term"]').fill("12");

    await page.locator('[data-testid="select-loan-type"]').selectOption("interest_only");
    await page.locator('[data-testid="input-interest-only-months"]').fill("12");

    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator("table")).toBeVisible();

    // In the 12th month (final month), principal should balloon-repay the full 50,000 balance
    const lastRowCells = page.locator("table tbody tr").nth(11).locator("td");
    await expect(lastRowCells.nth(0)).toHaveText("12");
    await expect(lastRowCells.nth(3)).toHaveText("50000.00"); // Principal paid
    await expect(lastRowCells.nth(6)).toHaveText("0.00");     // Balance cleared
  });
});
