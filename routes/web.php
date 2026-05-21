<?php

use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PeriodoAcademicoController;
use App\Http\Controllers\ProyectoController;
use App\Http\Controllers\SeguimientoProyectoController;
use App\Http\Controllers\UsuariosController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Ruta pública
|--------------------------------------------------------------------------
*/

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

/*
|--------------------------------------------------------------------------
| Rutas para usuarios autenticados
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['role:coordinador,admin'])->group(function () {
        Route::get('auditoria', [AuditoriaController::class, 'index'])->name('auditoria.index');
        Route::get('auditoria/{id}', [AuditoriaController::class, 'show'])
            ->whereNumber('id')
            ->name('auditoria.show');
    });

    Route::middleware(['role:estudiante,docente,coordinador,admin'])->group(function () {
        Route::get('seguimiento', [SeguimientoProyectoController::class, 'index'])->name('seguimiento.index');
        Route::get('seguimiento/{proyecto}', [SeguimientoProyectoController::class, 'show'])
            ->whereNumber('proyecto')
            ->name('seguimiento.show');

        Route::post('seguimiento/{proyecto}/entregas', [SeguimientoProyectoController::class, 'storeEntrega'])
            ->whereNumber('proyecto')
            ->name('seguimiento.entregas.store');

        Route::patch('seguimiento/{proyecto}/documento-trabajo', [SeguimientoProyectoController::class, 'updateDocumentoTrabajo'])
            ->whereNumber('proyecto')
            ->name('seguimiento.documento-trabajo.update');

        Route::post('seguimiento/{proyecto}/archivo-revision', [SeguimientoProyectoController::class, 'storeArchivoRevision'])
            ->whereNumber('proyecto')
            ->name('seguimiento.archivo-revision.store');
    });


    /*
    |--------------------------------------------------------------------------
    | Rutas protegidas para coordinador y admin
    |--------------------------------------------------------------------------
    */

    Route::middleware(['role:coordinador,admin'])->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Proyectos
        |--------------------------------------------------------------------------
        */

        Route::prefix('proyectos')->name('proyectos.')->group(function () {
            Route::get('/', [ProyectoController::class, 'index'])->name('index');
            Route::get('/create', [ProyectoController::class, 'create'])->name('create');
            Route::post('/', [ProyectoController::class, 'store'])->name('store');

            Route::get('/papelera', [ProyectoController::class, 'papelera'])->name('papelera');

            Route::get('/{proyecto}/edit', [ProyectoController::class, 'edit'])->name('edit');
            Route::put('/{proyecto}', [ProyectoController::class, 'update'])->name('update');

            Route::post('/{proyecto}/cambiar-estado', [ProyectoController::class, 'cambiarEstado'])->name('cambiar-estado');
            Route::post('/{proyecto}/aprobar', [ProyectoController::class, 'aprobar'])->name('aprobar');
            Route::post('/{proyecto}/rechazar', [ProyectoController::class, 'rechazar'])->name('rechazar');

            Route::delete('/{proyecto}', [ProyectoController::class, 'destroy'])->name('destroy');

            Route::post('/{id}/restore', [ProyectoController::class, 'restore'])->name('restore');
        });

        /*
        |--------------------------------------------------------------------------
        | Usuarios
        |--------------------------------------------------------------------------
        */

        Route::prefix('usuarios')->name('usuarios.')->group(function () {
            Route::get('/', [UsuariosController::class, 'index'])->name('index');
            Route::get('/crear', [UsuariosController::class, 'create'])->name('create');
            Route::post('/', [UsuariosController::class, 'store'])->name('store');

            Route::get('/papelera', [UsuariosController::class, 'papelera'])->name('papelera');

            Route::get('/{user}/editar', [UsuariosController::class, 'edit'])->name('edit');
            Route::put('/{user}', [UsuariosController::class, 'update'])->name('update');
            Route::patch('/{user}/estado', [UsuariosController::class, 'updateEstado'])->name('estado');
        });

        /*
        |--------------------------------------------------------------------------
        | Periodos académicos
        |--------------------------------------------------------------------------
        */

        Route::prefix('periodos')->name('periodos.')->group(function () {
            Route::get('/', [PeriodoAcademicoController::class, 'index'])->name('index');
            Route::get('/crear', [PeriodoAcademicoController::class, 'create'])->name('create');
            Route::post('/', [PeriodoAcademicoController::class, 'store'])->name('store');

            Route::get('/{periodo}/editar', [PeriodoAcademicoController::class, 'edit'])->name('edit');
            Route::put('/{periodo}', [PeriodoAcademicoController::class, 'update'])->name('update');
        });
    });
});

require __DIR__ . '/settings.php';