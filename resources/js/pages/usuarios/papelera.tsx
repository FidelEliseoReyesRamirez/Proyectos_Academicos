import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Search, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Usuario = {
    id: number;
    name: string;
    email: string;
    rol: string;
    activo: boolean;
    telefono_contacto?: string | null;
    created_at: string;
};

type PaginatedUsuarios = {
    data: Usuario[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    total: number;
};

type Props = {
    usuarios: PaginatedUsuarios;
    filters: {
        rol?: string | null;
    };
    roles: string[];
};

const roleLabels: Record<string, string> = {
    estudiante: 'Estudiante',
    tutor: 'Tutor',
    revisor: 'Revisor',
    coordinador: 'Coordinador',
};

export default function UsuariosPapelera({ usuarios, filters, roles }: Props) {
    const applyFilter = (rol: string) => {
        router.get(
            '/usuarios/papelera',
            { rol: rol || undefined },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const restaurarUsuario = (usuario: Usuario) => {
        router.patch(
            `/usuarios/${usuario.id}/estado`,
            { activo: true },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Papelera de usuarios" />

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

                .select-input {
                    width: 100%;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.65);
                    padding: 0.58rem 0.75rem;
                    font-size: 0.9rem;
                    color: #24151A;
                    outline: none;
                }

                @media (prefers-color-scheme: dark) {
                    .select-input {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.055);
                        color: #F4EEE9;
                    }
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 999px;
                    padding: 0.25rem 0.65rem;
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: #6B1230;
                    background: rgba(249,237,240,0.90);
                    border: 1px solid rgba(107,18,48,0.14);
                }

                @media (prefers-color-scheme: dark) {
                    .role-badge {
                        color: #D4849A;
                        background: rgba(212,132,154,0.10);
                        border-color: rgba(212,132,154,0.28);
                    }
                }

                .inactive-badge {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 999px;
                    padding: 0.25rem 0.65rem;
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: #b91c1c;
                    background: rgba(220,38,38,0.10);
                    border: 1px solid rgba(220,38,38,0.20);
                }
            `}</style>

            <div className="users-page">
                <div className="users-shell">
                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="users-eyebrow">
                                        <Trash2 className="h-4 w-4" />
                                        Usuarios inactivos
                                    </div>

                                    <h1 className="users-title">
                                        Papelera de usuarios
                                    </h1>

                                    <p className="users-description">
                                        Aquí aparecen las cuentas desactivadas. Un usuario inactivo no puede iniciar sesión.
                                    </p>
                                </div>

                                <Button asChild variant="outline" className="rounded-xl">
                                    <Link href="/usuarios">
                                        <ArrowLeft className="h-4 w-4" />
                                        Volver al directorio
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="users-eyebrow">
                                        <Search className="h-4 w-4" />
                                        Directorio inactivo
                                    </div>

                                    <p className="mt-1 text-sm text-[#6E6458] dark:text-[#D7C9C0]">
                                        Total: {usuarios.total} usuario(s)
                                    </p>
                                </div>

                                <select
                                    className="select-input max-w-xs"
                                    value={filters.rol ?? ''}
                                    onChange={(event) => applyFilter(event.target.value)}
                                >
                                    <option value="">Todos los roles</option>
                                    {roles.map((rol) => (
                                        <option key={rol} value={rol}>
                                            {roleLabels[rol] ?? rol}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.1em] text-[#8A8074] dark:border-[#D6B96A]/14 dark:text-[#A9978D]">
                                        <th className="px-5 py-3 font-black">Nombre</th>
                                        <th className="px-5 py-3 font-black">Correo</th>
                                        <th className="px-5 py-3 font-black">Rol</th>
                                        <th className="px-5 py-3 font-black">Estado</th>
                                        <th className="px-5 py-3 font-black">Registro</th>
                                        <th className="px-5 py-3 font-black">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usuarios.data.map((usuario) => (
                                        <tr
                                            key={usuario.id}
                                            className="border-b border-[#6B1230]/8 last:border-b-0 dark:border-[#D6B96A]/10"
                                        >
                                            <td className="px-5 py-4 font-bold text-[#24151A] dark:text-[#F4EEE9]">
                                                <div className="flex items-center gap-2">
                                                    <UserRound className="h-4 w-4 text-[#6B1230] dark:text-[#D4849A]" />
                                                    {usuario.name}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-[#6E6458] dark:text-[#D7C9C0]">
                                                {usuario.email}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="role-badge">
                                                    {roleLabels[usuario.rol] ?? usuario.rol}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inactive-badge">
                                                    Inactivo
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-[#6E6458] dark:text-[#D7C9C0]">
                                                {new Date(usuario.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="px-5 py-4">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-xl"
                                                    onClick={() => restaurarUsuario(usuario)}
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                    Restaurar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap gap-2 border-t border-[#6B1230]/10 p-4 dark:border-[#D6B96A]/14">
                            {usuarios.links.map((link, index) => (
                                <Button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    size="sm"
                                    variant={link.active ? 'default' : 'outline'}
                                    disabled={!link.url}
                                    className="rounded-xl"
                                    onClick={() => {
                                        if (link.url) {
                                            router.visit(link.url, {
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                            .replace('&laquo;', 'Anterior')
                                            .replace('&raquo;', 'Siguiente'),
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

UsuariosPapelera.layout = {
    breadcrumbs: [
        {
            title: 'Papelera de usuarios',
            href: '/usuarios/papelera',
        },
    ],
};