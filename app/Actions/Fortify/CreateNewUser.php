<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Services\KafkaProducerService;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Throwable;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        $this->publicarUsuarioCreado($user);

        return $user;
    }

    private function publicarUsuarioCreado(User $user): void
    {
        try {
            app(KafkaProducerService::class)->publish(
                config('kafka.topics.usuarios_eventos'),
                [
                    'event' => 'usuario.creado',
                    'version' => 1,
                    'occurred_at' => now()->toISOString(),
                    'producer' => [
                        'service' => 'proyectos-academicos-monolith',
                        'module' => 'auth',
                    ],
                    'data' => [
                        'id' => (int) $user->id,
                        'nombre' => $user->name,
                        'email' => $user->email,
                        'rol' => $user->rol,
                        'activo' => (bool) $user->activo,
                        'origen' => 'registro_publico',
                        'usuario_accion' => null,
                    ],
                ],
                (string) $user->id
            );
        } catch (Throwable $e) {
            report($e);
        }
    }
}
