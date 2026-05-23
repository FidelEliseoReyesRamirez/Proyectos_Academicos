import { test } from '@playwright/test';

test('TC-HU1-006 - Bloqueo tras 5 intentos fallidos', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    for (let i = 0; i < 5; i++) {

        await page.locator('input[type="email"]').fill('albarracinvictor251@gmail.com');

        await page.locator('input[type="password"]').fill('PasswordIncorrecto');

        await page.locator('button[type="submit"]').click();

        await page.waitForTimeout(1000);
    }

    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU1-006.png',
        fullPage: true
    });

});