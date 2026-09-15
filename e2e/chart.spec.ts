import { test, expect } from "@playwright/test";

test.describe("Chart.js Visualization for Interest vs Principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.locator('[data-testid="input-loan-amount"]').fill("150000");
    await page.locator('[data-testid="input-interest-rate"]').fill("4.0");
    await page.locator('[data-testid="input-loan-term"]').fill("180");
    await page.click('[data-testid="calculate-button"]');

    await expect(page.locator("table")).toBeVisible();
  });

  test("renders chart canvas and KPI summary cards", async ({ page }) => {
    await expect(page.locator('[data-testid="amortization-chart-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="amortization-chart-canvas"]')).toBeVisible();

    // Verify KPI cards have values
    await expect(page.locator('[data-testid="kpi-total-principal"]')).toContainText("€150,000");
    await expect(page.locator('[data-testid="kpi-total-interest"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="kpi-total-cost"]')).not.toBeEmpty();
  });

  test("switches between annual, cumulative, and monthly chart views", async ({ page }) => {
    // Default is annual
    await expect(page.locator('[data-testid="chart-tab-annual"]')).toHaveClass(/bg-blue-600/);

    // Switch to cumulative
    await page.click('[data-testid="chart-tab-cumulative"]');
    await expect(page.locator('[data-testid="chart-tab-cumulative"]')).toHaveClass(/bg-blue-600/);
    await expect(page.locator('[data-testid="amortization-chart-canvas"]')).toBeVisible();

    // Switch to monthly
    await page.click('[data-testid="chart-tab-monthly"]');
    await expect(page.locator('[data-testid="chart-tab-monthly"]')).toHaveClass(/bg-blue-600/);
    await expect(page.locator('[data-testid="amortization-chart-canvas"]')).toBeVisible();

    // Switch back to annual
    await page.click('[data-testid="chart-tab-annual"]');
    await expect(page.locator('[data-testid="chart-tab-annual"]')).toHaveClass(/bg-blue-600/);
  });
});
