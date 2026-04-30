import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Configuración de perfil" />

            <h1 className="sr-only">Configuración de perfil</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Información del perfil"
                    description="Actualiza tu nombre y número de celular. El correo electrónico está protegido y no puede modificarse desde esta vista."
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors, recentlySuccessful }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-[#24151A] dark:text-[#F4EEE9]"
                                >
                                    Nombre completo
                                </Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full rounded-xl border-[#6B1230]/12 bg-white/65 text-[#24151A] shadow-[0_8px_18px_rgba(107,18,48,0.05)] placeholder:text-[#8A8074] focus-visible:ring-[#B88A28] dark:border-[#D6B96A]/14 dark:bg-white/[0.055] dark:text-[#F4EEE9] dark:placeholder:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Nombre completo"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="telefono_contacto"
                                    className="text-[#24151A] dark:text-[#F4EEE9]"
                                >
                                    Número de celular
                                </Label>

                                <Input
                                    id="telefono_contacto"
                                    type="tel"
                                    className="mt-1 block w-full rounded-xl border-[#6B1230]/12 bg-white/65 text-[#24151A] shadow-[0_8px_18px_rgba(107,18,48,0.05)] placeholder:text-[#8A8074] focus-visible:ring-[#B88A28] dark:border-[#D6B96A]/14 dark:bg-white/[0.055] dark:text-[#F4EEE9] dark:placeholder:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]"
                                    defaultValue={String(auth.user.telefono_contacto ?? '')}
                                    name="telefono_contacto"
                                    autoComplete="tel"
                                    placeholder="Ej. 76543210"
                                    inputMode="tel"
                                />

                                <p className="text-xs font-medium text-[#6E6458] dark:text-[#A9978D]">
                                    Ingresa un número de contacto válido para comunicaciones académicas.
                                </p>

                                <InputError
                                    className="mt-2"
                                    message={errors.telefono_contacto}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[#24151A] dark:text-[#F4EEE9]"
                                >
                                    Correo electrónico
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full cursor-not-allowed rounded-xl border-[#6B1230]/12 bg-[#F5F0EA] text-[#6E6458] shadow-none placeholder:text-[#8A8074] focus-visible:ring-[#B88A28] dark:border-[#D6B96A]/14 dark:bg-white/[0.035] dark:text-[#A9978D] dark:placeholder:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    readOnly
                                    aria-readonly="true"
                                    autoComplete="username"
                                    placeholder="Correo electrónico"
                                />

                                <p className="text-xs font-medium text-[#6E6458] dark:text-[#A9978D]">
                                    El correo electrónico está vinculado a la cuenta y no puede modificarse desde esta sección.
                                </p>

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div className="rounded-xl border border-[#C9A84C]/28 bg-[#F6EEDC]/55 px-4 py-3 text-sm text-[#6E6458] dark:border-[#D6B96A]/18 dark:bg-white/[0.045] dark:text-[#D7C9C0]">
                                        <p>
                                            Tu correo electrónico todavía no fue verificado.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-bold text-[#6B1230] underline decoration-[#C9A84C]/60 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:text-[#D6B96A]"
                                            >
                                                Haz clic aquí para reenviar el correo de verificación.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-3 rounded-lg border border-green-600/25 bg-green-600/10 px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-300">
                                                Se envió un nuevo enlace de verificación a tu correo electrónico.
                                            </div>
                                        )}
                                    </div>
                                )}

                            {recentlySuccessful && (
                                <div className="rounded-xl border border-green-600/25 bg-green-600/10 px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-300">
                                    Perfil actualizado correctamente.
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="rounded-xl bg-[#6B1230] px-5 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-[#4A0D21] hover:shadow-[0_12px_28px_rgba(107,18,48,0.20)] dark:bg-[#D4849A] dark:text-[#2B1620] dark:shadow-none dark:hover:bg-[#E3A1B2]"
                                >
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Configuración de perfil',
            href: edit(),
        },
    ],
};