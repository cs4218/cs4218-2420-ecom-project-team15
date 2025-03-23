import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('chrys@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('chryschrys');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'chrys' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill('testingCategory');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('link', { name: 'Create Product' }).click();
});

test('should add, update and delete a product in one flow', async ({ page }) => {
    // create product
    await page.locator(".ant-select-selection-search-input").nth(0).click();
    await page.getByTitle('testingCategory').locator('div').click();
    await page.getByLabel('Upload Photo').setInputFiles("./client/public/images/a2.png");
    await page.getByRole('textbox', { name: 'write a name' }).click();
    await page.getByRole('textbox', { name: 'write a name' }).fill('testingProduct1');
    await page.getByRole('textbox', { name: 'write a description' }).click();
    await page.getByRole('textbox', { name: 'write a description' }).fill('testingDecription1');
    await page.getByPlaceholder('write a Price').click();
    await page.getByPlaceholder('write a Price').fill('25');
    await page.getByPlaceholder('write a quantity').click();
    await page.getByPlaceholder('write a quantity').fill('5');
    await page.locator(".ant-select-selection-search-input").nth(1).click();
    await page.getByTitle('Yes').click();
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

    await page.getByText('testingProduct1').click();
    await expect(page.getByTitle('testingCategory')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'write a name' })).toHaveValue("testingProduct1");
    await expect(page.getByRole('textbox', { name: 'write a description' })).toHaveValue("testingDecription1");
    await expect(page.getByPlaceholder('write a Price')).toHaveValue("25");
    await expect(page.getByPlaceholder('write a quantity')).toHaveValue("5");
    await expect(page.getByTitle('Yes')).toBeVisible();

    // update product
    await page.getByRole('textbox', { name: 'write a name' }).click();
    await page.getByRole('textbox', { name: 'write a name' }).fill('testingProduct2');
    await page.getByPlaceholder('write a Price').click();
    await page.getByPlaceholder('write a Price').fill('30');
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

    await page.getByText('testingProduct2').click();
    await expect(page.getByRole('textbox', { name: 'write a name' })).toHaveValue("testingProduct2");
    await expect(page.getByPlaceholder('write a Price')).toHaveValue("30");

    // delete product
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept("y");
    });
    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/admin/products"); // wait for product to be successfully deleted
    await expect(page.getByText('testingProduct2')).not.toBeVisible();

    // clean up: delete category
    await page.getByRole('link', { name: 'Create Category' }).click();
    await page.locator('tr', { hasText: 'testingCategory' }).getByRole('button', { name: 'Delete' }).click();
});