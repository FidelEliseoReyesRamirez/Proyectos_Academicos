<?php

namespace App\Console\Commands;

use App\Services\KafkaProducerService;
use Illuminate\Console\Command;

class KafkaTestProduceCommand extends Command
{
    protected $signature = 'kafka:test-produce';

    protected $description = 'Publica un evento de prueba en Kafka';

    public function handle(KafkaProducerService $kafka): int
    {
        $payload = [
            'evento' => 'proyecto.registrado',
            'proyecto_id' => 999,
            'codigo' => 'PROY-KAFKA-TEST',
            'titulo' => 'Prueba Laravel hacia Kafka',
            'estado' => 'en_revision',
            'origen' => 'laravel',
            'fecha_evento' => now()->toISOString(),
        ];

        $kafka->publish(
            topicName: 'proyecto.registrado',
            payload: $payload,
            key: 'proyecto-999',
        );

        $this->info('Evento publicado correctamente en Kafka.');

        return self::SUCCESS;
    }
}