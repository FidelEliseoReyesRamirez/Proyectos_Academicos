<?php

use App\Http\Controllers\UsuariosController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\PeriodosAcademicosController;
use App\Http\Controllers\ProyectoController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware(['role:coordinador'])->group(function () {
        Route::get('usuarios', [UsuariosController::class, 'index'])->name('usuarios.index');
        Route::get('usuarios/crear', [UsuariosController::class, 'create'])->name('usuarios.create');
        Route::post('usuarios', [UsuariosController::class, 'store'])->name('usuarios.store');

        Route::get('usuarios/papelera', [UsuariosController::class, 'papelera'])->name('usuarios.papelera');

        Route::get('usuarios/{user}/editar', [UsuariosController::class, 'edit'])->name('usuarios.edit');
        Route::put('usuarios/{user}', [UsuariosController::class, 'update'])->name('usuarios.update');

        Route::patch('usuarios/{user}/estado', [UsuariosController::class, 'updateEstado'])->name('usuarios.estado');

        //Periodos
        Route::get('periodos', [PeriodosAcademicosController::class, 'index'])->name('periodos.index');
        Route::get('periodos/crear', [PeriodosAcademicosController::class, 'create'])->name('periodos.create');
        Route::post('periodos', [PeriodosAcademicosController::class, 'store'])->name('periodos.store');

        //Proyectos
        Route::get('proyectos', [ProyectoController::class, 'index'])->name('proyectos.index');
        Route::get('proyectos/crear', [ProyectoController::class, 'create'])->name('proyectos.create');
        Route::post('proyectos', [ProyectoController::class, 'store'])->name('proyectos.store');
        Route::get('proyectos/{proyecto}/editar', [ProyectoController::class, 'edit'])->name('proyectos.edit');
        Route::put('proyectos/{proyecto}', [ProyectoController::class, 'update'])->name('proyectos.update');
    });
});




require __DIR__ . '/settings.php';
