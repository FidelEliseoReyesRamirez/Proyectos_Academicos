<?php

namespace App\Http\Controllers;

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

        if ($rol === 'estudiante') {
            $query->where('p.estudiante_id', $usuarioId);
        } elseif ($rol === 'docente') {
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
        } elseif (! in_array($rol, ['coordinador', 'admin'], true)) {
            $query->whereRaw('1 = 0');
        }

        if ($sortBy === 'estado') {
            $query->orderBy('p.estado', $sortDir)
                ->orderByRaw('COALESCE(ultimo_avance.ultimo_avance_at, p.updated_at) DESC');
        } else {
            $query->orderByRaw('COALESCE(ultimo_avance.ultimo_avance_at, p.updated_at) ' . $sortDir)
                ->orderBy('p.estado');
        }

        $filas = $query
            ->limit(80)
            ->get();

        $proyectoIds = $filas
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $revisoresPorProyecto = $this->obtenerRevisoresPorProyecto($proyectoIds);
        $lineaTiempoPorProyecto = $this->obtenerLineaTiempoPorProyecto($proyectoIds);

        $proyectos = $filas
            ->map(function ($fila) use ($revisoresPorProyecto, $lineaTiempoPorProyecto) {
                $proyectoId = (int) $fila->id;

                $ultimoAvanceResumen = null;

                if ($fila->ultimo_avance_at) {
                    $estadoAnterior = $fila->estado_anterior ?: 'Sin estado previo';
                    $estadoNuevo = $fila->estado_nuevo ?: $fila->estado;

                    $ultimoAvanceResumen = "{$estadoAnterior} → {$estadoNuevo}";
                }

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

                    'revisores' => $revisoresPorProyecto->get($proyectoId, collect())->values()->all(),

                    'ultimo_avance' => [
                        'fecha' => $fila->ultimo_avance_at,
                        'resumen' => $ultimoAvanceResumen,
                        'comentario' => $fila->ultimo_avance_comentario,
                        'usuario' => $fila->ultimo_avance_usuario,
                    ],

                    'linea_tiempo' => $lineaTiempoPorProyecto->get($proyectoId, collect())->values()->all(),
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
                'summary' => $this->crearResumen($proyectos),
                'proyectos' => $proyectos,
            ],
        ]);
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
     * @param Collection<int, array<string, mixed>> $proyectos
     * @return array<string, mixed>
     */
    private function crearResumen(Collection $proyectos): array
    {
        $porEstado = $proyectos
            ->groupBy('estado')
            ->map(fn ($items) => $items->count())
            ->toArray();

        $sinAvance = $proyectos
            ->filter(fn ($proyecto) => empty($proyecto['ultimo_avance']['fecha']))
            ->count();

        $ultimoAvanceGeneral = $proyectos
            ->pluck('ultimo_avance.fecha')
            ->filter()
            ->sortDesc()
            ->first();

        return [
            'total_proyectos' => $proyectos->count(),
            'sin_avance' => $sinAvance,
            'por_estado' => $porEstado,
            'ultimo_avance_general' => $ultimoAvanceGeneral,
        ];
    }
}