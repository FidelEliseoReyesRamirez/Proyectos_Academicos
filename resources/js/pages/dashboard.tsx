
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    Activity,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BarChart3,
    BookOpenCheck,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    Clock3,
    FileCheck2,
    FileText,
    Filter,
    FolderKanban,
    MessageSquareText,
    Search,
    ShieldAlert,
    TrendingUp,
    UserRound,
    UsersRound,
    X,
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
    revisores?: Usuario[];
    ultimo_avance?: {
        fecha?: string | null;
        resumen?: string | null;
        comentario?: string | null;
        usuario?: string | null;
    } | null;
    metricas?: {
        entregas?: number;
        archivos?: number;
        observaciones?: number;
        revisiones?: number;
        reuniones?: number;
        ultima_reunion?: string | null;
    };
    riesgo?: {
        sin_avance?: boolean;
        sin_revisores?: boolean;
        sin_entregas?: boolean;
        estado_critico?: boolean;
        requiere_atencion?: boolean;
    };
};

type ActividadMensual = {
    periodo: string;
    label: string;
    eventos: number;
    entregas: number;
    reuniones: number;
    total: number;
};

type UltimoEvento = {
    id: number;
    proyecto_id: number;
    tipo_evento: string;
    descripcion: string;
    created_at: string;
    codigo: string;
    titulo: string;
    actor?: string | null;
};

type DashboardSummary = {
    total_proyectos: number;
    sin_avance: number;
    sin_revisores?: number;
    sin_entregas?: number;
    requieren_atencion?: number;
    concluidos?: number;
    aprobados?: number;
    en_desarrollo?: number;
    observados?: number;
    en_revision?: number;
    rechazados?: number;
    tasa_conclusion?: number;
    tasa_aprobacion?: number;
    tasa_riesgo?: number;
    avance_institucional?: number;
    entregas_total?: number;
    archivos_total?: number;
    observaciones_total?: number;
    observaciones_abiertas?: number;
    revisiones_total?: number;
    revisiones_pendientes?: number;
    eventos_total?: number;
    reuniones_total?: number;
    reuniones_ultimos_30_dias?: number;
    por_estado: Record<string, number>;
    por_modalidad?: Record<string, number>;
    por_area?: Record<string, number>;
    ultimo_avance_general?: string | null;
};

type DashboardData = {
    rol: string;
    filters: {
        sort_by: 'estado' | 'ultimo_avance';
        sort_dir: 'asc' | 'desc';
    };
    summary: DashboardSummary;
    charts?: {
        actividad_mensual?: ActividadMensual[];
        ultimos_eventos?: UltimoEvento[];
    };
    proyectos: ProyectoDashboard[];
};

type Props = {
    dashboardData?: DashboardData;
};

const roleLabels: Record<string, string> = {
    estudiante: 'Estudiante',
    tutor: 'Tutor',
    revisor: 'Revisor',
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

const modalidadLabels: Record<string, string> = {
    proyecto_grado: 'Proyecto de grado',
    tesis: 'Tesis',
    excelencia: 'Excelencia',
    trabajo_dirigido: 'Trabajo dirigido',
};

const estadoOrder = [
    'en_revision',
    'en_desarrollo',
    'observado',
    'aprobado',
    'rechazado',
    'concluido',
];

const estadoColors: Record<string, string> = {
    en_revision: '#C9A84C',
    en_desarrollo: '#2563EB',
    observado: '#EA8A1F',
    aprobado: '#3F9D58',
    rechazado: '#B91C1C',
    concluido: '#6E6458',
};

const chartColors = ['#6B1230', '#C9A84C', '#2563EB', '#3F9D58', '#EA8A1F', '#6E6458', '#B91C1C', '#8B5CF6'];

function normalizeRole(role?: string | null): string {
    return String(role || 'estudiante').toLowerCase();
}

function isCoordinatorRole(role: string): boolean {
    return role === 'coordinador' || role === 'admin' || role === 'administrador';
}

function isAcademicRole(role: string): boolean {
    return role === 'tutor' || role === 'revisor' || role === 'docente';
}

function safeNumber(value: unknown): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function estadoLabel(value?: string | null): string {
    if (!value) return 'Sin estado';
    return estadoLabels[value] || value.replaceAll('_', ' ');
}

function modalidadLabel(value?: string | null): string {
    if (!value) return 'Sin modalidad';
    return modalidadLabels[value] || value.replaceAll('_', ' ');
}

function eventoLabel(value?: string | null): string {
    if (!value) return 'Evento';
    return value.replaceAll('_', ' ');
}

function getEstadoColor(value?: string | null): string {
    if (!value) return '#6E6458';
    return estadoColors[value] || '#6E6458';
}

function formatDate(value?: string | null): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatRelative(value?: string | null): string {
    if (!value) return 'Sin movimiento';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin movimiento';

    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)} días`;

    return formatDate(value);
}

function percent(value: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((value / total) * 100);
}

function recordEntries(record?: Record<string, number>): Array<[string, number]> {
    return Object.entries(record || {})
        .filter(([, value]) => safeNumber(value) > 0)
        .sort((a, b) => b[1] - a[1]);
}

function getMainTitle(role: string): string {
    if (role === 'estudiante') return 'Mi seguimiento académico';
    if (role === 'tutor') return 'Proyectos bajo tutoría';
    if (role === 'revisor') return 'Proyectos para revisión';
    if (role === 'docente') return 'Mis proyectos asignados';
    if (isCoordinatorRole(role)) return 'Dashboard académico institucional';
    return 'Dashboard';
}

function getDescription(role: string): string {
    if (role === 'estudiante') {
        return 'Vista limitada a tu proyecto, tus entregas, reuniones y últimos avances.';
    }

    if (role === 'tutor') {
        return 'Controla reuniones, entregas y proyectos que requieren seguimiento tutorial.';
    }

    if (role === 'revisor') {
        return 'Revisa proyectos asignados y prioriza los casos con mayor necesidad de atención.';
    }

    if (isCoordinatorRole(role)) {
        return 'Vista ejecutiva de avance, riesgo académico, documentación, revisiones y actividad institucional.';
    }

    return 'Información académica disponible para tu perfil.';
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <section className={`dash-card ${className}`}>{children}</section>;
}

function KpiCard({
    title,
    value,
    description,
    icon,
    tone = 'default',
}: {
    title: string;
    value: ReactNode;
    description: string;
    icon: ReactNode;
    tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
    return (
        <div className={`kpi-card tone-${tone}`}>
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-content">
                <span>{title}</span>
                <strong>{value}</strong>
                <p>{description}</p>
            </div>
        </div>
    );
}

function EstadoChip({ estado }: { estado?: string | null }) {
    const color = getEstadoColor(estado);

    return (
        <span className="estado-chip" style={{ borderColor: `${color}55`, color }}>
            <span style={{ background: color }} />
            {estadoLabel(estado)}
        </span>
    );
}

function DonutChart({
    data,
    total,
}: {
    data: Array<{ label: string; value: number; color: string }>;
    total: number;
}) {
    const segments: string[] = [];
    let current = 0;

    if (total > 0) {
        data.forEach((item) => {
            const size = (item.value / total) * 100;
            segments.push(`${item.color} ${current}% ${current + size}%`);
            current += size;
        });
    }

    const background = total > 0
        ? `conic-gradient(${segments.join(', ')})`
        : 'conic-gradient(#D8D0C7 0% 100%)';

    return (
        <div className="donut-wrap">
            <div className="donut" style={{ background }}>
                <div className="donut-center">
                    <strong>{total}</strong>
                    <span>proyectos</span>
                </div>
            </div>

            <div className="donut-legend">
                {data.map((item) => (
                    <div key={item.label} className="legend-row">
                        <span className="legend-dot" style={{ background: item.color }} />
                        <span className="legend-label">{item.label}</span>
                        <strong>{item.value}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HorizontalBars({
    data,
    labelFormatter,
    emptyText,
}: {
    data: Array<[string, number]>;
    labelFormatter?: (value: string) => string;
    emptyText: string;
}) {
    const max = Math.max(...data.map(([, value]) => value), 0);

    if (data.length === 0) {
        return <div className="empty-mini">{emptyText}</div>;
    }

    return (
        <div className="bar-list">
            {data.map(([label, value], index) => {
                const width = max > 0 ? Math.max(7, Math.round((value / max) * 100)) : 0;
                const color = chartColors[index % chartColors.length];

                return (
                    <div key={label} className="bar-row">
                        <div className="bar-row-top">
                            <span>{labelFormatter ? labelFormatter(label) : label}</span>
                            <strong>{value}</strong>
                        </div>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${width}%`, background: color }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MonthlyActivityChart({ data }: { data: ActividadMensual[] }) {
    const max = Math.max(...data.map((item) => item.total), 0);

    if (data.length === 0 || max === 0) {
        return <div className="empty-mini">Sin actividad registrada en los últimos meses.</div>;
    }

    return (
        <div className="monthly-chart">
            {data.map((item) => {
                const height = Math.max(8, Math.round((item.total / max) * 100));

                return (
                    <div key={item.periodo} className="month-col">
                        <div className="month-bar-wrap" title={`${item.label}: ${item.total} actividades`}>
                            <div className="month-bar" style={{ height: `${height}%` }}>
                                <span style={{ height: `${percent(item.eventos, item.total)}%` }} className="month-segment events" />
                                <span style={{ height: `${percent(item.entregas, item.total)}%` }} className="month-segment deliveries" />
                                <span style={{ height: `${percent(item.reuniones, item.total)}%` }} className="month-segment meetings" />
                            </div>
                        </div>
                        <strong>{item.total}</strong>
                        <span>{item.label.replace(' 2026', '')}</span>
                    </div>
                );
            })}
        </div>
    );
}

function RiskReasons({ proyecto }: { proyecto: ProyectoDashboard }) {
    const riesgo = proyecto.riesgo;

    if (!riesgo) return null;

    const reasons = [
        riesgo.estado_critico ? 'Estado crítico' : null,
        riesgo.sin_avance ? 'Sin avance' : null,
        riesgo.sin_entregas ? 'Sin entregas' : null,
        riesgo.sin_revisores ? 'Sin revisores' : null,
    ].filter(Boolean);

    if (reasons.length === 0) {
        return <span className="risk-ok">Sin alertas</span>;
    }

    return (
        <div className="risk-tags">
            {reasons.map((reason) => (
                <span key={String(reason)}>{reason}</span>
            ))}
        </div>
    );
}

function StudentProjectSummary({ proyecto }: { proyecto?: ProyectoDashboard }) {
    if (!proyecto) {
        return (
            <Card>
                <div className="empty-block">
                    <FolderKanban className="h-16 w-16" />
                    <strong>Sin proyecto asignado</strong>
                    <p>No tienes un proyecto vinculado a tu usuario actual.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="student-project-card">
            <div className="student-project-top">
                <div>
                    <span className="project-code">{proyecto.codigo}</span>
                    <h2>{proyecto.titulo}</h2>
                    <p>{proyecto.descripcion || 'Sin descripción registrada.'}</p>
                </div>
                <EstadoChip estado={proyecto.estado} />
            </div>

            <div className="student-details-grid">
                <div>
                    <span>Tutor</span>
                    <strong>{proyecto.tutor?.name || 'Sin tutor asignado'}</strong>
                </div>
                <div>
                    <span>Modalidad</span>
                    <strong>{modalidadLabel(proyecto.modalidad)}</strong>
                </div>
                <div>
                    <span>Área temática</span>
                    <strong>{proyecto.area_tematica || 'Sin área registrada'}</strong>
                </div>
                <div>
                    <span>Último avance</span>
                    <strong>{formatRelative(proyecto.ultimo_avance?.fecha)}</strong>
                </div>
            </div>

            <div className="student-actions">
                <Link href={`/seguimiento/${proyecto.id}`} className="project-action">
                    Ver seguimiento
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </Card>
    );
}

function ProjectCard({
    proyecto,
    coordinatorMode,
    academicMode,
}: {
    proyecto: ProyectoDashboard;
    coordinatorMode: boolean;
    academicMode: boolean;
}) {
    return (
        <Link key={proyecto.id} href={`/seguimiento/${proyecto.id}`} className="project-card">
            <div className="project-main">
                <span className="project-code">{proyecto.codigo}</span>

                <div className="project-title">{proyecto.titulo}</div>

                <div className="project-meta">
                    <span>
                        <UserRound className="h-3.5 w-3.5 text-[var(--brand)]" />
                        Estudiante: <strong>{proyecto.estudiante?.name || 'Sin asignar'}</strong>
                    </span>

                    {(coordinatorMode || academicMode) && (
                        <span>
                            <UsersRound className="h-3.5 w-3.5 text-[#9A6C18]" />
                            Tutor: <strong>{proyecto.tutor?.name || 'Sin asignar'}</strong>
                        </span>
                    )}

                    <span>
                        <BookOpenCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                        {modalidadLabel(proyecto.modalidad)}
                    </span>
                </div>
            </div>

            <EstadoChip estado={proyecto.estado} />

            <div className="project-metrics">
                <div className="metric-pill">
                    <strong>{safeNumber(proyecto.metricas?.entregas)}</strong>
                    <span>Entregas</span>
                </div>
                <div className="metric-pill">
                    <strong>{safeNumber(proyecto.metricas?.archivos)}</strong>
                    <span>Archivos</span>
                </div>
                <div className="metric-pill">
                    <strong>{safeNumber(proyecto.metricas?.reuniones)}</strong>
                    <span>Reuniones</span>
                </div>
            </div>

            <div>
                <div className="project-time-label">Último avance</div>
                <div className="project-time-value">
                    <Clock className="h-3.5 w-3.5 opacity-70" />
                    {formatRelative(proyecto.ultimo_avance?.fecha)}
                </div>

                <div style={{ marginTop: '0.45rem' }}>
                    <RiskReasons proyecto={proyecto} />
                </div>
            </div>

            <span className="project-action">
                Ver seguimiento
                <ChevronRight className="h-4 w-4" />
            </span>
        </Link>
    );
}

export default function Dashboard({ dashboardData }: Props) {
    const page = usePage<SharedPageProps>();
    const user = page.props.auth?.user;

    const userName = user?.name || 'Usuario';
    const rawRole = dashboardData?.rol ?? user?.role ?? user?.rol;
    const role = normalizeRole(rawRole);
    const roleLabel = roleLabels[role] || role;

    const proyectos = dashboardData?.proyectos || [];
    const filters = dashboardData?.filters || { sort_by: 'ultimo_avance', sort_dir: 'desc' };

    const summary: DashboardSummary = dashboardData?.summary || {
        total_proyectos: 0,
        sin_avance: 0,
        por_estado: {},
    };

    const charts = dashboardData?.charts || {};
    const actividadMensual = charts.actividad_mensual || [];
    const ultimosEventos = charts.ultimos_eventos || [];

    const coordinatorMode = isCoordinatorRole(role);
    const academicMode = isAcademicRole(role);
    const studentMode = role === 'estudiante';

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const offStart = router.on('start', () => setLoading(true));
        const offFinish = router.on('finish', () => setLoading(false));

        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const filteredProyectos = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return proyectos;

        return proyectos.filter((proyecto) => (
            proyecto.titulo.toLowerCase().includes(q) ||
            proyecto.codigo.toLowerCase().includes(q) ||
            (proyecto.estudiante?.name || '').toLowerCase().includes(q) ||
            (proyecto.tutor?.name || '').toLowerCase().includes(q) ||
            (proyecto.area_tematica || '').toLowerCase().includes(q) ||
            modalidadLabel(proyecto.modalidad).toLowerCase().includes(q) ||
            estadoLabel(proyecto.estado).toLowerCase().includes(q)
        ));
    }, [proyectos, search]);

    const proyectosAtencion = useMemo(() => {
        return [...proyectos]
            .filter((proyecto) => proyecto.riesgo?.requiere_atencion)
            .slice(0, 6);
    }, [proyectos]);

    const estadoData = estadoOrder
        .map((estado) => ({
            label: estadoLabel(estado),
            value: safeNumber(summary.por_estado?.[estado]),
            color: getEstadoColor(estado),
        }))
        .filter((item) => item.value > 0);

    const modalidadData = recordEntries(summary.por_modalidad);
    const areaData = recordEntries(summary.por_area).slice(0, 8);
    const studentProject = proyectos[0];

    const cambiarOrden = (sortBy: 'estado' | 'ultimo_avance') => {
        const nextDirection = filters.sort_by === sortBy && filters.sort_dir === 'desc' ? 'asc' : 'desc';

        router.get(
            '/dashboard',
            { sort_by: sortBy, sort_dir: nextDirection },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Dashboard" />

            <style>{`
                .dashboard-page {
                    --bg-card: rgba(255, 255, 255, 0.86);
                    --bg-card-strong: rgba(255, 255, 255, 0.96);
                    --text-main: #24151A;
                    --text-soft: #6E6458;
                    --text-muted: #8A8074;
                    --border: rgba(107, 18, 48, 0.13);
                    --border-strong: rgba(107, 18, 48, 0.25);
                    --brand: #6B1230;
                    --brand-2: #C9A84C;
                    --brand-soft: rgba(107, 18, 48, 0.09);
                    --gold-soft: rgba(201, 168, 76, 0.16);
                    --shadow: 0 18px 45px rgba(107, 18, 48, 0.09);
                    --shadow-soft: 0 10px 26px rgba(107, 18, 48, 0.06);

                    min-height: 100vh;
                    color: var(--text-main);
                    background:
                        radial-gradient(circle at 92% 6%, rgba(201,168,76,0.24), transparent 29%),
                        radial-gradient(circle at 4% 96%, rgba(107,18,48,0.12), transparent 34%),
                        linear-gradient(135deg, #FBF8F3 0%, #F5EFE8 48%, #F8EDDA 100%);
                }

                .dark .dashboard-page {
                    --bg-card: rgba(255, 255, 255, 0.055);
                    --bg-card-strong: rgba(255, 255, 255, 0.085);
                    --text-main: #F5EFE9;
                    --text-soft: #D3C5BC;
                    --text-muted: #A9978D;
                    --border: rgba(214, 185, 106, 0.16);
                    --border-strong: rgba(214, 185, 106, 0.30);
                    --brand: #D4849A;
                    --brand-2: #D6B96A;
                    --brand-soft: rgba(212, 132, 154, 0.12);
                    --gold-soft: rgba(214, 185, 106, 0.12);
                    --shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
                    --shadow-soft: 0 10px 28px rgba(0, 0, 0, 0.18);

                    background:
                        radial-gradient(circle at 92% 6%, rgba(214,185,106,0.15), transparent 29%),
                        radial-gradient(circle at 4% 96%, rgba(212,132,154,0.14), transparent 34%),
                        linear-gradient(135deg, #211119 0%, #2A1620 48%, #351B28 100%);
                }

                .dashboard-shell { width: 100%; max-width: 1480px; margin: 0 auto; padding: 1rem; display: grid; gap: 1rem; }
                @media (min-width: 768px) { .dashboard-shell { padding: 1.5rem; gap: 1.25rem; } }
                @media (min-width: 1280px) { .dashboard-shell { padding: 2rem 2.25rem; } }

                .progress-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 9999; background: linear-gradient(90deg, transparent, var(--brand), var(--brand-2), transparent); background-size: 200% 100%; animation: progress-slide 1.1s linear infinite; }
                @keyframes progress-slide { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

                .dash-card { border: 1px solid var(--border); background: var(--bg-card); border-radius: 1.5rem; box-shadow: var(--shadow-soft); backdrop-filter: blur(12px); }
                .hero-card { padding: 1.25rem; display: grid; gap: 1.25rem; }
                @media (min-width: 980px) { .hero-card { grid-template-columns: minmax(0, 1.5fr) minmax(21rem, 0.8fr); align-items: center; padding: 1.5rem; } }

                .eyebrow { display: inline-flex; align-items: center; gap: 0.45rem; color: #9A6C18; font-size: 0.68rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
                .dark .eyebrow { color: var(--brand-2); }
                .hero-title { margin-top: 0.55rem; font-size: clamp(1.7rem, 3vw, 2.55rem); font-weight: 950; line-height: 1.06; letter-spacing: -0.045em; }
                .hero-text { margin-top: 0.75rem; max-width: 54rem; color: var(--text-soft); font-size: 0.95rem; line-height: 1.65; }
                .hero-badges { display: flex; gap: 0.55rem; flex-wrap: wrap; margin-top: 1rem; }
                .hero-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.38rem 0.72rem; border-radius: 999px; background: var(--brand-soft); color: var(--brand); font-size: 0.75rem; font-weight: 850; border: 1px solid var(--border); }

                .hero-panel { border: 1px solid var(--border); border-radius: 1.15rem; background: linear-gradient(135deg, var(--brand-soft), var(--gold-soft)); padding: 1rem; display: grid; gap: 0.75rem; }
                .hero-progress-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
                .hero-progress-top span { color: var(--text-muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
                .hero-progress-top strong { font-size: 1.75rem; font-weight: 950; color: var(--text-main); }
                .progress-track { height: 0.7rem; overflow: hidden; border-radius: 999px; background: rgba(110, 100, 88, 0.14); }
                .dark .progress-track { background: rgba(255, 255, 255, 0.08); }
                .progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--brand), var(--brand-2)); }
                .hero-panel p { margin: 0; color: var(--text-soft); font-size: 0.82rem; line-height: 1.5; }

                .kpi-grid { display: grid; gap: 0.8rem; grid-template-columns: 1fr; }
                @media (min-width: 640px) { .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                @media (min-width: 1180px) { .kpi-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
                .student-kpi-grid { display: grid; gap: 0.8rem; grid-template-columns: 1fr; }
                @media (min-width: 760px) { .student-kpi-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

                .kpi-card { display: flex; align-items: center; gap: 0.95rem; padding: 1.05rem 1.1rem; border-radius: 1.15rem; border: 1px solid var(--border); background: var(--bg-card); box-shadow: var(--shadow-soft); min-width: 0; }
                .kpi-card:hover { transform: translateY(-1px); border-color: var(--border-strong); box-shadow: var(--shadow); }
                .kpi-icon { flex-shrink: 0; width: 2.75rem; height: 2.75rem; display: flex; align-items: center; justify-content: center; border-radius: 0.9rem; background: var(--brand-soft); color: var(--brand); }
                .kpi-card.tone-success .kpi-icon { background: rgba(21, 128, 61, 0.12); color: #15803D; }
                .kpi-card.tone-warning .kpi-icon { background: rgba(234, 138, 31, 0.14); color: #B86612; }
                .kpi-card.tone-danger .kpi-icon { background: rgba(185, 28, 28, 0.14); color: #B91C1C; }
                .kpi-card.tone-info .kpi-icon { background: rgba(37, 99, 235, 0.12); color: #2563EB; }
                .dark .kpi-card.tone-success .kpi-icon { color: #6FC282; }
                .dark .kpi-card.tone-warning .kpi-icon { color: #F4B45E; }
                .dark .kpi-card.tone-danger .kpi-icon { color: #F87171; }
                .dark .kpi-card.tone-info .kpi-icon { color: #93C5FD; }
                .kpi-content { min-width: 0; flex: 1; }
                .kpi-content span { display: block; color: var(--text-muted); font-size: 0.66rem; font-weight: 950; letter-spacing: 0.10em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .kpi-content strong { display: block; margin-top: 0.12rem; color: var(--text-main); font-size: 1.72rem; font-weight: 950; line-height: 1.05; }
                .kpi-content p { margin: 0.25rem 0 0; color: var(--text-soft); font-size: 0.74rem; line-height: 1.38; }

                .section-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
                @media (min-width: 1180px) { .section-grid.cols-2 { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); } }
                .section-card { padding: 1.15rem; }
                .section-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
                .section-title { display: flex; align-items: center; gap: 0.55rem; color: var(--text-main); font-size: 1.02rem; font-weight: 950; letter-spacing: -0.015em; }
                .section-subtitle { margin: 0.35rem 0 0; color: var(--text-soft); font-size: 0.82rem; line-height: 1.5; }

                .donut-wrap { display: grid; gap: 1rem; align-items: center; }
                @media (min-width: 680px) { .donut-wrap { grid-template-columns: 13rem minmax(0, 1fr); } }
                .donut { width: 12rem; height: 12rem; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px var(--border); }
                .donut-center { width: 7.25rem; height: 7.25rem; border-radius: 50%; background: var(--bg-card-strong); border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .donut-center strong { color: var(--text-main); font-size: 1.9rem; font-weight: 950; line-height: 1; }
                .donut-center span { margin-top: 0.25rem; color: var(--text-muted); font-size: 0.68rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
                .donut-legend { display: grid; gap: 0.55rem; }
                .legend-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0.55rem; padding: 0.52rem 0.65rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.38); border: 1px solid var(--border); }
                .dark .legend-row { background: rgba(255, 255, 255, 0.035); }
                .legend-dot { width: 0.62rem; height: 0.62rem; border-radius: 999px; }
                .legend-label { min-width: 0; color: var(--text-soft); font-size: 0.82rem; font-weight: 760; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .legend-row strong { color: var(--text-main); font-size: 0.85rem; font-weight: 950; }

                .bar-list { display: grid; gap: 0.75rem; }
                .bar-row { display: grid; gap: 0.38rem; }
                .bar-row-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: var(--text-soft); font-size: 0.82rem; font-weight: 780; }
                .bar-row-top span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .bar-row-top strong { color: var(--text-main); font-weight: 950; }
                .bar-track { height: 0.52rem; border-radius: 999px; overflow: hidden; background: rgba(110, 100, 88, 0.13); }
                .dark .bar-track { background: rgba(255, 255, 255, 0.07); }
                .bar-fill { height: 100%; min-width: 0.4rem; border-radius: 999px; }

                .monthly-chart { min-height: 17rem; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.7rem; align-items: end; padding-top: 0.5rem; }
                .month-col { height: 16rem; display: grid; grid-template-rows: 1fr auto auto; gap: 0.35rem; align-items: end; text-align: center; min-width: 0; }
                .month-bar-wrap { width: 100%; height: 100%; display: flex; align-items: end; justify-content: center; }
                .month-bar { width: min(2.25rem, 78%); min-height: 0.8rem; border-radius: 0.8rem 0.8rem 0.35rem 0.35rem; overflow: hidden; display: flex; flex-direction: column-reverse; box-shadow: 0 10px 18px rgba(107, 18, 48, 0.14); }
                .month-segment { display: block; width: 100%; min-height: 0; }
                .month-segment.events { background: var(--brand); }
                .month-segment.deliveries { background: var(--brand-2); }
                .month-segment.meetings { background: #2563EB; }
                .month-col strong { color: var(--text-main); font-size: 0.82rem; font-weight: 950; }
                .month-col span { color: var(--text-muted); font-size: 0.68rem; font-weight: 820; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .chart-legend-inline { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 0.85rem; }
                .chart-legend-inline span { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--text-soft); font-size: 0.74rem; font-weight: 800; }
                .chart-legend-inline i { width: 0.55rem; height: 0.55rem; border-radius: 999px; display: inline-block; }

                .filters-card { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
                @media (min-width: 920px) { .filters-card { flex-direction: row; align-items: center; justify-content: space-between; } }
                .search-wrap { position: relative; width: 100%; max-width: 34rem; }
                .search-wrap .search-icon { position: absolute; left: 0.88rem; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; color: var(--text-muted); pointer-events: none; }
                .search-input { width: 100%; height: 2.75rem; border-radius: 0.9rem; border: 1px solid var(--border); background: var(--bg-card-strong); color: var(--text-main); padding: 0 2.75rem 0 2.55rem; font-size: 0.9rem; outline: none; }
                .search-input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-soft); }
                .clear-button { position: absolute; right: 0.55rem; top: 50%; transform: translateY(-50%); width: 1.65rem; height: 1.65rem; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: var(--brand-soft); color: var(--brand); cursor: pointer; }
                .sort-group { display: flex; flex-wrap: wrap; align-items: center; gap: 0.55rem; }
                .sort-label { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--text-muted); font-size: 0.72rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
                .sort-button { height: 2.25rem; display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid var(--border); border-radius: 0.72rem; background: transparent; color: var(--text-soft); padding: 0 0.8rem; font-size: 0.78rem; font-weight: 860; cursor: pointer; }
                .sort-button:hover { border-color: var(--border-strong); color: var(--brand); background: var(--brand-soft); }
                .sort-button.is-active { background: var(--brand); color: white; border-color: var(--brand); }

                .project-list { display: grid; gap: 0.8rem; }
                .project-card { display: grid; grid-template-columns: 1fr; gap: 1rem; padding: 1.05rem; border: 1px solid var(--border); border-radius: 1.15rem; background: var(--bg-card); color: inherit; text-decoration: none; }
                .project-card:hover { transform: translateY(-1px); border-color: var(--border-strong); background: var(--bg-card-strong); box-shadow: var(--shadow); }
                @media (min-width: 1080px) { .project-card { grid-template-columns: minmax(0, 1.45fr) auto minmax(12rem, 0.65fr) minmax(13rem, 0.8fr) auto; align-items: center; } }
                .project-main { min-width: 0; }
                .project-code { display: inline-flex; width: fit-content; margin-bottom: 0.4rem; padding: 0.16rem 0.52rem; border-radius: 0.48rem; color: #9A6C18; background: rgba(154, 108, 24, 0.10); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.7rem; font-weight: 950; letter-spacing: 0.04em; }
                .dark .project-code { color: var(--brand-2); background: var(--gold-soft); }
                .project-title { color: var(--text-main); font-size: 0.98rem; font-weight: 950; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
                .project-meta { margin-top: 0.48rem; display: flex; flex-wrap: wrap; gap: 0.65rem; color: var(--text-soft); font-size: 0.75rem; }
                .project-meta span { display: inline-flex; align-items: center; gap: 0.28rem; }
                .project-meta strong { color: var(--text-main); font-weight: 850; }
                .estado-chip { width: max-content; max-width: 100%; display: inline-flex; align-items: center; gap: 0.42rem; padding: 0.28rem 0.68rem; border-radius: 999px; border: 1px solid; background: rgba(255, 255, 255, 0.35); font-size: 0.73rem; font-weight: 900; white-space: nowrap; }
                .dark .estado-chip { background: rgba(255, 255, 255, 0.04); }
                .estado-chip span { width: 0.5rem; height: 0.5rem; flex-shrink: 0; border-radius: 999px; }
                .project-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.35rem; }
                .metric-pill { padding: 0.42rem 0.5rem; border-radius: 0.72rem; border: 1px solid var(--border); background: rgba(255, 255, 255, 0.36); text-align: center; }
                .dark .metric-pill { background: rgba(255, 255, 255, 0.035); }
                .metric-pill strong { display: block; color: var(--text-main); font-size: 0.9rem; font-weight: 950; line-height: 1; }
                .metric-pill span { display: block; margin-top: 0.17rem; color: var(--text-muted); font-size: 0.62rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.05em; }
                .project-time-label { color: var(--text-muted); font-size: 0.64rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 0.22rem; }
                .project-time-value { display: flex; align-items: center; gap: 0.35rem; color: var(--text-main); font-size: 0.84rem; font-weight: 860; }
                .risk-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
                .risk-tags span { display: inline-flex; width: fit-content; padding: 0.22rem 0.52rem; border-radius: 999px; color: #B86612; background: rgba(234, 138, 31, 0.12); border: 1px solid rgba(234, 138, 31, 0.22); font-size: 0.68rem; font-weight: 850; white-space: nowrap; }
                .risk-ok { display: inline-flex; width: fit-content; padding: 0.22rem 0.52rem; border-radius: 999px; color: #15803D; background: rgba(21, 128, 61, 0.11); border: 1px solid rgba(21, 128, 61, 0.18); font-size: 0.68rem; font-weight: 850; }
                .project-action { width: fit-content; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.55rem 0.82rem; border-radius: 0.75rem; background: linear-gradient(135deg, var(--brand), #4A0D21); color: white; font-size: 0.78rem; font-weight: 900; white-space: nowrap; box-shadow: 0 8px 20px rgba(107, 18, 48, 0.20); }
                .dark .project-action { color: #2A1620; background: linear-gradient(135deg, var(--brand), #D6B96A); }

                .events-list, .attention-list { display: grid; gap: 0.58rem; }
                .event-row, .attention-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0.75rem; padding: 0.72rem 0.78rem; border-radius: 0.85rem; border: 1px solid var(--border); background: rgba(255, 255, 255, 0.38); color: inherit; text-decoration: none; }
                .dark .event-row, .dark .attention-row { background: rgba(255, 255, 255, 0.035); }
                .event-icon, .attention-icon { width: 2.05rem; height: 2.05rem; border-radius: 0.62rem; display: flex; align-items: center; justify-content: center; background: var(--brand-soft); color: var(--brand); }
                .attention-icon { background: rgba(234, 138, 31, 0.13); color: #B86612; }
                .event-body, .attention-body { min-width: 0; }
                .event-body strong, .attention-body strong { display: block; color: var(--text-main); font-size: 0.84rem; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .event-body span, .attention-body span { display: block; margin-top: 0.12rem; color: var(--text-soft); font-size: 0.73rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                .student-project-card { padding: 1.25rem; display: grid; gap: 1rem; }
                .student-project-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
                .student-project-top h2 { margin: 0; color: var(--text-main); font-size: 1.25rem; font-weight: 950; line-height: 1.25; }
                .student-project-top p { margin: 0.5rem 0 0; color: var(--text-soft); font-size: 0.88rem; line-height: 1.55; }
                .student-details-grid { display: grid; gap: 0.7rem; grid-template-columns: 1fr; }
                @media (min-width: 780px) { .student-details-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
                .student-details-grid div { border: 1px solid var(--border); border-radius: 0.9rem; padding: 0.75rem; background: rgba(255,255,255,0.35); }
                .dark .student-details-grid div { background: rgba(255,255,255,0.035); }
                .student-details-grid span { display: block; color: var(--text-muted); font-size: 0.65rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
                .student-details-grid strong { display: block; margin-top: 0.25rem; color: var(--text-main); font-size: 0.88rem; font-weight: 900; }
                .student-actions { display: flex; justify-content: flex-end; }

                .empty-mini { min-height: 8rem; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--text-soft); border: 1px dashed var(--border); border-radius: 1rem; padding: 1rem; font-size: 0.86rem; line-height: 1.5; }
                .empty-block { padding: 3rem 1.5rem; text-align: center; }
                .empty-block svg { margin: 0 auto 0.75rem; opacity: 0.35; }
                .empty-block strong { display: block; color: var(--text-main); font-size: 1.08rem; font-weight: 950; }
                .empty-block p { max-width: 30rem; margin: 0.5rem auto 0; color: var(--text-soft); font-size: 0.88rem; line-height: 1.55; }
                .list-title-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 0 0.1rem; }
                .total-text { color: var(--text-soft); font-size: 0.78rem; font-weight: 800; }
                .total-text strong { color: var(--text-main); font-weight: 950; }
            `}</style>

            {loading && <div className="progress-bar" aria-hidden="true" />}

            <div className="dashboard-page">
                <div className="dashboard-shell">
                    <Card className="hero-card">
                        <div>
                            <div className="eyebrow">
                                <BookOpenCheck className="h-4 w-4" />
                                Gestión académica
                            </div>

                            <h1 className="hero-title">{getMainTitle(role)}</h1>

                            <p className="hero-text">
                                Hola <strong>{userName}</strong>. {getDescription(role)}
                            </p>

                            <div className="hero-badges">
                                <span className="hero-badge">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Sesión como {roleLabel}
                                </span>

                                <span className="hero-badge">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    Último avance: {formatRelative(summary.ultimo_avance_general)}
                                </span>

                                {!studentMode && (
                                    <span className="hero-badge">
                                        <Activity className="h-3.5 w-3.5" />
                                        {safeNumber(summary.eventos_total)} eventos registrados
                                    </span>
                                )}
                            </div>
                        </div>

                        {!studentMode && (
                            <div className="hero-panel">
                                <div className="hero-progress-top">
                                    <span>Avance institucional</span>
                                    <strong>{safeNumber(summary.avance_institucional)}%</strong>
                                </div>

                                <div className="progress-track">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${Math.min(100, Math.max(0, safeNumber(summary.avance_institucional)))}%` }}
                                    />
                                </div>

                                <p>Indicador ponderado por estado: revisión, desarrollo, observado, aprobado y concluido.</p>
                            </div>
                        )}
                    </Card>

                    {studentMode ? (
                        <>
                            <section className="student-kpi-grid">
                                <KpiCard
                                    title="Estado actual"
                                    value={estadoLabel(studentProject?.estado)}
                                    description="Situación de tu proyecto"
                                    icon={<FolderKanban className="h-5 w-5" />}
                                    tone="info"
                                />
                                <KpiCard
                                    title="Entregas"
                                    value={safeNumber(studentProject?.metricas?.entregas)}
                                    description={`${safeNumber(studentProject?.metricas?.archivos)} archivos asociados`}
                                    icon={<FileCheck2 className="h-5 w-5" />}
                                    tone="default"
                                />
                                <KpiCard
                                    title="Reuniones"
                                    value={safeNumber(studentProject?.metricas?.reuniones)}
                                    description="Reuniones de tutoría registradas"
                                    icon={<CalendarCheck className="h-5 w-5" />}
                                    tone="default"
                                />
                                <KpiCard
                                    title="Último avance"
                                    value={formatRelative(studentProject?.ultimo_avance?.fecha)}
                                    description="Movimiento más reciente"
                                    icon={<Clock className="h-5 w-5" />}
                                    tone={studentProject?.riesgo?.sin_avance ? 'warning' : 'success'}
                                />
                            </section>

                            <StudentProjectSummary proyecto={studentProject} />
                        </>
                    ) : (
                        <>
                            <section className="kpi-grid">
                                <KpiCard
                                    title={coordinatorMode ? 'Proyectos activos' : 'Proyectos visibles'}
                                    value={summary.total_proyectos}
                                    description={coordinatorMode ? 'Total activo del sistema' : 'Según tu perfil'}
                                    icon={<FolderKanban className="h-5 w-5" />}
                                    tone="default"
                                />

                                <KpiCard
                                    title="Requieren atención"
                                    value={safeNumber(summary.requieren_atencion)}
                                    description="Riesgo por avance, entregas, revisores o estado"
                                    icon={<ShieldAlert className="h-5 w-5" />}
                                    tone={safeNumber(summary.requieren_atencion) > 0 ? 'warning' : 'success'}
                                />

                                <KpiCard
                                    title="Tasa de conclusión"
                                    value={`${safeNumber(summary.tasa_conclusion)}%`}
                                    description={`${safeNumber(summary.concluidos)} proyectos concluidos`}
                                    icon={<CheckCircle2 className="h-5 w-5" />}
                                    tone="success"
                                />

                                <KpiCard
                                    title="Riesgo académico"
                                    value={`${safeNumber(summary.tasa_riesgo)}%`}
                                    description="Porcentaje de proyectos con alertas"
                                    icon={<AlertTriangle className="h-5 w-5" />}
                                    tone={safeNumber(summary.tasa_riesgo) > 0 ? 'danger' : 'success'}
                                />

                                <KpiCard
                                    title="Entregas"
                                    value={safeNumber(summary.entregas_total)}
                                    description={`${safeNumber(summary.archivos_total)} archivos asociados`}
                                    icon={<FileCheck2 className="h-5 w-5" />}
                                    tone="info"
                                />

                                <KpiCard
                                    title="Reuniones"
                                    value={safeNumber(summary.reuniones_total)}
                                    description={`${safeNumber(summary.reuniones_ultimos_30_dias)} en los últimos 30 días`}
                                    icon={<CalendarCheck className="h-5 w-5" />}
                                    tone="default"
                                />

                                <KpiCard
                                    title="Observaciones"
                                    value={safeNumber(summary.observaciones_total)}
                                    description={`${safeNumber(summary.observaciones_abiertas)} abiertas`}
                                    icon={<MessageSquareText className="h-5 w-5" />}
                                    tone={safeNumber(summary.observaciones_abiertas) > 0 ? 'warning' : 'default'}
                                />

                                <KpiCard
                                    title="Revisiones"
                                    value={safeNumber(summary.revisiones_total)}
                                    description={`${safeNumber(summary.revisiones_pendientes)} pendientes`}
                                    icon={<FileText className="h-5 w-5" />}
                                    tone={safeNumber(summary.revisiones_pendientes) > 0 ? 'warning' : 'default'}
                                />
                            </section>

                            {coordinatorMode && (
                                <>
                                    <section className="section-grid cols-2">
                                        <Card className="section-card">
                                            <div className="section-header">
                                                <div>
                                                    <div className="section-title">
                                                        <BarChart3 className="h-5 w-5 text-[var(--brand)]" />
                                                        Distribución por estado
                                                    </div>
                                                    <p className="section-subtitle">Lectura ejecutiva del avance actual de los proyectos.</p>
                                                </div>
                                            </div>
                                            <DonutChart data={estadoData} total={summary.total_proyectos} />
                                        </Card>

                                        <Card className="section-card">
                                            <div className="section-header">
                                                <div>
                                                    <div className="section-title">
                                                        <BarChart3 className="h-5 w-5 text-[var(--brand)]" />
                                                        Proyectos por modalidad
                                                    </div>
                                                    <p className="section-subtitle">Concentración por tipo de modalidad académica.</p>
                                                </div>
                                            </div>
                                            <HorizontalBars data={modalidadData} labelFormatter={modalidadLabel} emptyText="No hay modalidades registradas." />
                                        </Card>
                                    </section>

                                    <section className="section-grid cols-2">
                                        <Card className="section-card">
                                            <div className="section-header">
                                                <div>
                                                    <div className="section-title">
                                                        <TrendingUp className="h-5 w-5 text-[var(--brand)]" />
                                                        Actividad mensual
                                                    </div>
                                                    <p className="section-subtitle">Eventos, entregas y reuniones registradas durante los últimos meses.</p>
                                                </div>
                                            </div>
                                            <MonthlyActivityChart data={actividadMensual} />
                                            <div className="chart-legend-inline">
                                                <span><i style={{ background: 'var(--brand)' }} /> Eventos</span>
                                                <span><i style={{ background: 'var(--brand-2)' }} /> Entregas</span>
                                                <span><i style={{ background: '#2563EB' }} /> Reuniones</span>
                                            </div>
                                        </Card>

                                        <Card className="section-card">
                                            <div className="section-header">
                                                <div>
                                                    <div className="section-title">
                                                        <BookOpenCheck className="h-5 w-5 text-[var(--brand)]" />
                                                        Áreas temáticas
                                                    </div>
                                                    <p className="section-subtitle">Principales líneas académicas registradas.</p>
                                                </div>
                                            </div>
                                            <HorizontalBars data={areaData} emptyText="No hay áreas temáticas registradas." />
                                        </Card>
                                    </section>
                                </>
                            )}

                            {(coordinatorMode || academicMode) && proyectosAtencion.length > 0 && (
                                <Card className="section-card">
                                    <div className="section-header">
                                        <div>
                                            <div className="section-title">
                                                <AlertTriangle className="h-5 w-5 text-[#B86612]" />
                                                Proyectos que requieren atención
                                            </div>
                                            <p className="section-subtitle">
                                                Casos priorizados por falta de avance, falta de entregas, falta de revisores o estado crítico.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="attention-list">
                                        {proyectosAtencion.map((proyecto) => (
                                            <Link key={proyecto.id} href={`/seguimiento/${proyecto.id}`} className="attention-row">
                                                <div className="attention-icon">
                                                    <AlertTriangle className="h-4 w-4" />
                                                </div>
                                                <div className="attention-body">
                                                    <strong>{proyecto.titulo}</strong>
                                                    <span>{proyecto.codigo} · {estadoLabel(proyecto.estado)} · {formatRelative(proyecto.ultimo_avance?.fecha)}</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-[#B86612]" />
                                            </Link>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {coordinatorMode && ultimosEventos.length > 0 && (
                                <Card className="section-card">
                                    <div className="section-header">
                                        <div>
                                            <div className="section-title">
                                                <Activity className="h-5 w-5 text-[var(--brand)]" />
                                                Últimos eventos académicos
                                            </div>
                                            <p className="section-subtitle">Registro reciente de actividad generada en los proyectos.</p>
                                        </div>
                                    </div>

                                    <div className="events-list">
                                        {ultimosEventos.map((evento) => (
                                            <Link key={evento.id} href={`/seguimiento/${evento.proyecto_id}`} className="event-row">
                                                <div className="event-icon">
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <div className="event-body">
                                                    <strong>{eventoLabel(evento.tipo_evento)}</strong>
                                                    <span>{evento.codigo} · {evento.descripcion} · {formatRelative(evento.created_at)}</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-[var(--brand)]" />
                                            </Link>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {proyectos.length > 0 && (
                                <Card className="filters-card">
                                    <div className="search-wrap">
                                        <Search className="search-icon" />
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Buscar por título, código, estudiante, tutor, área, modalidad o estado..."
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                        />

                                        {search && (
                                            <button type="button" className="clear-button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {(role === 'tutor' || role === 'revisor' || role === 'docente' || coordinatorMode) && (
                                        <div className="sort-group">
                                            <span className="sort-label">
                                                <Filter className="h-3.5 w-3.5" />
                                                Ordenar
                                            </span>

                                            <button
                                                type="button"
                                                className={`sort-button ${filters.sort_by === 'ultimo_avance' ? 'is-active' : ''}`}
                                                onClick={() => cambiarOrden('ultimo_avance')}
                                            >
                                                Avance
                                                {filters.sort_by === 'ultimo_avance' && (
                                                    filters.sort_dir === 'asc'
                                                        ? <ArrowUp className="h-3 w-3" />
                                                        : <ArrowDown className="h-3 w-3" />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className={`sort-button ${filters.sort_by === 'estado' ? 'is-active' : ''}`}
                                                onClick={() => cambiarOrden('estado')}
                                            >
                                                Estado
                                                {filters.sort_by === 'estado' && (
                                                    filters.sort_dir === 'asc'
                                                        ? <ArrowUp className="h-3 w-3" />
                                                        : <ArrowDown className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </Card>
                            )}

                            {filteredProyectos.length > 0 && (
                                <>
                                    <div className="list-title-row">
                                        <div className="section-title">
                                            <FolderKanban className="h-5 w-5 text-[var(--brand)]" />
                                            {coordinatorMode ? 'Todos los proyectos' : 'Proyectos vinculados'}
                                        </div>
                                        <span className="total-text">Mostrando <strong>{filteredProyectos.length}</strong> de <strong>{proyectos.length}</strong></span>
                                    </div>

                                    <section className="project-list">
                                        {filteredProyectos.map((proyecto) => (
                                            <ProjectCard
                                                key={proyecto.id}
                                                proyecto={proyecto}
                                                coordinatorMode={coordinatorMode}
                                                academicMode={academicMode}
                                            />
                                        ))}
                                    </section>
                                </>
                            )}
                        </>
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
