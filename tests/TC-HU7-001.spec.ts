import { test } from '@playwright/test';

test('TC-HU7-001 - Crear proyecto y asignar tutor-estudiante', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HU7-001 - Crear proyecto y asignar tutor-estudiante');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Coordinador crea proyecto y asigna tutor y estudiante');

    // =========================
    // TIPOS DE PRUEBA
    // =========================
    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();
    await page.locator('.tipo-chip[data-tipo="Interfaz"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================
    await page.fill('#tc-precond', 'Coordinador autenticado en el sistema');
    await page.fill('#tc-datos', 'Proyecto QA TEST con asignación de roles');

    // =========================
    // PASOS
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Crear proyecto QA TEST');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Asignar estudiante QA');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Asignar tutor QA');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================
    await page.fill('#tc-esperado', 'Proyecto creado y asignado correctamente');

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
        path: 'tests/sprint2/tests/screenshots/TC-HU7-001.png',
        fullPage: true
    });

    // =========================
    // GUARDAR
    // =========================
    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});