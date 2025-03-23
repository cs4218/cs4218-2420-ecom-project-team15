import { test, expect } from "@playwright/test";

test.describe("AboutPage", () => {
  test("about page renders when not logged in", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "About" }).click();
    await expect(page.getByRole("main")).toContainText("Welcome to Virtual Vault");
  });

  test("about page renders when logged in", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill("glenn.ong13@gmail.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill("Qwerty1234567890");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForSelector("role=list >> text=glenn");
    await page.getByRole("link", { name: "About" }).click();
    await expect(page.getByRole("main")).toContainText("Welcome to Virtual Vault");
  });
});
