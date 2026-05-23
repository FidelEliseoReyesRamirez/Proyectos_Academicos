import { test, expect } from '@playwright/test';

test('TC-HU1-005 - Usuario inactivo no puede iniciar sesión', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.locator('input[type="email"]').fill('usuario.inactivo@gmail.com');

    await page.locator('input[type="password"]').fill('Prueba123.');

    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/login/);

    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU1-005.png',
        fullPage: true
    });

});