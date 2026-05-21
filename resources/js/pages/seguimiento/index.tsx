import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BookOpenCheck,
    CalendarClock,
    Eye,
    FileText,
    FolderKanban,
    ListFilter,
    MessageSquareText,
    UserRound,
} from 'lucide-react';

type Usuario = {
    id: number;
    name: string;
    email: string;
    rol: string;
} | null;

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    descripcion?: string | null;
    estado: string;
    modalidad: string;
    area_tematica?: string | null;
    updated_at?: string | null;
    estudiante: Usuario;
    tutor: Usuario;
    revisores: Usuario[];
    entregas_count: number;
    archivos_count: number;
    observaciones_count: number;
    revisiones_count: number;
    eventos_count: number;
};

type SeguimientoData = {
    rol: string;
    filters: {
        sort_by: 'estado' | 'titulo' | 'ultimo_movimiento';
        sort_dir: 'asc' | 'desc';
    };
    summary: {
        total: number;
        sin_entregas: number;
        con_observaciones: number;
        con_revisiones: number;
    };
    proyectos: Proyecto[];
};

type Props = {
    seguimientoData: SeguimientoData;
};

const estadoLabels: Record<string, string> = {
    en_revision: 'En revisión',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    en_desarrollo: 'En desarrollo',
    observado: 'Observado',
    concluido: 'Concluido',
    listo_para_revision: 'Listo para revisión',
    en_revision_final: 'En revisión final',
};

const estadoTone: Record<string, string> = {
    en_revision: 'state-review',
    aprobado: 'state-approved',
    rechazado: 'state-rejected',
    en_desarrollo: 'state-development',
    observado: 'state-observed',
    concluido: 'state-finished',
    listo_para_revision: 'state-ready',
    en_revision_final: 'state-final',
};

function estadoLabel(estado: string): string {
    return estadoLabels[estado] || estado.replaceAll('_', ' ');
}

function formatDate(value?: string | null): string {
    if (!value) return 'Sin registro';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin registro';

    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function EstadoChip({ estado }: { estado: string }) {
    return (
        <span className={`estado-chip ${estadoTone[estado] || 'state-default'}`}>
            <span />
            {estadoLabel(estado)}
        </span>
    );
}

function KpiCard({
    icon,
    label,
    value,
    note,
    tone = 'normal',
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    note: string;
    tone?: 'normal' | 'warning' | 'success';
}) {
    return (
        <article className={`kpi-card tone-${tone}`}>
            <div className="kpi-head">
                {icon}
                <span>{label}</span>
            </div>
            <strong>{value}</strong>
            <p>{note}</p>
        </article>
    );
}

function SortButton({
    active,
    label,
    direction,
    onClick,
}: {
    active: boolean;
    label: string;
    direction: 'asc' | 'desc';
    onClick: () => void;
}) {
    return (
        <button type="button" className={`sort-button ${active ? 'is-active' : ''}`} onClick={onClick}>
            <ListFilter className="h-4 w-4" />
            {label}
            {active && (direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)}
        </button>
    );
}

export default function SeguimientoIndex({ seguimientoData }: Props) {
    const { rol, filters, summary, proyectos } = seguimientoData;

    const cambiarOrden = (sortBy: 'estado' | 'titulo' | 'ultimo_movimiento') => {
        const nextDirection = filters.sort_by === sortBy && filters.sort_dir === 'desc' ? 'asc' : 'desc';

        router.get(
            '/seguimiento',
            {
                sort_by: sortBy,
                sort_dir: nextDirection,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Seguimiento del Proyecto" />

            <style>{`
                .seguimiento-page {
                    --surface: rgba(255,255,255,0.86);
                    --surface-strong: #fff;
                    --surface-soft: rgba(255,255,255,0.62);
                    --text: #24151A;
                    --muted: #6E6458;
                    --muted-2: #8A8074;
                    --border: rgba(107,18,48,0.14);
                    --border-strong: rgba(107,18,48,0.28);
                    --guindo: #6B1230;
                    --gold: #9A6C18;
                    --shadow: 0 16px 38px rgba(107,18,48,0.08);

                    min-height: 100vh;
                    color: var(--text);
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.20), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.13), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .seguimiento-page {
                        --surface: rgba(53,27,40,0.92);
                        --surface-strong: #351B28;
                        --surface-soft: rgba(255,255,255,0.055);
                        --text: #F4EEE9;
                        --muted: #D7C9C0;
                        --muted-2: #A9978D;
                        --border: rgba(214,185,106,0.18);
                        --border-strong: rgba(214,185,106,0.32);
                        --guindo: #D4849A;
                        --gold: #D6B96A;
                        --shadow: 0 18px 45px rgba(18,7,12,0.34);

                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .seguimiento-shell {
                    display: grid;
                    gap: 1.25rem;
                    padding: 1rem;
                }

                @media (min-width: 768px) {
                    .seguimiento-shell {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

                .hero-card,
                .kpi-card,
                .project-card,
                .empty-card {
                    border: 1px solid var(--border);
                    background: var(--surface);
                    box-shadow: var(--shadow);
                    backdrop-filter: blur(10px);
                }

                .hero-card {
                    border-radius: 1.5rem;
                    padding: 1.35rem;
                }

                .eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: var(--gold);
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .hero-title {
                    margin-top: 0.65rem;
                    color: var(--text);
                    font-size: clamp(1.8rem, 3vw, 2.6rem);
                    font-weight: 950;
                    line-height: 1.08;
                    letter-spacing: -0.04em;
                }

                .hero-text {
                    margin-top: 0.75rem;
                    max-width: 56rem;
                    color: var(--muted);
                    font-size: 0.95rem;
                    line-height: 1.7;
                }

                .kpi-grid {
                    display: grid;
                    gap: 0.9rem;
                }

                @media (min-width: 760px) {
                    .kpi-grid {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }
                }

                .kpi-card {
                    border-radius: 1.15rem;
                    padding: 1rem;
                }

                .kpi-head {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: var(--muted-2);
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .kpi-card strong {
                    display: block;
                    margin-top: 0.45rem;
                    color: var(--text);
                    font-size: 1.65rem;
                    font-weight: 950;
                }

                .kpi-card p {
                    margin-top: 0.35rem;
                    color: var(--muted);
                    font-size: 0.78rem;
                    line-height: 1.45;
                }

                .section-head {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                @media (min-width: 820px) {
                    .section-head {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }
                }

                .section-title {
                    margin: 0;
                    color: var(--text);
                    font-size: 1.2rem;
                    font-weight: 950;
                }

                .section-description {
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.86rem;
                    line-height: 1.55;
                }

                .sort-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.55rem;
                }

                .sort-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    border: 1px solid var(--border);
                    border-radius: 0.8rem;
                    background: var(--surface);
                    color: var(--muted);
                    padding: 0.55rem 0.75rem;
                    font-size: 0.78rem;
                    font-weight: 900;
                    cursor: pointer;
                }

                .sort-button:hover,
                .sort-button.is-active {
                    border-color: var(--border-strong);
                    background: color-mix(in srgb, var(--guindo) 10%, var(--surface));
                    color: var(--guindo);
                }

                .project-list {
                    display: grid;
                    gap: 0.75rem;
                }

                .project-card {
                    display: grid;
                    gap: 0.8rem;
                    border-radius: 1rem;
                    padding: 1rem;
                    color: inherit;
                    text-decoration: none;
                    transition: 0.15s ease;
                }

                .project-card:hover {
                    border-color: var(--border-strong);
                    background: var(--surface-strong);
                    transform: translateY(-1px);
                }

                @media (min-width: 960px) {
                    .project-card {
                        grid-template-columns: minmax(0, 1.4fr) auto minmax(150px, 0.4fr) auto;
                        align-items: center;
                    }
                }

                .project-code {
                    display: block;
                    color: var(--gold);
                    font-size: 0.68rem;
                    font-weight: 950;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-bottom: 0.2rem;
                }

                .project-main strong {
                    display: block;
                    color: var(--text);
                    font-size: 0.95rem;
                    font-weight: 950;
                    line-height: 1.3;
                }

                .project-main p,
                .project-info span {
                    margin-top: 0.2rem;
                    color: var(--muted);
                    font-size: 0.78rem;
                    line-height: 1.45;
                }

                .project-info strong {
                    display: block;
                    color: var(--text);
                    font-size: 0.82rem;
                    font-weight: 900;
                }

                .project-action {
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.35rem;
                    border-radius: 0.7rem;
                    background: color-mix(in srgb, var(--guindo) 10%, transparent);
                    color: var(--guindo);
                    padding: 0.45rem 0.65rem;
                    font-size: 0.76rem;
                    font-weight: 900;
                }

                .estado-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    width: max-content;
                    border-radius: 999px;
                    padding: 0.3rem 0.65rem;
                    font-size: 0.72rem;
                    font-weight: 900;
                    white-space: nowrap;
                }

                .estado-chip span {
                    width: 0.48rem;
                    height: 0.48rem;
                    border-radius: 999px;
                    background: currentColor;
                }

                .state-review { background: rgba(201,168,76,0.18); color: #9A6C18; }
                .state-approved { background: rgba(63,157,88,0.15); color: #2F7D46; }
                .state-rejected { background: rgba(185,28,28,0.13); color: #B91C1C; }
                .state-development { background: rgba(59,130,246,0.14); color: #2563EB; }
                .state-observed { background: rgba(234,138,31,0.16); color: #B86612; }
                .state-finished { background: rgba(110,100,88,0.15); color: var(--muted); }
                .state-ready { background: rgba(20,184,166,0.14); color: #0F766E; }
                .state-final { background: rgba(99,102,241,0.14); color: #4F46E5; }
                .state-default { background: rgba(110,100,88,0.13); color: var(--muted); }

                .empty-card {
                    border-radius: 1rem;
                    padding: 1.25rem;
                    color: var(--muted);
                }
            `}</style>

            <div className="seguimiento-page">
                <div className="seguimiento-shell">
                    <section className="hero-card">
                        <div className="eyebrow">
                            <BookOpenCheck className="h-4 w-4" />
                            Seguimiento del Proyecto de Grado
                        </div>

                        <h1 className="hero-title">Evolución académica del proyecto</h1>

                        <p className="hero-text">
                            Consulta entregas, archivos, revisiones, observaciones y eventos de seguimiento.
                            La visibilidad depende del rol actual: estudiante, docente, coordinador o administrador.
                        </p>
                    </section>

                    <section className="kpi-grid">
                        <KpiCard
                            icon={<FolderKanban className="h-4 w-4" />}
                            label="Proyectos"
                            value={summary.total}
                            note="Proyectos visibles para tu rol."
                        />

                        <KpiCard
                            icon={<AlertTriangle className="h-4 w-4" />}
                            label="Sin entregas"
                            value={summary.sin_entregas}
                            note="Proyectos sin entrega registrada."
                            tone={summary.sin_entregas > 0 ? 'warning' : 'success'}
                        />

                        <KpiCard
                            icon={<MessageSquareText className="h-4 w-4" />}
                            label="Con observaciones"
                            value={summary.con_observaciones}
                            note="Proyectos con correcciones o comentarios."
                        />

                        <KpiCard
                            icon={<FileText className="h-4 w-4" />}
                            label="Con revisiones"
                            value={summary.con_revisiones}
                            note="Proyectos con revisión formal."
                        />
                    </section>

                    <section>
                        <div className="section-head">
                            <div>
                                <h2 className="section-title">
                                    {rol === 'estudiante' ? 'Mi proyecto' : 'Proyectos en seguimiento'}
                                </h2>
                                <p className="section-description">
                                    Selecciona un proyecto para ver su línea de tiempo, entregas, archivos, observaciones y revisiones.
                                </p>
                            </div>

                            <div className="sort-actions">
                                <SortButton
                                    active={filters.sort_by === 'ultimo_movimiento'}
                                    label="Último movimiento"
                                    direction={filters.sort_dir}
                                    onClick={() => cambiarOrden('ultimo_movimiento')}
                                />

                                <SortButton
                                    active={filters.sort_by === 'estado'}
                                    label="Estado"
                                    direction={filters.sort_dir}
                                    onClick={() => cambiarOrden('estado')}
                                />

                                <SortButton
                                    active={filters.sort_by === 'titulo'}
                                    label="Título"
                                    direction={filters.sort_dir}
                                    onClick={() => cambiarOrden('titulo')}
                                />
                            </div>
                        </div>
                    </section>

                    {proyectos.length === 0 ? (
                        <div className="empty-card">
                            No hay proyectos disponibles para seguimiento con tu rol actual.
                        </div>
                    ) : (
                        <section className="project-list">
                            {proyectos.map((proyecto) => (
                                <Link key={proyecto.id} href={`/seguimiento/${proyecto.id}`} className="project-card">
                                    <div className="project-main">
                                        <span className="project-code">{proyecto.codigo}</span>
                                        <strong>{proyecto.titulo}</strong>
                                        <p>
                                            Estudiante: {proyecto.estudiante?.name || 'Sin estudiante'} · Tutor: {proyecto.tutor?.name || 'Sin tutor'}
                                        </p>
                                    </div>

                                    <EstadoChip estado={proyecto.estado} />

                                    <div className="project-info">
                                        <strong>{formatDate(proyecto.updated_at)}</strong>
                                        <span>Último movimiento</span>
                                    </div>

                                    <div className="project-action">
                                        <Eye className="h-4 w-4" />
                                        Ver seguimiento
                                    </div>
                                </Link>
                            ))}
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

SeguimientoIndex.layout = {
    breadcrumbs: [
        {
            title: 'Seguimiento',
            href: '/seguimiento',
        },
    ],
};
