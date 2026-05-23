import { test } from '@playwright/test';

test('TC-HU12-002 - Estudiante solo puede subir archivos con extensión permitida', async ({ page }) => {

    const url = 'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html';

    await page.goto(url);

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HU12-002 - Estudiante solo puede subir archivos con extensión permitida');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar que el estudiante solo pueda subir archivos con extensiones permitidas');

    // =========================
    // TIPOS DE PRUEBA (CORREGIDO)
    // =========================
    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();
    await page.locator('.tipo-chip[data-tipo="Seguridad"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================
    await page.fill('#tc-precond', 'Estudiante autenticado en módulo de subida de avances');
    await page.fill('#tc-datos', 'Extensiones permitidas: PDF, DOCX');

    // =========================
    // PASOS
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Ingresar al proyecto asignado');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Abrir opción subir avance');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Seleccionar archivo con extensión inválida');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Validar rechazo del sistema');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================
    await page.fill('#tc-esperado', 'El sistema solo permite archivos con extensiones válidas');

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
        path: 'tests/sprint2/tests/screenshots/TC-HU12-002.png',
        fullPage: true
    });

    // =========================
    // GUARDAR
    // =========================
    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});