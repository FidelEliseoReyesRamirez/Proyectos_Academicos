import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState, type ReactNode } from 'react';
import {
    Activity,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BarChart3,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Eye,
    FolderKanban,
    GraduationCap,
    ListFilter,
    ShieldCheck,
    UserRound,
    UsersRound,
} from 'lucide-react';

type AuthUser = {
    id?: number;
    name?: string;
    email?: string;
    role?: string | null;
    rol?: string | null;
};

type SharedPageProps = {
    auth?: {
        user?: AuthUser | null;
    };
};

type Usuario = {
    id?: number;
    name?: string | null;
    email?: string | null;
};

type Revisor = Usuario & {
    asignado_en?: string | null;
    plazo_revision?: string | null;
};

type TimelineItem = {
    id: number;
    estado_anterior?: string | null;
    estado_nuevo: string;
    comentario?: string | null;
    created_at: string;
    usuario?: {
        name?: string | null;
        email?: string | null;
    } | null;
};

type ProyectoDashboard = {
    id: number;
    codigo: string;
    titulo: string;
    descripcion?: string | null;
    modalidad?: string | null;
    area_tematica?: string | null;
    estado: string;
    created_at?: string | null;
    updated_at?: string | null;
    estudiante?: Usuario | null;
    tutor?: Usuario | null;
    revisores?: Revisor[];
    ultimo_avance?: {
        fecha?: string | null;
        resumen?: string | null;
        comentario?: string | null;
        usuario?: string | null;
    } | null;
    linea_tiempo?: TimelineItem[];
};

type DashboardData = {
    rol: string;
    filters: {
        sort_by: 'estado' | 'ultimo_avance';
        sort_dir: 'asc' | 'desc';
    };
    summary: {
        total_proyectos: number;
        sin_avance: number;
        por_estado: Record<string, number>;
        ultimo_avance_general?: string | null;
    };
    proyectos: ProyectoDashboard[];
};

type Props = {
    dashboardData?: DashboardData;
};

const roleLabels: Record<string, string> = {
    estudiante: 'Estudiante',
    docente: 'Docente',
    coordinador: 'Coordinador',
    admin: 'Administrador',
    administrador: 'Administrador',
};

const estadoLabels: Record<string, string> = {
    en_revision: 'En revisión',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    en_desarrollo: 'En desarrollo',
    observado: 'Observado',
    concluido: 'Concluido',
};

const estadoSolid: Record<string, string> = {
    en_revision: '#C9A84C',
    aprobado: '#3F9D58',
    rechazado: '#B91C1C',
    en_desarrollo: '#2563EB',
    observado: '#EA8A1F',
    concluido: '#6E6458',
};

const estadoTone: Record<string, string> = {
    en_revision: 'state-review',
    aprobado: 'state-approved',
    rechazado: 'state-rejected',
    en_desarrollo: 'state-development',
    observado: 'state-observed',
    concluido: 'state-finished',
};

const estadoOrder = [
    'en_revision',
    'en_desarrollo',
    'observado',
    'aprobado',
    'rechazado',
    'concluido',
];

function normalizeRole(role?: string | null): string {
    return String(role || 'estudiante').toLowerCase();
}

function estadoLabel(value?: string | null): string {
    if (!value) return 'Sin estado';
    return estadoLabels[value] || value.replaceAll('_', ' ');
}

function formatDate(value?: string | null): string {
    if (!value) return 'Sin registro';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Sin registro';
    }

    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatShortDate(value?: string | null): string {
    if (!value) return 'Sin registro';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Sin registro';
    }

    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: 'short',
    }).format(date);
}

function getInitials(name?: string | null): string {
    if (!name) return 'U';

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

function safePercent(value: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((value / total) * 100);
}

function isCoordinatorRole(role: string): boolean {
    return role === 'coordinador' || role === 'admin';
}

function getMainTitle(role: string): string {
    if (role === 'estudiante') return 'Seguimiento de mi proyecto';
    if (role === 'docente') return 'Panel docente';
    if (isCoordinatorRole(role)) return 'Panorama académico general';
    return 'Dashboard académico';
}

function getDescription(role: string): string {
    if (role === 'estudiante') {
        return 'Consulta el estado actual de tu proyecto, el último avance registrado y la evolución del proceso académico.';
    }

    if (role === 'docente') {
        return 'Consulta los proyectos donde figuras como tutor o revisor y prioriza tu trabajo según estado y último avance.';
    }

    if (isCoordinatorRole(role)) {
        return 'Vista ejecutiva para revisar estados, proyectos sin avance, carga operativa y actividad reciente del sistema académico.';
    }

    return 'Consulta la información académica disponible para tu perfil.';
}

function getDonutGradient(porEstado: Record<string, number>, total: number): string {
    if (total <= 0) {
        return 'conic-gradient(var(--muted-border) 0deg 360deg)';
    }

    let current = 0;

    const segments = estadoOrder
        .filter((estado) => (porEstado[estado] || 0) > 0)
        .map((estado) => {
            const value = porEstado[estado] || 0;
            const degrees = (value / total) * 360;
            const start = current;
            const end = current + degrees;
            current = end;

            return `${estadoSolid[estado] || '#8A8074'} ${start}deg ${end}deg`;
        });

    return `conic-gradient(${segments.join(', ')})`;
}

function EstadoChip({ estado }: { estado: string }) {
    return (
        <span className={`estado-chip ${estadoTone[estado] || 'state-default'}`}>
            <span className="estado-dot" />
            {estadoLabel(estado)}
        </span>
    );
}

function KpiCard({
    icon,
    label,
    value,
    note,
    tone = 'neutral',
}: {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    note: string;
    tone?: 'neutral' | 'warning' | 'danger' | 'success';
}) {
    return (
        <article className={`kpi-card tone-${tone}`}>
            <div className="kpi-head">
                <span className="kpi-icon">{icon}</span>
                <span>{label}</span>
            </div>

            <div className="kpi-value">{value}</div>
            <p className="kpi-note">{note}</p>
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
        <button
            type="button"
            className={`sort-button ${active ? 'is-active' : ''}`}
            aria-pressed={active}
            onClick={onClick}
        >
            <ListFilter className="h-4 w-4" />
            <span>{label}</span>
            {active && (
                direction === 'asc'
                    ? <ArrowUp className="h-3.5 w-3.5" />
                    : <ArrowDown className="h-3.5 w-3.5" />
            )}
        </button>
    );
}

function StateDistribution({
    porEstado,
    total,
}: {
    porEstado: Record<string, number>;
    total: number;
}) {
    const estados = estadoOrder.filter((estado) => (porEstado[estado] || 0) > 0);

    if (estados.length === 0) {
        return (
            <div className="empty-soft">
                <BarChart3 className="h-5 w-5" />
                <div>
                    <strong>Sin datos de distribución</strong>
                    <p>No hay proyectos activos para mostrar.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="distribution">
            {estados.map((estado) => {
                const count = porEstado[estado] || 0;
                const percent = safePercent(count, total);

                return (
                    <div key={estado} className="distribution-row">
                        <div className="distribution-top">
                            <EstadoChip estado={estado} />
                            <strong>{count}</strong>
                        </div>

                        <div className="bar-track">
                            <div
                                className={`bar-fill ${estadoTone[estado] || 'state-default'}`}
                                style={{ width: `${percent}%` }}
                            />
                        </div>

                        <span className="distribution-percent">{percent}% del total</span>
                    </div>
                );
            })}
        </div>
    );
}

function Timeline({ items }: { items: TimelineItem[] }) {
    if (!items.length) {
        return (
            <div className="empty-soft">
                <Clock3 className="h-5 w-5" />
                <div>
                    <strong>Sin línea de tiempo</strong>
                    <p>El historial aparecerá cuando se registren cambios de estado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="timeline">
            {items.map((item) => (
                <div key={item.id} className="timeline-item">
                    <span className="timeline-marker" />

                    <div className="timeline-card">
                        <strong>
                            {estadoLabel(item.estado_anterior)} → {estadoLabel(item.estado_nuevo)}
                        </strong>
                        <p>{formatDate(item.created_at)}</p>
                        <span>Registrado por {item.usuario?.name || 'Usuario no identificado'}</span>

                        {item.comentario && (
                            <em>{item.comentario}</em>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProjectRow({
    proyecto,
    selected,
    onSelect,
    coordinatorMode,
}: {
    proyecto: ProyectoDashboard;
    selected: boolean;
    onSelect: () => void;
    coordinatorMode: boolean;
}) {
    return (
        <button
            type="button"
            className={`project-row ${selected ? 'is-selected' : ''}`}
            aria-pressed={selected}
            onClick={onSelect}
        >
            <div className="project-main">
                <span className="project-code">{proyecto.codigo}</span>
                <strong>{proyecto.titulo}</strong>
                <p>
                    {proyecto.estudiante?.name || 'Sin estudiante'}
                    {coordinatorMode && (
                        <> · Tutor: {proyecto.tutor?.name || 'Sin tutor'}</>
                    )}
                </p>
            </div>

            <div className="project-status">
                <EstadoChip estado={proyecto.estado} />
            </div>

            <div className="project-date">
                <span>Último avance</span>
                <strong>{formatShortDate(proyecto.ultimo_avance?.fecha)}</strong>
            </div>

            <div className="project-action">
                <Eye className="h-4 w-4" />
                Ver
            </div>
        </button>
    );
}

function ProjectDetail({ proyecto }: { proyecto: ProyectoDashboard | null }) {
    if (!proyecto) {
        return (
            <aside className="detail-panel empty-detail">
                <FolderKanban className="h-8 w-8" />
                <h3>Selecciona un proyecto</h3>
                <p>El detalle y la línea de tiempo se mostrarán en esta sección.</p>
            </aside>
        );
    }

    return (
        <aside className="detail-panel">
            <div className="detail-head">
                <div className="eyebrow">
                    <Activity className="h-4 w-4" />
                    Detalle del proyecto
                </div>

                <h2>{proyecto.titulo}</h2>
                <EstadoChip estado={proyecto.estado} />
            </div>

            <div className="detail-body">
                <div className="detail-grid">
                    <div className="detail-item">
                        <span>Estudiante</span>
                        <strong>{proyecto.estudiante?.name || 'Sin estudiante'}</strong>
                        <p>{proyecto.estudiante?.email || 'Sin correo registrado'}</p>
                    </div>

                    <div className="detail-item">
                        <span>Tutor</span>
                        <strong>{proyecto.tutor?.name || 'Sin tutor asignado'}</strong>
                        <p>{proyecto.tutor?.email || 'Sin correo registrado'}</p>
                    </div>

                    <div className="detail-item">
                        <span>Último avance</span>
                        <strong>{proyecto.ultimo_avance?.resumen || 'Sin avance registrado'}</strong>
                        <p>{formatDate(proyecto.ultimo_avance?.fecha)}</p>
                    </div>

                    <div className="detail-item">
                        <span>Área temática</span>
                        <strong>{proyecto.area_tematica || 'Sin área temática registrada'}</strong>
                        <p>{proyecto.descripcion || 'Sin descripción registrada.'}</p>
                    </div>

                    <div className="detail-item">
                        <span>Revisores</span>

                        {proyecto.revisores && proyecto.revisores.length > 0 ? (
                            <div className="reviewers">
                                {proyecto.revisores.map((revisor) => (
                                    <span key={revisor.id} className="reviewer-chip">
                                        <UsersRound className="h-3.5 w-3.5" />
                                        {revisor.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p>No hay revisores asignados todavía.</p>
                        )}
                    </div>
                </div>

                <div>
                    <div className="eyebrow timeline-title">
                        <Clock3 className="h-4 w-4" />
                        Línea de tiempo
                    </div>

                    <Timeline items={proyecto.linea_tiempo || []} />
                </div>
            </div>
        </aside>
    );
}

export default function Dashboard({ dashboardData }: Props) {
    const page = usePage<SharedPageProps>();

    const user = page.props.auth?.user;
    const userName = user?.name || 'Usuario';
    const userEmail = user?.email || 'Sin correo registrado';

    const rawRole = dashboardData?.rol ?? user?.role ?? user?.rol;
    const role = normalizeRole(rawRole);
    const roleLabel = roleLabels[role] || role;

    const proyectos = dashboardData?.proyectos || [];
    const filters = dashboardData?.filters || {
        sort_by: 'ultimo_avance',
        sort_dir: 'desc',
    };

    const summary = dashboardData?.summary || {
        total_proyectos: 0,
        sin_avance: 0,
        por_estado: {},
        ultimo_avance_general: null,
    };

    const coordinatorMode = isCoordinatorRole(role);

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        proyectos[0]?.id ?? null,
    );

    const selectedProject =
        proyectos.find((proyecto) => proyecto.id === selectedProjectId)
        || proyectos[0]
        || null;

    const totalRevision = summary.por_estado?.en_revision || 0;
    const totalObservados = summary.por_estado?.observado || 0;
    const totalConcluidos = summary.por_estado?.concluido || 0;
    const totalAtencion = summary.sin_avance + totalRevision + totalObservados;

    const proyectosAtencion = useMemo(() => {
        return proyectos
            .filter((proyecto) => {
                return !proyecto.ultimo_avance?.fecha
                    || ['en_revision', 'observado', 'rechazado'].includes(proyecto.estado);
            })
            .slice(0, 6);
    }, [proyectos]);

    const proyectosRecientes = useMemo(() => {
        return [...proyectos]
            .filter((proyecto) => proyecto.ultimo_avance?.fecha)
            .sort((a, b) => {
                const dateA = new Date(a.ultimo_avance?.fecha || '').getTime();
                const dateB = new Date(b.ultimo_avance?.fecha || '').getTime();

                return dateB - dateA;
            })
            .slice(0, 5);
    }, [proyectos]);

    const cambiarOrden = (sortBy: 'estado' | 'ultimo_avance') => {
        const nextDirection =
            filters.sort_by === sortBy && filters.sort_dir === 'desc'
                ? 'asc'
                : 'desc';

        router.get(
            '/dashboard',
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
            <Head title="Dashboard" />

            <style>{`
                .dashboard-page,
                .dashboard-page * {
                    box-sizing: border-box;
                }

                .dashboard-page {
                    --page-bg: #F7F2EA;
                    --surface: rgba(255,255,255,0.86);
                    --surface-strong: #FFFFFF;
                    --surface-soft: rgba(255,255,255,0.66);
                    --text: #24151A;
                    --muted: #6E6458;
                    --muted-2: #8A8074;
                    --border: rgba(107,18,48,0.14);
                    --border-strong: rgba(107,18,48,0.26);
                    --guindo: #6B1230;
                    --guindo-strong: #4A0D21;
                    --gold: #C9A84C;
                    --gold-strong: #9A6C18;
                    --shadow: 0 18px 45px rgba(107,18,48,0.10);
                    --muted-border: rgba(110,100,88,0.16);

                    width: 100%;
                    min-height: 100vh;
                    color: var(--text);
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.20), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.13), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-page {
                        --page-bg: #211018;
                        --surface: rgba(53,27,40,0.92);
                        --surface-strong: #351B28;
                        --surface-soft: rgba(255,255,255,0.055);
                        --text: #F4EEE9;
                        --muted: #D7C9C0;
                        --muted-2: #A9978D;
                        --border: rgba(214,185,106,0.18);
                        --border-strong: rgba(214,185,106,0.32);
                        --guindo: #D4849A;
                        --guindo-strong: #E3A1B2;
                        --gold: #D6B96A;
                        --gold-strong: #E2CA8A;
                        --shadow: 0 18px 45px rgba(18,7,12,0.34);
                        --muted-border: rgba(255,255,255,0.12);

                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .dashboard-shell {
                    display: grid;
                    gap: 1.25rem;
                    padding: 1rem;
                }

                @media (min-width: 768px) {
                    .dashboard-shell {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

                .hero-panel,
                .kpi-card,
                .chart-panel,
                .project-row,
                .detail-panel,
                .mini-panel {
                    border: 1px solid var(--border);
                    background: var(--surface);
                    box-shadow: var(--shadow);
                    backdrop-filter: blur(10px);
                }

                .hero-panel {
                    border-radius: 1.5rem;
                    padding: 1.35rem;
                    background:
                        linear-gradient(135deg, var(--surface-strong), var(--surface)),
                        radial-gradient(circle at 90% 10%, rgba(201,168,76,0.24), transparent 32%);
                }

                @media (min-width: 900px) {
                    .hero-panel {
                        padding: 1.65rem;
                    }
                }

                .hero-grid {
                    display: grid;
                    gap: 1.25rem;
                }

                @media (min-width: 920px) {
                    .hero-grid {
                        grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.72fr);
                        align-items: center;
                    }
                }

                .eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: var(--gold-strong);
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .hero-title {
                    margin-top: 0.65rem;
                    color: var(--text);
                    font-size: clamp(1.9rem, 3.3vw, 3rem);
                    font-weight: 950;
                    line-height: 1.06;
                    letter-spacing: -0.04em;
                }

                .hero-description {
                    margin-top: 0.8rem;
                    max-width: 56rem;
                    color: var(--muted);
                    font-size: 0.95rem;
                    line-height: 1.7;
                }

                .profile-box {
                    border-radius: 1.2rem;
                    border: 1px solid var(--border);
                    background: var(--surface-soft);
                    padding: 1rem;
                }

                .profile-main {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }

                .profile-avatar {
                    display: flex;
                    width: 3.7rem;
                    height: 3.7rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 1rem;
                    border: 1px solid var(--border-strong);
                    background: color-mix(in srgb, var(--gold) 18%, transparent);
                    color: var(--gold-strong);
                    font-size: 1rem;
                    font-weight: 950;
                }

                .profile-name {
                    margin: 0;
                    color: var(--text);
                    font-size: 0.95rem;
                    font-weight: 900;
                    line-height: 1.3;
                }

                .profile-email {
                    margin-top: 0.1rem;
                    color: var(--muted);
                    font-size: 0.8rem;
                    overflow-wrap: anywhere;
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    margin-top: 0.9rem;
                    border-radius: 999px;
                    background: color-mix(in srgb, var(--guindo) 14%, transparent);
                    color: var(--guindo);
                    padding: 0.42rem 0.75rem;
                    font-size: 0.78rem;
                    font-weight: 900;
                }

                .kpi-grid {
                    display: grid;
                    gap: 0.9rem;
                }

                @media (min-width: 700px) {
                    .kpi-grid {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }
                }

                .kpi-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 1.15rem;
                    padding: 1rem;
                }

                .kpi-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at top right, rgba(201,168,76,0.16), transparent 42%);
                    pointer-events: none;
                }

                .kpi-card.tone-warning::before {
                    background: radial-gradient(circle at top right, rgba(234,138,31,0.18), transparent 42%);
                }

                .kpi-card.tone-danger::before {
                    background: radial-gradient(circle at top right, rgba(185,28,28,0.16), transparent 42%);
                }

                .kpi-card.tone-success::before {
                    background: radial-gradient(circle at top right, rgba(63,157,88,0.16), transparent 42%);
                }

                .kpi-head {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: var(--muted-2);
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .kpi-icon {
                    color: var(--gold-strong);
                }

                .kpi-value {
                    position: relative;
                    z-index: 1;
                    margin-top: 0.45rem;
                    color: var(--text);
                    font-size: 1.65rem;
                    font-weight: 950;
                    line-height: 1.1;
                }

                .kpi-note {
                    position: relative;
                    z-index: 1;
                    margin-top: 0.35rem;
                    color: var(--muted);
                    font-size: 0.78rem;
                    line-height: 1.45;
                }

                .coordinator-grid {
                    display: grid;
                    gap: 1rem;
                }

                @media (min-width: 1120px) {
                    .coordinator-grid {
                        grid-template-columns: minmax(0, 1fr) minmax(330px, 0.72fr);
                    }
                }

                .chart-panel,
                .mini-panel {
                    border-radius: 1.2rem;
                    padding: 1rem;
                }

                .panel-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 0.95rem;
                }

                .panel-title {
                    margin-top: 0.3rem;
                    color: var(--text);
                    font-size: 1.05rem;
                    font-weight: 950;
                    letter-spacing: -0.02em;
                }

                .panel-note {
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.82rem;
                    line-height: 1.55;
                }

                .donut-wrap {
                    display: grid;
                    gap: 1rem;
                }

                @media (min-width: 860px) {
                    .donut-wrap {
                        grid-template-columns: 220px minmax(0, 1fr);
                        align-items: center;
                    }
                }

                .donut {
                    width: 190px;
                    height: 190px;
                    margin: 0 auto;
                    border-radius: 999px;
                    display: grid;
                    place-items: center;
                    background: var(--donut-bg);
                    box-shadow: inset 0 0 0 1px var(--border);
                }

                .donut-center {
                    display: grid;
                    place-items: center;
                    width: 116px;
                    height: 116px;
                    border-radius: 999px;
                    background: var(--surface-strong);
                    border: 1px solid var(--border);
                    text-align: center;
                }

                .donut-center strong {
                    color: var(--text);
                    font-size: 1.6rem;
                    font-weight: 950;
                    line-height: 1;
                }

                .donut-center span {
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.72rem;
                    font-weight: 850;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .distribution {
                    display: grid;
                    gap: 0.85rem;
                }

                .distribution-row {
                    display: grid;
                    gap: 0.35rem;
                }

                .distribution-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }

                .distribution-top strong {
                    color: var(--text);
                    font-size: 0.9rem;
                    font-weight: 950;
                }

                .bar-track {
                    width: 100%;
                    height: 0.55rem;
                    border-radius: 999px;
                    overflow: hidden;
                    background: var(--muted-border);
                }

                .bar-fill {
                    height: 100%;
                    min-width: 0.35rem;
                    border-radius: 999px;
                }

                .bar-fill.state-review { background: #C9A84C; }
                .bar-fill.state-approved { background: #3F9D58; }
                .bar-fill.state-rejected { background: #B91C1C; }
                .bar-fill.state-development { background: #2563EB; }
                .bar-fill.state-observed { background: #EA8A1F; }
                .bar-fill.state-finished { background: #6E6458; }
                .bar-fill.state-default { background: #8A8074; }

                .distribution-percent {
                    color: var(--muted);
                    font-size: 0.74rem;
                    font-weight: 750;
                }

                .attention-list {
                    display: grid;
                    gap: 0.55rem;
                }

                .attention-button {
                    width: 100%;
                    display: grid;
                    gap: 0.25rem;
                    text-align: left;
                    border: 1px solid var(--border);
                    border-radius: 0.9rem;
                    background: var(--surface-soft);
                    padding: 0.75rem;
                    color: var(--text);
                    cursor: pointer;
                }

                .attention-button:hover {
                    border-color: var(--border-strong);
                    background: var(--surface-strong);
                }

                .attention-button strong {
                    font-size: 0.83rem;
                    font-weight: 950;
                    line-height: 1.35;
                }

                .attention-button span {
                    color: var(--muted);
                    font-size: 0.75rem;
                    line-height: 1.45;
                }

                .content-grid {
                    display: grid;
                    gap: 1.25rem;
                }

                @media (min-width: 1120px) {
                    .content-grid {
                        grid-template-columns: minmax(0, 1fr) minmax(360px, 0.72fr);
                        align-items: start;
                    }
                }

                .section-panel {
                    display: grid;
                    gap: 0.9rem;
                }

                .section-head {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                @media (min-width: 740px) {
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
                    letter-spacing: -0.02em;
                }

                .section-description {
                    margin-top: 0.2rem;
                    color: var(--muted);
                    font-size: 0.85rem;
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
                    gap: 0.65rem;
                }

                .project-row {
                    width: 100%;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr);
                    gap: 0.7rem;
                    align-items: center;
                    border-radius: 1rem;
                    padding: 0.85rem;
                    text-align: left;
                    color: var(--text);
                    cursor: pointer;
                }

                @media (min-width: 920px) {
                    .project-row {
                        grid-template-columns: minmax(0, 1.45fr) auto minmax(120px, 0.35fr) auto;
                    }
                }

                .project-row:hover,
                .project-row.is-selected {
                    border-color: var(--border-strong);
                    background: var(--surface-strong);
                    transform: translateY(-1px);
                }

                .project-code {
                    display: inline-block;
                    color: var(--gold-strong);
                    font-size: 0.68rem;
                    font-weight: 950;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-bottom: 0.2rem;
                }

                .project-main strong {
                    display: block;
                    color: var(--text);
                    font-size: 0.92rem;
                    font-weight: 950;
                    line-height: 1.3;
                }

                .project-main p {
                    margin-top: 0.2rem;
                    color: var(--muted);
                    font-size: 0.78rem;
                    line-height: 1.45;
                }

                .project-date span {
                    display: block;
                    color: var(--muted-2);
                    font-size: 0.66rem;
                    font-weight: 950;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .project-date strong {
                    display: block;
                    margin-top: 0.15rem;
                    color: var(--text);
                    font-size: 0.8rem;
                    font-weight: 950;
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
                    flex-shrink: 0;
                    border-radius: 999px;
                    padding: 0.3rem 0.65rem;
                    font-size: 0.72rem;
                    font-weight: 900;
                    white-space: nowrap;
                }

                .estado-dot {
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
                .state-default { background: rgba(110,100,88,0.13); color: var(--muted); }

                .detail-panel {
                    position: sticky;
                    top: 1rem;
                    border-radius: 1.2rem;
                    overflow: hidden;
                }

                .empty-detail {
                    padding: 1.5rem;
                    text-align: center;
                }

                .empty-detail svg {
                    margin: 0 auto 0.75rem;
                    color: var(--gold-strong);
                }

                .empty-detail h3 {
                    color: var(--text);
                    font-size: 1rem;
                    font-weight: 950;
                }

                .empty-detail p {
                    margin-top: 0.35rem;
                    color: var(--muted);
                    font-size: 0.84rem;
                    line-height: 1.55;
                }

                .detail-head {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    background: var(--surface-soft);
                }

                .detail-head h2 {
                    margin: 0.45rem 0 0.75rem;
                    color: var(--text);
                    font-size: 1.08rem;
                    font-weight: 950;
                    line-height: 1.25;
                }

                .detail-body {
                    display: grid;
                    gap: 1rem;
                    padding: 1rem;
                }

                .detail-grid {
                    display: grid;
                    gap: 0.7rem;
                }

                .detail-item {
                    border: 1px solid var(--border);
                    border-radius: 0.9rem;
                    background: var(--surface-soft);
                    padding: 0.75rem;
                }

                .detail-item span {
                    display: block;
                    color: var(--muted-2);
                    font-size: 0.66rem;
                    font-weight: 950;
                    letter-spacing: 0.09em;
                    text-transform: uppercase;
                }

                .detail-item strong {
                    display: block;
                    margin-top: 0.25rem;
                    color: var(--text);
                    font-size: 0.86rem;
                    font-weight: 900;
                    overflow-wrap: anywhere;
                }

                .detail-item p {
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.78rem;
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                }

                .reviewers {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.45rem;
                    margin-top: 0.55rem;
                }

                .reviewer-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    border-radius: 999px;
                    background: color-mix(in srgb, var(--gold) 16%, transparent);
                    color: var(--gold-strong);
                    padding: 0.35rem 0.55rem;
                    font-size: 0.74rem;
                    font-weight: 850;
                }

                .timeline-title {
                    margin-bottom: 0.75rem;
                }

                .timeline {
                    display: grid;
                    gap: 0.8rem;
                }

                .timeline-item {
                    display: grid;
                    grid-template-columns: 0.85rem minmax(0, 1fr);
                    gap: 0.65rem;
                }

                .timeline-marker {
                    width: 0.75rem;
                    height: 0.75rem;
                    margin-top: 0.25rem;
                    border-radius: 999px;
                    background: var(--guindo);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--guindo) 14%, transparent);
                }

                .timeline-card {
                    border: 1px solid var(--border);
                    border-radius: 0.9rem;
                    background: var(--surface-soft);
                    padding: 0.75rem;
                }

                .timeline-card strong {
                    color: var(--text);
                    font-size: 0.84rem;
                    font-weight: 950;
                }

                .timeline-card p,
                .timeline-card span {
                    display: block;
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.76rem;
                    line-height: 1.45;
                }

                .timeline-card em {
                    display: block;
                    margin-top: 0.45rem;
                    color: var(--text);
                    font-size: 0.78rem;
                    line-height: 1.5;
                }

                .empty-soft {
                    display: flex;
                    gap: 0.65rem;
                    align-items: flex-start;
                    border: 1px dashed var(--border-strong);
                    border-radius: 0.9rem;
                    padding: 0.85rem;
                    color: var(--muted);
                }

                .empty-soft strong {
                    color: var(--text);
                    font-size: 0.84rem;
                    font-weight: 900;
                }

                .empty-soft p {
                    margin-top: 0.2rem;
                    font-size: 0.76rem;
                    line-height: 1.5;
                }

                .sort-button:focus-visible,
                .project-row:focus-visible,
                .attention-button:focus-visible {
                    outline: 3px solid color-mix(in srgb, var(--gold) 45%, transparent);
                    outline-offset: 3px;
                }
            `}</style>

            <div className="dashboard-page">
                <div className="dashboard-shell">
                    <section className="hero-panel">
                        <div className="hero-grid">
                            <div>
                                <div className="eyebrow">
                                    <FolderKanban className="h-4 w-4" />
                                    Seguimiento académico
                                </div>

                                <h1 className="hero-title">{getMainTitle(role)}</h1>

                                <p className="hero-description">
                                    {getDescription(role)}
                                </p>
                            </div>

                            <aside className="profile-box" aria-label="Información de sesión">
                                <div className="profile-main">
                                    <div className="profile-avatar">{getInitials(userName)}</div>

                                    <div>
                                        <p className="profile-name">{userName}</p>
                                        <p className="profile-email">{userEmail}</p>
                                    </div>
                                </div>

                                <div className="role-badge">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Sesión activa como {roleLabel}
                                </div>
                            </aside>
                        </div>
                    </section>

                    <section className="kpi-grid" aria-label="Indicadores principales">
                        <KpiCard
                            icon={<FolderKanban className="h-4 w-4" />}
                            label={coordinatorMode ? 'Proyectos activos' : 'Proyectos visibles'}
                            value={summary.total_proyectos}
                            note={coordinatorMode ? 'Total activo del sistema.' : 'Según tu perfil actual.'}
                        />

                        <KpiCard
                            icon={<AlertTriangle className="h-4 w-4" />}
                            label="Requieren atención"
                            value={totalAtencion}
                            note="Sin avance, en revisión u observados."
                            tone={totalAtencion > 0 ? 'warning' : 'success'}
                        />

                        <KpiCard
                            icon={<Clock3 className="h-4 w-4" />}
                            label="Sin avance"
                            value={summary.sin_avance}
                            note="Sin historial de estado registrado."
                            tone={summary.sin_avance > 0 ? 'danger' : 'success'}
                        />

                        <KpiCard
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            label="Concluidos"
                            value={totalConcluidos}
                            note={`${safePercent(totalConcluidos, summary.total_proyectos)}% del total visible.`}
                            tone="success"
                        />
                    </section>

                    {coordinatorMode && (
                        <section className="coordinator-grid" aria-label="Panorama gráfico de coordinación">
                            <article className="chart-panel">
                                <div className="panel-head">
                                    <div>
                                        <div className="eyebrow">
                                            <BarChart3 className="h-4 w-4" />
                                            Gráfico de estados
                                        </div>
                                        <h2 className="panel-title">Distribución general de proyectos</h2>
                                        <p className="panel-note">
                                            Permite identificar concentración de proyectos por estado académico.
                                        </p>
                                    </div>

                                    <ShieldCheck className="h-5 w-5 text-[#9A6C18]" />
                                </div>

                                <div className="donut-wrap">
                                    <div
                                        className="donut"
                                        style={{
                                            '--donut-bg': getDonutGradient(
                                                summary.por_estado || {},
                                                summary.total_proyectos,
                                            ),
                                        } as React.CSSProperties}
                                    >
                                        <div className="donut-center">
                                            <strong>{summary.total_proyectos}</strong>
                                            <span>Proyectos</span>
                                        </div>
                                    </div>

                                    <StateDistribution
                                        porEstado={summary.por_estado || {}}
                                        total={summary.total_proyectos}
                                    />
                                </div>
                            </article>

                            <article className="mini-panel">
                                <div className="panel-head">
                                    <div>
                                        <div className="eyebrow">
                                            <AlertTriangle className="h-4 w-4" />
                                            Prioridad
                                        </div>
                                        <h2 className="panel-title">Proyectos para revisar</h2>
                                        <p className="panel-note">
                                            Lista generada por estados sensibles o ausencia de avance.
                                        </p>
                                    </div>
                                </div>

                                {proyectosAtencion.length === 0 ? (
                                    <div className="empty-soft">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <div>
                                            <strong>Sin alertas operativas</strong>
                                            <p>No hay proyectos marcados como prioridad.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="attention-list">
                                        {proyectosAtencion.map((proyecto) => (
                                            <button
                                                key={proyecto.id}
                                                type="button"
                                                className="attention-button"
                                                onClick={() => setSelectedProjectId(proyecto.id)}
                                            >
                                                <strong>{proyecto.titulo}</strong>
                                                <span>
                                                    {estadoLabel(proyecto.estado)} · Último avance: {formatShortDate(proyecto.ultimo_avance?.fecha)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </article>
                        </section>
                    )}

                    <section className="content-grid">
                        <div className="section-panel">
                            <div className="section-head">
                                <div>
                                    <h2 className="section-title">
                                        {role === 'estudiante'
                                            ? 'Mi proyecto'
                                            : coordinatorMode
                                                ? 'Repositorio operativo de proyectos'
                                                : 'Proyectos vinculados a mi labor docente'}
                                    </h2>
                                    <p className="section-description">
                                        Título del proyecto, estudiante, estado actual y fecha del último avance registrado.
                                    </p>
                                </div>

                                {(role === 'docente' || coordinatorMode) && (
                                    <div className="sort-actions">
                                        <SortButton
                                            active={filters.sort_by === 'estado'}
                                            label="Ordenar por estado"
                                            direction={filters.sort_dir}
                                            onClick={() => cambiarOrden('estado')}
                                        />

                                        <SortButton
                                            active={filters.sort_by === 'ultimo_avance'}
                                            label="Ordenar por último avance"
                                            direction={filters.sort_dir}
                                            onClick={() => cambiarOrden('ultimo_avance')}
                                        />
                                    </div>
                                )}
                            </div>

                            {proyectos.length === 0 ? (
                                <div className="mini-panel">
                                    <div className="empty-soft">
                                        <FolderKanban className="h-5 w-5" />
                                        <div>
                                            <strong>No hay proyectos para mostrar</strong>
                                            <p>No se encontraron proyectos activos vinculados a tu usuario actual.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="project-list">
                                    {proyectos.map((proyecto) => (
                                        <ProjectRow
                                            key={proyecto.id}
                                            proyecto={proyecto}
                                            selected={selectedProject?.id === proyecto.id}
                                            onSelect={() => setSelectedProjectId(proyecto.id)}
                                            coordinatorMode={coordinatorMode}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <ProjectDetail proyecto={selectedProject} />
                    </section>

                    {coordinatorMode && proyectosRecientes.length > 0 && (
                        <section className="mini-panel">
                            <div className="panel-head">
                                <div>
                                    <div className="eyebrow">
                                        <Activity className="h-4 w-4" />
                                        Actividad reciente
                                    </div>
                                    <h2 className="panel-title">Últimos proyectos con avance</h2>
                                    <p className="panel-note">
                                        Acceso rápido a los proyectos con movimiento reciente.
                                    </p>
                                </div>
                            </div>

                            <div className="project-list">
                                {proyectosRecientes.map((proyecto) => (
                                    <ProjectRow
                                        key={`recent-${proyecto.id}`}
                                        proyecto={proyecto}
                                        selected={selectedProject?.id === proyecto.id}
                                        onSelect={() => setSelectedProjectId(proyecto.id)}
                                        coordinatorMode={coordinatorMode}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};