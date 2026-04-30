<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UsuariosController extends Controller
{
    private const ROLES = [
        'estudiante',
        'tutor',
        'revisor',
        'coordinador',
    ];

    public function index(Request $request): Response
    {
        $busqueda = trim((string) $request->query('busqueda', ''));
        $rol = $request->query('rol');
        $estado = $request->query('estado');
        $fechaDesde = $request->query('fecha_desde');
        $fechaHasta = $request->query('fecha_hasta');

        $usuarios = User::query()
            ->select([
                'id',
                'name',
                'email',
                'rol',
                'activo',
                'telefono_contacto',
                'created_at',
            ])
            ->when($busqueda !== '', function ($query) use ($busqueda) {
                $query->where(function ($subQuery) use ($busqueda) {
                    $subQuery
                        ->where('name', 'ILIKE', "%{$busqueda}%")
                        ->orWhere('email', 'ILIKE', "%{$busqueda}%");
                });
            })
            ->when($rol, function ($query) use ($rol) {
                $query->where('rol', $rol);
            })
            ->when($estado !== null && $estado !== '', function ($query) use ($estado) {
                $query->where('activo', $estado === 'activo');
            })
            ->when($fechaDesde, function ($query) use ($fechaDesde) {
                $query->whereDate('created_at', '>=', $fechaDesde);
            })
            ->when($fechaHasta, function ($query) use ($fechaHasta) {
                $query->whereDate('created_at', '<=', $fechaHasta);
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('usuarios/index', [
            'usuarios' => $usuarios,
            'filters' => [
                'busqueda' => $busqueda,
                'rol' => $rol,
                'estado' => $estado,
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
            ],
            'roles' => self::ROLES,
        ]);
    }

    public function papelera(Request $request): Response
    {
        $rol = $request->query('rol');

        $usuarios = User::query()
            ->select([
                'id',
                'name',
                'email',
                'rol',
                'activo',
                'telefono_contacto',
                'created_at',
            ])
            ->where('activo', false)
            ->when($rol, fn($query) => $query->where('rol', $rol))
            ->orderByDesc('updated_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('usuarios/papelera', [
            'usuarios' => $usuarios,
            'filters' => [
                'rol' => $rol,
            ],
            'roles' => self::ROLES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('usuarios/create', [
            'roles' => self::ROLES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'telefono_contacto' => ['nullable', 'string', 'max:20'],
            'rol' => ['required', Rule::in(self::ROLES)],
            'activo' => ['required', 'boolean'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'telefono_contacto' => $validated['telefono_contacto'] ?? null,
            'rol' => $validated['rol'],
            'activo' => $validated['activo'],
            'password' => Hash::make($validated['password']),
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
            'email_verified_at' => now(),
        ]);

        return to_route('usuarios.index')->with('toast', [
            'type' => 'success',
            'message' => 'Usuario creado correctamente.',
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('usuarios/edit', [
            'usuario' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->rol,
                'activo' => $user->activo,
                'telefono_contacto' => $user->telefono_contacto,
                'created_at' => $user->created_at,
            ],
            'roles' => self::ROLES,
            'restricciones' => [
                'es_usuario_actual' => Auth::id() === $user->id,
                'es_ultimo_coordinador' => $this->esUltimoCoordinador($user),
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'telefono_contacto' => ['nullable', 'string', 'max:20'],
            'rol' => ['required', Rule::in(self::ROLES)],
            'activo' => ['required', 'boolean'],
            'password' => [
                'nullable',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $usuarioActual = $request->user();

        if ($usuarioActual->id === $user->id && $validated['rol'] !== $user->rol) {
            return back()->withErrors([
                'rol' => 'No puedes modificar tu propio rol.',
            ]);
        }

        if ($this->esUltimoCoordinador($user) && $validated['rol'] !== 'coordinador') {
            return back()->withErrors([
                'rol' => 'No puedes quitar el rol al último coordinador activo del sistema.',
            ]);
        }

        if ($this->esUltimoCoordinador($user) && $validated['activo'] === false) {
            return back()->withErrors([
                'activo' => 'No puedes desactivar al último coordinador activo del sistema.',
            ]);
        }

        $user->forceFill([
            'name' => $validated['name'],
            'telefono_contacto' => $validated['telefono_contacto'] ?? null,
            'rol' => $validated['rol'],
            'activo' => $validated['activo'],
        ]);

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
            $user->intentos_fallidos = 0;
            $user->bloqueado_hasta = null;
        }

        $user->save();

        return to_route('usuarios.index')->with('toast', [
            'type' => 'success',
            'message' => 'Usuario actualizado correctamente.',
        ]);
    }

    public function updateEstado(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'activo' => ['required', 'boolean'],
        ]);

        if ($this->esUltimoCoordinador($user) && $validated['activo'] === false) {
            return back()->withErrors([
                'activo' => 'No puedes desactivar al último coordinador activo del sistema.',
            ]);
        }

        $user->forceFill([
            'activo' => $validated['activo'],
        ])->save();

        return back()->with('toast', [
            'type' => 'success',
            'message' => $validated['activo']
                ? 'Usuario restaurado correctamente.'
                : 'Usuario enviado a papelera correctamente.',
        ]);
    }

    private function esUltimoCoordinador(User $user): bool
    {
        if ($user->rol !== 'coordinador' || ! $user->activo) {
            return false;
        }

        return User::query()
            ->where('rol', 'coordinador')
            ->where('activo', true)
            ->count() <= 1;
    }
}
