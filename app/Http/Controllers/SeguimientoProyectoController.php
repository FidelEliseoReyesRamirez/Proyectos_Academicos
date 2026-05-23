<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use App\Models\ProyectoArchivo;
use App\Models\ProyectoEntrega;
use App\Models\ProyectoEvento;
use App\Models\ProyectoRevision;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Services\KafkaProducerService;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
            ->map(fn (Proyecto $proyecto) => $this->mapProyectoListado($proyecto, (int) $usuario->id, $rol));

        return Inertia::render('seguimiento/index', [
            'seguimientoData' => [
                'rol' => $rol,
                'filters' => [
                    'sort_by' => $sortBy,
                    'sort_dir' => $sortDir,
                ],
                'summary' => [
                    'total' => $proyectos->count(),
                    'mis_tutoriados' => $proyectos->where('relacion_usuario', 'tutor')->count(),
                    'mis_revisiones' => $proyectos->where('relacion_usuario', 'revisor')->count(),
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
            'documentoTrabajoActualizadoPor:id,name,email,rol',
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
                    'puede_accion_tutor' => $rol === 'docente' && (int) $proyecto->tutor_id === (int) $usuario->id,
                    'puede_devolver_revision' => in_array($rol, ['coordinador', 'admin'], true)
                        || (
                            $rol === 'docente'
                            && DB::table('proyecto_revisores')
                                ->where('proyecto_id', $proyecto->id)
                                ->where('revisor_id', $usuario->id)
                                ->exists()
                        ),
                    'puede_administrar' => in_array($rol, ['coordinador', 'admin'], true),
                ],
            ],
        ]);
    }

    public function storeReunionTutoria(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless($rol === 'docente' && (int) $proyecto->tutor_id === (int) $usuario->id, 403);

        $validated = $request->validate([
            'fecha_reunion' => ['required', 'date'],
            'modalidad' => ['required', 'string', 'in:presencial,virtual'],
            'temas_tratados' => ['required', 'string', 'max:5000'],
            'acuerdos' => ['required', 'string', 'max:5000'],
        ]);

        $proyecto->loadMissing([
            'estudiante:id,name,email,rol',
            'tutor:id,name,email,rol',
            'revisores:id,name,email,rol',
        ]);

        $eventoKafka = DB::transaction(function () use ($validated, $proyecto, $usuario): array {
            $reunionId = DB::table('proyecto_reuniones_tutoria')->insertGetId([
                'proyecto_id' => (int) $proyecto->id,
                'tutor_id' => (int) $usuario->id,
                'fecha_reunion' => $validated['fecha_reunion'],
                'modalidad' => $validated['modalidad'],
                'temas_tratados' => $validated['temas_tratados'],
                'acuerdos' => $validated['acuerdos'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            ProyectoEvento::create([
                'proyecto_id' => (int) $proyecto->id,
                'actor_id' => (int) $usuario->id,
                'tipo_evento' => 'reunion_tutoria_registrada',
                'descripcion' => 'El tutor registró una reunión de seguimiento.',
                'metadata' => [
                    'reunion_id' => (int) $reunionId,
                    'fecha_reunion' => $validated['fecha_reunion'],
                    'modalidad' => $validated['modalidad'],
                    'temas_tratados' => $validated['temas_tratados'],
                    'acuerdos' => $validated['acuerdos'],
                ],
            ]);

            return [
                'event_id' => (string) Str::uuid(),
                'event' => 'proyecto.reunion_tutoria_registrada',
                'module' => 'Seguimiento',
                'aggregate_type' => 'proyecto',
                'aggregate_id' => (int) $proyecto->id,
                'occurred_at' => now()->toISOString(),
                'data' => [
                    'proyecto' => [
                        'id' => (int) $proyecto->id,
                        'codigo' => $proyecto->codigo,
                        'titulo' => $proyecto->titulo,
                        'estado' => (string) $proyecto->estado,
                    ],
                    'reunion' => [
                        'id' => (int) $reunionId,
                        'fecha_reunion' => $validated['fecha_reunion'],
                        'modalidad' => $validated['modalidad'],
                        'temas_tratados' => $validated['temas_tratados'],
                        'acuerdos' => $validated['acuerdos'],
                    ],
                    'tutor' => $proyecto->tutor ? [
                        'id' => (int) $proyecto->tutor->id,
                        'nombre' => $proyecto->tutor->name,
                        'email' => $proyecto->tutor->email,
                    ] : null,
                    'estudiante' => $proyecto->estudiante ? [
                        'id' => (int) $proyecto->estudiante->id,
                        'nombre' => $proyecto->estudiante->name,
                        'email' => $proyecto->estudiante->email,
                    ] : null,
                    'revisores' => $proyecto->revisores->map(fn ($revisor) => [
                        'id' => (int) $revisor->id,
                        'nombre' => $revisor->name,
                        'email' => $revisor->email,
                    ])->values()->all(),
                ],
            ];
        });

        $this->publicarEventoSeguimiento($eventoKafka, $proyecto);

        return redirect()
            ->route('seguimiento.show', $proyecto)
            ->with('toast', [
                'type' => 'success',
                'message' => 'Reunión de tutoría registrada correctamente.',
            ]);
    }

    public function storeEntrega(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless(
            $rol === 'estudiante' && (int) $proyecto->estudiante_id === (int) $usuario->id,
            403
        );

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:3000'],
            'archivo' => [
                'required',
                'file',
                'max:204800',
                'mimes:doc,docx,pdf,xls,xlsx',
            ],
        ]);

        $archivo = $request->file('archivo');

        $proyecto->loadMissing([
            'estudiante:id,name,email,rol',
            'tutor:id,name,email,rol',
            'revisores:id,name,email,rol',
        ]);

        $eventoKafka = DB::transaction(function () use ($validated, $archivo, $proyecto, $usuario): array {
            $siguienteVersion = ((int) ProyectoEntrega::query()
                ->where('proyecto_id', $proyecto->id)
                ->max('numero_version')) + 1;

            $entrega = ProyectoEntrega::create([
                'proyecto_id' => (int) $proyecto->id,
                'estudiante_id' => (int) $usuario->id,
                'titulo' => $validated['titulo'],
                'descripcion' => $validated['descripcion'] ?? null,
                'numero_version' => $siguienteVersion,
                'estado' => 'enviado',
                'enviado_at' => now(),
            ]);

            $nombreOriginal = $archivo->getClientOriginalName();
            $extension = $archivo->getClientOriginalExtension();
            $nombreServidor = 'entrega_' . $entrega->id . '_' . Str::uuid() . '.' . $extension;
            $directorio = 'proyectos/' . $proyecto->id . '/entregas/' . $entrega->id;

            $ruta = $archivo->storeAs($directorio, $nombreServidor, 'local');

            $archivoRegistro = ProyectoArchivo::create([
                'entrega_id' => (int) $entrega->id,
                'proyecto_id' => (int) $proyecto->id,
                'subido_por_id' => (int) $usuario->id,
                'tipo_archivo' => 'avance_estudiante',
                'nombre_original' => $nombreOriginal,
                'nombre_servidor' => $nombreServidor,
                'ruta_almacenamiento' => $ruta,
                'mime_type' => $archivo->getClientMimeType(),
                'tamano_bytes' => $archivo->getSize(),
            ]);

            ProyectoEvento::create([
                'proyecto_id' => (int) $proyecto->id,
                'actor_id' => (int) $usuario->id,
                'tipo_evento' => 'entrega_subida',
                'descripcion' => 'El estudiante subió la entrega versión ' . $siguienteVersion . ': ' . $entrega->titulo,
                'metadata' => [
                    'entrega_id' => (int) $entrega->id,
                    'numero_version' => $siguienteVersion,
                    'titulo' => $entrega->titulo,
                    'archivo_original' => $nombreOriginal,
                ],
            ]);

            return [
                'event_id' => (string) Str::uuid(),
                'event' => 'proyecto.entrega_subida',
                'module' => 'Seguimiento',
                'aggregate_type' => 'proyecto',
                'aggregate_id' => (int) $proyecto->id,
                'occurred_at' => now()->toISOString(),
                'data' => [
                    'proyecto' => [
                        'id' => (int) $proyecto->id,
                        'codigo' => $proyecto->codigo,
                        'titulo' => $proyecto->titulo,
                        'estado' => (string) $proyecto->estado,
                    ],
                    'entrega' => [
                        'id' => (int) $entrega->id,
                        'titulo' => $entrega->titulo,
                        'descripcion' => $entrega->descripcion,
                        'numero_version' => (int) $entrega->numero_version,
                        'estado' => $entrega->estado,
                        'enviado_at' => optional($entrega->enviado_at)->toISOString(),
                    ],
                    'archivo' => [
                        'id' => (int) $archivoRegistro->id,
                        'nombre_original' => $archivoRegistro->nombre_original,
                        'mime_type' => $archivoRegistro->mime_type,
                        'tamano_bytes' => $archivoRegistro->tamano_bytes,
                    ],
                    'estudiante' => [
                        'id' => (int) $usuario->id,
                        'nombre' => $usuario->name,
                        'email' => $usuario->email,
                    ],
                    'tutor' => $proyecto->tutor ? [
                        'id' => (int) $proyecto->tutor->id,
                        'nombre' => $proyecto->tutor->name,
                        'email' => $proyecto->tutor->email,
                    ] : null,
                    'revisores' => $proyecto->revisores->map(fn ($revisor) => [
                        'id' => (int) $revisor->id,
                        'nombre' => $revisor->name,
                        'email' => $revisor->email,
                    ])->values()->all(),
                ],
            ];
        });

        try {
            app(KafkaProducerService::class)->publish(
                'proyectos.entregas',
                $eventoKafka,
                'proyecto-' . $proyecto->id
            );
        } catch (\Throwable $exception) {
            Log::warning('No se pudo publicar proyecto.entrega_subida en Kafka.', [
                'proyecto_id' => $proyecto->id,
                'error' => $exception->getMessage(),
            ]);
        }

        return redirect()
            ->route('seguimiento.show', $proyecto)
            ->with('toast', [
                'type' => 'success',
                'message' => 'Entrega subida correctamente.',
            ]);
    }

    public function updateDocumentoTrabajo(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless($this->puedeVerProyecto($proyecto, (int) $usuario->id, $rol), 403);

        $validated = $request->validate([
            'documento_trabajo_titulo' => ['nullable', 'string', 'max:255'],
            'documento_trabajo_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $titulo = trim((string) ($validated['documento_trabajo_titulo'] ?? ''));
        $url = trim((string) ($validated['documento_trabajo_url'] ?? ''));

        if ($titulo === '' && $url === '') {
            return back()->withErrors([
                'documento_trabajo_url' => 'Debes registrar al menos un título o un enlace del documento de trabajo.',
            ]);
        }

        DB::transaction(function () use ($proyecto, $usuario, $titulo, $url): void {
            $proyecto->forceFill([
                'documento_trabajo_titulo' => $titulo !== '' ? $titulo : null,
                'documento_trabajo_url' => $url !== '' ? $url : null,
                'documento_trabajo_actualizado_por_id' => (int) $usuario->id,
                'documento_trabajo_actualizado_at' => now(),
            ])->save();

            ProyectoEvento::create([
                'proyecto_id' => (int) $proyecto->id,
                'actor_id' => (int) $usuario->id,
                'tipo_evento' => 'documento_trabajo_actualizado',
                'descripcion' => 'Se actualizó el documento de trabajo activo del proyecto.',
                'metadata' => [
                    'titulo' => $titulo,
                    'url' => $url,
                ],
            ]);
        });

        return redirect()
            ->route('seguimiento.show', $proyecto)
            ->with('toast', [
                'type' => 'success',
                'message' => 'Documento de trabajo actualizado correctamente.',
            ]);
    }

    public function tutorSolicitarCorrecciones(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless($rol === 'docente' && (int) $proyecto->tutor_id === (int) $usuario->id, 403);

        $proyecto->loadMissing([
            'estudiante:id,name,email,rol',
            'tutor:id,name,email,rol',
            'revisores:id,name,email,rol',
        ]);

        $validated = $request->validate([
            'entrega_id' => ['nullable', 'integer', 'exists:proyecto_entregas,id'],
            'comentario' => ['required', 'string', 'max:5000'],
        ]);

        $entrega = null;

        if (! empty($validated['entrega_id'])) {
            $entrega = ProyectoEntrega::query()
                ->where('id', $validated['entrega_id'])
                ->where('proyecto_id', $proyecto->id)
                ->firstOrFail();
        } else {
            $entrega = ProyectoEntrega::query()
                ->where('proyecto_id', $proyecto->id)
                ->orderByDesc('numero_version')
                ->first();
        }

        $eventoKafka = DB::transaction(function () use ($proyecto, $usuario, $validated, $entrega): array {
            DB::statement("SELECT set_config('app.user_id', ?, true)", [(string) $usuario->id]);

            $estadoAnterior = (string) $proyecto->estado;

            $proyecto->forceFill([
                'estado' => 'observado',
            ])->save();

            if ($entrega) {
                $entrega->forceFill([
                    'estado' => 'requiere_correcciones',
                ])->save();
            }

            ProyectoEvento::create([
                'proyecto_id' => (int) $proyecto->id,
                'actor_id' => (int) $usuario->id,
                'tipo_evento' => 'correcciones_solicitadas',
                'descripcion' => 'El tutor solicitó correcciones al estudiante.',
                'metadata' => [
                    'estado_anterior' => $estadoAnterior,
                    'estado_nuevo' => 'observado',
                    'entrega_id' => $entrega ? (int) $entrega->id : null,
                    'numero_version' => $entrega ? (int) $entrega->numero_version : null,
                    'comentario' => $validated['comentario'],
                ],
            ]);

            return [
                'event_id' => (string) Str::uuid(),
                'event' => 'proyecto.correcciones_solicitadas',
                'module' => 'Seguimiento',
                'aggregate_type' => 'proyecto',
                'aggregate_id' => (int) $proyecto->id,
                'occurred_at' => now()->toISOString(),
                'data' => [
                    'proyecto' => [
                        'id' => (int) $proyecto->id,
                        'codigo' => $proyecto->codigo,
                        'titulo' => $proyecto->titulo,
                        'estado_anterior' => $estadoAnterior,
                        'estado_nuevo' => 'observado',
                    ],
                    'entrega' => $entrega ? [
                        'id' => (int) $entrega->id,
                        'titulo' => $entrega->titulo,
                        'numero_version' => (int) $entrega->numero_version,
                        'estado' => 'requiere_correcciones',
                    ] : null,
                    'comentario' => $validated['comentario'],
                    'tutor' => [
                        'id' => (int) $usuario->id,
                        'nombre' => $usuario->name,
                        'email' => $usuario->email,
                    ],
                    'estudiante' => $proyecto->estudiante ? [
                        'id' => (int) $proyecto->estudiante->id,
                        'nombre' => $proyecto->estudiante->name,
                        'email' => $proyecto->estudiante->email,
                    ] : null,
                ],
            ];
        });

        $this->publicarEventoSeguimiento($eventoKafka, $proyecto);

        return redirect()
            ->route('seguimiento.show', $proyecto)
            ->with('toast', [
                'type' => 'success',
                'message' => 'Correcciones solicitadas al estudiante.',
            ]);
    }

    public function tutorDerivarRevision(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless($rol === 'docente' && (int) $proyecto->tutor_id === (int) $usuario->id, 403);

        abort_if($proyecto->revisores()->count() === 0, 422, 'El proyecto no tiene revisores asignados.');

        $validated = $request->validate([
            'entrega_id' => ['nullable', 'integer', 'exists:proyecto_entregas,id'],
            'comentario' => ['nullable', 'string', 'max:5000'],
        ]);

        $proyecto->loadMissing([
            'estudiante:id,name,email,rol',
            'tutor:id,name,email,rol',
            'revisores:id,name,email,rol',
        ]);

        $entrega = null;

        if (! empty($validated['entrega_id'])) {
            $entrega = ProyectoEntrega::query()
                ->where('id', $validated['entrega_id'])
                ->where('proyecto_id', $proyecto->id)
                ->firstOrFail();
        } else {
            $entrega = ProyectoEntrega::query()
                ->where('proyecto_id', $proyecto->id)
                ->orderByDesc('numero_version')
                ->first();
        }

        $eventoKafka = DB::transaction(function () use ($proyecto, $usuario, $validated, $entrega): array {
            DB::statement("SELECT set_config('app.user_id', ?, true)", [(string) $usuario->id]);

            $estadoAnterior = (string) $proyecto->estado;

            $proyecto->forceFill([
                'estado' => 'en_revision',
            ])->save();

            if ($entrega) {
                $entrega->forceFill([
                    'estado' => 'derivada_revision',
                ])->save();
            }

            ProyectoEvento::create([
                'proyecto_id' => (int) $proyecto->id,
                'actor_id' => (int) $usuario->id,
                'tipo_evento' => 'derivado_revision',
                'descripcion' => 'El tutor derivó el proyecto a revisión por revisores.',
                'metadata' => [
                    'estado_anterior' => $estadoAnterior,
                    'estado_nuevo' => 'en_revision',
                    'entrega_id' => $entrega ? (int) $entrega->id : null,
                    'numero_version' => $entrega ? (int) $entrega->numero_version : null,
                    'comentario' => $validated['comentario'] ?? null,
                    'revisores' => $proyecto->revisores->map(fn ($revisor) => [
                        'id' => (int) $revisor->id,
                        'nombre' => $revisor->name,
                        'email' => $revisor->email,
                    ])->values()->all(),
                ],
            ]);

            return [
                'event_id' => (string) Str::uuid(),
                'event' => 'proyecto.derivado_revision',
                'module' => 'Seguimiento',
                'aggregate_type' => 'proyecto',
                'aggregate_id' => (int) $proyecto->id,
                'occurred_at' => now()->toISOString(),
                'data' => [
                    'proyecto' => [
                        'id' => (int) $proyecto->id,
                        'codigo' => $proyecto->codigo,
                        'titulo' => $proyecto->titulo,
                        'estado_anterior' => $estadoAnterior,
                        'estado_nuevo' => 'en_revision',
                    ],
                    'entrega' => $entrega ? [
                        'id' => (int) $entrega->id,
                        'titulo' => $entrega->titulo,
                        'numero_version' => (int) $entrega->numero_version,
                        'estado' => 'derivada_revision',
                    ] : null,
                    'comentario' => $validated['comentario'] ?? null,
                    'tutor' => [
                        'id' => (int) $usuario->id,
                        'nombre' => $usuario->name,
                        'email' => $usuario->email,
                    ],
                    'estudiante' => $proyecto->estudiante ? [
                        'id' => (int) $proyecto->estudiante->id,
                        'nombre' => $proyecto->estudiante->name,
                        'email' => $proyecto->estudiante->email,
                    ] : null,
                    'revisores' => $proyecto->revisores->map(fn ($revisor) => [
                        'id' => (int) $revisor->id,
                        'nombre' => $revisor->name,
                        'email' => $revisor->email,
                    ])->values()->all(),
                ],
            ];
        });

        $this->publicarEventoSeguimiento($eventoKafka, $proyecto);

        return redirect()
            ->route('seguimiento.show', $proyecto)
            ->with('toast', [
                'type' => 'success',
                'message' => 'Proyecto derivado a revisión por revisores.',
            ]);
    }

    public function storeArchivoRevision(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        $esRevisorAsignado = DB::table('proyecto_revisores')
            ->where('proyecto_id', $proyecto->id)
            ->where('revisor_id', $usuario->id)
            ->exists();

        abort_unless(
            in_array($rol, ['coordinador', 'admin'], true)
                || ($rol === 'docente' && $esRevisorAsignado),
            403
        );

        $validated = $request->validate([
            'entrega_id' => ['required', 'integer', 'exists:proyecto_entregas,id'],
            'resultado' => ['required', 'string', 'in:aprobado,rechazado,requiere_correcciones'],
            'comentario' => ['nullable', 'string', 'max:5000'],
            'archivo' => [
                'required',
                'file',
                'max:204800',
                'mimes:doc,docx,pdf,xls,xlsx',
            ],
        ]);

        $entrega = ProyectoEntrega::query()
            ->where('id', $validated['entrega_id'])
            ->where('proyecto_id', $proyecto->id)
            ->firstOrFail();

        $archivo = $request->file('archivo');

        $proyecto->loadMissing([
            'estudiante:id,name,email,rol',
            'tutor:id,name,email,rol',
            'revisores:id,name,email,rol',
        ]);

        $eventoKafka = DB::transaction(function () use ($validated, $archivo, $proyecto, $entrega, $usuario, $rol): array {
            $rolRevision = 'coordinador';

            if ($rol === 'docente') {
                $rolRevision = 'revisor';
            }

            $revision = ProyectoRevision::create([
                'proyecto_id' => (int) $proyecto->id,
                'entrega_id' => (int) $entrega->id,
                'revisor_id' => (int) $usuario->id,
                'rol_revision' => $rolRevision,
                'resultado' => $validated['resultado'],
                'comentario' => $validated['comentario'] ?? null,
            ]);

            $nombreOriginal = $archivo->getClientOriginalName();
            $extension = $archivo->getClientOriginalExtension();
            $nombreServidor = 'revision_' . $revision->id . '_' . Str::uuid() . '.' . $extension;
            $directorio = 'proyectos/' . $proyecto->id . '/entregas/' . $entrega->id . '/revisiones';

            $ruta = $archivo->storeAs($directorio, $nombreServidor, 'local');

            $archivoRevision = ProyectoArchivo::create([
                'entrega_id' => (int) $entrega->id,
                'proyecto_id' => (int) $proyecto->id,
                'subido_por_id' => (int) $usuario->id,
                'tipo_archivo' => 'documento_revisado',
                'estado' => 'activo',
                'nombre_original' => $nombreOriginal,
                'nombre_servidor' => $nombreServidor,
                'ruta_almacenamiento' => $ruta,
                'mime_type' => $archivo->getClientMimeType(),
                'tamano_bytes' => $archivo->getSize(),
            ]);

            ProyectoEvento::create([
                'proyecto_id' => (int) $proyecto->id,
                'actor_id' => (int) $usuario->id,
                'tipo_evento' => 'archivo_revision_devuelto',
                'descripcion' => ucfirst($rolRevision) . ' devolvió un archivo revisado para la entrega versión ' . $entrega->numero_version . '.',
                'metadata' => [
                    'entrega_id' => (int) $entrega->id,
                    'revision_id' => (int) $revision->id,
                    'rol_revision' => $rolRevision,
                    'resultado' => $validated['resultado'],
                    'archivo_original' => $nombreOriginal,
                ],
            ]);

            return [
                'event_id' => (string) Str::uuid(),
                'event' => 'proyecto.revision_devuelta',
                'module' => 'Seguimiento',
                'aggregate_type' => 'proyecto',
                'aggregate_id' => (int) $proyecto->id,
                'occurred_at' => now()->toISOString(),
                'data' => [
                    'proyecto' => [
                        'id' => (int) $proyecto->id,
                        'codigo' => $proyecto->codigo,
                        'titulo' => $proyecto->titulo,
                        'estado' => (string) $proyecto->estado,
                    ],
                    'entrega' => [
                        'id' => (int) $entrega->id,
                        'titulo' => $entrega->titulo,
                        'numero_version' => (int) $entrega->numero_version,
                        'estado' => $entrega->estado,
                    ],
                    'revision' => [
                        'id' => (int) $revision->id,
                        'rol_revision' => $rolRevision,
                        'resultado' => $validated['resultado'],
                        'comentario' => $validated['comentario'] ?? null,
                    ],
                    'archivo' => [
                        'id' => (int) $archivoRevision->id,
                        'nombre_original' => $nombreOriginal,
                        'mime_type' => $archivo->getClientMimeType(),
                        'tamano_bytes' => $archivo->getSize(),
                    ],
                    'revisor' => [
                        'id' => (int) $usuario->id,
                        'nombre' => $usuario->name,
                        'email' => $usuario->email,
                    ],
                    'estudiante' => $proyecto->estudiante ? [
                        'id' => (int) $proyecto->estudiante->id,
                        'nombre' => $proyecto->estudiante->name,
                        'email' => $proyecto->estudiante->email,
                    ] : null,
                    'tutor' => $proyecto->tutor ? [
                        'id' => (int) $proyecto->tutor->id,
                        'nombre' => $proyecto->tutor->name,
                        'email' => $proyecto->tutor->email,
                    ] : null,
                    'revisores' => $proyecto->revisores->map(fn ($revisor) => [
                        'id' => (int) $revisor->id,
                        'nombre' => $revisor->name,
                        'email' => $revisor->email,
                    ])->values()->all(),
                ],
            ];
        });

        $this->publicarEventoSeguimiento($eventoKafka, $proyecto);

        return redirect()
            ->route('seguimiento.show', $proyecto)
            ->with('toast', [
                'type' => 'success',
                'message' => 'Archivo revisado devuelto correctamente.',
            ]);
    }

    public function replaceArchivo(Request $request, Proyecto $proyecto, ProyectoArchivo $archivo): RedirectResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless($this->puedeVerProyecto($proyecto, (int) $usuario->id, $rol), 403);
        abort_unless((int) $archivo->proyecto_id === (int) $proyecto->id, 404);
        abort_unless((string) $archivo->estado === 'activo', 422);

        $esArchivoDelUsuario = (int) $archivo->subido_por_id === (int) $usuario->id;

        $puedeReemplazarComoEstudiante = $rol === 'estudiante'
            && (int) $proyecto->estudiante_id === (int) $usuario->id
            && $archivo->tipo_archivo === 'avance_estudiante'
            && $esArchivoDelUsuario;

        $esRevisorAsignado = DB::table('proyecto_revisores')
            ->where('proyecto_id', $proyecto->id)
            ->where('revisor_id', $usuario->id)
            ->exists();

        $puedeReemplazarComoRevisor = $rol === 'docente'
            && $esRevisorAsignado
            && $archivo->tipo_archivo === 'documento_revisado'
            && $esArchivoDelUsuario;

        $puedeReemplazarComoCoordinador = in_array($rol, ['coordinador', 'admin'], true);

        abort_unless(
            $puedeReemplazarComoEstudiante
                || $puedeReemplazarComoRevisor
                || $puedeReemplazarComoCoordinador,
            403
        );

        $validated = $request->validate([
            'archivo' => [
                'required',
                'file',
                'max:204800',
                'mimes:doc,docx,pdf,xls,xlsx',
            ],
            'motivo_reemplazo' => ['required', 'string', 'max:1000'],
        ]);

        $nuevoArchivo = $request->file('archivo');

        DB::transaction(function () use ($validated, $nuevoArchivo, $proyecto, $archivo, $usuario): void {
            $nombreOriginal = $nuevoArchivo->getClientOriginalName();
            $extension = $nuevoArchivo->getClientOriginalExtension();

            $prefijo = $archivo->tipo_archivo === 'documento_revisado'
                ? 'revision_reemplazo_'
                : 'entrega_reemplazo_';

            $nombreServidor = $prefijo . $archivo->id . '_' . Str::uuid() . '.' . $extension;

            $directorio = 'proyectos/' . $proyecto->id . '/entregas/' . $archivo->entrega_id . '/reemplazos';

            $ruta = $nuevoArchivo->storeAs($directorio, $nombreServidor, 'local');

            $nuevoRegistro = ProyectoArchivo::create([
                'entrega_id' => (int) $archivo->entrega_id,
                'proyecto_id' => (int) $proyecto->id,
                'subido_por_id' => (int) $usuario->id,
                'tipo_archivo' => $archivo->tipo_archivo,
                'estado' => 'activo',
                'nombre_original' => $nombreOriginal,
                'nombre_servidor' => $nombreServidor,
                'ruta_almacenamiento' => $ruta,
                'mime_type' => $nuevoArchivo->getClientMimeType(),
                'tamano_bytes' => $nuevoArchivo->getSize(),
            ]);

            $archivo->forceFill([
                'estado' => 'reemplazado',
                'reemplazado_por_archivo_id' => (int) $nuevoRegistro->id,
                'reemplazado_at' => now(),
                'motivo_reemplazo' => $validated['motivo_reemplazo'],
            ])->save();

            ProyectoEvento::create([
                'proyecto_id' => (int) $proyecto->id,
                'actor_id' => (int) $usuario->id,
                'tipo_evento' => 'archivo_reemplazado',
                'descripcion' => 'Se reemplazó el archivo "' . $archivo->nombre_original . '" por "' . $nombreOriginal . '".',
                'metadata' => [
                    'archivo_anterior_id' => (int) $archivo->id,
                    'archivo_nuevo_id' => (int) $nuevoRegistro->id,
                    'tipo_archivo' => $archivo->tipo_archivo,
                    'motivo' => $validated['motivo_reemplazo'],
                ],
            ]);
        });

        return redirect()
            ->route('seguimiento.show', $proyecto)
            ->with('toast', [
                'type' => 'success',
                'message' => 'Archivo reemplazado correctamente.',
            ]);
    }

    public function downloadArchivo(Request $request, Proyecto $proyecto, ProyectoArchivo $archivo): StreamedResponse
    {
        $usuario = $request->user();
        $rol = strtolower((string) $usuario->rol);

        abort_unless($this->puedeVerProyecto($proyecto, (int) $usuario->id, $rol), 403);

        abort_unless((int) $archivo->proyecto_id === (int) $proyecto->id, 404);

        abort_unless(Storage::disk('local')->exists($archivo->ruta_almacenamiento), 404);

        return Storage::disk('local')->download(
            $archivo->ruta_almacenamiento,
            $archivo->nombre_original
        );
    }

    private function publicarEventoSeguimiento(array $eventoKafka, Proyecto $proyecto): void
    {
        try {
            app(KafkaProducerService::class)->publish(
                'proyectos.entregas',
                $eventoKafka,
                'proyecto-' . $proyecto->id
            );
        } catch (\Throwable $exception) {
            Log::warning('No se pudo publicar evento de seguimiento en Kafka.', [
                'proyecto_id' => $proyecto->id,
                'event' => $eventoKafka['event'] ?? null,
                'error' => $exception->getMessage(),
            ]);
        }
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

    private function relacionSeguimiento(Proyecto $proyecto, int $usuarioId, string $rol): string
    {
        if ($rol === 'estudiante' && (int) $proyecto->estudiante_id === $usuarioId) {
            return 'estudiante';
        }

        if ((int) $proyecto->tutor_id === $usuarioId) {
            return 'tutor';
        }

        if ($proyecto->revisores->contains(fn ($revisor) => (int) $revisor->id === $usuarioId)) {
            return 'revisor';
        }

        if ($rol === 'coordinador') {
            return 'coordinador';
        }

        if ($rol === 'admin') {
            return 'admin';
        }

        return 'general';
    }

    private function mapProyectoListado(Proyecto $proyecto, int $usuarioId, string $rol): array
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
            'relacion_usuario' => $this->relacionSeguimiento($proyecto, $usuarioId, $rol),
            'documento_trabajo' => [
                'titulo' => $proyecto->documento_trabajo_titulo,
                'url' => $proyecto->documento_trabajo_url,
                'actualizado_at' => $proyecto->documento_trabajo_actualizado_at,
                'actualizado_por' => $this->mapUsuario($proyecto->documentoTrabajoActualizadoPor),
            ],
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
            'documento_trabajo' => [
                'titulo' => $proyecto->documento_trabajo_titulo,
                'url' => $proyecto->documento_trabajo_url,
                'actualizado_at' => $proyecto->documento_trabajo_actualizado_at,
                'actualizado_por' => $this->mapUsuario($proyecto->documentoTrabajoActualizadoPor),
            ],
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
            'reuniones_tutoria' => DB::table('proyecto_reuniones_tutoria as r')
                ->leftJoin('users as u', 'u.id', '=', 'r.tutor_id')
                ->where('r.proyecto_id', $proyecto->id)
                ->orderByDesc('r.fecha_reunion')
                ->select([
                    'r.id',
                    'r.fecha_reunion',
                    'r.modalidad',
                    'r.temas_tratados',
                    'r.acuerdos',
                    'r.created_at',
                    'u.name as tutor_nombre',
                    'u.email as tutor_email',
                ])
                ->get()
                ->map(fn ($reunion) => [
                    'id' => (int) $reunion->id,
                    'fecha_reunion' => $reunion->fecha_reunion,
                    'modalidad' => $reunion->modalidad,
                    'temas_tratados' => $reunion->temas_tratados,
                    'acuerdos' => $reunion->acuerdos,
                    'created_at' => $reunion->created_at,
                    'tutor' => [
                        'name' => $reunion->tutor_nombre,
                        'email' => $reunion->tutor_email,
                    ],
                ])
                ->values(),
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
            'reunion_tutoria_registrada' => 'Reunión de tutoría registrada',
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
            'estado' => $archivo->estado ?? 'activo',
            'reemplazado_por_archivo_id' => $archivo->reemplazado_por_archivo_id,
            'reemplazado_at' => $archivo->reemplazado_at,
            'motivo_reemplazo' => $archivo->motivo_reemplazo,
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
