import { test, expect } from "@playwright/test";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test.describe("Categories Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/categories");
    });

    test("should display category buttons", async ({ page }) => {
        const categories = await page.locator('[data-testid="categories"]');
        await expect(categories).toHaveCount(3); // Ensure categories exist
    });

    test("should navigate to a category page when clicked", async ({ page }) => {
        const firstCategory = page.locator('[data-testid="categories"]').first();

        // Ensure at least one category is present
        await expect(firstCategory).toBeVisible();

        const categoryName = await firstCategory.innerText();

        await firstCategory.click();

        // Expect URL to include the category slug
        await expect(page).toHaveURL(new RegExp(`http://localhost:3000/category/.*`));

        await expect(page.locator('[data-testid="category-name"]')).toContainText(categoryName);

    });
});
