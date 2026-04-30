<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Mostrar la página de configuración del perfil.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Actualizar la información del perfil.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'telefono_contacto' => ['nullable', 'string', 'max:20'],
        ])->validate();

        $request->user()->forceFill([
            'name' => $validated['name'],
            'telefono_contacto' => $validated['telefono_contacto'] ?? null,
        ])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Perfil actualizado correctamente.',
        ]);

        return to_route('profile.edit');
    }
}