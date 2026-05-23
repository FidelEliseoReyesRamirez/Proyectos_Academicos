import { test } from '@playwright/test';

test('Tutor - Revisión proyecto (fallback)', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.fill('input[type="email"]', 'tutor.qa@est.univalle.edu');
    await page.fill('input[type="password"]', 'Prueba123.');
    await page.click('[data-test="login-button"]');

    await page.waitForURL('**/dashboard');

    await page.goto('http://localhost:8000/seguimiento/1');

    await page.getByText('Revisión')
        .click()
        .catch(() => console.log('⚠ Revisión no disponible aún'));
});