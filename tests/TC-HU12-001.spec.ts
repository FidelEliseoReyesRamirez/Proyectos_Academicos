import { test } from '@playwright/test';

test('TC-HU12-001 - Estudiante puede ver sus proyectos', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    await page.fill('#tc-titulo', 'TC-HU12-001 - Estudiante puede ver sus proyectos');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar que estudiante vea solo sus proyectos');

    await page.locator('.tipo-chip[data-tipo="Interfaz"]').click();

    await page.fill('#tc-precond', 'Estudiante autenticado en el sistema');
    await page.fill('#tc-datos', 'Proyectos asignados al estudiante');

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Iniciar sesión como estudiante');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Ir a dashboard');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Ver lista de proyectos');
    });

    await page.fill('#tc-esperado', 'Solo se muestran proyectos del estudiante');

    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Pass');
    });

    await page.screenshot({
        path: 'tests/sprint2/tests/screenshots/TC-HU12-001.png',
        fullPage: true
    });

    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});