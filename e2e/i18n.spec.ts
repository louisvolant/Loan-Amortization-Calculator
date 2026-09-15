import { test, expect } from "@playwright/test";

test.describe("Multi-Language Support & LocalStorage Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("switches between all 7 supported languages correctly", async ({ page }) => {
    const langSelect = page.locator('[data-testid="select-language"]');

    // French
    await langSelect.selectOption("fr");
    await expect(page.locator("h2")).toContainText("Calculateur d'Amortissement Hypothécaire");
    await expect(page.locator('[data-testid="calculate-button"]')).toContainText("Calculer le tableau d'amortissement");

    // Italian
    await langSelect.selectOption("it");
    await expect(page.locator("h2")).toContainText("Calcolatore di Ammortamento del Mutuo");
    await expect(page.locator('[data-testid="calculate-button"]')).toContainText("Calcola Piano di Ammortamento");

    // Spanish
    await langSelect.selectOption("es");
    await expect(page.locator("h2")).toContainText("Calculadora de Amortización Hipotecaria");
    await expect(page.locator('[data-testid="calculate-button"]')).toContainText("Calcular la Tabla de Amortización");

    // German
    await langSelect.selectOption("de");
    await expect(page.locator("h2")).toContainText("Tilgungsrechner für Hypotheken");
    await expect(page.locator('[data-testid="calculate-button"]')).toContainText("Tilgungsplan berechnen");

    // Ukrainian
    await langSelect.selectOption("uk");
    await expect(page.locator("h2")).toContainText("Калькулятор Амортизації Кредиту");
    await expect(page.locator('[data-testid="calculate-button"]')).toContainText("Розрахувати графік амортизації");

    // Portuguese
    await langSelect.selectOption("pt");
    await expect(page.locator("h2")).toContainText("Calculadora de Amortização de Empréstimos");
    await expect(page.locator('[data-testid="calculate-button"]')).toContainText("Calcular Tabela de Amortização");

    // English
    await langSelect.selectOption("en");
    await expect(page.locator("h2")).toContainText("Mortgage Amortization Calculator");
    await expect(page.locator('[data-testid="calculate-button"]')).toContainText("Calculate Amortization Schedule");
  });

  test("persists chosen language in localStorage across page reloads", async ({ page }) => {
    const langSelect = page.locator('[data-testid="select-language"]');

    // Choose Italian
    await langSelect.selectOption("it");
    await expect(page.locator("h2")).toContainText("Calcolatore di Ammortamento del Mutuo");

    // Check localStorage
    const savedLang = await page.evaluate(() => localStorage.getItem("mortgageCalculatorLanguage"));
    expect(savedLang).toBe("it");

    // Reload page
    await page.reload();

    // Verify language remains Italian after reload
    await expect(page.locator('[data-testid="select-language"]')).toHaveValue("it");
    await expect(page.locator("h2")).toContainText("Calcolatore di Ammortamento del Mutuo");
  });
});
