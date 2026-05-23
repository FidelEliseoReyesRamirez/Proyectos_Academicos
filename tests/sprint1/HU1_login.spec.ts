import { test, expect } from '@playwright/test';

test('HU1 - Login válido', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.locator('input[type="email"]').fill('albarracinvictor251@gmail.com');

    await page.locator('input[type="password"]').fill('Prueba123.');

    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dashboard');

    await expect(page).toHaveURL(/dashboard/);

    await page.screenshot({
        path: 'tests/screenshots/login_ok.png',
        fullPage: true
    });

});