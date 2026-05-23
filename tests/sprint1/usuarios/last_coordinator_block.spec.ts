import { test, expect } from '@playwright/test';

test('TC-HU3-006 - No se puede desactivar al último coordinador', async ({ page }) => {

    await page.goto('http://localhost:8000/login');

    // Login coordinador
    await page.getByRole('textbox', {
        name: 'Correo electrónico *'
    }).fill('albarracinvictor251@gmail.com');

    await page.getByRole('textbox', {
        name: 'Contraseña * ¿Olvidaste tu'
    }).fill('Prueba123.');

    await page.locator('[data-test="login-button"]').click();

    // Esperar dashboard
    await page.waitForURL('**/dashboard');

    // Ir usuarios
    await page.goto('http://localhost:8000/usuarios');

    // Filtrar coordinadores
    await page.getByRole('button', {
        name: 'Todos los roles'
    }).click();

    await page.getByRole('button', {
        name: 'Coordinador'
    }).click();

    // Screenshot coordinadores
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-006_TABLE.png',
        fullPage: true
    });

    // Desactivar primer coordinador
    await page.getByRole('button', {
        name: 'Desactivar',
        description: 'Desactivar a QA Test',
        exact: true
    }).click();

    await page.getByRole('button', {
        name: 'Sí, desactivar'
    }).click();

    await page.waitForTimeout(3000);

    // Screenshot primer coordinador desactivado
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-006_FIRST_DISABLED.png',
        fullPage: true
    });

    // Intentar desactivar último coordinador
    await page.getByRole('button', {
        name: 'Desactivar',
        description: 'Desactivar a Victor Albarracin',
        exact: true
    }).click();

    await page.getByRole('button', {
        name: 'Sí, desactivar'
    }).click();

    // Esperar mensaje error
    await page.waitForTimeout(2000);

    // Validar mensaje restricción
    await expect(
        page.getByText('No puedes desactivar al último coordinador activo')
    ).toBeVisible();

    // Screenshot restricción
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-006_BLOCKED.png',
        fullPage: true
    });

});