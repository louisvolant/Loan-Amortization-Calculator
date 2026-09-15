import { test, expect } from "@playwright/test";

test.describe("Dark / Light Mode & Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Reset theme storage before each test
    await page.evaluate(() => {
      localStorage.removeItem("theme");
      document.documentElement.classList.remove("dark");
    });
    await page.reload();
  });

  test("renders theme toggle button in footer and toggles dark mode", async ({ page }) => {
    const toggleButton = page.locator('[data-testid="theme-toggle"]');
    await expect(toggleButton).toBeVisible();

    // Verify initial toggle state (light by default)
    const initialText = await toggleButton.innerText();
    expect(initialText).toContain("Dark Mode");

    // Click to switch to dark mode
    await toggleButton.click();

    // Verify dark class is applied to html element
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    expect(isDark).toBe(true);

    // Verify button text switched to prompt for Light mode
    await expect(toggleButton).toContainText("Light Mode");

    // Verify localStorage persistence
    const savedTheme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(savedTheme).toBe("dark");

    // Click again to toggle back to light mode
    await toggleButton.click();

    const isDarkAfterSecondToggle = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkAfterSecondToggle).toBe(false);
    await expect(toggleButton).toContainText("Dark Mode");
  });

  test("persists dark mode choice across page reload", async ({ page }) => {
    const toggleButton = page.locator('[data-testid="theme-toggle"]');
    await toggleButton.click();

    // Expect dark mode
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Reload page
    await page.reload();

    // Dark mode should remain active
    await expect(page.locator("html")).toHaveClass(/dark/);
    const persistedTheme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(persistedTheme).toBe("dark");
  });
});
