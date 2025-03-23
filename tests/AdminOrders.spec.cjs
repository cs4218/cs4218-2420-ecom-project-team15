import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForURL('http://localhost:3000/');
  await page.goto('http://localhost:3000/dashboard/admin/orders');
  await page.waitForURL('http://localhost:3000/dashboard/admin/orders');
});

test('Renders page', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('All Orders');
});

test('Renders orders and able to change order status', async ({ page }) => {
  // check if columns are rendered
  await expect(page.getByRole('main')).toContainText('#');
  await expect(page.getByRole('main')).toContainText('Status');
  await expect(page.getByRole('main')).toContainText('Buyer');
  await expect(page.getByRole('main')).toContainText('Date');
  await expect(page.getByRole('main')).toContainText('Payment');
  await expect(page.getByRole('main')).toContainText('Quantity');

  // change order status
  await page.getByText('Not Processed').first().click();
  await page.getByTitle('Processing').locator('div').click();
  await expect(page.getByRole('main')).toContainText('Processing');
  await page.waitForTimeout(2000);
  await page.locator('#root').getByTitle('Processing').click();
  await page.getByText('Not Processed').nth(3).click();
  await expect(page.getByRole('main')).toContainText('Not Processed');
});
