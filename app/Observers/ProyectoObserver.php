<?php

namespace App\Observers;

use App\Models\Proyecto;
use App\Services\KafkaProducerService;
use Throwable;

class ProyectoObserver
{
    public function created(Proyecto $proyecto): void
    {
        try {
            app(KafkaProducerService::class)->publish(
                config('kafka.topics.proyecto_registrado'),
                [
                    'event' => 'proyecto.registrado',
                    'version' => 1,
                    'occurred_at' => now()->toISOString(),
                    'data' => [
                        'id' => $proyecto->id,
                        'codigo' => $proyecto->codigo,
                        'titulo' => $proyecto->titulo,
                        'descripcion' => $proyecto->descripcion,
                        'modalidad' => $proyecto->modalidad,
                        'area_tematica' => $proyecto->area_tematica,
                        'estado' => $proyecto->estado,
                        'estudiante_id' => $proyecto->estudiante_id,
                        'tutor_id' => $proyecto->tutor_id,
                        'periodo_id' => $proyecto->periodo_id,
                    ],
                ],
                (string) $proyecto->id
            );
        } catch (Throwable $e) {
            report($e);
        }
    }
}