<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Validar que el usuario autenticado tenga uno de los roles permitidos.
     *
     * Ejemplo:
     * ->middleware('role:coordinador')
     * ->middleware('role:coordinador,admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()
                ->route('login')
                ->with('error', 'Debes iniciar sesión para acceder a esta sección.');
        }

        if (! in_array($user->rol, $roles, true)) {
            return redirect()
                ->to('/')
                ->with('error', 'No tienes permisos para acceder a esta sección.');
        }

        return $next($request);
    }
}