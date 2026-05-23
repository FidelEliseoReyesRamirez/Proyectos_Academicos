import { test } from '@playwright/test';

test('TC-HIJO-016 - Subir avance del proyecto', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HIJO-016 - Subir avance del proyecto');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Estudiante sube avance del proyecto');

    // =========================
    // TIPOS
    // =========================
    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();

    // =========================
    // DETALLES
    // =========================
    await page.fill('#tc-precond', 'Estudiante autenticado con proyecto asignado');
    await page.fill('#tc-datos', 'Archivo de avance en PDF o DOCX');

    // =========================
    // PASOS
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Acceder al proyecto');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Subir archivo de avance');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Confirmar envío');
    });

    // =========================
    // RESULTADO
    // =========================
    await page.fill('#tc-esperado', 'Avance subido correctamente');

    // =========================
    // ESTADO
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Pass');
    });

    await page.screenshot({
        path: 'tests/sprint2/tests/screenshots/TC-HIJO-016.png',
        fullPage: true
    });

    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});