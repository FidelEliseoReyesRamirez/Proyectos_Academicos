import { test, expect } from '@playwright/test';

test('Llenar Test Plan Sprint 1', async ({ page }) => {

    // Abrir HTML local
    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    // Esperar carga
    await page.waitForTimeout(3000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================

    await page.fill(
        '#tc-titulo',
        'TC-HU1-001 - Login válido'
    );

    await page.selectOption(
        '#tc-sprint',
        { label: 'Sprint 1' }
    );

    await page.fill(
        '#tc-responsable',
        'Victor Albarracin'
    );

    await page.fill(
        '#tc-desc',
        'Verificar que un usuario válido pueda iniciar sesión correctamente.'
    );

    // =========================
    // TIPOS DE PRUEBA
    // =========================

    // Scroll sección tipos
    await page.locator('.tipo-group')
        .scrollIntoViewIfNeeded();

    await page.waitForTimeout(1000);

    // Seleccionar Interfaz
    await page.locator('.tipo-chip[data-tipo="Interfaz"]')
        .click();

    await page.waitForTimeout(500);

    // Seleccionar Regresión
    await page.locator('.tipo-chip[data-tipo="Regresión"]')
        .click();

    await page.waitForTimeout(500);

    // =========================
    // DETALLES EJECUCIÓN
    // =========================

    await page.fill(
        '#tc-precond',
        'El usuario debe estar registrado y activo.'
    );

    await page.fill(
        '#tc-datos',
        'Email: qa.coordinador@est.univalle.edu / Password: Prueba123.'
    );

    // =========================
    // PASOS
    // =========================

    // Agregar primer paso
    await page.evaluate(() => {
        // @ts-ignore
        addPaso();
    });

    await page.waitForTimeout(500);

    await page.locator('.paso-input')
        .first()
        .fill('Ingresar correo y contraseña válidos.');

    // Agregar segundo paso
    await page.evaluate(() => {
        // @ts-ignore
        addPaso();
    });

    await page.waitForTimeout(500);

    await page.locator('.paso-input')
        .nth(1)
        .fill('Presionar el botón Iniciar Sesión.');

    // =========================
    // RESULTADO ESPERADO
    // =========================

    await page.fill(
        '#tc-esperado',
        'El sistema redirecciona correctamente al dashboard.'
    );

    // =========================
    // ESTADO PASS
    // =========================

    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Pass');
    });

    await page.waitForTimeout(1000);

    // =========================
    // SCREENSHOT
    // =========================

    await page.screenshot({
        path: 'tests/sprint1/screenshots/TESTPLAN_TC-HU1-001.png',
        fullPage: true
    });

    // =========================
    // GUARDAR
    // =========================

    await page.getByRole('button', {
        name: '✦ Guardar Test Case'
    }).scrollIntoViewIfNeeded();

    await page.waitForTimeout(1000);

    await page.getByRole('button', {
        name: '✦ Guardar Test Case'
    }).click();

    // Esperar guardado Firebase
    await page.waitForTimeout(5000);

    // =========================
    // VALIDACIÓN
    // =========================

    await expect(
        page.getByText('TC-HU1-001 - Login válido')
    ).toBeVisible();

});