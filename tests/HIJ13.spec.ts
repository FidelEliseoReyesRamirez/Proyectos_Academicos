import { test } from '@playwright/test';

test('TC-HIJ13-001 - Se puede devolver documentos al estudiante', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HIJ13-001 - Se puede devolver documentos del proyecto');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar devolución de documentos al estudiante');

    // =========================
    // TIPOS DE PRUEBA
    // =========================
    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================
    await page.fill('#tc-precond', 'Documento enviado por estudiante');
    await page.fill('#tc-datos', 'Archivo de avance del proyecto');

    // =========================
    // PASOS
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Abrir documento');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Revisar contenido');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Devolver documento con observaciones');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================
    await page.fill('#tc-esperado', 'Documento devuelto correctamente');

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
        path: 'tests/sprint2/tests/screenshots/TC-HIJ13-001.png',
        fullPage: true
    });

    // =========================
    // GUARDAR
    // =========================
    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});