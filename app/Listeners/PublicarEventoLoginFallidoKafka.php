<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\KafkaProducerService;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Str;
use Throwable;

class PublicarEventoLoginFallidoKafka
{
    public function handle(Failed $event): void
    {
        $email = Str::lower(trim((string) request()->input('email')));

        $user = $event->user instanceof User
            ? $event->user
            : User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        try {
            app(KafkaProducerService::class)->publish(
                config('kafka.topics.auth_eventos'),
                [
                    'event' => 'auth.login_fallido',
                    'version' => 1,
                    'occurred_at' => now()->toISOString(),
                    'producer' => [
                        'service' => 'proyectos-academicos-monolith',
                        'module' => 'auth',
                    ],
                    'data' => [
                        'usuario' => $user ? [
                            'id' => (int) $user->id,
                            'nombre' => $user->name,
                            'email' => $user->email,
                            'rol' => $user->rol,
                            'activo' => (bool) $user->activo,
                            'intentos_fallidos' => (int) $user->intentos_fallidos,
                            'bloqueado_hasta' => $user->bloqueado_hasta,
                        ] : null,
                        'email' => $email,
                        'guard' => $event->guard,
                        'ip_address' => request()->ip(),
                        'user_agent' => substr((string) request()->userAgent(), 0, 1000),
                        'descripcion' => 'Intento fallido de inicio de sesión.',
                    ],
                ],
                $user ? (string) $user->id : $email
            );
        } catch (Throwable $e) {
            report($e);
        }
    }
}
