<?php

namespace App\Observers;

use App\Models\Proyecto;
use App\Services\KafkaProducerService;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProyectoObserver implements ShouldHandleEventsAfterCommit
{
    public function created(Proyecto $proyecto): void
    {
        try {
            $proyectoCompleto = Proyecto::query()
                ->with([
                    'periodo:id,nombre,fecha_inicio,fecha_cierre',
                    'estudiante:id,name,email',
                    'tutor:id,name,email',
                ])
                ->findOrFail($proyecto->id);

            $revisores = DB::table('proyecto_revisores')
                ->join('users', 'users.id', '=', 'proyecto_revisores.revisor_id')
                ->where('proyecto_revisores.proyecto_id', $proyecto->id)
                ->select([
                    'users.id',
                    'users.name',
                    'users.email',
                    'proyecto_revisores.asignado_en',
                ])
                ->orderBy('users.name')
                ->get()
                ->map(fn ($revisor) => [
                    'id' => (int) $revisor->id,
                    'nombre' => $revisor->name,
                    'email' => $revisor->email,
                    'asignado_en' => $revisor->asignado_en,
                ])
                ->values()
                ->all();

            app(KafkaProducerService::class)->publish(
                config('kafka.topics.proyecto_registrado'),
                [
                    'event' => 'proyecto.registrado',
                    'version' => 1,
                    'occurred_at' => now()->toISOString(),
                    'producer' => [
                        'service' => 'proyectos-academicos-monolith',
                        'module' => 'proyectos',
                    ],
                    'data' => [
                        'id' => (int) $proyectoCompleto->id,
                        'codigo' => $proyectoCompleto->codigo,
                        'titulo' => $proyectoCompleto->titulo,
                        'descripcion' => $proyectoCompleto->descripcion,
                        'modalidad' => $proyectoCompleto->modalidad,
                        'area_tematica' => $proyectoCompleto->area_tematica,
                        'estado' => $proyectoCompleto->estado,

                        'periodo' => $proyectoCompleto->periodo ? [
                            'id' => (int) $proyectoCompleto->periodo->id,
                            'nombre' => $proyectoCompleto->periodo->nombre,
                            'fecha_inicio' => $proyectoCompleto->periodo->fecha_inicio,
                            'fecha_cierre' => $proyectoCompleto->periodo->fecha_cierre,
                        ] : null,

                        'estudiante' => $proyectoCompleto->estudiante ? [
                            'id' => (int) $proyectoCompleto->estudiante->id,
                            'nombre' => $proyectoCompleto->estudiante->name,
                            'email' => $proyectoCompleto->estudiante->email,
                        ] : null,

                        'tutor' => $proyectoCompleto->tutor ? [
                            'id' => (int) $proyectoCompleto->tutor->id,
                            'nombre' => $proyectoCompleto->tutor->name,
                            'email' => $proyectoCompleto->tutor->email,
                        ] : null,

                        'revisores' => $revisores,
                    ],
                ],
                (string) $proyectoCompleto->id
            );
        } catch (Throwable $e) {
            report($e);
        }
    }
}