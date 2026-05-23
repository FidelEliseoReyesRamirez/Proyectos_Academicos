import { test } from '@playwright/test';

test('TC-HU9-001 - Tutor solo puede ver sus proyectos asignados', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HU9-001 - Tutor solo puede ver sus proyectos asignados');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar que el tutor solo vea proyectos asignados');

    // =========================
    // TIPOS DE PRUEBA
    // =========================
    await page.locator('.tipo-chip[data-tipo="Seguridad"]').click();

    // =========================
    // DETALLES EJECUCIÓN
    // =========================
    await page.fill('#tc-precond', 'Tutor autenticado con proyectos asignados');
    await page.fill('#tc-datos', 'Vista de proyectos filtrada por tutor');

    // =========================
    // PASOS
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Iniciar sesión como tutor');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Acceder a sección de proyectos');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Verificar proyectos visibles');
    });

    // =========================
    // RESULTADO ESPERADO
    // =========================
    await page.fill('#tc-esperado', 'Solo se muestran proyectos asignados al tutor');

    // =========================
    // ESTADO
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Pass');
    });

    await page.screenshot({
        path: 'tests/sprint2/tests/screenshots/TC-HU9-001.png',
        fullPage: true
    });

    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});