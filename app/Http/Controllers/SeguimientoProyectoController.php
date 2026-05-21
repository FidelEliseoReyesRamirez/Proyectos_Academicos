<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SeguimientoProyectoController extends Controller
{
    public function index(Request $request): Response
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        $sortBy = (string) $request->query('sort_by', 'ultimo_movimiento');
        $sortDir = (string) $request->query('sort_dir', 'desc');

        if (! in_array($sortBy, ['estado', 'titulo', 'ultimo_movimiento'], true)) {
            $sortBy = 'ultimo_movimiento';
        }

        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $query = $this->proyectosVisiblesQuery($usuario->id, $rol)
            ->with([
                'estudiante:id,name,email,rol',
                'tutor:id,name,email,rol',
                'revisores:id,name,email,rol',
            ])
            ->withCount([
                'entregas',
                'archivos',
                'observaciones',
                'revisiones',
                'eventos',
            ]);

        if ($sortBy === 'estado') {
            $query->orderBy('estado', $sortDir)->orderByDesc('updated_at');
        } elseif ($sortBy === 'titulo') {
            $query->orderBy('titulo', $sortDir);
        } else {
            $query->orderByDesc('updated_at')->orderBy('titulo');
        }

        $proyectos = $query
            ->limit(100)
            ->get()
            ->map(fn (Proyecto $proyecto) => $this->mapProyectoListado($proyecto));

        return Inertia::render('seguimiento/index', [
            'seguimientoData' => [
                'rol' => $rol,
                'filters' => [
                    'sort_by' => $sortBy,
                    'sort_dir' => $sortDir,
                ],
                'summary' => [
                    'total' => $proyectos->count(),
                    'sin_entregas' => $proyectos->where('entregas_count', 0)->count(),
                    'con_observaciones' => $proyectos->filter(fn ($p) => $p['observaciones_count'] > 0)->count(),
                    'con_revisiones' => $proyectos->filter(fn ($p) => $p['revisiones_count'] > 0)->count(),
                ],
                'proyectos' => $proyectos->values(),
            ],
        ]);
    }

    public function show(Request $request, Proyecto $proyecto): Response
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless($this->puedeVerProyecto($proyecto, (int) $usuario->id, $rol), 403);

        $proyecto->load([
            'estudiante:id,name,email,rol',
            'tutor:id,name,email,rol',
            'revisores:id,name,email,rol',
            'entregas' => fn ($query) => $query->orderByDesc('numero_version'),
            'entregas.archivos' => fn ($query) => $query->orderByDesc('created_at'),
            'entregas.archivos.subidoPor:id,name,email,rol',
            'entregas.observaciones' => fn ($query) => $query->orderByDesc('created_at'),
            'entregas.observaciones.autor:id,name,email,rol',
            'entregas.observaciones.dirigidoA:id,name,email,rol',
            'entregas.revisiones' => fn ($query) => $query->orderByDesc('created_at'),
            'entregas.revisiones.revisor:id,name,email,rol',
            'archivos' => fn ($query) => $query->orderByDesc('created_at'),
            'archivos.subidoPor:id,name,email,rol',
            'observaciones' => fn ($query) => $query->orderByDesc('created_at'),
            'observaciones.autor:id,name,email,rol',
            'observaciones.dirigidoA:id,name,email,rol',
            'revisiones' => fn ($query) => $query->orderByDesc('created_at'),
            'revisiones.revisor:id,name,email,rol',
            'eventos' => fn ($query) => $query->orderByDesc('created_at'),
            'eventos.actor:id,name,email,rol',
        ]);

        return Inertia::render('seguimiento/show', [
            'seguimientoData' => [
                'rol' => $rol,
                'proyecto' => $this->mapProyectoDetalle($proyecto),
                'linea_tiempo' => $this->lineaTiempo($proyecto),
                'permisos' => [
                    'puede_subir_entrega' => $rol === 'estudiante' && (int) $proyecto->estudiante_id === (int) $usuario->id,
                    'puede_observar' => in_array($rol, ['docente', 'coordinador', 'admin'], true),
                    'puede_revisar' => in_array($rol, ['docente', 'coordinador', 'admin'], true),
                    'puede_administrar' => in_array($rol, ['coordinador', 'admin'], true),
                ],
            ],
        ]);
    }

    private function proyectosVisiblesQuery(int $usuarioId, string $rol): Builder
    {
        $query = Proyecto::query()
            ->whereNull('deleted_at');

        if ($rol === 'estudiante') {
            return $query->where('estudiante_id', $usuarioId);
        }

        if ($rol === 'docente') {
            return $query->where(function (Builder $subquery) use ($usuarioId) {
                $subquery
                    ->where('tutor_id', $usuarioId)
                    ->orWhereHas('revisores', fn (Builder $revisorQuery) => $revisorQuery->where('users.id', $usuarioId));
            });
        }

        if (in_array($rol, ['coordinador', 'admin'], true)) {
            return $query;
        }

        return $query->whereRaw('1 = 0');
    }

    private function puedeVerProyecto(Proyecto $proyecto, int $usuarioId, string $rol): bool
    {
        if (in_array($rol, ['coordinador', 'admin'], true)) {
            return true;
        }

        if ($rol === 'estudiante') {
            return (int) $proyecto->estudiante_id === $usuarioId;
        }

        if ($rol === 'docente') {
            if ((int) $proyecto->tutor_id === $usuarioId) {
                return true;
            }

            return DB::table('proyecto_revisores')
                ->where('proyecto_id', $proyecto->id)
                ->where('revisor_id', $usuarioId)
                ->exists();
        }

        return false;
    }

    private function mapProyectoListado(Proyecto $proyecto): array
    {
        return [
            'id' => (int) $proyecto->id,
            'codigo' => $proyecto->codigo,
            'titulo' => $proyecto->titulo,
            'descripcion' => $proyecto->descripcion,
            'estado' => (string) $proyecto->estado,
            'modalidad' => (string) $proyecto->modalidad,
            'area_tematica' => $proyecto->area_tematica,
            'updated_at' => $proyecto->updated_at,
            'estudiante' => $this->mapUsuario($proyecto->estudiante),
            'tutor' => $this->mapUsuario($proyecto->tutor),
            'revisores' => $proyecto->revisores->map(fn ($u) => $this->mapUsuario($u))->values(),
            'entregas_count' => (int) $proyecto->entregas_count,
            'archivos_count' => (int) $proyecto->archivos_count,
            'observaciones_count' => (int) $proyecto->observaciones_count,
            'revisiones_count' => (int) $proyecto->revisiones_count,
            'eventos_count' => (int) $proyecto->eventos_count,
        ];
    }

    private function mapProyectoDetalle(Proyecto $proyecto): array
    {
        return [
            'id' => (int) $proyecto->id,
            'codigo' => $proyecto->codigo,
            'titulo' => $proyecto->titulo,
            'descripcion' => $proyecto->descripcion,
            'estado' => (string) $proyecto->estado,
            'modalidad' => (string) $proyecto->modalidad,
            'area_tematica' => $proyecto->area_tematica,
            'created_at' => $proyecto->created_at,
            'updated_at' => $proyecto->updated_at,
            'estudiante' => $this->mapUsuario($proyecto->estudiante),
            'tutor' => $this->mapUsuario($proyecto->tutor),
            'revisores' => $proyecto->revisores->map(fn ($u) => $this->mapUsuario($u))->values(),
            'entregas' => $proyecto->entregas->map(fn ($entrega) => [
                'id' => (int) $entrega->id,
                'titulo' => $entrega->titulo,
                'descripcion' => $entrega->descripcion,
                'numero_version' => (int) $entrega->numero_version,
                'estado' => $entrega->estado,
                'enviado_at' => $entrega->enviado_at,
                'created_at' => $entrega->created_at,
                'archivos' => $entrega->archivos->map(fn ($archivo) => $this->mapArchivo($archivo))->values(),
                'observaciones' => $entrega->observaciones->map(fn ($observacion) => $this->mapObservacion($observacion))->values(),
                'revisiones' => $entrega->revisiones->map(fn ($revision) => $this->mapRevision($revision))->values(),
            ])->values(),
            'archivos' => $proyecto->archivos->map(fn ($archivo) => $this->mapArchivo($archivo))->values(),
            'observaciones' => $proyecto->observaciones->map(fn ($observacion) => $this->mapObservacion($observacion))->values(),
            'revisiones' => $proyecto->revisiones->map(fn ($revision) => $this->mapRevision($revision))->values(),
            'eventos' => $proyecto->eventos->map(fn ($evento) => [
                'id' => (int) $evento->id,
                'tipo_evento' => $evento->tipo_evento,
                'descripcion' => $evento->descripcion,
                'metadata' => $evento->metadata,
                'created_at' => $evento->created_at,
                'actor' => $this->mapUsuario($evento->actor),
            ])->values(),
        ];
    }

    private function lineaTiempo(Proyecto $proyecto): array
    {
        $historialEstados = DB::table('historial_estados as h')
            ->leftJoin('users as u', 'u.id', '=', 'h.usuario_id')
            ->where('h.proyecto_id', $proyecto->id)
            ->selectRaw("
                h.id,
                h.estado_anterior::text as estado_anterior,
                h.estado_nuevo::text as estado_nuevo,
                h.comentario,
                h.created_at,
                u.name as usuario_nombre,
                u.email as usuario_email
            ")
            ->get()
            ->map(fn ($item) => [
                'tipo' => 'estado_cambiado',
                'titulo' => 'Cambio de estado',
                'descripcion' => ($item->estado_anterior ?: 'Sin estado previo') . ' → ' . $item->estado_nuevo,
                'comentario' => $item->comentario,
                'fecha' => $item->created_at,
                'actor' => [
                    'name' => $item->usuario_nombre,
                    'email' => $item->usuario_email,
                ],
            ]);

        $eventos = $proyecto->eventos->map(fn ($evento) => [
            'tipo' => $evento->tipo_evento,
            'titulo' => $this->tituloEvento($evento->tipo_evento),
            'descripcion' => $evento->descripcion,
            'comentario' => null,
            'fecha' => $evento->created_at,
            'actor' => $this->mapUsuario($evento->actor),
        ]);

        $entregas = $proyecto->entregas->map(fn ($entrega) => [
            'tipo' => 'entrega_registrada',
            'titulo' => 'Entrega registrada',
            'descripcion' => 'Versión ' . $entrega->numero_version . ': ' . $entrega->titulo,
            'comentario' => $entrega->descripcion,
            'fecha' => $entrega->created_at,
            'actor' => $this->mapUsuario($entrega->estudiante),
        ]);

        return $historialEstados
            ->merge($eventos)
            ->merge($entregas)
            ->sortByDesc('fecha')
            ->values()
            ->all();
    }

    private function tituloEvento(string $tipo): string
    {
        return match ($tipo) {
            'entrega_subida' => 'Entrega subida',
            'archivo_subido' => 'Archivo subido',
            'observacion_registrada' => 'Observación registrada',
            'revision_registrada' => 'Revisión registrada',
            'matriz_correccion_subida' => 'Matriz de corrección subida',
            'estado_actualizado' => 'Estado actualizado',
            'derivado_revision' => 'Derivado a revisión',
            default => str_replace('_', ' ', ucfirst($tipo)),
        };
    }

    private function mapUsuario($usuario): ?array
    {
        if (! $usuario) {
            return null;
        }

        return [
            'id' => (int) $usuario->id,
            'name' => $usuario->name,
            'email' => $usuario->email,
            'rol' => $usuario->rol,
        ];
    }

    private function mapArchivo($archivo): array
    {
        return [
            'id' => (int) $archivo->id,
            'tipo_archivo' => $archivo->tipo_archivo,
            'nombre_original' => $archivo->nombre_original,
            'ruta_almacenamiento' => $archivo->ruta_almacenamiento,
            'mime_type' => $archivo->mime_type,
            'tamano_bytes' => $archivo->tamano_bytes,
            'created_at' => $archivo->created_at,
            'subido_por' => $this->mapUsuario($archivo->subidoPor),
        ];
    }

    private function mapObservacion($observacion): array
    {
        return [
            'id' => (int) $observacion->id,
            'tipo' => $observacion->tipo,
            'texto' => $observacion->texto,
            'estado' => $observacion->estado,
            'created_at' => $observacion->created_at,
            'autor' => $this->mapUsuario($observacion->autor),
            'dirigido_a' => $this->mapUsuario($observacion->dirigidoA),
        ];
    }

    private function mapRevision($revision): array
    {
        return [
            'id' => (int) $revision->id,
            'rol_revision' => $revision->rol_revision,
            'resultado' => $revision->resultado,
            'comentario' => $revision->comentario,
            'created_at' => $revision->created_at,
            'revisor' => $this->mapUsuario($revision->revisor),
        ];
    }
}
