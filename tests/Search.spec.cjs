import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test("search able to display product when logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('h6')).toContainText('Found 1');
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible();
  });

  test("search able to display product when not logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('h6')).toContainText('Found 1');
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible();
  });

  test("search able to add product to cart when logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Add To Cart' }).click();
    await expect(page.getByText('Item added to cart')).toBeVisible();
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('NUS T-shirtPlain NUS T-shirt for salePrice : 4.99Remove')).toBeVisible();
  });

  test("search able to add product to cart when not logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Add To Cart' }).click();
    await expect(page.getByText('Item added to cart')).toBeVisible();
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('NUS T-shirtPlain NUS T-shirt for salePrice : 4.99Remove')).toBeVisible();
  });

  test("search able to view more details when logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await page.getByRole('button', { name: 'More Details' }).click();
    await expect(page.locator('div').filter({ hasText: 'Product DetailsName : NUS T-' }).nth(2)).toBeVisible();
  });

  test("search able to view more details when not logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('shirt');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for sale\.\.\. \$ 4\.99More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await page.getByRole('button', { name: 'More Details' }).click();
    await expect(page.locator('div').filter({ hasText: 'Product DetailsName : NUS T-' }).nth(2)).toBeVisible();
  });

  test("search able to display multiple products when logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('racing');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^Racing SimComes with seat, wheels and pa\.\.\. \$ 1200More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await expect(page.getByRole('main').locator('div').filter({ hasText: 'William 2025 Racing' }).nth(3)).toBeVisible();
  });

  test("search able to display multiple products when not logged in", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.goto('http://localhost:3000/');
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('racing');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('div').filter({ hasText: /^Racing SimComes with seat, wheels and pa\.\.\. \$ 1200More DetailsAdd To Cart$/ }).first()).toBeVisible();
    await expect(page.getByRole('main').locator('div').filter({ hasText: 'William 2025 Racing' }).nth(3)).toBeVisible();
  });

});
