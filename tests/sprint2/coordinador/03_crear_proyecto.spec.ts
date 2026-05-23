import { test } from '@playwright/test';

test('Coordinador - Crear proyecto y asignar tutor/estudiante', async ({ page }) => {

    // ======================
    // LOGIN
    // ======================
    await page.goto('http://localhost:8000/login');

    await page.fill('input[type="email"]', 'albarracinvictor251@gmail.com');
    await page.fill('input[type="password"]', 'Prueba123.');
    await page.click('[data-test="login-button"]');

    await page.waitForURL('**/dashboard');

    // ======================
    // IR A PROYECTOS
    // ======================
    await page.getByRole('link', { name: 'Proyectos' }).click();
    await page.getByRole('link', { name: 'Nuevo Proyecto' }).click();

    // ======================
    // CREAR PROYECTO
    // ======================
    await page.getByRole('textbox', { name: /Ej: Sistema/ })
        .fill('QA TEST');

    await page.getByRole('textbox', { name: /Resumen/ })
        .fill('QA pruebas automáticas sprint 2');

    // ======================
    // ASIGNAR ÁREAS
    // ======================
    await page.getByRole('button', { name: 'Selecciona una o mas areas' }).click();
    await page.getByRole('button', { name: 'Inteligencia Artificial' }).click();
    await page.getByRole('button', { name: 'Aprendizaje Automatico' }).click();

    // ======================
    // ASIGNAR ESTUDIANTE Y TUTOR
    // ======================
    await page.getByRole('button', { name: 'Estudiante QA' }).click();
    await page.getByRole('button', { name: 'Tutor QA' }).click();

    // ======================
    // GUARDAR PROYECTO
    // ======================
    await page.getByRole('button', { name: 'Guardar proyecto' }).click();

    // ======================
    // VALIDACIÓN BÁSICA
    // ======================
    await page.waitForTimeout(2000);

    await page.screenshot({
        path: 'tests/sprint2/screenshots/coordinador_proyecto_creado.png',
        fullPage: true
    });

});