<?php

namespace App\Listeners;

use App\Services\KafkaProducerService;
use Illuminate\Auth\Events\Login;
use Throwable;

class PublicarEventoLoginExitosoKafka
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        try {
            app(KafkaProducerService::class)->publish(
                config('kafka.topics.auth_eventos'),
                [
                    'event' => 'auth.login_exitoso',
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
                            'activo' => (bool) $user->activo,
                        ],
                        'remember' => (bool) $event->remember,
                        'guard' => $event->guard,
                        'ip_address' => request()->ip(),
                        'user_agent' => substr((string) request()->userAgent(), 0, 1000),
                        'descripcion' => 'Inicio de sesión exitoso.',
                    ],
                ],
                (string) $user->id
            );
        } catch (Throwable $e) {
            report($e);
        }
    }
}
