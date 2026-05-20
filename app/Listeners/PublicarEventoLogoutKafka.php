<?php

namespace App\Listeners;

use App\Services\KafkaProducerService;
use Illuminate\Auth\Events\Logout;
use Throwable;

class PublicarEventoLogoutKafka
{
    public function handle(Logout $event): void
    {
        $user = $event->user;

        if (! $user) {
            return;
        }

        try {
            app(KafkaProducerService::class)->publish(
                config('kafka.topics.auth_eventos'),
                [
                    'event' => 'auth.logout',
                    'version' => 1,
                    'occurred_at' => now()->toISOString(),
                    'producer' => [
                        'service' => 'proyectos-academicos-monolith',
                        'module' => 'auth',
                    ],
                    'data' => [
                        'usuario' => [
                            'id' => (int) $user->id,
                            'nombre' => $user->name,
                            'email' => $user->email,
                            'rol' => $user->rol,
                        ],
                        'ip_address' => request()->ip(),
                        'user_agent' => substr((string) request()->userAgent(), 0, 1000),
                    ],
                ],
                (string) $user->id
            );
        } catch (Throwable $e) {
            report($e);
        }
    }
}
