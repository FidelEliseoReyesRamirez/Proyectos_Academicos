import { test } from '@playwright/test';

test('TC-HU7-003 - Permite cambiar de tutor', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HU7-003 - Permite cambiar de tutor');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar cambio de tutor en un proyecto existente');

    // =========================
    // TIPOS DE PRUEBA
    // =========================
    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================
    await page.fill('#tc-precond', 'Proyecto con tutor asignado');
    await page.fill('#tc-datos', 'Cambio de tutor QA TEST');

    // =========================
    // PASOS
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Abrir proyecto existente');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Seleccionar nuevo tutor');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Guardar cambios');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================
    await page.fill('#tc-esperado', 'El tutor es actualizado correctamente');

    // =========================
    // ESTADO
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Pass');
    });

    // =========================
    // SCREENSHOT
    // =========================
    await page.screenshot({
        path: 'tests/sprint2/tests/screenshots/TC-HU7-003.png',
        fullPage: true
    });

    // =========================
    // GUARDAR
    // =========================
    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});