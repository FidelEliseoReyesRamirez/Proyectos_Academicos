import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Edit3,
    Filter,
    Plus,
    Search,
    Trash2,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
        busqueda?: string | null;
        rol?: string | null;
        estado?: string | null;
        fecha_desde?: string | null;
        fecha_hasta?: string | null;
    };
    roles: string[];
};

type PageProps = {
    errors?: Record<string, string>;
};

const roleLabels: Record<string, string> = {
    estudiante: 'Estudiante',
    tutor: 'Tutor',
    revisor: 'Revisor',
    coordinador: 'Coordinador',
};

export default function UsuariosIndex({ usuarios, filters, roles }: Props) {
    const { errors = {} } = usePage<PageProps>().props;
    const firstError = Object.values(errors)[0];

    const applyFilters = (nextFilters: Partial<Props['filters']>) => {
        router.get(
            '/usuarios',
            {
                busqueda: nextFilters.busqueda ?? filters.busqueda ?? undefined,
                rol: nextFilters.rol ?? filters.rol ?? undefined,
                estado: nextFilters.estado ?? filters.estado ?? undefined,
                fecha_desde:
                    nextFilters.fecha_desde ?? filters.fecha_desde ?? undefined,
                fecha_hasta:
                    nextFilters.fecha_hasta ?? filters.fecha_hasta ?? undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        router.get(
            '/usuarios',
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const desactivarUsuario = (usuario: Usuario) => {
        router.patch(
            `/usuarios/${usuario.id}/estado`,
            { activo: false },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Directorio de usuarios" />

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

                .filter-grid {
                    display: grid;
                    gap: 0.85rem;
                }

                @media (min-width: 768px) {
                    .filter-grid {
                        grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr auto;
                        align-items: end;
                    }
                }

                .filter-label {
                    display: block;
                    margin-bottom: 0.35rem;
                    color: #6E6458;
                    font-size: 0.72rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                @media (prefers-color-scheme: dark) {
                    .filter-label {
                        color: #A9978D;
                    }
                }

                .filter-input,
                .select-input {
                    width: 100%;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background-color: rgba(255,255,255,0.75);
                    padding: 0.58rem 0.75rem;
                    font-size: 0.9rem;
                    color: #24151A;
                    outline: none;
                }

                .filter-input::placeholder {
                    color: #8A8074;
                }

                .select-input option {
                    background-color: #FAF8F5;
                    color: #24151A;
                }

                @media (prefers-color-scheme: dark) {
                    .filter-input,
                    .select-input {
                        border-color: rgba(214,185,106,0.14);
                        background-color: #2B1620;
                        color: #F4EEE9;
                    }

                    .filter-input::placeholder {
                        color: #A9978D;
                    }

                    .select-input option {
                        background-color: #2B1620;
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

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 999px;
                    padding: 0.25rem 0.65rem;
                    font-size: 0.75rem;
                    font-weight: 900;
                }

                .status-active {
                    color: #15803d;
                    background: rgba(22,163,74,0.10);
                    border: 1px solid rgba(22,163,74,0.20);
                }

                .status-inactive {
                    color: #b91c1c;
                    background: rgba(220,38,38,0.10);
                    border: 1px solid rgba(220,38,38,0.20);
                }

                .error-box {
                    margin: 1rem 1.25rem 0;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.65rem;
                    border-radius: 1rem;
                    border: 1px solid rgba(220,38,38,0.22);
                    background: rgba(220,38,38,0.10);
                    padding: 0.9rem 1rem;
                    color: #b91c1c;
                    font-size: 0.88rem;
                    font-weight: 700;
                    line-height: 1.5;
                }

                @media (prefers-color-scheme: dark) {
                    .error-box {
                        border-color: rgba(248,113,113,0.28);
                        background: rgba(220,38,38,0.12);
                        color: #fca5a5;
                    }
                }
            `}</style>

            <div className="users-page">
                <div className="users-shell">
                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="users-eyebrow">
                                        <UsersRound className="h-4 w-4" />
                                        Coordinación académica
                                    </div>

                                    <h1 className="users-title">
                                        Directorio de usuarios
                                    </h1>

                                    <p className="users-description">
                                        Consulta los usuarios registrados en la plataforma. Puedes filtrar por nombre, correo, rol, estado y fecha de registro.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        asChild
                                        className="rounded-xl bg-[#6B1230] font-bold text-white hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620] dark:hover:bg-[#E3A1B2]"
                                    >
                                        <Link href="/usuarios/crear">
                                            <Plus className="h-4 w-4" />
                                            Crear usuario
                                        </Link>
                                    </Button>

                                    <Button
                                        asChild
                                        variant="outline"
                                        className="rounded-xl"
                                    >
                                        <Link href="/usuarios/papelera">
                                            <Trash2 className="h-4 w-4" />
                                            Papelera
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="users-eyebrow">
                                <Filter className="h-4 w-4" />
                                Filtros del directorio
                            </div>

                            <div className="mt-4 filter-grid">
                                <div>
                                    <label className="filter-label">
                                        Nombre o correo
                                    </label>
                                    <Input
                                        className="filter-input"
                                        defaultValue={filters.busqueda ?? ''}
                                        placeholder="Buscar por nombre o correo"
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                applyFilters({
                                                    busqueda:
                                                        event.currentTarget.value ||
                                                        undefined,
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="filter-label">Rol</label>
                                    <select
                                        className="select-input"
                                        value={filters.rol ?? ''}
                                        onChange={(event) =>
                                            applyFilters({
                                                rol:
                                                    event.target.value ||
                                                    undefined,
                                            })
                                        }
                                    >
                                        <option value="">Todos</option>
                                        {roles.map((rol) => (
                                            <option key={rol} value={rol}>
                                                {roleLabels[rol] ?? rol}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="filter-label">Estado</label>
                                    <select
                                        className="select-input"
                                        value={filters.estado ?? ''}
                                        onChange={(event) =>
                                            applyFilters({
                                                estado:
                                                    event.target.value ||
                                                    undefined,
                                            })
                                        }
                                    >
                                        <option value="">Todos</option>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="filter-label">
                                        Registro desde
                                    </label>
                                    <Input
                                        type="date"
                                        className="filter-input"
                                        defaultValue={filters.fecha_desde ?? ''}
                                        onChange={(event) =>
                                            applyFilters({
                                                fecha_desde:
                                                    event.target.value ||
                                                    undefined,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="filter-label">
                                        Registro hasta
                                    </label>
                                    <Input
                                        type="date"
                                        className="filter-input"
                                        defaultValue={filters.fecha_hasta ?? ''}
                                        onChange={(event) =>
                                            applyFilters({
                                                fecha_hasta:
                                                    event.target.value ||
                                                    undefined,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        className="rounded-xl bg-[#6B1230] font-bold text-white hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620] dark:hover:bg-[#E3A1B2]"
                                        onClick={() => {
                                            const input = document.querySelector<HTMLInputElement>(
                                                '.filter-input',
                                            );

                                            applyFilters({
                                                busqueda:
                                                    input?.value || undefined,
                                            });
                                        }}
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={clearFilters}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="users-card">
                        <div className="users-card-header">
                            <div>
                                <div className="users-eyebrow">
                                    <Search className="h-4 w-4" />
                                    Resultado de búsqueda
                                </div>

                                <p className="mt-1 text-sm text-[#6E6458] dark:text-[#D7C9C0]">
                                    Total: {usuarios.total} usuario(s)
                                </p>
                            </div>
                        </div>

                        {firstError && (
                            <div className="error-box">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{firstError}</span>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.1em] text-[#8A8074] dark:border-[#D6B96A]/14 dark:text-[#A9978D]">
                                        <th className="px-5 py-3 font-black">Nombre</th>
                                        <th className="px-5 py-3 font-black">Correo</th>
                                        <th className="px-5 py-3 font-black">Celular</th>
                                        <th className="px-5 py-3 font-black">Rol</th>
                                        <th className="px-5 py-3 font-black">Estado</th>
                                        <th className="px-5 py-3 font-black">Registro</th>
                                        <th className="px-5 py-3 font-black">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usuarios.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-8 text-center text-sm font-semibold text-[#6E6458] dark:text-[#D7C9C0]"
                                            >
                                                No se encontraron usuarios con los filtros aplicados.
                                            </td>
                                        </tr>
                                    )}

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

                                            <td className="px-5 py-4 text-[#6E6458] dark:text-[#D7C9C0]">
                                                {usuario.telefono_contacto || 'No registrado'}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="role-badge">
                                                    {roleLabels[usuario.rol] ?? usuario.rol}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={
                                                        usuario.activo
                                                            ? 'status-badge status-active'
                                                            : 'status-badge status-inactive'
                                                    }
                                                >
                                                    {usuario.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-[#6E6458] dark:text-[#D7C9C0]">
                                                {new Date(usuario.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-xl"
                                                    >
                                                        <Link href={`/usuarios/${usuario.id}/editar`}>
                                                            <Edit3 className="h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                    </Button>

                                                    {usuario.activo && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            className="rounded-xl"
                                                            onClick={() =>
                                                                desactivarUsuario(
                                                                    usuario,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Desactivar
                                                        </Button>
                                                    )}
                                                </div>
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

UsuariosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Directorio de usuarios',
            href: '/usuarios',
        },
    ],
};