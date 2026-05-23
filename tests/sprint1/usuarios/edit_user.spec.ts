import { test } from '@playwright/test';

test('TC-HU3-004 - Coordinador edita usuario', async ({ page }) => {

    // ID REAL DEL USUARIO
    const userId = 7;

    await page.goto('http://localhost:8000/login');

    await page.getByRole('textbox', {
        name: 'Correo electrónico *'
    }).fill('albarracinvictor251@gmail.com');

    await page.getByRole('textbox', {
        name: 'Contraseña * ¿Olvidaste tu'
    }).fill('Prueba123.');

    await page.locator('[data-test="login-button"]').click();

    await page.waitForURL('**/dashboard');

    // Ir directo a editar
    await page.goto(`http://localhost:8000/usuarios/${userId}/editar`);

    // Esperar carga
    await page.waitForTimeout(3000);

    // Screenshot inicial
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-004_FORM.png',
        fullPage: true
    });

    // Editar nombre
    await page.locator('input').first().fill('Usuario Editado QA');

    // Screenshot datos editados
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-004_DATA.png',
        fullPage: true
    });

    // Guardar cambios
    await page.locator('button[type="submit"]').click();

    // Esperar procesamiento
    await page.waitForTimeout(3000);

    // Screenshot resultado
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-004_SUCCESS.png',
        fullPage: true
    });

});