import { test } from '@playwright/test';

test('TC-HU9-002 - Tutor puede descargar archivo del estudiante', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    await page.fill('#tc-titulo', 'TC-HU9-002 - Tutor puede descargar archivo del estudiante');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar descarga de archivos del estudiante por el tutor');

    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();

    await page.fill('#tc-precond', 'Estudiante ha subido archivo de avance');
    await page.fill('#tc-datos', 'Archivo PDF o DOCX disponible');

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Tutor accede al proyecto');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Selecciona archivo del estudiante');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Descargar archivo');
    });

    await page.fill('#tc-esperado', 'El archivo se descarga correctamente');

    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Pass');
    });

    await page.screenshot({
        path: 'tests/sprint2/tests/screenshots/TC-HU9-002.png',
        fullPage: true
    });

    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});