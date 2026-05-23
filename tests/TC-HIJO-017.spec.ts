import { test } from '@playwright/test';

test('TC-HIJO-017 - Reunión y decisión del tutor', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    // =========================
    // INFORMACIÓN GENERAL
    // =========================
    await page.fill('#tc-titulo', 'TC-HIJO-017 - Reunión y decisión del tutor');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Tutor registra reunión y decide derivación del proyecto');

    // =========================
    // TIPOS
    // =========================
    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();

    // =========================
    // DETALLES
    // =========================
    await page.fill('#tc-precond', 'Tutor autenticado con proyecto asignado');
    await page.fill('#tc-datos', 'Reunión + evaluación de avance');

    // =========================
    // PASOS - REUNIÓN
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Registrar reunión de seguimiento');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Evaluar avance del estudiante');
    });

    // =========================
    // PASO - DECISIÓN (FALLA)
    // =========================
    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Derivar a revisión de tribunales');
    });

    // ⚠ ERROR CONTROLADO DEL SISTEMA
    // No hay tribunales asignados → error no manejado

    await page.fill(
        '#tc-esperado',
        'Error controlado: el sistema debe bloquear la derivación si no existen tribunales asignados'
    );

    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Fail');
    });

    await page.screenshot({
        path: 'tests/sprint2/tests/screenshots/TC-HIJO-017.png',
        fullPage: true
    });

    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});