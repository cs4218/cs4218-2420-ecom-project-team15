import { test, expect } from "@playwright/test";

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
});

test('should display all products under a category', async ({ page }) => {
    // Create test category: testsCategory
    await page.getByRole('link', { name: 'Create Category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill('testsCategory');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Create product: testsProduct1
    await page.getByRole('link', { name: 'Create Product' }).click();
    await page.locator(".ant-select-selection-search-input").first().click();
    await page.getByTitle('testsCategory').locator('div').click();
    await page.getByLabel('Upload Photo').setInputFiles("./client/public/images/a2.png");
    await page.getByRole('textbox', { name: 'write a name' }).click();
    await page.getByRole('textbox', { name: 'write a name' }).fill('testsProduct1');
    await page.getByRole('textbox', { name: 'write a description' }).click();
    await page.getByRole('textbox', { name: 'write a description' }).fill('testsDescription1');
    await page.getByPlaceholder('write a Price').click();
    await page.getByPlaceholder('write a Price').fill('25');
    await page.getByPlaceholder('write a quantity').click();
    await page.getByPlaceholder('write a quantity').fill('5');
    await page.locator(".ant-select-selection-search-input").nth(1).click();
    await page.getByTitle('Yes').click();
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/admin/products");

    // create product: testsProduct2
    await page.getByRole('link', { name: 'Create Product' }).click();
    await page.locator(".ant-select-selection-search-input").first().click();
    await page.getByTitle('testsCategory').locator('div').click();
    await page.getByLabel('Upload Photo').setInputFiles("./client/public/images/a2.png");
    await page.getByRole('textbox', { name: 'write a name' }).click();
    await page.getByRole('textbox', { name: 'write a name' }).fill('testsProduct2');
    await page.getByRole('textbox', { name: 'write a description' }).click();
    await page.getByRole('textbox', { name: 'write a description' }).fill('testsDescription2');
    await page.getByPlaceholder('write a Price').click();
    await page.getByPlaceholder('write a Price').fill('25');
    await page.getByPlaceholder('write a quantity').click();
    await page.getByPlaceholder('write a quantity').fill('5');
    await page.locator(".ant-select-selection-search-input").nth(1).click();
    await page.getByTitle('Yes').click();
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

    // view products under testsCategory 
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'testsCategory', exact: true }).click();
    await expect(page.getByText('testsProduct1')).toBeVisible();
    await expect(page.getByText('testsProduct2')).toBeVisible();

    // clean up
    await page.getByRole('button', { name: 'chrys' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    // clean up: delete category
    await page.getByRole('link', { name: 'Create Category' }).click();
    await page.locator('tr', { hasText: 'testsCategory' }).getByRole('button', { name: 'Delete' }).click();
    // clean up: delete products
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByText('testsProduct1').click();
    await expect(page.getByRole('textbox', { name: 'write a name' })).toHaveValue("testsProduct1"); // wait for product to load
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept("y");
    });
    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/admin/products"); // wait for product to be successfully deleted
    await page.getByText('testsProduct2').click();
    await expect(page.getByRole('textbox', { name: 'write a name' })).toHaveValue("testsProduct2"); // wait for product to load
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept("y");
    });
    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/admin/products"); // wait for product to be successfully deleted
});
