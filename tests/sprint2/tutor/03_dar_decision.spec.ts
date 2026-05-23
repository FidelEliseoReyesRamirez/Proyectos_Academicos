import { test } from '@playwright/test';

test('Tutor - Decisión proyecto', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.fill('input[type="email"]', 'tutor.qa@est.univalle.edu');
    await page.fill('input[type="password"]', 'Prueba123.');
    await page.click('[data-test="login-button"]');

    await page.waitForURL('**/dashboard');

    await page.getByRole('button', { name: 'Decisión del tutor' }).click();

    await page.getByLabel('Decisión *').selectOption('derivar');

    await page.getByRole('button', { name: 'Derivar a revisores' }).click();
});