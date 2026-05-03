<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    private const MAX_INTENTOS_FALLIDOS = 5;
    private const MINUTOS_BLOQUEO = 15;

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);

        $this->configurarCorreoRecuperacionPassword();
        $this->configurarVistas();
        $this->configurarRateLimiter();
        $this->configurarAutenticacion();
    }

    private function configurarCorreoRecuperacionPassword(): void
    {
        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Restablecimiento de contraseña')
                ->greeting('¡Hola!')
                ->line('Recibiste este correo porque solicitaste restablecer la contraseña de tu cuenta.')
                ->action('Restablecer contraseña', $url)
                ->line('Este enlace de restablecimiento de contraseña expirará en 60 minutos.')
                ->line('Si no solicitaste este cambio, no necesitas realizar ninguna acción.')
                ->salutation('Saludos, Universidad Privada del Valle');
        });
    }

    private function configurarVistas(): void
    {
        Fortify::loginView(function (Request $request) {
            return Inertia::render('auth/login', [
                'canResetPassword' => route('password.request', [], false) !== null,
                'canRegister' => true,
                'status' => $request->session()->get('status'),
            ]);
        });

        Fortify::registerView(function () {
            return Inertia::render('auth/register');
        });

        Fortify::requestPasswordResetLinkView(function () {
            return Inertia::render('auth/forgot-password');
        });

        Fortify::resetPasswordView(function (Request $request) {
            return Inertia::render('auth/reset-password', [
                'email' => $request->email,
                'token' => $request->route('token'),
            ]);
        });

        Fortify::verifyEmailView(function () {
            return Inertia::render('auth/verify-email');
        });

        Fortify::confirmPasswordView(function () {
            return Inertia::render('auth/confirm-password');
        });

        Fortify::twoFactorChallengeView(function () {
            return Inertia::render('auth/two-factor-challenge');
        });
    }

    private function configurarRateLimiter(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $email = Str::transliterate(Str::lower((string) $request->input('email')));

            return Limit::perMinute(50)->by($email . '|' . $request->ip());
        });
    }

    private function configurarAutenticacion(): void
    {
        Fortify::authenticateUsing(function (Request $request) {
            $email = Str::lower(trim((string) $request->input('email')));
            $password = (string) $request->input('password');

            /** @var User|null $user */
            $user = User::query()
                ->whereRaw('LOWER(email) = ?', [$email])
                ->first();

            if (! $user) {
                $this->registrarIntentoLogin($request, $email, false);

                return null;
            }

            if (! $user->activo) {
                $this->registrarIntentoLogin($request, $email, false);

                $this->registrarAuditoria(
                    $request,
                    $user,
                    'login_fallido',
                    'Intento de inicio de sesión en una cuenta inactiva.'
                );

                throw ValidationException::withMessages([
                    'email' => 'Tu cuenta se encuentra inactiva. Comunícate con el coordinador.',
                ]);
            }

            if ($this->usuarioEstaBloqueado($user)) {
                $this->registrarIntentoLogin($request, $email, false);

                $this->registrarAuditoria(
                    $request,
                    $user,
                    'login_fallido',
                    'Intento de acceso con cuenta bloqueada.'
                );

                $minutosRestantes = now()->diffInMinutes(
                    Carbon::parse($user->bloqueado_hasta),
                    false
                );

                $minutosRestantes = max(1, (int) ceil($minutosRestantes));

                throw ValidationException::withMessages([
                    'email' => "Cuenta bloqueada temporalmente. Intenta nuevamente en {$minutosRestantes} minuto(s).",
                ]);
            }

            if ($this->bloqueoYaExpiro($user)) {
                $user->forceFill([
                    'intentos_fallidos' => 0,
                    'bloqueado_hasta' => null,
                ])->save();
            }

            if (! Hash::check($password, $user->password)) {
                $this->registrarFallo($request, $user, $email);

                return null;
            }

            $user->forceFill([
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => null,
            ])->save();

            $this->registrarIntentoLogin($request, $email, true);

            $this->registrarAuditoria(
                $request,
                $user,
                'login_exitoso',
                'Inicio de sesión exitoso.'
            );

            return $user;
        });
    }

    private function registrarFallo(Request $request, User $user, string $email): void
    {
        $this->registrarIntentoLogin($request, $email, false);

        $intentos = ((int) $user->intentos_fallidos) + 1;

        $datosActualizar = [
            'intentos_fallidos' => $intentos,
        ];

        if ($intentos >= self::MAX_INTENTOS_FALLIDOS) {
            $datosActualizar['bloqueado_hasta'] = now()->addMinutes(self::MINUTOS_BLOQUEO);
        }

        $user->forceFill($datosActualizar)->save();

        $this->registrarAuditoria(
            $request,
            $user,
            'login_fallido',
            "Intento fallido de inicio de sesión. Intento {$intentos} de " . self::MAX_INTENTOS_FALLIDOS . '.'
        );

        if ($intentos >= self::MAX_INTENTOS_FALLIDOS) {
            $this->registrarAuditoria(
                $request,
                $user,
                'cuenta_bloqueada',
                'Cuenta bloqueada temporalmente por superar el límite de intentos fallidos consecutivos.'
            );

            throw ValidationException::withMessages([
                'email' => 'Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en ' . self::MINUTOS_BLOQUEO . ' minutos.',
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

    private function registrarIntentoLogin(Request $request, string $email, bool $exitoso): void
    {
        DB::table('login_intentos')->insert([
            'email' => $email,
            'exitoso' => $exitoso,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            'created_at' => now(),
        ]);
    }

    private function registrarAuditoria(
        Request $request,
        ?User $user,
        string $tipoEvento,
        string $descripcion
    ): void {
        DB::table('audit_logs')->insert([
            'usuario_id' => $user?->id,
            'usuario_email' => $user?->email ?? Str::lower(trim((string) $request->input('email'))),
            'tipo_evento' => $tipoEvento,
            'tabla_afectada' => 'users',
            'registro_id' => $user?->id,
            'valores_anteriores' => null,
            'valores_nuevos' => $user ? json_encode([
                'intentos_fallidos' => $user->intentos_fallidos,
                'bloqueado_hasta' => $user->bloqueado_hasta,
            ]) : null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            'descripcion' => $descripcion,
            'created_at' => now(),
        ]);
    }
}