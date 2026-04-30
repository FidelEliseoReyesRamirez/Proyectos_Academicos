import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const passwordRules = [
        {
            label: 'Mínimo 8 caracteres',
            valid: password.length >= 8,
        },
        {
            label: 'Al menos una letra mayúscula',
            valid: /[A-ZÁÉÍÓÚÑ]/.test(password),
        },
        {
            label: 'Al menos una letra minúscula',
            valid: /[a-záéíóúñ]/.test(password),
        },
        {
            label: 'Al menos un número',
            valid: /[0-9]/.test(password),
        },
        {
            label: 'Al menos un símbolo especial',
            valid: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password),
        },
        {
            label: 'La confirmación debe coincidir',
            valid: password.length > 0 && password === passwordConfirmation,
        },
    ];

    const passwordIsStrong = passwordRules.every((rule) => rule.valid);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();

    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <>
            <Head title="Configuración de seguridad" />

            <h1 className="sr-only">Configuración de seguridad</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Actualizar contraseña"
                    description="Utiliza una contraseña segura para proteger el acceso a tu cuenta."
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onSuccess={() => {
                        setPassword('');
                        setPasswordConfirmation('');
                    }}
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing, recentlySuccessful }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="current_password"
                                    className="text-[#24151A] dark:text-[#F4EEE9]"
                                >
                                    Contraseña actual
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full rounded-xl border-[#6B1230]/12 bg-white/65 text-[#24151A] shadow-[0_8px_18px_rgba(107,18,48,0.05)] placeholder:text-[#8A8074] focus-visible:ring-[#B88A28] dark:border-[#D6B96A]/14 dark:bg-white/[0.055] dark:text-[#F4EEE9] dark:placeholder:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]"
                                    autoComplete="current-password"
                                    placeholder="Ingresa tu contraseña actual"
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-[#24151A] dark:text-[#F4EEE9]"
                                >
                                    Nueva contraseña
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    className="mt-1 block w-full rounded-xl border-[#6B1230]/12 bg-white/65 text-[#24151A] shadow-[0_8px_18px_rgba(107,18,48,0.05)] placeholder:text-[#8A8074] focus-visible:ring-[#B88A28] dark:border-[#D6B96A]/14 dark:bg-white/[0.055] dark:text-[#F4EEE9] dark:placeholder:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]"
                                    autoComplete="new-password"
                                    placeholder="Ingresa una nueva contraseña"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-[#24151A] dark:text-[#F4EEE9]"
                                >
                                    Confirmar contraseña
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={passwordConfirmation}
                                    onChange={(event) =>
                                        setPasswordConfirmation(event.target.value)
                                    }
                                    className="mt-1 block w-full rounded-xl border-[#6B1230]/12 bg-white/65 text-[#24151A] shadow-[0_8px_18px_rgba(107,18,48,0.05)] placeholder:text-[#8A8074] focus-visible:ring-[#B88A28] dark:border-[#D6B96A]/14 dark:bg-white/[0.055] dark:text-[#F4EEE9] dark:placeholder:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]"
                                    autoComplete="new-password"
                                    placeholder="Confirma la nueva contraseña"
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="rounded-xl border border-[#6B1230]/10 bg-white/55 px-4 py-3 shadow-[0_8px_18px_rgba(107,18,48,0.05)] dark:border-[#D6B96A]/14 dark:bg-white/[0.045]">
                                <p className="mb-3 text-sm font-bold text-[#24151A] dark:text-[#F4EEE9]">
                                    La contraseña debe cumplir:
                                </p>

                                <div className="grid gap-2">
                                    {passwordRules.map((rule) => (
                                        <div
                                            key={rule.label}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            {rule.valid ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-[#8A8074] dark:text-[#A9978D]" />
                                            )}

                                            <span
                                                className={
                                                    rule.valid
                                                        ? 'font-semibold text-green-700 dark:text-green-300'
                                                        : 'text-[#6E6458] dark:text-[#A9978D]'
                                                }
                                            >
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {recentlySuccessful && (
                                <div className="rounded-xl border border-green-600/25 bg-green-600/10 px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-300">
                                    Contraseña actualizada correctamente.
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing || !passwordIsStrong}
                                    data-test="update-password-button"
                                    className="rounded-xl bg-[#6B1230] px-5 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-[#4A0D21] hover:shadow-[0_12px_28px_rgba(107,18,48,0.20)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#D4849A] dark:text-[#2B1620] dark:shadow-none dark:hover:bg-[#E3A1B2]"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar contraseña'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {canManageTwoFactor && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Autenticación en dos pasos"
                        description="Administra la verificación adicional para proteger el acceso a tu cuenta."
                    />

                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4 rounded-2xl border border-[#6B1230]/10 bg-white/55 p-5 shadow-[0_14px_34px_rgba(107,18,48,0.08)] backdrop-blur-sm dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none">
                            <p className="text-sm leading-6 text-[#6E6458] dark:text-[#D7C9C0]">
                                La autenticación en dos pasos está activa. Al iniciar sesión,
                                el sistema solicitará un código seguro generado por una
                                aplicación compatible con TOTP instalada en tu teléfono.
                            </p>

                            <div className="relative inline">
                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl font-bold"
                                        >
                                            {processing
                                                ? 'Desactivando...'
                                                : 'Desactivar 2FA'}
                                        </Button>
                                    )}
                                </Form>
                            </div>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4 rounded-2xl border border-[#6B1230]/10 bg-white/55 p-5 shadow-[0_14px_34px_rgba(107,18,48,0.08)] backdrop-blur-sm dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none">
                            <p className="text-sm leading-6 text-[#6E6458] dark:text-[#D7C9C0]">
                                Al activar la autenticación en dos pasos, deberás ingresar
                                un código seguro durante el inicio de sesión. Este código se
                                obtiene desde una aplicación compatible con TOTP en tu teléfono.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                        className="rounded-xl bg-[#6B1230] px-5 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-[#4A0D21] hover:shadow-[0_12px_28px_rgba(107,18,48,0.20)] dark:bg-[#D4849A] dark:text-[#2B1620] dark:shadow-none dark:hover:bg-[#E3A1B2]"
                                    >
                                        <ShieldCheck />
                                        Continuar configuración
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-xl bg-[#6B1230] px-5 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-[#4A0D21] hover:shadow-[0_12px_28px_rgba(107,18,48,0.20)] dark:bg-[#D4849A] dark:text-[#2B1620] dark:shadow-none dark:hover:bg-[#E3A1B2]"
                                            >
                                                {processing
                                                    ? 'Activando...'
                                                    : 'Activar 2FA'}
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            )}
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Configuración de seguridad',
            href: edit(),
        },
    ],
};