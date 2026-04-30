<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    private const MAX_INTENTOS_FALLIDOS = 5;
    private const MINUTOS_BLOQUEO = 15;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $email = Str::lower(trim((string) $this->input('email')));
        $password = (string) $this->input('password');

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if ($user && !$user->activo) {
            $this->registrarIntentoLogin($email, false, $user);
            $this->registrarAuditoria($user, 'login_fallido', 'Intento de inicio de sesión en una cuenta inactiva.');

            throw ValidationException::withMessages([
                'email' => 'Tu cuenta se encuentra inactiva. Comunícate con el coordinador.',
            ]);
        }

        if ($user && $this->usuarioEstaBloqueado($user)) {
            $this->registrarIntentoLogin($email, false, $user);
            $this->registrarAuditoria($user, 'login_fallido', 'Intento de acceso con cuenta bloqueada.');

            $minutosRestantes = now()->diffInMinutes(Carbon::parse($user->bloqueado_hasta), false);
            $minutosRestantes = max(1, (int) ceil($minutosRestantes));

            throw ValidationException::withMessages([
                'email' => "Cuenta bloqueada temporalmente. Intenta nuevamente en {$minutosRestantes} minuto(s).",
            ]);
        }

        if ($user && $this->bloqueoYaExpiro($user)) {
            $user->forceFill([
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => null,
            ])->save();
        }

        if (! Auth::attempt(['email' => $email, 'password' => $password], $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            $this->registrarFallo($email, $user);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        /** @var User $usuarioAutenticado */
        $usuarioAutenticado = Auth::user();

        $usuarioAutenticado->forceFill([
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
        ])->save();

        $this->registrarIntentoLogin($email, true, $usuarioAutenticado);
        $this->registrarAuditoria($usuarioAutenticado, 'login_exitoso', 'Inicio de sesión exitoso.');
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower((string) $this->input('email')).'|'.$this->ip()
        );
    }

    private function registrarFallo(string $email, ?User $user): void
    {
        $this->registrarIntentoLogin($email, false, $user);

        if (! $user) {
            return;
        }

        $intentos = ((int) $user->intentos_fallidos) + 1;

        $datosActualizar = [
            'intentos_fallidos' => $intentos,
        ];

        if ($intentos >= self::MAX_INTENTOS_FALLIDOS) {
            $datosActualizar['bloqueado_hasta'] = now()->addMinutes(self::MINUTOS_BLOQUEO);
        }

        $user->forceFill($datosActualizar)->save();

        $this->registrarAuditoria(
            $user,
            'login_fallido',
            "Intento fallido de inicio de sesión. Intento {$intentos} de ".self::MAX_INTENTOS_FALLIDOS.'.'
        );

        if ($intentos >= self::MAX_INTENTOS_FALLIDOS) {
            $this->registrarAuditoria(
                $user,
                'cuenta_bloqueada',
                'Cuenta bloqueada temporalmente por superar el límite de intentos fallidos consecutivos.'
            );

            throw ValidationException::withMessages([
                'email' => 'Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en '.self::MINUTOS_BLOQUEO.' minutos.',
            ]);
        }
    }

    private function usuarioEstaBloqueado(User $user): bool
    {
        return $user->bloqueado_hasta !== null
            && Carbon::parse($user->bloqueado_hasta)->isFuture();
    }

    private function bloqueoYaExpiro(User $user): bool
    {
        return $user->bloqueado_hasta !== null
            && Carbon::parse($user->bloqueado_hasta)->isPast();
    }

    private function registrarIntentoLogin(string $email, bool $exitoso, ?User $user = null): void
    {
        DB::table('login_intentos')->insert([
            'email' => $email,
            'exitoso' => $exitoso,
            'ip_address' => $this->ip(),
            'user_agent' => substr((string) $this->userAgent(), 0, 1000),
            'created_at' => now(),
        ]);
    }

    private function registrarAuditoria(?User $user, string $tipoEvento, string $descripcion): void
    {
        DB::table('audit_logs')->insert([
            'usuario_id' => $user?->id,
            'usuario_email' => $user?->email ?? Str::lower(trim((string) $this->input('email'))),
            'tipo_evento' => $tipoEvento,
            'tabla_afectada' => 'users',
            'registro_id' => $user?->id,
            'valores_anteriores' => null,
            'valores_nuevos' => $user ? json_encode([
                'intentos_fallidos' => $user->intentos_fallidos,
                'bloqueado_hasta' => $user->bloqueado_hasta,
            ]) : null,
            'ip_address' => $this->ip(),
            'user_agent' => substr((string) $this->userAgent(), 0, 1000),
            'descripcion' => $descripcion,
            'created_at' => now(),
        ]);
    }
}