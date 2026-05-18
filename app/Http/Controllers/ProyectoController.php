<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use App\Models\User;
use App\Models\PeriodoAcademico;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProyectoController extends Controller
{
    private const MODALIDADES_VALIDAS = [
        'proyecto_grado',
        'tesis',
        'excelencia',
        'trabajo_dirigido',
    ];

    private const ESTADOS_VALIDOS = [
        'en_revision',
        'aprobado',
        'rechazado',
        'en_desarrollo',
        'observado',
        'concluido',
    ];

    private const MAX_REVISORES = 2;

    // ============================================================
    // Listado de proyectos ACTIVOS (no eliminados).
    // Filtros: busqueda (titulo/codigo), periodo, tutor,
    // estudiante (por nombre), estado.
    // ============================================================
    public function index(Request $request): Response
    {
        $busqueda          = trim((string) $request->query('busqueda', ''));
        $periodoId         = $request->query('periodo_id');
        $tutorId           = $request->query('tutor_id');
        $estudianteBuscar  = trim((string) $request->query('estudiante_buscar', ''));
        $estado            = $request->query('estado');

        $proyectos = Proyecto::query()
            ->with(['periodo:id,nombre', 'estudiante:id,name', 'tutor:id,name'])
            ->select([
                'id', 'codigo', 'titulo', 'estado', 'deleted_at',
                'periodo_id', 'estudiante_id', 'tutor_id', 'created_at',
            ])
            ->when($busqueda !== '', fn ($q) => $q->where(function ($sub) use ($busqueda) {
                $sub->where('titulo', 'ILIKE', "%{$busqueda}%")
                    ->orWhere('codigo', 'ILIKE', "%{$busqueda}%");
            }))
            ->when($periodoId, fn ($q) => $q->where('periodo_id', $periodoId))
            ->when($tutorId,   fn ($q) => $q->where('tutor_id', $tutorId))
            ->when($estado,    fn ($q) => $q->where('estado', $estado))
            ->when($estudianteBuscar !== '', fn ($q) => $q->whereHas('estudiante', function ($sub) use ($estudianteBuscar) {
                $sub->where('name', 'ILIKE', "%{$estudianteBuscar}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('proyectos/index', [
            'proyectos' => $proyectos,
            'filters'   => [
                'busqueda'          => $busqueda,
                'periodo_id'        => $periodoId,
                'tutor_id'          => $tutorId,
                'estudiante_buscar' => $estudianteBuscar,
                'estado'            => $estado,
            ],
            'periodos'         => PeriodoAcademico::select(['id', 'nombre'])
                                    ->orderByDesc('fecha_inicio')->get(),
            'tutores'          => User::where('rol', 'tutor')
                                    ->select(['id', 'name'])->orderBy('name')->get(),
            // Contador para el badge del link a la papelera.
            'eliminados_count' => Proyecto::onlyTrashed()->count(),
        ]);
    }

    // ============================================================
    // Pagina dedicada de papelera: solo proyectos eliminados.
    // ============================================================
    public function papelera(Request $request): Response
    {
        $busqueda = trim((string) $request->query('busqueda', ''));

        $eliminados = Proyecto::query()
            ->onlyTrashed()
            ->with(['periodo:id,nombre', 'estudiante:id,name', 'tutor:id,name'])
            ->select([
                'id', 'codigo', 'titulo', 'estado', 'deleted_at',
                'periodo_id', 'estudiante_id', 'tutor_id',
            ])
            ->when($busqueda !== '', fn ($q) => $q->where(function ($sub) use ($busqueda) {
                $sub->where('titulo', 'ILIKE', "%{$busqueda}%")
                    ->orWhere('codigo', 'ILIKE', "%{$busqueda}%");
            }))
            ->orderByDesc('deleted_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('proyectos/papelera', [
            'eliminados' => $eliminados,
            'filters'    => ['busqueda' => $busqueda],
        ]);
    }

    // ============================================================
    // Formulario de creacion.
    // ============================================================
    public function create(): Response
    {
        $hoy = Carbon::today();

        $periodosVigentes = PeriodoAcademico::query()
            ->select('id', 'nombre', 'fecha_inicio', 'fecha_cierre')
            ->where('activo', true)
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_cierre', '>=', $hoy)
            ->orderByDesc('fecha_inicio')
            ->get();

        $tutores = User::where('rol', 'tutor')
            ->where('activo', true)
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return Inertia::render('proyectos/create', [
            'periodos'    => $periodosVigentes,
            'estudiantes' => User::where('rol', 'estudiante')
                                 ->where('activo', true)
                                 ->select(['id', 'name'])
                                 ->orderBy('name')
                                 ->get(),
            'tutores'   => $tutores,
            'revisores' => $tutores,
        ]);
    }

    // ============================================================
    // Persistencia: crear proyecto + revisores.
    // ============================================================
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'titulo'          => ['required', 'string', 'max:255'],
            'descripcion'     => ['nullable', 'string'],
            'modalidad'       => ['required', 'string', 'in:' . implode(',', self::MODALIDADES_VALIDAS)],
            'area_tematica'   => ['nullable', 'array'],
            'area_tematica.*' => ['string', 'max:80'],
            'periodo_id'      => ['required', 'exists:periodos_academicos,id'],
            'estudiante_id'   => ['required', 'exists:users,id'],
            'tutor_id'        => ['required', 'exists:users,id', 'different:estudiante_id'],
            'revisores_ids'   => ['nullable', 'array', 'max:' . self::MAX_REVISORES],
            'revisores_ids.*' => [
                'integer',
                'exists:users,id',
                'different:tutor_id',
                'different:estudiante_id',
            ],
        ]);

        $revisores = array_map('intval', $validated['revisores_ids'] ?? []);

        if (count($revisores) !== count(array_unique($revisores))) {
            return back()->withErrors([
                'revisores_ids' => 'No puedes asignar al mismo revisor dos veces.',
            ]);
        }

        $periodoActivo = PeriodoAcademico::where('activo', true)
            ->whereDate('fecha_inicio', '<=', Carbon::today())
            ->whereDate('fecha_cierre', '>=', Carbon::today())
            ->first();

        if (!$periodoActivo) {
            return back()->withErrors([
                'periodo_id' => 'No hay un periodo academico activo y vigente.',
            ]);
        }

        if ((int) $validated['periodo_id'] !== $periodoActivo->id) {
            return back()->withErrors([
                'periodo_id' => 'Solo puedes registrar proyectos en el periodo activo vigente.',
            ]);
        }

        $auth = Auth::user();
        if ($auth instanceof User && $auth->getAttribute('rol') === 'estudiante') {
            $validated['estudiante_id'] = $auth->getKey();
        }

        unset($validated['revisores_ids']);

        $validated['area_tematica'] = !empty($validated['area_tematica'])
            ? implode(', ', array_unique($validated['area_tematica']))
            : null;

        $validated['codigo'] = 'PROY-' . Carbon::now()->format('Y') . '-' . strtoupper(Str::random(5));
        $validated['estado'] = 'en_revision';

        $proyecto = DB::transaction(function () use ($validated, $revisores) {
            $proyecto = Proyecto::create($validated);

            if (!empty($revisores)) {
                $filas = array_map(fn ($revisorId) => [
                    'proyecto_id' => $proyecto->id,
                    'revisor_id'  => $revisorId,
                    'asignado_en' => now(),
                ], $revisores);

                DB::table('proyecto_revisores')->insert($filas);
            }

            return $proyecto;
        });

        return to_route('proyectos.index')->with('toast', [
            'type'    => 'success',
            'message' => 'Proyecto creado correctamente con el codigo ' . $proyecto->codigo,
        ]);
    }

    // ============================================================
    // Formulario de edicion.
    // ============================================================
    public function edit(Proyecto $proyecto): Response
    {
        $periodos = PeriodoAcademico::select(['id', 'nombre'])
            ->orderByDesc('fecha_inicio')
            ->get();

        $tutores = User::where('rol', 'tutor')
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $estudiantes = User::where('rol', 'estudiante')
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $revisoresActuales = DB::table('proyecto_revisores')
            ->where('proyecto_id', $proyecto->id)
            ->pluck('revisor_id')
            ->map(fn ($id) => (int) $id)
            ->toArray();

        return Inertia::render('proyectos/edit', [
            'proyecto'          => $proyecto,
            'periodos'          => $periodos,
            'estudiantes'       => $estudiantes,
            'tutores'           => $tutores,
            'revisores'         => $tutores,
            'revisoresActuales' => $revisoresActuales,
        ]);
    }

    // ============================================================
    // Persistencia: actualizar proyecto + sincronizar revisores.
    // ============================================================
    public function update(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'titulo'          => ['required', 'string', 'max:255'],
            'descripcion'     => ['nullable', 'string'],
            'modalidad'       => ['required', 'string', 'in:' . implode(',', self::MODALIDADES_VALIDAS)],
            'area_tematica'   => ['nullable', 'array'],
            'area_tematica.*' => ['string', 'max:80'],
            'estado'          => ['required', 'string', 'in:' . implode(',', self::ESTADOS_VALIDOS)],
            'periodo_id'      => ['required', 'exists:periodos_academicos,id'],
            'estudiante_id'   => ['required', 'exists:users,id'],
            'tutor_id'        => ['required', 'exists:users,id', 'different:estudiante_id'],
            'revisores_ids'   => ['nullable', 'array', 'max:' . self::MAX_REVISORES],
            'revisores_ids.*' => [
                'integer',
                'exists:users,id',
                'different:tutor_id',
                'different:estudiante_id',
            ],
        ]);

        $revisores = array_map('intval', $validated['revisores_ids'] ?? []);

        if (count($revisores) !== count(array_unique($revisores))) {
            return back()->withErrors([
                'revisores_ids' => 'No puedes asignar al mismo revisor dos veces.',
            ]);
        }

        unset($validated['revisores_ids']);

        $validated['area_tematica'] = !empty($validated['area_tematica'])
            ? implode(', ', array_unique($validated['area_tematica']))
            : null;

        $userId = (int) Auth::id();

        DB::transaction(function () use ($proyecto, $validated, $revisores, $userId) {
            DB::statement("SET LOCAL app.user_id = '{$userId}'");
            $proyecto->update($validated);

            DB::table('proyecto_revisores')
                ->where('proyecto_id', $proyecto->id)
                ->delete();

            if (!empty($revisores)) {
                $filas = array_map(fn ($revisorId) => [
                    'proyecto_id' => $proyecto->id,
                    'revisor_id'  => $revisorId,
                    'asignado_en' => now(),
                ], $revisores);

                DB::table('proyecto_revisores')->insert($filas);
            }
        });

        return to_route('proyectos.index')->with('toast', [
            'type'    => 'success',
            'message' => 'Proyecto actualizado correctamente.',
        ]);
    }

    // ============================================================
    // Cambio rapido de estado a cualquiera de los valores validos.
    // Recibe el estado desde el body de la peticion.
    // El trigger fn_registrar_historial_estado registra el cambio
    // automaticamente usando app.user_id.
    // ============================================================
    public function cambiarEstado(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $validated = $request->validate([
            'estado' => ['required', 'string', 'in:' . implode(',', self::ESTADOS_VALIDOS)],
        ]);

        $nuevoEstado = $validated['estado'];

        if ($proyecto->estado === $nuevoEstado) {
            return back()->with('toast', [
                'type'    => 'info',
                'message' => 'El proyecto ya estaba en ese estado.',
            ]);
        }

        $userId = (int) Auth::id();

        DB::transaction(function () use ($proyecto, $nuevoEstado, $userId) {
            DB::statement("SET LOCAL app.user_id = '{$userId}'");
            $proyecto->update(['estado' => $nuevoEstado]);
        });

        return back()->with('toast', [
            'type'    => 'success',
            'message' => "Estado del proyecto {$proyecto->codigo} actualizado a {$nuevoEstado}.",
        ]);
    }

    // ============================================================
    // Soft delete: el proyecto pasa a la papelera.
    // ============================================================
    public function destroy(Proyecto $proyecto): RedirectResponse
    {
        $proyecto->delete();

        return back()->with('toast', [
            'type'    => 'success',
            'message' => "Proyecto {$proyecto->codigo} enviado a la papelera.",
        ]);
    }

    // ============================================================
    // Restaurar desde la papelera.
    // Usa $id porque el route-model binding por defecto
    // no resuelve registros soft-deleted.
    // ============================================================
    public function restore(int $id): RedirectResponse
    {
        $proyecto = Proyecto::withTrashed()->findOrFail($id);

        if (!$proyecto->trashed()) {
            return back()->with('toast', [
                'type'    => 'info',
                'message' => 'El proyecto no esta eliminado.',
            ]);
        }

        $proyecto->restore();

        return back()->with('toast', [
            'type'    => 'success',
            'message' => "Proyecto {$proyecto->codigo} restaurado correctamente.",
        ]);
    }
}