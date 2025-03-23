import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('chrys@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('chryschrys');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForURL("http://localhost:3000");
  await page.getByRole('button', { name: 'chrys' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Create Category' }).click();
  await page.waitForURL("http://localhost:3000/dashboard/admin/create-category")
});

test('should add, update, and delete a category in one flow', async ({ page }) => {
  // empty input
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/name is required/i)).toBeVisible({ timeout: 1000 });

  // create test category: testCategory1
  await page.getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).fill('testCategory1');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/new category created/i)).toBeVisible({ timeout: 1000 });
  await expect(page.getByRole('cell', { name: 'testCategory1' })).toBeVisible();

  // create test category: testCategory2
  await page.getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).fill('testCategory2');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/new category created/i)).toBeVisible({ timeout: 1000 });
  await expect(page.getByRole('cell', { name: 'testCategory2' })).toBeVisible();

  // delete testCategory1
  await page.locator('tr', { hasText: 'testCategory1' }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(/category is deleted/i)).toBeVisible({ timeout: 1000 });
  await expect(page.getByRole('cell', { name: 'testCategory1' })).not.toBeVisible();

  // update testCategory2 to testCategory3
  await page.locator('tr', { hasText: 'testCategory2' }).getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('testCategory3');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/testCategory3 is updated/i)).toBeVisible({ timeout: 1000 });
  await expect(page.getByRole('cell', { name: 'testCategory3' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'testCategory2' })).not.toBeVisible();

  // clean up: delete testCategory3
  await page.locator('tr', { hasText: 'testCategory3' }).getByRole('button', { name: 'Delete' }).click();
});

test('should handle adding duplicates and updating to duplicates', async ({ page }) => {
  // create test category: testCategory1
  await page.getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).fill('testCategory1');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/new category created/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('cell', { name: 'testCategory1' })).toBeVisible();

  // attempt to add a duplicate category: testCategory1 (should fail)
  await page.getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).fill('testCategory1');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/category already exists/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('cell', { name: 'testCategory1' })).toHaveCount(1);

  // attempt to add a duplicate category:     testCategory1   (should fail)
  await page.getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).fill('    testCategory1  ');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/category already exists/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('cell', { name: 'testCategory1' })).toHaveCount(1);

  // create test category: testCategory2
  await page.getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('textbox', { name: 'Enter new category' }).fill('testCategory2');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/new category created/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('cell', { name: 'testCategory2' })).toBeVisible();

  // attempt to update testCategory2 to TESTCATEGORY1 (should fail)
  await page.getByRole('button', { name: 'Edit' }).nth(1).click();
  await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
  await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('TESTCATEGORY1');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/category with this name already exists/i)).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole('cell', { name: 'testCategory2' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'testCategory1' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Close' }).click();

  // clean up: delete testCategory1 and testCategory2
  await page.locator('tr', { hasText: 'testCategory1' }).getByRole('button', { name: 'Delete' }).click();
  await page.locator('tr', { hasText: 'testCategory2' }).getByRole('button', { name: 'Delete' }).click();
});
