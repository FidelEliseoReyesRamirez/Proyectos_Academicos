import { test, expect } from '@playwright/test';

test('Llenar Test Plan Sprint 1 - Desactivar usuario', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(3000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================

    await page.fill('#tc-titulo', 'TC-HU3-005 - Desactivar usuario');

    await page.selectOption('#tc-sprint', { label: 'Sprint 1' });

    await page.fill('#tc-responsable', 'Victor Albarracin');

    await page.fill('#tc-desc', 'Deactivate user');

    // =========================
    // TIPOS DE PRUEBA
    // =========================

    await page.locator('.tipo-group').scrollIntoViewIfNeeded();

    await page.locator('.tipo-chip[data-tipo="Seguridad"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================

    await page.fill('#tc-precond', 'Usuario activo');

    await page.fill('#tc-datos', 'Usuario QA');

    // =========================
    // PASOS
    // =========================

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Seleccionar usuario activo');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Desactivar usuario desde panel');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================

    await page.fill('#tc-esperado', 'Usuario desactivado');

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
        path: 'tests/sprint1/screenshots/TESTPLAN_TC-HU3-005.png',
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
        page.getByText('TC-HU3-005 - Desactivar usuario')
    ).toBeVisible();

});