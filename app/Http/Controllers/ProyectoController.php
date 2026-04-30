<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use App\Models\User;
use App\Models\PeriodoAcademico;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = trim((string) $request->query('busqueda', ''));
        $periodoId = $request->query('periodo_id');
        $estado = $request->query('estado');

        $proyectos = Proyecto::query()
            ->with(['periodo', 'estudiante', 'tutor'])
            ->select([
                'id',
                'codigo',
                'titulo',
                'estado',
                'periodo_id',
                'estudiante_id',
                'tutor_id',
                'created_at',
            ])
            ->when($busqueda !== '', function ($query) use ($busqueda) {
                $query->where(function ($subQuery) use ($busqueda) {
                    $subQuery
                        ->where('titulo', 'ILIKE', "%{$busqueda}%")
                        ->orWhere('codigo', 'ILIKE', "%{$busqueda}%");
                });
            })
            ->when($periodoId, function ($query) use ($periodoId) {
                $query->where('periodo_id', $periodoId);
            })
            ->when($estado, function ($query) use ($estado) {
                $query->where('estado', $estado);
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('proyectos/index', [
            'proyectos' => $proyectos,
            'filters' => [
                'busqueda' => $busqueda,
                'periodo_id' => $periodoId,
                'estado' => $estado,
            ],
            'periodos' => PeriodoAcademico::select(['id', 'nombre'])->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('proyectos/create', [
            'periodos' => PeriodoAcademico::select('id', 'nombre')->get(),
            'estudiantes' => User::where('rol', '=', 'estudiante', 'and')->select(['id', 'name'])->get(),
            'tutores' => User::where('rol', '=', 'tutor', 'and')->select(['id', 'name'])->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'codigo' => ['required', 'string', 'max:50'],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'string'],
            'periodo_id' => ['required', 'exists:periodos_academicos,id'],
            'estudiante_id' => ['required', 'exists:users,id'],
            'tutor_id' => ['required', 'exists:users,id'],
        ]);

        // 🔥 VALIDACIÓN DE FECHAS DEL PERIODO
        $periodo = PeriodoAcademico::findOrFail($validated['periodo_id']);

        if (now()->lt($periodo->fecha_inicio) || now()->gt($periodo->fecha_fin)) {
            return back()->withErrors([
                'periodo_id' => 'No se pueden registrar proyectos fuera del periodo activo.',
            ]);
        }

        Proyecto::create($validated);

        return to_route('proyectos.index')->with('toast', [
            'type' => 'success',
            'message' => 'Proyecto creado correctamente.',
        ]);
    }

    public function edit(Proyecto $proyecto): Response
    {
        return Inertia::render('proyectos/edit', [
            'proyecto' => $proyecto->load(['periodo', 'estudiante', 'tutor']),
            'periodos' => PeriodoAcademico::select(['id', 'nombre'])->get(),
            'estudiantes' => User::where('rol', '=', 'estudiante', 'and')->select(['id', 'name'])->get(),
            'tutores' => User::where('rol', '=', 'tutor', 'and')->select(['id', 'name'])->get(),
        ]);
    }

    public function update(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'codigo' => ['required', 'string', 'max:50'],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'string'],
            'periodo_id' => ['required', 'exists:periodos_academicos,id'],
            'estudiante_id' => ['required', 'exists:users,id'],
            'tutor_id' => ['required', 'exists:users,id'],
        ]);

        $proyecto->update($validated);

        return to_route('proyectos.index')->with('toast', [
            'type' => 'success',
            'message' => 'Proyecto actualizado correctamente.',
        ]);
    }
}