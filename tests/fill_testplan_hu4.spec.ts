import { test, expect } from '@playwright/test';

test('Llenar Test Plan Sprint 1 - Editar usuario', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(3000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================

    await page.fill('#tc-titulo', 'TC-HU3-004 - Editar usuario');

    await page.selectOption('#tc-sprint', { label: 'Sprint 1' });

    await page.fill('#tc-responsable', 'Victor Albarracin');

    await page.fill('#tc-desc', 'Edit user data');

    // =========================
    // TIPOS DE PRUEBA
    // =========================

    await page.locator('.tipo-group').scrollIntoViewIfNeeded();

    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================

    await page.fill('#tc-precond', 'Usuario existente');

    await page.fill('#tc-datos', 'Usuario QA');

    // =========================
    // PASOS
    // =========================

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Buscar usuario existente');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Editar información del usuario');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================

    await page.fill('#tc-esperado', 'Datos actualizados');

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
        path: 'tests/sprint1/screenshots/TESTPLAN_TC-HU3-004.png',
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
        page.getByText('TC-HU3-004 - Editar usuario')
    ).toBeVisible();

});