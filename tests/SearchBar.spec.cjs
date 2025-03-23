import { test, expect } from "@playwright/test";

test.describe("SearchBar", () => {
  test("search bar able to display product when logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('navigation').click();
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).nth(1)).toBeVisible();
  });

  test("search bar able to display product when not logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('navigation').click();
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).nth(1)).toBeVisible();
  });

  test("search bar does not change when empty when logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('navigation').click();
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('main')).toContainText('William 2025 Racing Kit$78.00Official Driver\'s Racing Kit...More DetailsAdd To Cart');
  });

  test("search bar does not change when empty when not logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('navigation').click();
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('main')).toContainText('William 2025 Racing Kit$78.00Official Driver\'s Racing Kit...More DetailsAdd To Cart');
  });
});
