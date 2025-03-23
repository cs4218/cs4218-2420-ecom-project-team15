import { test, expect } from '@playwright/test';

test.describe('404 Page Not Found', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/non-existing-route'); // Update with your actual test URL
    });

    test('should display the 404 page with correct text', async ({ page }) => {
        await expect(page.locator('.pnf-title')).toHaveText('404');
        await expect(page.locator('.pnf-heading')).toHaveText('Oops ! Page Not Found');
    });

    test('should contain a "Go Back" button that navigates to home', async ({ page }) => {
        const goBackButton = page.locator('.pnf-btn');
        await expect(goBackButton).toBeVisible();

        // Click the "Go Back" button and check redirection
        await goBackButton.click();
        await expect(page).toHaveURL('http://localhost:3000/'); // Ensure it redirects to the home page
    });
});
