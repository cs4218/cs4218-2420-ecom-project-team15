import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('user@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForURL('http://localhost:3000/');
  await page.goto('http://localhost:3000/dashboard/user');
  await page.waitForURL('http://localhost:3000/dashboard/user');
});

test('Verify user details and UserMenu links', async ({ page }) => {
  // check user name, email and address
  await expect(page.getByRole('main')).toContainText('user');
  await expect(page.getByRole('main')).toContainText('user@test.com');
  await expect(page.getByRole('main')).toContainText('Main St 123');

  const profileLink = page.getByRole('link', { name: 'Profile' });
  await expect(profileLink).toBeVisible();
  await profileLink.click();
  await page.waitForURL('http://localhost:3000/dashboard/user/profile');
  await expect(page.url()).toBe('http://localhost:3000/dashboard/user/profile');

  await page.goto('http://localhost:3000/dashboard/user');

  const ordersLink = page.getByRole('link', { name: 'Orders' });
  await expect(ordersLink).toBeVisible();
  await ordersLink.click();
  await page.waitForURL('http://localhost:3000/dashboard/user/orders');
  await expect(page.url()).toBe('http://localhost:3000/dashboard/user/orders');
});