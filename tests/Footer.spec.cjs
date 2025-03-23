import { test, expect } from '@playwright/test';

test.describe('Footer Component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('should render the footer with correct text', async ({ page }) => {
        const footer = page.locator('.footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText('All Rights Reserved © TestingComp');
    });

    test('should contain correct navigation links', async ({ page }) => {
        const aboutLink = page.locator('text=About');
        const contactLink = page.locator('text=Contact');
        const policyLink = page.locator('text=Privacy Policy');

        await expect(aboutLink).toBeVisible();
        await expect(contactLink).toBeVisible();
        await expect(policyLink).toBeVisible();
    });

    test('should navigate to About page when About link is clicked', async ({ page }) => {
        await page.click('text=About');
        await expect(page).toHaveURL(/about/);
    });

    test('should navigate to Contact page when Contact link is clicked', async ({ page }) => {
        await page.click('text=Contact');
        await expect(page).toHaveURL(/contact/);
    });

    test('should navigate to Privacy Policy page when Privacy Policy link is clicked', async ({ page }) => {
        await page.click('text=Privacy Policy');
        await expect(page).toHaveURL(/policy/);
    });
});
