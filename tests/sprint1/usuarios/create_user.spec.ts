import { test, expect } from '@playwright/test';

test('TC-HU3-003 - Coordinador crea usuario', async ({ page }) => {

    // Email único para evitar duplicados
    const email = `qa${Date.now()}@est.univalle.edu`;

    // Ir al login
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

    // Ir directamente al formulario
    await page.goto('http://localhost:8000/usuarios/crear');

    // Esperar carga
    await page.waitForURL('**/usuarios/crear');

    // Screenshot formulario
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-003_FORM.png',
        fullPage: true
    });

    // Llenar formulario
    await page.getByRole('textbox', {
        name: 'Nombre completo *'
    }).fill('Usuario QA');

    await page.getByRole('textbox', {
        name: 'Correo electrónico *'
    }).fill(email);

    await page.getByRole('textbox', {
        name: 'Número de celular'
    }).fill('64058970');

    await page.getByRole('textbox', {
        name: 'Contraseña temporal *'
    }).fill('PruebaUsuario1.');

    await page.getByRole('textbox', {
        name: 'Confirmar contraseña *'
    }).fill('PruebaUsuario1.');

    // Screenshot antes submit
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-003_DATA.png',
        fullPage: true
    });

    // Crear usuario
    await page.getByRole('button', {
        name: 'Crear usuario'
    }).click();

    // Esperar procesamiento
    await page.waitForTimeout(3000);

    // Validar que salió del formulario
    await expect(page).not.toHaveURL(/usuarios\/crear/);

    // Screenshot resultado
    await page.screenshot({
        path: 'tests/sprint1/tests/screenshots/TC-HU3-003_SUCCESS.png',
        fullPage: true
    });

});