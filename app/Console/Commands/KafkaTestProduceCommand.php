<?php

namespace App\Console\Commands;

use App\Services\KafkaProducerService;
use Illuminate\Console\Command;

class KafkaTestProduceCommand extends Command
{
    protected $signature = 'kafka:test-produce {--id=1}';

    protected $description = 'Publica un evento de prueba en Kafka';

    public function handle(KafkaProducerService $producer): int
    {
        $projectId = (int) $this->option('id');

        $payload = [
            'event' => 'proyecto.registrado',
            'version' => 1,
            'occurred_at' => now()->toISOString(),
            'data' => [
                'id' => $projectId,
                'nombre' => 'Proyecto de prueba Kafka',
                'origen' => 'laravel',
            ],
        ];

        $producer->publish(
            config('kafka.topics.proyecto_registrado'),
            $payload,
            (string) $projectId
        );

        $this->info('Evento publicado en Kafka.');
        $this->line(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return self::SUCCESS;
    }
}