<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $usuario = Auth::user();

        $rol = strtolower((string) ($usuario->rol ?? 'estudiante'));
        $usuarioId = (int) $usuario->id;

        $sortBy = (string) $request->query('sort_by', 'ultimo_avance');
        $sortDir = (string) $request->query('sort_dir', 'desc');

        if (! in_array($sortBy, ['estado', 'ultimo_avance'], true)) {
            $sortBy = 'ultimo_avance';
        }

        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $ultimoAvanceSubquery = DB::table('historial_estados as h')
            ->selectRaw("
                DISTINCT ON (h.proyecto_id)
                h.proyecto_id,
                h.estado_anterior::text as estado_anterior,
                h.estado_nuevo::text as estado_nuevo,
                h.comentario,
                h.created_at as ultimo_avance_at,
                h.usuario_id
            ")
            ->orderBy('h.proyecto_id')
            ->orderByDesc('h.created_at')
            ->orderByDesc('h.id');

        $query = DB::table('proyectos as p')
            ->leftJoin('users as estudiante', 'estudiante.id', '=', 'p.estudiante_id')
            ->leftJoin('users as tutor', 'tutor.id', '=', 'p.tutor_id')
            ->leftJoinSub($ultimoAvanceSubquery, 'ultimo_avance', function ($join) {
                $join->on('ultimo_avance.proyecto_id', '=', 'p.id');
            })
            ->leftJoin('users as avance_usuario', 'avance_usuario.id', '=', 'ultimo_avance.usuario_id')
            ->whereNull('p.deleted_at')
            ->selectRaw("
                p.id,
                p.codigo,
                p.titulo,
                p.descripcion,
                p.modalidad::text as modalidad,
                p.area_tematica,
                p.estado::text as estado,
                p.estudiante_id,
                p.tutor_id,
                p.periodo_id,
                p.created_at,
                p.updated_at,

                estudiante.name as estudiante_nombre,
                estudiante.email as estudiante_email,

                tutor.name as tutor_nombre,
                tutor.email as tutor_email,

                ultimo_avance.estado_anterior,
                ultimo_avance.estado_nuevo,
                ultimo_avance.comentario as ultimo_avance_comentario,
                ultimo_avance.ultimo_avance_at,
                avance_usuario.name as ultimo_avance_usuario
            ");

        $this->aplicarFiltroPorRol($query, $rol, $usuarioId);

        if ($sortBy === 'estado') {
            $query->orderBy('p.estado', $sortDir)
                ->orderByRaw('COALESCE(ultimo_avance.ultimo_avance_at, p.updated_at) DESC');
        } else {
            $query->orderByRaw('COALESCE(ultimo_avance.ultimo_avance_at, p.updated_at) ' . $sortDir)
                ->orderBy('p.estado');
        }

        $filas = $query
            ->limit(120)
            ->get();

        $proyectoIds = $filas
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $revisoresPorProyecto = $this->obtenerRevisoresPorProyecto($proyectoIds);
        $lineaTiempoPorProyecto = $this->obtenerLineaTiempoPorProyecto($proyectoIds);

        $conteosEntregas = $this->obtenerConteosPorProyecto('proyecto_entregas', $proyectoIds);
        $conteosArchivos = $this->obtenerConteosPorProyecto('proyecto_archivos', $proyectoIds);
        $conteosObservaciones = $this->obtenerConteosPorProyecto('proyecto_observaciones', $proyectoIds);
        $conteosRevisiones = $this->obtenerConteosPorProyecto('proyecto_revisiones', $proyectoIds);
        $conteosReuniones = $this->obtenerConteosPorProyecto('proyecto_reuniones_tutoria', $proyectoIds);

        $ultimasReuniones = $this->obtenerUltimaFechaPorProyecto(
            'proyecto_reuniones_tutoria',
            'fecha_reunion',
            $proyectoIds
        );

        $proyectos = $filas
            ->map(function ($fila) use (
                $revisoresPorProyecto,
                $lineaTiempoPorProyecto,
                $conteosEntregas,
                $conteosArchivos,
                $conteosObservaciones,
                $conteosRevisiones,
                $conteosReuniones,
                $ultimasReuniones
            ) {
                $proyectoId = (int) $fila->id;

                $revisores = $revisoresPorProyecto->get($proyectoId, collect())->values()->all();

                $entregasCount = (int) ($conteosEntregas[$proyectoId] ?? 0);
                $archivosCount = (int) ($conteosArchivos[$proyectoId] ?? 0);
                $observacionesCount = (int) ($conteosObservaciones[$proyectoId] ?? 0);
                $revisionesCount = (int) ($conteosRevisiones[$proyectoId] ?? 0);
                $reunionesCount = (int) ($conteosReuniones[$proyectoId] ?? 0);

                $ultimoAvanceResumen = null;

                if ($fila->ultimo_avance_at) {
                    $estadoAnterior = $fila->estado_anterior ?: 'Sin estado previo';
                    $estadoNuevo = $fila->estado_nuevo ?: $fila->estado;
                    $ultimoAvanceResumen = "{$estadoAnterior} → {$estadoNuevo}";
                }

                $sinAvance = empty($fila->ultimo_avance_at);
                $sinRevisores = count($revisores) === 0;
                $sinEntregas = $entregasCount === 0;
                $estadoCritico = in_array($fila->estado, ['observado', 'rechazado'], true);

                return [
                    'id' => $proyectoId,
                    'codigo' => $fila->codigo,
                    'titulo' => $fila->titulo,
                    'descripcion' => $fila->descripcion,
                    'modalidad' => $fila->modalidad,
                    'area_tematica' => $fila->area_tematica,
                    'estado' => $fila->estado,
                    'created_at' => $fila->created_at,
                    'updated_at' => $fila->updated_at,

                    'estudiante' => [
                        'id' => (int) $fila->estudiante_id,
                        'name' => $fila->estudiante_nombre,
                        'email' => $fila->estudiante_email,
                    ],

                    'tutor' => $fila->tutor_id ? [
                        'id' => (int) $fila->tutor_id,
                        'name' => $fila->tutor_nombre,
                        'email' => $fila->tutor_email,
                    ] : null,

                    'revisores' => $revisores,

                    'ultimo_avance' => [
                        'fecha' => $fila->ultimo_avance_at,
                        'resumen' => $ultimoAvanceResumen,
                        'comentario' => $fila->ultimo_avance_comentario,
                        'usuario' => $fila->ultimo_avance_usuario,
                    ],

                    'linea_tiempo' => $lineaTiempoPorProyecto->get($proyectoId, collect())->values()->all(),

                    'metricas' => [
                        'entregas' => $entregasCount,
                        'archivos' => $archivosCount,
                        'observaciones' => $observacionesCount,
                        'revisiones' => $revisionesCount,
                        'reuniones' => $reunionesCount,
                        'ultima_reunion' => $ultimasReuniones[$proyectoId] ?? null,
                    ],

                    'riesgo' => [
                        'sin_avance' => $sinAvance,
                        'sin_revisores' => $sinRevisores,
                        'sin_entregas' => $sinEntregas,
                        'estado_critico' => $estadoCritico,
                        'requiere_atencion' => $sinAvance || $sinRevisores || $sinEntregas || $estadoCritico,
                    ],
                ];
            })
            ->values();

        return Inertia::render('dashboard', [
            'dashboardData' => [
                'rol' => $rol,
                'filters' => [
                    'sort_by' => $sortBy,
                    'sort_dir' => $sortDir,
                ],
                'summary' => $this->crearResumen($proyectos, $proyectoIds),
                'charts' => [
                    'actividad_mensual' => $this->obtenerActividadMensual($proyectoIds),
                    'ultimos_eventos' => $this->obtenerUltimosEventos($proyectoIds),
                ],
                'proyectos' => $proyectos,
            ],
        ]);
    }

    private function aplicarFiltroPorRol($query, string $rol, int $usuarioId): void
    {
        if ($rol === 'estudiante') {
            $query->where('p.estudiante_id', $usuarioId);
            return;
        }

        if ($rol === 'tutor') {
            $query->where('p.tutor_id', $usuarioId);
            return;
        }

        if ($rol === 'revisor') {
            $query->whereExists(function ($existsQuery) use ($usuarioId) {
                $existsQuery->selectRaw('1')
                    ->from('proyecto_revisores as pr')
                    ->whereColumn('pr.proyecto_id', 'p.id')
                    ->where('pr.revisor_id', $usuarioId);
            });
            return;
        }

        if ($rol === 'docente') {
            $query->where(function ($subquery) use ($usuarioId) {
                $subquery
                    ->where('p.tutor_id', $usuarioId)
                    ->orWhereExists(function ($existsQuery) use ($usuarioId) {
                        $existsQuery->selectRaw('1')
                            ->from('proyecto_revisores as pr')
                            ->whereColumn('pr.proyecto_id', 'p.id')
                            ->where('pr.revisor_id', $usuarioId);
                    });
            });
            return;
        }

        if (! in_array($rol, ['coordinador', 'admin', 'administrador'], true)) {
            $query->whereRaw('1 = 0');
        }
    }

    /**
     * @param array<int, int> $proyectoIds
     * @return Collection<int, Collection<int, array<string, mixed>>>
     */
    private function obtenerRevisoresPorProyecto(array $proyectoIds): Collection
    {
        if (empty($proyectoIds)) {
            return collect();
        }

        return DB::table('proyecto_revisores as pr')
            ->join('users as u', 'u.id', '=', 'pr.revisor_id')
            ->whereIn('pr.proyecto_id', $proyectoIds)
            ->select([
                'pr.proyecto_id',
                'pr.revisor_id',
                'u.name',
                'u.email',
                'pr.asignado_en',
                'pr.plazo_revision',
            ])
            ->orderBy('u.name')
            ->get()
            ->groupBy('proyecto_id')
            ->map(function ($items) {
                return $items->map(fn ($item) => [
                    'id' => (int) $item->revisor_id,
                    'name' => $item->name,
                    'email' => $item->email,
                    'asignado_en' => $item->asignado_en,
                    'plazo_revision' => $item->plazo_revision,
                ]);
            });
    }

    /**
     * @param array<int, int> $proyectoIds
     * @return Collection<int, Collection<int, array<string, mixed>>>
     */
    private function obtenerLineaTiempoPorProyecto(array $proyectoIds): Collection
    {
        if (empty($proyectoIds)) {
            return collect();
        }

        return DB::table('historial_estados as h')
            ->leftJoin('users as u', 'u.id', '=', 'h.usuario_id')
            ->whereIn('h.proyecto_id', $proyectoIds)
            ->selectRaw("
                h.id,
                h.proyecto_id,
                h.estado_anterior::text as estado_anterior,
                h.estado_nuevo::text as estado_nuevo,
                h.comentario,
                h.created_at,
                u.name as usuario_nombre,
                u.email as usuario_email
            ")
            ->orderBy('h.created_at')
            ->orderBy('h.id')
            ->get()
            ->groupBy('proyecto_id')
            ->map(function ($items) {
                return $items->map(fn ($item) => [
                    'id' => (int) $item->id,
                    'estado_anterior' => $item->estado_anterior,
                    'estado_nuevo' => $item->estado_nuevo,
                    'comentario' => $item->comentario,
                    'created_at' => $item->created_at,
                    'usuario' => [
                        'name' => $item->usuario_nombre,
                        'email' => $item->usuario_email,
                    ],
                ]);
            });
    }

    /**
     * @param array<int, int> $proyectoIds
     * @return array<int, int>
     */
    private function obtenerConteosPorProyecto(string $tabla, array $proyectoIds): array
    {
        if (empty($proyectoIds)) {
            return [];
        }

        return DB::table($tabla)
            ->whereIn('proyecto_id', $proyectoIds)
            ->selectRaw('proyecto_id, COUNT(*) as total')
            ->groupBy('proyecto_id')
            ->pluck('total', 'proyecto_id')
            ->map(fn ($total) => (int) $total)
            ->toArray();
    }

    /**
     * @param array<int, int> $proyectoIds
     * @return array<int, string|null>
     */
    private function obtenerUltimaFechaPorProyecto(string $tabla, string $columnaFecha, array $proyectoIds): array
    {
        if (empty($proyectoIds)) {
            return [];
        }

        return DB::table($tabla)
            ->whereIn('proyecto_id', $proyectoIds)
            ->selectRaw("proyecto_id, MAX({$columnaFecha}) as ultima_fecha")
            ->groupBy('proyecto_id')
            ->pluck('ultima_fecha', 'proyecto_id')
            ->toArray();
    }

    /**
     * @param Collection<int, array<string, mixed>> $proyectos
     * @param array<int, int> $proyectoIds
     * @return array<string, mixed>
     */
    private function crearResumen(Collection $proyectos, array $proyectoIds): array
    {
        $total = $proyectos->count();

        $porEstado = $proyectos
            ->groupBy('estado')
            ->map(fn ($items) => $items->count())
            ->toArray();

        $porModalidad = $proyectos
            ->groupBy('modalidad')
            ->map(fn ($items) => $items->count())
            ->toArray();

        $porArea = $this->obtenerDistribucionPorArea($proyectos);

        $sinAvance = $proyectos
            ->filter(fn ($proyecto) => empty($proyecto['ultimo_avance']['fecha']))
            ->count();

        $sinRevisores = $proyectos
            ->filter(fn ($proyecto) => empty($proyecto['revisores']))
            ->count();

        $sinEntregas = $proyectos
            ->filter(fn ($proyecto) => (int) ($proyecto['metricas']['entregas'] ?? 0) === 0)
            ->count();

        $requierenAtencion = $proyectos
            ->filter(fn ($proyecto) => (bool) ($proyecto['riesgo']['requiere_atencion'] ?? false))
            ->count();

        $concluidos = (int) ($porEstado['concluido'] ?? 0);
        $aprobados = (int) ($porEstado['aprobado'] ?? 0);
        $enDesarrollo = (int) ($porEstado['en_desarrollo'] ?? 0);
        $observados = (int) ($porEstado['observado'] ?? 0);
        $enRevision = (int) ($porEstado['en_revision'] ?? 0);
        $rechazados = (int) ($porEstado['rechazado'] ?? 0);

        $avancePonderado = $this->porcentaje($total > 0
            ? (
                ($concluidos * 1.0) +
                ($aprobados * 0.8) +
                ($enDesarrollo * 0.55) +
                ($observados * 0.35) +
                ($enRevision * 0.20)
            )
            : 0, max($total, 1));

        $ultimoAvanceGeneral = $proyectos
            ->pluck('ultimo_avance.fecha')
            ->filter()
            ->sortDesc()
            ->first();

        $entregasTotal = $this->contarTabla('proyecto_entregas', $proyectoIds);
        $archivosTotal = $this->contarTabla('proyecto_archivos', $proyectoIds);
        $observacionesTotal = $this->contarTabla('proyecto_observaciones', $proyectoIds);
        $observacionesAbiertas = $this->contarTabla('proyecto_observaciones', $proyectoIds, [
            ['estado', '=', 'abierta'],
        ]);
        $revisionesTotal = $this->contarTabla('proyecto_revisiones', $proyectoIds);
        $revisionesPendientes = $this->contarTabla('proyecto_revisiones', $proyectoIds, [
            ['resultado', '=', 'pendiente'],
        ]);
        $eventosTotal = $this->contarTabla('proyecto_eventos', $proyectoIds);
        $reunionesTotal = $this->contarTabla('proyecto_reuniones_tutoria', $proyectoIds);
        $reunionesUltimos30Dias = $this->contarTabla('proyecto_reuniones_tutoria', $proyectoIds, [
            ['fecha_reunion', '>=', now()->subDays(30)],
        ]);

        return [
            'total_proyectos' => $total,
            'sin_avance' => $sinAvance,
            'sin_revisores' => $sinRevisores,
            'sin_entregas' => $sinEntregas,
            'requieren_atencion' => $requierenAtencion,

            'concluidos' => $concluidos,
            'aprobados' => $aprobados,
            'en_desarrollo' => $enDesarrollo,
            'observados' => $observados,
            'en_revision' => $enRevision,
            'rechazados' => $rechazados,

            'tasa_conclusion' => $this->porcentaje($concluidos, $total),
            'tasa_aprobacion' => $this->porcentaje($aprobados + $concluidos, $total),
            'tasa_riesgo' => $this->porcentaje($requierenAtencion, $total),
            'avance_institucional' => $avancePonderado,

            'entregas_total' => $entregasTotal,
            'archivos_total' => $archivosTotal,
            'observaciones_total' => $observacionesTotal,
            'observaciones_abiertas' => $observacionesAbiertas,
            'revisiones_total' => $revisionesTotal,
            'revisiones_pendientes' => $revisionesPendientes,
            'eventos_total' => $eventosTotal,
            'reuniones_total' => $reunionesTotal,
            'reuniones_ultimos_30_dias' => $reunionesUltimos30Dias,

            'por_estado' => $porEstado,
            'por_modalidad' => $porModalidad,
            'por_area' => $porArea,

            'ultimo_avance_general' => $ultimoAvanceGeneral,
        ];
    }

    /**
     * @param Collection<int, array<string, mixed>> $proyectos
     * @return array<string, int>
     */
    private function obtenerDistribucionPorArea(Collection $proyectos): array
    {
        $areas = [];

        foreach ($proyectos as $proyecto) {
            $texto = (string) ($proyecto['area_tematica'] ?? '');

            foreach (preg_split('/[,;|]/', $texto) ?: [] as $area) {
                $area = trim($area);

                if ($area === '') {
                    continue;
                }

                $areas[$area] = ($areas[$area] ?? 0) + 1;
            }
        }

        arsort($areas);

        return array_slice($areas, 0, 8, true);
    }

    /**
     * @param array<int, int> $proyectoIds
     * @param array<int, array<int, mixed>> $condiciones
     */
    private function contarTabla(string $tabla, array $proyectoIds, array $condiciones = []): int
    {
        if (empty($proyectoIds)) {
            return 0;
        }

        $query = DB::table($tabla)->whereIn('proyecto_id', $proyectoIds);

        foreach ($condiciones as $condicion) {
            [$columna, $operador, $valor] = $condicion;
            $query->where($columna, $operador, $valor);
        }

        return (int) $query->count();
    }

    private function porcentaje(float|int $valor, float|int $total): int
    {
        if ($total <= 0) {
            return 0;
        }

        return (int) round(($valor / $total) * 100);
    }

    /**
     * @param array<int, int> $proyectoIds
     * @return array<int, array<string, mixed>>
     */
    private function obtenerActividadMensual(array $proyectoIds): array
    {
        if (empty($proyectoIds)) {
            return [];
        }

        $desde = now()->subMonths(5)->startOfMonth();

        $eventos = DB::table('proyecto_eventos')
            ->whereIn('proyecto_id', $proyectoIds)
            ->where('created_at', '>=', $desde)
            ->selectRaw("to_char(created_at, 'YYYY-MM') as periodo, COUNT(*) as total")
            ->groupBy('periodo')
            ->pluck('total', 'periodo');

        $entregas = DB::table('proyecto_entregas')
            ->whereIn('proyecto_id', $proyectoIds)
            ->whereRaw('COALESCE(enviado_at, created_at) >= ?', [$desde])
            ->selectRaw("to_char(COALESCE(enviado_at, created_at), 'YYYY-MM') as periodo, COUNT(*) as total")
            ->groupBy('periodo')
            ->pluck('total', 'periodo');

        $reuniones = DB::table('proyecto_reuniones_tutoria')
            ->whereIn('proyecto_id', $proyectoIds)
            ->where('fecha_reunion', '>=', $desde)
            ->selectRaw("to_char(fecha_reunion, 'YYYY-MM') as periodo, COUNT(*) as total")
            ->groupBy('periodo')
            ->pluck('total', 'periodo');

        $meses = [];

        for ($i = 5; $i >= 0; $i--) {
            $fecha = Carbon::now()->subMonths($i)->startOfMonth();
            $periodo = $fecha->format('Y-m');

            $meses[] = [
                'periodo' => $periodo,
                'label' => ucfirst($fecha->locale('es')->isoFormat('MMM YYYY')),
                'eventos' => (int) ($eventos[$periodo] ?? 0),
                'entregas' => (int) ($entregas[$periodo] ?? 0),
                'reuniones' => (int) ($reuniones[$periodo] ?? 0),
                'total' => (int) ($eventos[$periodo] ?? 0)
                    + (int) ($entregas[$periodo] ?? 0)
                    + (int) ($reuniones[$periodo] ?? 0),
            ];
        }

        return $meses;
    }

    /**
     * @param array<int, int> $proyectoIds
     * @return array<int, array<string, mixed>>
     */
    private function obtenerUltimosEventos(array $proyectoIds): array
    {
        if (empty($proyectoIds)) {
            return [];
        }

        return DB::table('proyecto_eventos as e')
            ->join('proyectos as p', 'p.id', '=', 'e.proyecto_id')
            ->leftJoin('users as actor', 'actor.id', '=', 'e.actor_id')
            ->whereIn('e.proyecto_id', $proyectoIds)
            ->select([
                'e.id',
                'e.proyecto_id',
                'e.tipo_evento',
                'e.descripcion',
                'e.created_at',
                'p.codigo',
                'p.titulo',
                'actor.name as actor_nombre',
            ])
            ->orderByDesc('e.created_at')
            ->limit(8)
            ->get()
            ->map(fn ($evento) => [
                'id' => (int) $evento->id,
                'proyecto_id' => (int) $evento->proyecto_id,
                'tipo_evento' => $evento->tipo_evento,
                'descripcion' => $evento->descripcion,
                'created_at' => $evento->created_at,
                'codigo' => $evento->codigo,
                'titulo' => $evento->titulo,
                'actor' => $evento->actor_nombre,
            ])
            ->values()
            ->all();
    }
}
