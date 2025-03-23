import { test, expect } from "@playwright/test";

test.describe("CartPage", () => {
  test("Log in and still able to see homepage and all products", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole('main').locator('div').filter({ hasText: 'William 2025 Racing Kit$78.00Official Driver\'s Racing Kit...More DetailsAdd To' }).nth(2)
  });

  test("able to add items to cart when logged in", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.locator('div.card:has-text("William")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("William");
    await expect(page.getByRole("main")).toContainText("Racing Kit");
    await expect(page.getByRole("main")).toContainText("$78");
  });

  test("successfully add multiple items to cart when logged in", async ({ page }) => {
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

  test("able to add items to cart when not logged in", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("main")).toContainText("Novel");
    await expect(page.getByRole("main")).toContainText("A bestselling novel");
    await expect(page.getByRole("main")).toContainText("Price : 14.99");
  });

  test("successfully add multiple items to cart when not logged in", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await page.locator('div.card:has-text("Novel")').locator('button:has-text("Add to Cart")').click();
    await page.locator('div.card:has-text("Laptop")').locator('button:has-text("Add to Cart")').click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByText("NovelA bestselling novelPrice : 14.99Remove")).toBeVisible();
    await expect(page.getByText("LaptopA powerful laptopPrice : 1499.99Remove")).toBeVisible();
    await expect(page.locator("h1")).toContainText("You have 2 items in your cart");
  });

  test("Log in and able to see more details and all products", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole('main').locator('div').filter({ hasText: 'William 2025 Racing Kit$78.00Official Driver\'s Racing Kit...More DetailsAdd To' }).nth(2).click();
    await page.locator('div.card:has-text("William")').locator('button:has-text("More Details")').click();
    await expect(page.getByText('Product DetailsName : William')).toBeVisible();
  });

  test("Not logged in and still able to see homepage and all products", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole('main').locator('div').filter({ hasText: 'William 2025 Racing Kit$78.00Official Driver\'s Racing Kit...More DetailsAdd To' }).nth(2).click();
    await page.locator('div.card:has-text("William")').locator('button:has-text("More Details")').click();
    await expect(page.getByText('Product DetailsName : William')).toBeVisible();
  });

  test("logged in and categoryfilter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(2); 
    await expect(page.getByText('Laptop$1,499.99A powerful')).toBeVisible();
    await expect(page.getByText('Racing Sim$1,200.00Comes with')).toBeVisible();
 });

 test("not logged in and category filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(2); 
    await expect(page.getByText('Laptop$1,499.99A powerful')).toBeVisible();
    await expect(page.getByText('Racing Sim$1,200.00Comes with')).toBeVisible();
 });


 test("logged in and multiple category filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(4); 
    await expect(page.getByText('Laptop$1,499.99A powerful')).toBeVisible();
    await expect(page.getByText('Racing Sim$1,200.00Comes with')).toBeVisible();
    await expect(page.getByText('NUS T-shirt$4.99Plain NUS T-')).toBeVisible();
    await expect(page.getByText('William 2025 Racing Kit$78.00Official Driver\'s Racing Kit...More DetailsAdd To')).toBeVisible(); 
 });

 test("not logged in and multiple category filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(4); 
    await expect(page.getByText('Laptop$1,499.99A powerful')).toBeVisible();
    await expect(page.getByText('Racing Sim$1,200.00Comes with')).toBeVisible();
    await expect(page.getByText('NUS T-shirt$4.99Plain NUS T-')).toBeVisible();
    await expect(page.getByText('William 2025 Racing Kit$78.00Official Driver\'s Racing Kit...More DetailsAdd To')).toBeVisible(); 
 });

 test("logged in and price filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByText('$0 to').click();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(2); 
    await expect(page.getByText('Novel$14.99A bestselling')).toBeVisible();
    await expect(page.getByText('NUS T-shirt$4.99Plain NUS T-')).toBeVisible();  
 });

 test("not logged in and price filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByText('$0 to').click();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(2); 
    await expect(page.getByText('Novel$14.99A bestselling')).toBeVisible();
    await expect(page.getByText('NUS T-shirt$4.99Plain NUS T-')).toBeVisible();  
 });

 test("logged in and reset filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await page.getByText('$0 to').click();
    await page.waitForTimeout(3000); 
    await page.getByRole('button', { name: 'RESET FILTERS' }).click();
    await page.waitForTimeout(3000); 
    const products2 = page.locator('div.card.m-2');
    const productCount2 = await products2.count();
    expect(productCount2).toBe(6);    
 });

 test("not logged in and reset filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByText('$40 to').click();
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.waitForTimeout(3000); 
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await page.waitForTimeout(3000); 
    await page.getByRole('button', { name: 'RESET FILTERS' }).click();
    await page.waitForTimeout(3000); 
    const products2 = page.locator('div.card.m-2');
    const productCount2 = await products2.count();
    expect(productCount2).toBe(6);   
 });

 test("logged in and price with category filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByText('$40 to').click();
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await page.waitForTimeout(3000); 
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(1); 
    await expect(page.getByText('The Law of Contract in Singapore$54.99A bestselling book in Singapore...More')).toBeVisible(); });

 test("not logged in and price with category filter works", async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByText('$40 to').click();
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.waitForTimeout(3000); 
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await page.waitForTimeout(3000); 
    const products = page.locator('div.card.m-2');
    const productCount = await products.count();
    expect(productCount).toBe(1); 
    await expect(page.getByText('The Law of Contract in Singapore$54.99A bestselling book in Singapore...More')).toBeVisible();
 });

 test("logged in and load more works", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await expect(page.getByText('Textbook$79.99A comprehensive')).toBeVisible();
 });

 test("not logged in and loadmore works", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole('button', { name: 'Loadmore' }).click();
    await expect(page.getByText('Textbook$79.99A comprehensive')).toBeVisible();
 });
});

