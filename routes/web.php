<?php

use App\Http\Controllers\UsuariosController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

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
    });
});

require __DIR__ . '/settings.php';
