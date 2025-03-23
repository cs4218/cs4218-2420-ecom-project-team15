import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("CartPage", () => {
  test("successfully add items to cart", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
  });

  test("successfully add items to cart and removed", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).not.toBeVisible();
  });

  test("successfully add multiple items to cart", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.locator('div.card:has-text("Laptop")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await expect(page.getByText("LaptopA powerful laptopPrice : 1499.99Remove")).toBeVisible();
    await expect(page.locator("h1")).toContainText("You have 2 items in your cart");
  });

  test("successfully add some item to cart and then add more to cart", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await page.getByRole("link", { name: "Home" }).click();
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await page.locator('div.card:has-text("Laptop")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await expect(page.getByText("LaptopA powerful laptopPrice : 1499.99Remove")).toBeVisible();
  });

  test("price displayed is correct", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.locator('div.card:has-text("Laptop")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await expect(page.getByText("LaptopA powerful laptopPrice : 1499.99Remove")).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Total : $1,514.98');
  });

  test("successfully change address", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole("link", { name: "Cart" }).click();
    await page.getByRole("button", { name: "Update Address" }).click();
    await page.getByRole("textbox", { name: "Enter Your Address" }).click();
    await page.getByRole("textbox", { name: "Enter Your Address" }).fill("New Address");
    await page.getByRole("button", { name: "UPDATE" }).click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.locator("h5")).toContainText("New Address");
  });

  test("able to make payment", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
    await expect(page.locator(".mt-2")).toBeVisible();
  });

  test("able to change payment methods", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
    await page.getByRole("button", { name: "Paying with Card" }).click();
    await page.getByRole("button", { name: "Choose another way to pay" }).click();
    await expect(page.getByRole("button", { name: "Paying with PayPal" })).toBeVisible();
  });

  test("not logged in cart prompts to log in", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Plase Login to checkout");
  });

  test("cannot checkout when not logged in", async ({ page }) => {
    await page.goto("http://localhost:3000/");    
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("listitem").filter({ hasText: "Cart1" }).click();
    await expect(page.locator(".mt-2")).not.toBeVisible();
  });

  test("not log in still can successfully add items to cart", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
  });

  test("not logged in still can successfully add multiple items to cart", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.locator('div.card:has-text("Laptop")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await expect(page.getByText("LaptopA powerful laptopPrice : 1499.99Remove")).toBeVisible();
    await expect(page.locator("h1")).toContainText("You have 2 items in your cart");
  });

  test("not logged in still can successfully add some item to cart and then add more to cart", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await page.getByRole("link", { name: "Home" }).click();
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await page.locator('div.card:has-text("Laptop")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await expect(page.getByText("LaptopA powerful laptopPrice : 1499.99Remove")).toBeVisible();
  });

  test("not logged in but price displayed is correct", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.locator('div.card:has-text("Laptop")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await expect(page.getByText("LaptopA powerful laptopPrice : 1499.99Remove")).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Total : $1,514.98');
  });

  test("not logged in successfully add items to cart and removed", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).not.toBeVisible();
  });

  test("able to see pay by card t&c", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
    await page.getByRole("button", { name: "Paying with Card" }).click();
    await page.waitForSelector("role=link >> text=By paying with my card, I");
    await page.getByRole("link", { name: "By paying with my card, I" }).click();
    const page1Promise = page.waitForEvent("popup", { timeout: 60000 });
    const page1 = await page1Promise;
    await expect(page1.getByTestId("heroSection-container").getByRole("heading")).toContainText(
      "Legal Agreements for PayPal Services"
    );
  });
});
