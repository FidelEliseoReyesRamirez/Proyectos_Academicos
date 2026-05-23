import { test, expect } from '@playwright/test';

test('Llenar Test Plan Sprint 1 - Crear usuario', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(3000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================

    await page.fill('#tc-titulo', 'TC-HU3-003 - Crear usuario');

    await page.selectOption('#tc-sprint', { label: 'Sprint 1' });

    await page.fill('#tc-responsable', 'Victor Albarracin');

    await page.fill('#tc-desc', 'Create user flow');

    // =========================
    // TIPOS DE PRUEBA
    // =========================

    await page.locator('.tipo-group').scrollIntoViewIfNeeded();

    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();
    await page.waitForTimeout(500);

    await page.locator('.tipo-chip[data-tipo="Interfaz"]').click();
    await page.waitForTimeout(500);

    // =========================
    // DETALLES EJECUCIÓN
    // =========================

    await page.fill('#tc-precond', 'Usuario coordinador logueado');

    await page.fill('#tc-datos', 'Nuevo usuario QA');

    // =========================
    // PASOS
    // =========================

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Ir a formulario de creación de usuario');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Registrar nuevo usuario');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================

    await page.fill('#tc-esperado', 'Usuario creado correctamente');

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
        path: 'tests/sprint1/screenshots/TESTPLAN_TC-HU3-003.png',
        fullPage: true
    });

    // =========================
    // GUARDAR
    // =========================

    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(5000);

    // =========================
    // VALIDACIÓN
    // =========================

    await expect(
        page.getByText('TC-HU3-003 - Crear usuario')
    ).toBeVisible();

});