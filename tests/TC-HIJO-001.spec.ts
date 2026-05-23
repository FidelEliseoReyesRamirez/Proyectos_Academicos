import { test } from '@playwright/test';

test('TC-HIJIO-001 - Dashboard visual', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HIJIO-001 - Panel de Supervisión de Proyectos del Coordinador');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar dashboard visual del coordinador');

    // =========================
    // TIPOS DE PRUEBA
    // =========================
    await page.locator('.tipo-chip[data-tipo="Interfaz"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================
    await page.fill('#tc-precond', 'Coordinador con proyectos registrados');
    await page.fill('#tc-datos', 'Proyectos visibles en panel');

    // =========================
    // PASOS
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Ingresar al dashboard');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Visualizar panel de proyectos');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================
    await page.fill('#tc-esperado', 'El dashboard se muestra correctamente');

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
        path: 'tests/sprint2/tests/screenshots/TC-HIJIO-001.png',
        fullPage: true
    });

    // =========================
    // GUARDAR
    // =========================
    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});