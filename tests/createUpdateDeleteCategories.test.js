import { test, expect } from "@playwright/test";

test("Create, Update, and Delete a Category", async ({ page }) => {
  // Navigate to category management page
  await page.goto("http://localhost:3000/admin/categories");

  // Create a new category
  await page.fill("input[name='categoryName']", "Test Category");
  await page.click("button:has-text('Add Category')");

  // Wait for success message
  await expect(page.locator("text=Test Category is created")).toBeVisible();

  // Edit the newly created category
  await page.click("tr:has-text('Test Category') button:has-text('Edit')");
  await page.fill("input[name='categoryName']", "Updated Category");
  await page.click("button:has-text('Save')");

  // Wait for update confirmation
  await expect(page.locator("text=Updated Category is updated")).toBeVisible();

  // Delete the category
  await page.click("tr:has-text('Updated Category') button:has-text('Delete')");
  await page.click("button:has-text('Confirm')"); // Assuming a confirmation dialog

  // Wait for deletion confirmation
  await expect(page.locator("text=Category is deleted")).toBeVisible();

  // Verify the category no longer exists
  await expect(page.locator("text=Updated Category")).not.toBeVisible();
});
