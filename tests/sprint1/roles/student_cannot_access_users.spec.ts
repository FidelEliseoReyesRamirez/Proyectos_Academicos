import { test, expect } from '@playwright/test';

test('TC-HU3-002 - Estudiante no puede acceder a usuarios', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.locator('input[type="email"]').fill('estudiante.qa@est.univalle.edu');

    await page.locator('input[type="password"]').fill('Prueba123.');

    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dashboard');

    await page.goto('http://localhost:8000/usuarios');

    await page.waitForTimeout(2000);

    await expect(page).not.toHaveURL(/usuarios/);

    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-002.png',
        fullPage: true
    });

});