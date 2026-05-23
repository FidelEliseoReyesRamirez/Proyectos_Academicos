import { test, expect } from '@playwright/test';

test('TC-HU1-003 - Campos vacíos', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/login/);

    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU1-003.png',
        fullPage: true
    });

});