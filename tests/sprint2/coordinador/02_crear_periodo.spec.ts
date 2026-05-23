import { test } from '@playwright/test';

test('Coordinador - Crear periodo', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.fill('input[type="email"]', 'albarracinvictor251@gmail.com');
    await page.fill('input[type="password"]', 'Prueba123.');
    await page.click('[data-test="login-button"]');

    await page.waitForURL('**/dashboard');

    await page.getByRole('link', { name: 'Periodos' }).click();
    await page.getByRole('link', { name: 'Crear periodo' }).click();

    await page.locator('input').first().fill('2026-05-01');
    await page.locator('input').nth(1).fill('2026-05-31');

    await page.getByRole('button', { name: 'Confirmar Nuevo Periodo' }).click();
});