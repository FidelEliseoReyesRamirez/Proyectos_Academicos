import { test, expect } from '@playwright/test';

test('Llenar Test Plan Sprint 1 - Bloquear último coordinador', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(3000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================

    await page.fill('#tc-titulo', 'TC-HU3-006 - Último coordinador bloqueado');

    await page.selectOption('#tc-sprint', { label: 'Sprint 1' });

    await page.fill('#tc-responsable', 'Victor Albarracin');

    await page.fill('#tc-desc', 'No permitir desactivar último coordinador');

    // =========================
    // TIPOS DE PRUEBA
    // =========================

    await page.locator('.tipo-group').scrollIntoViewIfNeeded();

    await page.locator('.tipo-chip[data-tipo="Seguridad"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================

    await page.fill('#tc-precond', 'Existe un solo coordinador');

    await page.fill('#tc-datos', 'Sistema con 1 coordinador');

    // =========================
    // PASOS
    // =========================

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Intentar eliminar último coordinador');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Validar restricción del sistema');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================

    await page.fill('#tc-esperado', 'Bloqueo del sistema');

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
        path: 'tests/sprint1/screenshots/TESTPLAN_TC-HU3-006.png',
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
        page.getByText('TC-HU3-006 - Último coordinador bloqueado')
    ).toBeVisible();

});