import { test } from '@playwright/test';

test('TC-HU3-005 - Coordinador desactiva usuario', async ({ page }) => {

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

    // Ir módulo usuarios
    await page.goto('http://localhost:8000/usuarios');

    // Screenshot inicial
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-005_TABLE.png',
        fullPage: true
    });

    // Click desactivar usuario
    await page.getByRole('button', {
        name: 'Desactivar',
        description: 'Desactivar a Usuario Desactivar',
        exact: true
    }).click();

    // Screenshot modal
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-005_MODAL.png',
        fullPage: true
    });

    // Confirmar desactivación
    await page.getByRole('button', {
        name: 'Sí, desactivar'
    }).click();

    // Esperar procesamiento
    await page.waitForTimeout(3000);

    // Screenshot resultado
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-005_SUCCESS.png',
        fullPage: true
    });

});