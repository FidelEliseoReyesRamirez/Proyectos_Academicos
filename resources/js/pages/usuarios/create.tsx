import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    roles: string[];
};

const roleLabels: Record<string, string> = {
    estudiante: 'Estudiante',
    tutor: 'Tutor',
    revisor: 'Revisor',
    coordinador: 'Coordinador',
};

export default function UsuariosCreate({ roles }: Props) {
    const form = useForm({
        name: '',
        email: '',
        telefono_contacto: '',
        rol: 'estudiante',
        activo: true,
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/usuarios', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Crear usuario" />

            <style>{`
                .users-page {
                    width: 100%;
                    min-height: 100%;
                    overflow-x: hidden;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.22), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.14), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .users-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .users-shell {
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                }

                @media (min-width: 768px) {
                    .users-shell {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

                .users-card {
                    max-width: 760px;
                    overflow: hidden;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }

                @media (prefers-color-scheme: dark) {
                    .users-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }
                }

                .users-card-header {
                    padding: 1.25rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                }

                @media (prefers-color-scheme: dark) {
                    .users-card-header {
                        border-bottom-color: rgba(214,185,106,0.14);
                    }
                }

                .users-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: #9A6C18;
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                @media (prefers-color-scheme: dark) {
                    .users-eyebrow {
                        color: #D6B96A;
                    }
                }

                .users-title {
                    margin-top: 0.45rem;
                    font-size: 1.65rem;
                    font-weight: 900;
                    color: #24151A;
                }

                @media (prefers-color-scheme: dark) {
                    .users-title {
                        color: #F4EEE9;
                    }
                }

                .users-description {
                    margin-top: 0.35rem;
                    max-width: 48rem;
                    font-size: 0.9rem;
                    line-height: 1.65;
                    color: #6E6458;
                }

                @media (prefers-color-scheme: dark) {
                    .users-description {
                        color: #D7C9C0;
                    }
                }

                .field-label {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #24151A;
                }

                @media (prefers-color-scheme: dark) {
                    .field-label {
                        color: #F4EEE9;
                    }
                }

                .field-input,
                .select-input {
                    width: 100%;
                    margin-top: 0.35rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.65);
                    padding: 0.58rem 0.75rem;
                    color: #24151A;
                    outline: none;
                }

                @media (prefers-color-scheme: dark) {
                    .field-input,
                    .select-input {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.055);
                        color: #F4EEE9;
                    }
                }

                .error-text {
                    margin-top: 0.25rem;
                    font-size: 0.78rem;
                    color: #dc2626;
                    font-weight: 600;
                }
            `}</style>

            <div className="users-page">
                <div className="users-shell">
                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="users-eyebrow">
                                <UserPlus className="h-4 w-4" />
                                Nuevo usuario
                            </div>

                            <h1 className="users-title">
                                Crear cuenta de usuario
                            </h1>

                            <p className="users-description">
                                Registra una nueva cuenta asignando nombre, correo, rol, estado y contraseña temporal.
                            </p>
                        </div>

                        <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
                            <div>
                                <label className="field-label">Nombre completo</label>
                                <Input
                                    className="field-input"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder="Nombre completo"
                                />
                                {form.errors.name && <div className="error-text">{form.errors.name}</div>}
                            </div>

                            <div>
                                <label className="field-label">Correo electrónico</label>
                                <Input
                                    className="field-input"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    placeholder="correo@ejemplo.com"
                                />
                                {form.errors.email && <div className="error-text">{form.errors.email}</div>}
                            </div>

                            <div>
                                <label className="field-label">Número de celular</label>
                                <Input
                                    className="field-input"
                                    type="tel"
                                    value={form.data.telefono_contacto}
                                    onChange={(event) => form.setData('telefono_contacto', event.target.value)}
                                    placeholder="Ej. 76543210"
                                />
                                {form.errors.telefono_contacto && <div className="error-text">{form.errors.telefono_contacto}</div>}
                            </div>

                            <div>
                                <label className="field-label">Rol</label>
                                <select
                                    className="select-input"
                                    value={form.data.rol}
                                    onChange={(event) => form.setData('rol', event.target.value)}
                                >
                                    {roles.map((rol) => (
                                        <option key={rol} value={rol}>
                                            {roleLabels[rol] ?? rol}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.rol && <div className="error-text">{form.errors.rol}</div>}
                            </div>

                            <div>
                                <label className="field-label">Estado</label>
                                <select
                                    className="select-input"
                                    value={form.data.activo ? '1' : '0'}
                                    onChange={(event) => form.setData('activo', event.target.value === '1')}
                                >
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                                {form.errors.activo && <div className="error-text">{form.errors.activo}</div>}
                            </div>

                            <div>
                                <label className="field-label">Contraseña temporal</label>
                                <Input
                                    className="field-input"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(event) => form.setData('password', event.target.value)}
                                    placeholder="Mínimo 8, mayúscula, minúscula, número y símbolo"
                                />
                                {form.errors.password && <div className="error-text">{form.errors.password}</div>}
                            </div>

                            <div>
                                <label className="field-label">Confirmar contraseña</label>
                                <Input
                                    className="field-input"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                    placeholder="Confirma la contraseña"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2 md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-[#6B1230] px-5 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620] dark:hover:bg-[#E3A1B2]"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    {form.processing ? 'Guardando...' : 'Crear usuario'}
                                </Button>

                                <Button asChild type="button" variant="outline" className="rounded-xl">
                                    <Link href="/usuarios">
                                        <ArrowLeft className="h-4 w-4" />
                                        Volver
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}

UsuariosCreate.layout = {
    breadcrumbs: [
        {
            title: 'Crear usuario',
            href: '/usuarios/crear',
        },
    ],
};