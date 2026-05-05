<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use App\Models\User;
use App\Models\PeriodoAcademico;
use App\Mail\ProyectoRegistrado;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

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

            'estudiantes' => User::where('rol', '=', 'estudiante', 'and')
                ->select(['id', 'name'])
                ->get(),

            'tutores' => User::where('rol', '=', 'tutor', 'and')
                ->select(['id', 'name'])
                ->get(),
        ]);
    }


    public function store(Request $request): RedirectResponse
    {
        // CA 1: Validación de campos obligatorios (Quitamos 'codigo' de aquí)
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'modalidad' => ['required', 'string'],
            'area_tematica' => ['required', 'string'],
            'periodo_id' => ['required', 'exists:periodos_academicos,id'],
            'estudiante_id' => ['required', 'exists:users,id'],
            'tutor_id' => ['required', 'exists:users,id'],
        ]);

        $periodoActivo = PeriodoAcademico::where('activo', '=', true, 'and')->first();

        if (!$periodoActivo) {
            return back()->withErrors(['periodo_id' => 'No hay un periodo académico activo.']);
        }

        if ($validated['periodo_id'] != $periodoActivo->id) {
            return back()->withErrors(['periodo_id' => 'Solo puedes registrar proyectos en el periodo activo.']);
        }

        if (!Carbon::today()->between(
            Carbon::parse($periodoActivo->fecha_inicio),
            Carbon::parse($periodoActivo->fecha_cierre)
        )) {
            return back()->withErrors(['periodo_id' => 'El periodo activo está fuera de fecha.']);
        }

        // Si el usuario autenticado es un estudiante, forzamos que el proyecto sea suyo
        // para evitar que registre proyectos a nombre de otros.
        if (auth()->user()->rol === 'estudiante') {
            $validated['estudiante_id'] = auth()->id();
        }

        // CA 2: Generación automática de código único
        $validated['codigo'] = 'PROY-' . Carbon::now()->format('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(5));
        
        // ESTADO AUTOMÁTICO CORRECTO
        $validated['estado'] = 'en_revision';

        // Persistencia
        $proyecto = Proyecto::create($validated);

        // CA 3: El estudiante recibe una confirmación
        $estudiante = User::find($validated['estudiante_id']);
        Mail::to($estudiante->email)->send(new ProyectoRegistrado($proyecto));

        return to_route('proyectos.index')->with('toast', [
            'type' => 'success',
            'message' => 'Proyecto creado correctamente con el código ' . $proyecto->codigo,
        ]);
    }

    public function edit(Proyecto $proyecto): Response
    {
        return Inertia::render('Proyectos/Edit', [
            'proyecto' => $proyecto,
            'periodos' => PeriodoAcademico::all(),
            'estudiantes' => User::where('rol', '=', 'estudiante', 'and')->get(),
            'tutores' => User::where('rol', '=', 'tutor', 'and')->get(),
        ]);
    }

    public function update(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'codigo' => ['required', 'string', 'max:50'],
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'string'],

            'modalidad' => ['required', 'string'],
            'area_tematica' => ['required', 'string'],

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
