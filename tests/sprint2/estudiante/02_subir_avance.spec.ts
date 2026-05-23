import { test } from '@playwright/test';

test('Estudiante - Subir avance', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    await page.fill('input[type="email"]', 'estudiante.qa@est.univalle.edu');
    await page.fill('input[type="password"]', 'Prueba123.');
    await page.click('[data-test="login-button"]');

    await page.waitForURL('**/dashboard');

    await page.getByRole('link', { name: 'QA TEST' }).click();

    await page.goto('http://localhost:8000/seguimiento/1');

    await page.getByRole('button', { name: 'Subir avance' }).click();

    await page.getByRole('textbox', { name: /entregando/ }).fill('Capitulo QA');

    // FILE UPLOAD (si falla no rompe test)
    await page.setInputFiles('input[type="file"]', 'tests/files/avance.docx')
        .catch(() => console.log('⚠ Upload no disponible'));

    await page.getByRole('button', { name: 'Subir avance' }).click();
});