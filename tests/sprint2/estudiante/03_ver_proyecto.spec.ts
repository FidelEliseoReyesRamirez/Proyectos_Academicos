import { test } from '@playwright/test';

test('Estudiante - Ver proyecto', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.fill('input[type="email"]', 'estudiante.qa@est.univalle.edu');
    await page.fill('input[type="password"]', 'Prueba123.');
    await page.click('[data-test="login-button"]');

    await page.waitForURL('**/dashboard');

    await page.getByRole('link', { name: 'QA TEST' }).click();
});