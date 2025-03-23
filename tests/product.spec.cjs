// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
});

// test.describe.configure({ mode: 'serial' });

test.describe('View Product', () => {
    test('should show the product list', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Filter By Category' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Filter By Price' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'RESET FILTERS' })).toBeVisible();
    });
    test('should show the product details', async ({ page }) => {
        // click on the first product, "more details"
        const firstProductName = await page.locator('.card-title').first().textContent() || '';
        await page.locator('.card-name-price > button').first().click();
        await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
        await expect(page.getByRole('img', { name: firstProductName })).toBeVisible();
        await expect(page.getByRole('heading', { name: "Name : " + firstProductName })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Description : .+/ })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Price : $' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Category :' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Similar Products ➡️' })).toBeVisible();
        if (await page.getByText('No Similar Products found').isVisible()) {
            await expect(page.getByText('No Similar Products found')).toBeVisible();
        } else {
            await expect(page.locator('.card-title').first()).toBeVisible();
            const similarProduct = await page.locator('.card-title').first().textContent() || '';
            await expect(page.getByRole('img', { name: similarProduct })).toBeVisible();
            await expect(page.getByRole('heading', { name: "Name : " + firstProductName })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Category :' })).toBeVisible();
            await expect(page.getByRole('heading', { name: /Description : .+/ })).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Price : $' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(1)).toBeVisible();
        }
    });
    test('should show additional products when load more is clicked', async ({ page }) => {
        if (await page.getByRole('button', { name: 'Loadmore' }).isVisible()) {
            await page.getByRole('button', { name: 'Loadmore' }).click();
            const initialProductCount = await page.locator('.card').count();
            await page.getByRole('button', { name: 'Loadmore' }).click();
            await page.waitForSelector('.card:nth-child(' + (initialProductCount + 1) + ')');
            const newProductCount = await page.locator('.card').count();
            await expect(newProductCount).toBeGreaterThan(initialProductCount);
        }
    });
});

test.describe('Add to Cart', () => {
    test('should add product to cart from product list page', async ({ page }) => {
        const firstProductName = await page.locator('.card-title').first().textContent() || '';
        await page.locator('.card-name-price > button:nth-child(2)').first().click();
        await expect(page.getByRole('superscript')).toContainText('1');
        await page.getByRole('link', { name: 'Cart' }).click();
        await page.waitForSelector('.card');
        await expect(page.getByRole('heading', { name: 'Hello Guest You have 1 item' })).toBeVisible();
        await expect(page.getByRole('img', { name: firstProductName })).toBeVisible();
        await expect(page.getByText(firstProductName).first()).toBeVisible();
        await expect(page.getByText('Price :')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Cart Summary' })).toBeVisible();
        await expect(page.getByText('Total | Checkout | Payment')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Total : $' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Please login to checkout' })).toBeVisible();
    });
    test('should be able to add product to cart from product details page', async ({ page }) => {
        await page.waitForLoadState('networkidle');
        const firstProductName = await page.locator('.card-title').first().textContent() || '';
        await page.locator('.card-name-price > button').first().click();
        // wait for page to fully load before proceeding
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
        await expect(page.getByRole('superscript')).toContainText('1');
        await page.getByRole('link', { name: 'Cart' }).click();
        await expect(page.getByRole('heading', { name: 'Hello Guest You have 1 item' })).toBeVisible();
        await expect(page.getByRole('img', { name: firstProductName })).toBeVisible();
        await expect(page.getByText(firstProductName).first()).toBeVisible();
        await expect(page.getByText('Price :')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Cart Summary' })).toBeVisible();
        await expect(page.getByText('Total | Checkout | Payment')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Total : $' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Please login to checkout' })).toBeVisible();
    });

    test('should be able to login and checkout product from cart page', async ({ page }, testInfo) => {
        const firstProductName = await page.locator('.card-title').first().textContent() || '';
        await page.locator('.card-name-price > button:nth-child(2)').first().click();
        await page.getByRole('link', { name: 'Cart' }).click();
        await page.getByRole('button', { name: 'Please login to checkout' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('tester01@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester01pw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByRole('heading', { name: 'Hello tester01 You have 1' })).toBeVisible();
        // check that the button is now changed to make payment
        await expect(page.getByRole('button', { name: 'Make Payment' })).toBeVisible();
    });

});

test.describe('Admin View Products', () => {
    test('should show product list', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin01@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin01pw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'admin01' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByRole('heading', { name: 'All Products List' })).toBeVisible();
        await page.waitForTimeout(2000);
        await page.waitForSelector('.card');
        const newProductCount = await page.locator('.card').count();
        await expect(newProductCount).toBeGreaterThan(0);
    });

    test('should show product details when clicked', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin01@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin01pw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByRole('navigation')).toBeVisible();
        await page.getByRole('button', { name: 'admin01' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await page.waitForTimeout(2000);
        await page.waitForSelector('.card');
        const firstProductName = await page.locator('.card-title').first().textContent() || '';
        await page.locator('.card').first().click();
        await page.getByRole('heading', { name: 'Update Product' }).click();
        await expect(page.getByRole('textbox', { name: 'write a name' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'write a name' })).toHaveValue(firstProductName);
        await expect(page.getByRole('textbox', { name: 'write a description' })).toBeVisible();
        await expect(page.getByPlaceholder('write a Price')).toBeVisible();
        await expect(page.getByPlaceholder('write a quantity')).toBeVisible();
        await expect(page.getByRole('button', { name: 'UPDATE PRODUCT' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'DELETE PRODUCT' })).toBeVisible();
    });
});

test.describe.serial('View Profile', () => {
    test('should show user profile after logging in', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('tester01@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester01pw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByRole('navigation')).toBeVisible();
        await page.getByRole('button', { name: 'tester01' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Profile' }).click();
        // wait for page to fully load before proceeding
        await page.waitForTimeout(2000);
        await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('tester01');
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue('tester01@gmail.com');
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('12345678');
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('123 Avenue Street');
        await expect(page.getByRole('button', { name: 'UPDATE' })).toBeVisible();
    });

    test('should update user profile', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('tester01@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester01pw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'tester01' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Profile' }).click();
        // wait for page to fully load before proceeding
        await page.waitForTimeout(2000);
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('tester01changed');
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeDisabled();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester01pwchanged');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('87654321');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('321 Avenue Street');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('tester01changed');
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('87654321');
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('321 Avenue Street');

        // reset back to original values
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('tester01');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('12345678');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester01pw');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('123 Avenue Street');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(2000);
    });

    test('should display toast errors when updating profile with invalid data', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('tester01@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester01pw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'tester01' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Profile' }).click();
        // wait for page to fully load before proceeding
        await page.waitForTimeout(2000);
        await page.reload();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('tester01');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('test');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();

        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByText('Profile Updated Successfully')).toBeVisible();

        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('123');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByText('Phone number must be 8 or 10 digits long')).toBeVisible();

        await page.waitForTimeout(2000);
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('123456789');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(2000);
        await expect(page.getByText('Phone number must be 8 or 10 digits long')).toBeVisible();
    });
        
});