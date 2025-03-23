import { test, expect } from '@playwright/test';

test.describe('Header Component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000'); // Update with your actual test URL
    });

    test('should display navbar with correct links', async ({ page }) => {
        await expect(page.locator('.navbar')).toBeVisible();
        await expect(page.locator('.nav-link', { hasText: 'Home' })).toBeVisible();
        await expect(page.locator('.nav-link', { hasText: 'Categories' })).toBeVisible();
        await expect(page.locator('.nav-link', { hasText: 'Login' })).toBeVisible();
        await expect(page.locator('.nav-link', { hasText: 'Register' })).toBeVisible();
        await expect(page.locator('.nav-link', { hasText: 'Cart' })).toBeVisible();
    });

    test('should open categories dropdown when clicked', async ({ page }) => {
        await page.locator('.nav-link.dropdown-toggle', { hasText: 'Categories' }).click();
        await expect(page.locator('.dropdown-menu')).toBeVisible();
    });

    test('should show user dropdown when logged in', async ({ page }) => {
        // Mock login state
        await page.evaluate(() => {
            localStorage.setItem('auth', JSON.stringify({ user: { name: 'TestUser', role: 0 } }));
        });

        await page.reload();

        await expect(page.locator('nav')).toContainText('TestUser');
        await page.locator('.nav-link.dropdown-toggle', { hasText: 'TestUser' }).click();
        const userDropdown = page.getByTestId('user-dropdown-menu');
        await expect(userDropdown).toBeVisible();
    });

    test('should display correct cart count', async ({ page }) => {
        // Mock cart with 2 items
        await page.evaluate(() => {
            localStorage.setItem('cart', JSON.stringify([{ id: 1 }, { id: 2 }]));
        });

        await page.reload();

        await expect(page.locator('.ant-badge-count')).toHaveText('2');
    });

    test('should logout user when logout is clicked', async ({ page }) => {
        // Mock login state
        await page.evaluate(() => {
            localStorage.setItem('auth', JSON.stringify({ user: { name: 'TestUser', role: 0 } }));
        });

        await page.reload();
        await page.locator('.nav-link.dropdown-toggle', { hasText: 'TestUser' }).click();
        await page.locator('.dropdown-item', { hasText: 'Logout' }).click();

        await expect(page).toHaveURL('http://localhost:3000/login');
    });
});
