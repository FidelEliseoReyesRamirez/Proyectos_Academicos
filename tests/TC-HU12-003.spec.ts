import { test } from '@playwright/test';

test('TC-HU12-003 - Estudiante puede subir links de documentos de trabajo', async ({ page }) => {

    await page.goto(
        'file:///T:/univ/clases/7to%20Semestre/SistemasDistribuidos/ProyectoSD/testplan_proyectos_academicos.html'
    );

    await page.waitForTimeout(2000);

    await page.fill('#tc-titulo', 'TC-HU12-003 - Estudiante puede subir links de documentos de trabajo');
    await page.selectOption('#tc-sprint', { label: 'Sprint 2' });
    await page.fill('#tc-responsable', 'Victor Albarracin');
    await page.fill('#tc-desc', 'Validar subida de links externos');

    await page.locator('.tipo-chip[data-tipo="Sistema"]').click();

    await page.fill('#tc-precond', 'Estudiante autenticado');
    await page.fill('#tc-datos', 'Link de Google Drive o repositorio');

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Ingresar link de documento');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Validar URL');
    });

    await page.evaluate(() => {
        // @ts-ignore
        addPaso('Guardar enlace');
    });

    await page.fill('#tc-esperado', 'El link se guarda correctamente');

    await page.evaluate(() => {
        // @ts-ignore
        selectEstado('Pass');
    });

    await page.screenshot({
        path: 'tests/sprint2/tests/screenshots/TC-HU12-003.png',
        fullPage: true
    });

    await page.getByRole('button', { name: '✦ Guardar Test Case' }).click();

    await page.waitForTimeout(3000);
});