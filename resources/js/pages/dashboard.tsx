import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    AlertTriangle, ArrowDown, ArrowUp, BarChart3, BookOpenCheck, CheckCircle2,
    ChevronRight, Clock3, Filter, FolderKanban, MessageSquareText, Search,
    UserRound, X, FileCheck2, Clock,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Tipos
   ───────────────────────────────────────────────────────────── */
type AuthUser = { id?: number; name?: string; email?: string; role?: string | null; rol?: string | null; };
type SharedPageProps = { auth?: { user?: AuthUser | null; }; };

type Usuario = { id?: number; name?: string | null; email?: string | null; };
type Revisor = Usuario & { asignado_en?: string | null; plazo_revision?: string | null; };

type TimelineItem = {
    id: number; estado_anterior?: string | null; estado_nuevo: string;
    comentario?: string | null; created_at: string;
    usuario?: { name?: string | null; email?: string | null; } | null;
};

type ProyectoDashboard = {
    id: number; codigo: string; titulo: string; descripcion?: string | null;
    modalidad?: string | null; area_tematica?: string | null;
    estado: string; created_at?: string | null; updated_at?: string | null;
    estudiante?: Usuario | null; tutor?: Usuario | null;
    revisores?: Revisor[];
    ultimo_avance?: { fecha?: string | null; resumen?: string | null; comentario?: string | null; usuario?: string | null; } | null;
    linea_tiempo?: TimelineItem[];
};

type DashboardData = {
    rol: string;
    filters: { sort_by: 'estado' | 'ultimo_avance'; sort_dir: 'asc' | 'desc'; };
    summary: {
        total_proyectos: number;
        sin_avance: number;
        por_estado: Record<string, number>;
        ultimo_avance_general?: string | null;
    };
    proyectos: ProyectoDashboard[];
};

type Props = { dashboardData?: DashboardData; };

/* ─────────────────────────────────────────────────────────────
   Catálogos
   ───────────────────────────────────────────────────────────── */
const roleLabels: Record<string, string> = {
    estudiante: 'Estudiante', docente: 'Docente',
    coordinador: 'Coordinador', admin: 'Administrador', administrador: 'Administrador',
};

const estadoLabels: Record<string, string> = {
    en_revision: 'En revisión', aprobado: 'Aprobado', rechazado: 'Rechazado',
    en_desarrollo: 'En desarrollo', observado: 'Observado', concluido: 'Concluido',
};

const ESTADO_COLOR: Record<string, string> = {
    en_revision:   '#C9A84C',
    aprobado:      '#3F9D58',
    rechazado:     '#B91C1C',
    en_desarrollo: '#2563EB',
    observado:     '#EA8A1F',
    concluido:     '#6E6458',
};

const estadoOrder = ['en_revision', 'en_desarrollo', 'observado', 'aprobado', 'rechazado', 'concluido'];

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */
function normalizeRole(role?: string | null): string { return String(role || 'estudiante').toLowerCase(); }

function estadoLabel(value?: string | null): string {
    if (!value) return 'Sin estado';
    return estadoLabels[value] || value.replaceAll('_', ' ');
}

function formatRelative(value?: string | null): string {
    if (!value) return 'Sin movimiento';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin movimiento';
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)        return 'hace un momento';
    if (diff < 3600)      return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400)     return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)} días`;
    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric',
    }).format(date);
}

function safePercent(value: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((value / total) * 100);
}

function isCoordinatorRole(role: string): boolean {
    return role === 'coordinador' || role === 'admin' || role === 'administrador';
}

function getMainTitle(role: string): string {
    if (role === 'estudiante') return 'Mi proyecto';
    if (role === 'docente')    return 'Mis proyectos asignados';
    if (isCoordinatorRole(role)) return 'Panorama académico';
    return 'Dashboard';
}

function getDescription(role: string): string {
    if (role === 'estudiante')
        return 'Consulta el estado actual de tu proyecto de grado y su evolución.';
    if (role === 'docente')
        return 'Proyectos donde figuras como tutor o revisor.';
    if (isCoordinatorRole(role))
        return 'Vista ejecutiva del sistema: estados, atención requerida y actividad reciente.';
    return 'Información académica disponible para tu perfil.';
}

/* ─────────────────────────────────────────────────────────────
   Componente principal
   ───────────────────────────────────────────────────────────── */
export default function Dashboard({ dashboardData }: Props) {
    const page = usePage<SharedPageProps>();
    const user = page.props.auth?.user;
    const userName = user?.name || 'Usuario';

    const rawRole = dashboardData?.rol ?? user?.role ?? user?.rol;
    const role = normalizeRole(rawRole);
    const roleLabel = roleLabels[role] || role;

    const proyectos = dashboardData?.proyectos || [];
    const filters = dashboardData?.filters || { sort_by: 'ultimo_avance', sort_dir: 'desc' };
    const summary = dashboardData?.summary || {
        total_proyectos: 0, sin_avance: 0, por_estado: {}, ultimo_avance_general: null,
    };

    const coordinatorMode = isCoordinatorRole(role);

    /* Heurística 1 — loading bar */
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const offStart  = router.on('start',  () => setLoading(true));
        const offFinish = router.on('finish', () => setLoading(false));
        return () => { offStart(); offFinish(); };
    }, []);

    /* Heurística 7 — búsqueda local */
    const [search, setSearch] = useState('');

    const filteredProyectos = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return proyectos;
        return proyectos.filter((p) =>
            p.titulo.toLowerCase().includes(q) ||
            p.codigo.toLowerCase().includes(q) ||
            (p.estudiante?.name || '').toLowerCase().includes(q) ||
            (p.tutor?.name || '').toLowerCase().includes(q),
        );
    }, [proyectos, search]);

    const totalConcluidos = summary.por_estado?.concluido || 0;
    const totalRevision   = summary.por_estado?.en_revision || 0;
    const totalObservados = summary.por_estado?.observado || 0;
    const totalAtencion   = summary.sin_avance + totalRevision + totalObservados;

    /* Heurística 6 — Proyectos prioritarios solo para coordinador */
    const proyectosAtencion = useMemo(() => {
        if (!coordinatorMode) return [];
        return proyectos
            .filter((p) => !p.ultimo_avance?.fecha || ['observado', 'rechazado'].includes(p.estado))
            .slice(0, 5);
    }, [proyectos, coordinatorMode]);

    const cambiarOrden = (sortBy: 'estado' | 'ultimo_avance') => {
        const nextDirection = filters.sort_by === sortBy && filters.sort_dir === 'desc' ? 'asc' : 'desc';
        router.get('/dashboard', { sort_by: sortBy, sort_dir: nextDirection }, {
            preserveScroll: true, preserveState: true, replace: true,
        });
    };

    return (
        <>
            <Head title="Dashboard" />

            <style>{`
                /* ════════════════ PAGE ════════════════ */
                .dashboard-page {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.22), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.14), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }
                @media (prefers-color-scheme: dark) {
                    .dashboard-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .progress-bar {
                    position: fixed; top: 0; left: 0; right: 0;
                    height: 3px; z-index: 999;
                    background: linear-gradient(90deg, transparent, #6B1230, #C9A84C, transparent);
                    background-size: 200% 100%;
                    animation: progress-slide 1.1s linear infinite;
                }
                @keyframes progress-slide {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .shell {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                }
                @media (min-width: 768px)  { .shell { padding: 1.5rem; gap: 1.5rem; } }
                @media (min-width: 1280px) { .shell { padding: 2rem 2.25rem; } }

                .glass-card {
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }
                @media (prefers-color-scheme: dark) {
                    .glass-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }
                }

                .eyebrow {
                    display: inline-flex; align-items: center; gap: 0.45rem;
                    color: #9A6C18;
                    font-size: 0.68rem; font-weight: 900;
                    letter-spacing: 0.13em; text-transform: uppercase;
                }
                @media (prefers-color-scheme: dark) { .eyebrow { color: #D6B96A; } }

                /* ════════════════ HERO COMPACTO ════════════════ */
                .hero-title {
                    margin-top: 0.5rem;
                    font-size: clamp(1.6rem, 2.5vw, 2.1rem);
                    font-weight: 900;
                    line-height: 1.15;
                    letter-spacing: -0.02em;
                }
                .hero-greeting {
                    margin-top: 0.65rem;
                    color: #6E6458;
                    font-size: 0.92rem;
                    line-height: 1.55;
                    max-width: 50rem;
                }
                @media (prefers-color-scheme: dark) { .hero-greeting { color: #D7C9C0; } }

                .hero-role {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    margin-top: 0.85rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 999px;
                    background: rgba(107,18,48,0.10);
                    color: #6B1230;
                    font-size: 0.74rem;
                    font-weight: 800;
                }
                @media (prefers-color-scheme: dark) {
                    .hero-role { background: rgba(214,185,106,0.12); color: #D6B96A; }
                }

                /* ════════════════ KPI CARDS ════════════════ */
                .kpi-grid {
                    display: grid;
                    gap: 0.75rem;
                    grid-template-columns: 1fr;
                }
                @media (min-width: 640px)  { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .kpi-grid { grid-template-columns: repeat(4, 1fr); } }

                .kpi-card {
                    display: flex; align-items: center; gap: 1rem;
                    padding: 1.15rem 1.2rem;
                    border-radius: 1.15rem;
                    border: 1px solid rgba(107,18,48,0.10);
                    background: rgba(255,255,255,0.55);
                    transition: transform .18s, border-color .18s, box-shadow .18s;
                }
                .kpi-card:hover {
                    transform: translateY(-1px);
                    border-color: rgba(107,18,48,0.22);
                    box-shadow: 0 12px 28px rgba(107,18,48,0.08);
                }
                @media (prefers-color-scheme: dark) {
                    .kpi-card { background: rgba(255,255,255,0.035); border-color: rgba(214,185,106,0.14); }
                    .kpi-card:hover { border-color: rgba(214,185,106,0.32); }
                }
                .kpi-icon {
                    flex-shrink: 0;
                    width: 2.65rem; height: 2.65rem;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 0.85rem;
                    background: rgba(107,18,48,0.10);
                    color: #6B1230;
                }
                .kpi-card.tone-warning .kpi-icon { background: rgba(234,138,31,0.14); color: #B86612; }
                .kpi-card.tone-success .kpi-icon { background: rgba(21,128,61,0.12); color: #15803D; }
                .kpi-card.tone-danger .kpi-icon  { background: rgba(185,28,28,0.14); color: #B91C1C; }
                @media (prefers-color-scheme: dark) {
                    .kpi-icon { background: rgba(214,185,106,0.14); color: #D6B96A; }
                    .kpi-card.tone-warning .kpi-icon { background: rgba(244,180,94,0.14); color: #F4B45E; }
                    .kpi-card.tone-success .kpi-icon { background: rgba(111,194,130,0.14); color: #6FC282; }
                    .kpi-card.tone-danger .kpi-icon  { background: rgba(248,113,113,0.14); color: #F87171; }
                }
                .kpi-body { flex: 1; min-width: 0; }
                .kpi-body span {
                    color: #8A8074;
                    font-size: 0.66rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                .kpi-body strong {
                    display: block;
                    color: #24151A;
                    font-size: 1.75rem;
                    font-weight: 900;
                    line-height: 1.1;
                    margin-top: 0.15rem;
                }
                .kpi-body p {
                    margin: 0.2rem 0 0;
                    color: #6E6458;
                    font-size: 0.74rem;
                    line-height: 1.4;
                }
                @media (prefers-color-scheme: dark) {
                    .kpi-body span   { color: #A9978D; }
                    .kpi-body strong { color: #F4EEE9; }
                    .kpi-body p      { color: #D7C9C0; }
                }

                /* ════════════════ DISTRIBUCIÓN (barras) ════════════════ */
                .distribution {
                    display: grid;
                    gap: 0.85rem;
                }
                .distribution-row {
                    display: grid;
                    gap: 0.4rem;
                }
                .distribution-top {
                    display: flex; justify-content: space-between; align-items: center; gap: 1rem;
                }
                .distribution-top-left {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 0.84rem;
                    font-weight: 800;
                    color: #24151A;
                }
                @media (prefers-color-scheme: dark) { .distribution-top-left { color: #F4EEE9; } }
                .distribution-top-right {
                    font-size: 0.84rem;
                    font-weight: 800;
                    color: #6E6458;
                }
                .distribution-top-right strong { color: #24151A; }
                @media (prefers-color-scheme: dark) {
                    .distribution-top-right { color: #A9978D; }
                    .distribution-top-right strong { color: #F4EEE9; }
                }
                .bar-track {
                    width: 100%;
                    height: 0.45rem;
                    border-radius: 999px;
                    overflow: hidden;
                    background: rgba(110,100,88,0.12);
                }
                @media (prefers-color-scheme: dark) {
                    .bar-track { background: rgba(255,255,255,0.06); }
                }
                .bar-fill {
                    height: 100%;
                    min-width: 0.45rem;
                    border-radius: 999px;
                    transition: width .4s ease;
                }

                /* ════════════════ CHIPS ════════════════ */
                .chip-pill {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    padding: 0.25rem 0.65rem;
                    border-radius: 999px;
                    font-size: 0.72rem; font-weight: 800;
                    border: 1px solid rgba(0,0,0,0.06);
                    white-space: nowrap;
                    width: max-content;
                }
                .chip-dot {
                    display: inline-block;
                    width: 0.5rem; height: 0.5rem;
                    border-radius: 999px;
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.6);
                    flex-shrink: 0;
                }
                @media (prefers-color-scheme: dark) {
                    .chip-pill { border-color: rgba(255,255,255,0.10); }
                    .chip-dot  { box-shadow: 0 0 0 3px rgba(255,255,255,0.08); }
                }

                /* ════════════════ FILTERS BAR ════════════════ */
                .filters-bar {
                    display: flex; flex-direction: column;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                }
                @media (min-width: 900px) {
                    .filters-bar { flex-direction: row; align-items: center; justify-content: space-between; }
                }
                .search-wrap {
                    position: relative;
                    flex: 1;
                    max-width: 32rem;
                    width: 100%;
                }
                .search-wrap svg.search-icon {
                    position: absolute; left: 0.85rem; top: 50%;
                    transform: translateY(-50%);
                    height: 1rem; width: 1rem;
                    opacity: 0.4;
                    pointer-events: none;
                    z-index: 2;
                }
                .search-wrap .clear-btn {
                    position: absolute; right: 0.5rem; top: 50%;
                    transform: translateY(-50%);
                    width: 1.6rem; height: 1.6rem;
                    border-radius: 999px;
                    border: 0;
                    background: rgba(107,18,48,0.10);
                    color: #6B1230;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background .15s;
                }
                .search-wrap .clear-btn:hover { background: rgba(107,18,48,0.22); }
                @media (prefers-color-scheme: dark) {
                    .search-wrap .clear-btn { background: rgba(214,185,106,0.14); color: #D6B96A; }
                    .search-wrap .clear-btn:hover { background: rgba(214,185,106,0.28); }
                }
                .search-input {
                    width: 100%;
                    height: 2.65rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background-color: rgba(255,255,255,0.75);
                    padding: 0 2.75rem 0 2.5rem;
                    font-size: 0.9rem;
                    color: #24151A;
                    outline: none;
                    transition: border-color .18s, box-shadow .18s;
                }
                .search-input:focus-visible {
                    border-color: #6B1230;
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) {
                    .search-input { border-color: rgba(214,185,106,0.14); background-color: #2B1620; color: #F4EEE9; }
                }

                .sort-group { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
                .sort-label {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    font-size: 0.72rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #6E6458;
                }
                @media (prefers-color-scheme: dark) { .sort-label { color: #A9978D; } }
                .sort-button {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    height: 2.2rem;
                    padding: 0 0.8rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    border-radius: 0.7rem;
                    background: transparent;
                    color: #6E6458;
                    font-size: 0.78rem; font-weight: 800;
                    cursor: pointer;
                    transition: all .15s;
                }
                .sort-button:hover { background: rgba(107,18,48,0.06); color: #6B1230; }
                .sort-button.is-active {
                    background: #6B1230;
                    border-color: #6B1230;
                    color: white;
                }
                @media (prefers-color-scheme: dark) {
                    .sort-button { color: #A89889; border-color: rgba(214,185,106,0.22); }
                    .sort-button:hover { background: rgba(214,185,106,0.08); color: #D6B96A; }
                    .sort-button.is-active { background: #D4849A; border-color: #D4849A; color: #2B1620; }
                }

                /* ════════════════ PROJECT CARD (Link) ════════════════ */
                .project-list { display: grid; gap: 0.75rem; }
                .project-card {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 1.15rem 1.25rem;
                    border-radius: 1.1rem;
                    border: 1px solid rgba(107,18,48,0.10);
                    background: rgba(255,255,255,0.65);
                    text-decoration: none;
                    color: inherit;
                    transition: all .18s;
                }
                .project-card:hover {
                    border-color: rgba(107,18,48,0.25);
                    background: rgba(255,255,255,0.85);
                    transform: translateY(-1px);
                    box-shadow: 0 16px 34px rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) {
                    .project-card { background: rgba(255,255,255,0.035); border-color: rgba(214,185,106,0.14); }
                    .project-card:hover { background: rgba(255,255,255,0.08); border-color: rgba(214,185,106,0.32); }
                }
                @media (min-width: 1024px) {
                    .project-card {
                        grid-template-columns: minmax(0, 1.4fr) auto minmax(0, 0.9fr) auto;
                        align-items: center;
                    }
                }
                .project-main { min-width: 0; }
                .project-code {
                    display: inline-block;
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 0.04em;
                    color: #9A6C18;
                    background: rgba(154,108,24,0.10);
                    padding: 0.15rem 0.5rem;
                    border-radius: 0.45rem;
                    margin-bottom: 0.4rem;
                }
                @media (prefers-color-scheme: dark) {
                    .project-code { color: #D6B96A; background: rgba(214,185,106,0.12); }
                }
                .project-title {
                    font-size: 1rem;
                    font-weight: 900;
                    color: #24151A;
                    line-height: 1.35;
                    margin-bottom: 0.4rem;
                }
                @media (prefers-color-scheme: dark) { .project-title { color: #F4EEE9; } }
                .project-people {
                    display: flex; flex-wrap: wrap; gap: 0.85rem;
                    font-size: 0.76rem;
                    color: #6E6458;
                }
                .project-people span { display: inline-flex; align-items: center; gap: 0.3rem; }
                .project-people strong { color: #24151A; font-weight: 700; }
                @media (prefers-color-scheme: dark) {
                    .project-people { color: #A8A094; }
                    .project-people strong { color: #F4EEE9; }
                }
                .project-time-label {
                    font-size: 0.64rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #8A8074;
                    margin-bottom: 0.2rem;
                }
                .project-time-value {
                    display: flex; align-items: center; gap: 0.35rem;
                    color: #24151A;
                    font-size: 0.85rem;
                    font-weight: 800;
                }
                @media (prefers-color-scheme: dark) {
                    .project-time-label { color: #A9978D; }
                    .project-time-value { color: #F4EEE9; }
                }
                .project-action {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    padding: 0.55rem 0.95rem;
                    border-radius: 0.75rem;
                    background: linear-gradient(135deg, #6B1230, #4A0D21);
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 800;
                    box-shadow: 0 8px 20px rgba(107,18,48,0.20);
                    transition: transform .15s, box-shadow .15s;
                    flex-shrink: 0;
                }
                .project-card:hover .project-action {
                    transform: translateX(2px);
                    box-shadow: 0 10px 24px rgba(107,18,48,0.30);
                }
                @media (prefers-color-scheme: dark) {
                    .project-action { background: linear-gradient(135deg, #D4849A, #B95E78); color: #2B1620; }
                }

                /* ════════════════ ATTENTION LIST ════════════════ */
                .attention-list { display: grid; gap: 0.55rem; }
                .attention-item {
                    display: flex; align-items: center; gap: 0.85rem;
                    padding: 0.75rem 0.85rem;
                    border-radius: 0.85rem;
                    border: 1px solid rgba(234,138,31,0.20);
                    background: rgba(234,138,31,0.05);
                    text-decoration: none;
                    color: inherit;
                    transition: all .15s;
                }
                .attention-item:hover {
                    background: rgba(234,138,31,0.10);
                    border-color: rgba(234,138,31,0.35);
                }
                .attention-item-icon {
                    flex-shrink: 0;
                    width: 2rem; height: 2rem;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 0.5rem;
                    background: rgba(234,138,31,0.14);
                    color: #B86612;
                }
                .attention-item-body { flex: 1; min-width: 0; }
                .attention-item-body strong {
                    display: block;
                    font-size: 0.86rem;
                    font-weight: 800;
                    color: #24151A;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .attention-item-body span {
                    font-size: 0.74rem;
                    color: #6E6458;
                }
                @media (prefers-color-scheme: dark) {
                    .attention-item-body strong { color: #F4EEE9; }
                    .attention-item-body span   { color: #A9978D; }
                }

                /* ════════════════ EMPTY / TOTAL ════════════════ */
                .total-text {
                    color: #6E6458;
                    font-size: 0.78rem;
                    font-weight: 700;
                }
                .total-text strong { color: #24151A; font-weight: 900; }
                @media (prefers-color-scheme: dark) {
                    .total-text { color: #A9978D; }
                    .total-text strong { color: #F4EEE9; }
                }
                .empty-block {
                    padding: 3rem 1.5rem;
                    text-align: center;
                }
                .empty-block svg { opacity: 0.3; margin: 0 auto 0.75rem; display: block; }
                .empty-block strong {
                    display: block;
                    color: #24151A;
                    font-size: 1.1rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                }
                .empty-block p {
                    color: #6E6458;
                    font-size: 0.88rem;
                    max-width: 28rem;
                    margin: 0 auto 0.85rem;
                    line-height: 1.5;
                }
                @media (prefers-color-scheme: dark) {
                    .empty-block strong { color: #F4EEE9; }
                    .empty-block p      { color: #D7C9C0; }
                }

                .section-title {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 1.05rem; font-weight: 900;
                    color: #24151A;
                    letter-spacing: -0.01em;
                }
                @media (prefers-color-scheme: dark) { .section-title { color: #F4EEE9; } }

                .grid-2 {
                    display: grid;
                    gap: 1.25rem;
                    grid-template-columns: 1fr;
                }
                @media (min-width: 1024px) {
                    .grid-2 { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); }
                }
            `}</style>

            {/* Heurística 1 — barra de progreso */}
            {loading && <div className="progress-bar" aria-hidden="true" />}

            <div className="dashboard-page">
                <div className="shell">

                    {/* ══════════════ HERO COMPACTO ══════════════ */}
                    <section className="glass-card">
                        <div className="p-6">
                            <div className="eyebrow">
                                <BookOpenCheck className="h-4 w-4" />
                                Seguimiento académico
                            </div>

                            <h1 className="hero-title">{getMainTitle(role)}</h1>

                            <p className="hero-greeting">
                                Hola <strong>{userName}</strong> — {getDescription(role)}
                            </p>

                            <div className="hero-role">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Sesión como {roleLabel}
                            </div>
                        </div>
                    </section>

                    {/* ══════════════ KPI CARDS ══════════════ */}
                    <section className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-icon">
                                <FolderKanban className="h-5 w-5" />
                            </div>
                            <div className="kpi-body">
                                <span>{coordinatorMode ? 'Proyectos activos' : 'Proyectos visibles'}</span>
                                <strong>{summary.total_proyectos}</strong>
                                <p>{coordinatorMode ? 'Total del sistema' : 'Según tu perfil'}</p>
                            </div>
                        </div>

                        <div className={`kpi-card ${totalAtencion > 0 ? 'tone-warning' : 'tone-success'}`}>
                            <div className="kpi-icon">
                                {totalAtencion > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            </div>
                            <div className="kpi-body">
                                <span>Requieren atención</span>
                                <strong>{totalAtencion}</strong>
                                <p>{totalAtencion > 0 ? 'Sin avance, en revisión u observados' : 'Todo en orden'}</p>
                            </div>
                        </div>

                        <div className={`kpi-card ${summary.sin_avance > 0 ? 'tone-danger' : 'tone-success'}`}>
                            <div className="kpi-icon">
                                <Clock3 className="h-5 w-5" />
                            </div>
                            <div className="kpi-body">
                                <span>Sin avance</span>
                                <strong>{summary.sin_avance}</strong>
                                <p>Sin historial registrado</p>
                            </div>
                        </div>

                        <div className="kpi-card tone-success">
                            <div className="kpi-icon">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="kpi-body">
                                <span>Concluidos</span>
                                <strong>{totalConcluidos}</strong>
                                <p>{safePercent(totalConcluidos, summary.total_proyectos)}% del total</p>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════ COORDINADOR: Distribución + Atención ══════════════ */}
                    {coordinatorMode && summary.total_proyectos > 0 && (
                        <section className="grid-2">
                            <div className="glass-card p-6">
                                <div className="section-title mb-1">
                                    <BarChart3 className="h-5 w-5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                    Distribución por estado
                                </div>
                                <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mb-5 leading-relaxed">
                                    Concentración de proyectos según su estado académico actual.
                                </p>

                                <div className="distribution">
                                    {estadoOrder
                                        .filter((estado) => (summary.por_estado?.[estado] || 0) > 0)
                                        .map((estado) => {
                                            const count   = summary.por_estado[estado] || 0;
                                            const percent = safePercent(count, summary.total_proyectos);
                                            const color   = ESTADO_COLOR[estado] || '#6E6458';
                                            return (
                                                <div key={estado} className="distribution-row">
                                                    <div className="distribution-top">
                                                        <div className="distribution-top-left">
                                                            <span className="chip-dot" style={{ background: color }} />
                                                            {estadoLabel(estado)}
                                                        </div>
                                                        <div className="distribution-top-right">
                                                            <strong>{count}</strong> · {percent}%
                                                        </div>
                                                    </div>
                                                    <div className="bar-track">
                                                        <div
                                                            className="bar-fill"
                                                            style={{ width: `${percent}%`, background: color }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {proyectosAtencion.length > 0 && (
                                <div className="glass-card p-6">
                                    <div className="section-title mb-1">
                                        <AlertTriangle className="h-5 w-5 text-[#B86612]" />
                                        Requieren tu atención
                                    </div>
                                    <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mb-4 leading-relaxed">
                                        Proyectos observados, rechazados o sin avance registrado.
                                    </p>

                                    <div className="attention-list">
                                        {proyectosAtencion.map((proyecto) => (
                                            <Link
                                                key={proyecto.id}
                                                href={`/seguimiento/${proyecto.id}`}
                                                className="attention-item"
                                                title={`Abrir seguimiento de ${proyecto.titulo}`}
                                            >
                                                <div className="attention-item-icon">
                                                    <AlertTriangle className="h-4 w-4" />
                                                </div>
                                                <div className="attention-item-body">
                                                    <strong>{proyecto.titulo}</strong>
                                                    <span>
                                                        {estadoLabel(proyecto.estado)} · {formatRelative(proyecto.ultimo_avance?.fecha)}
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-[#B86612] flex-shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ══════════════ FILTROS Y ORDEN ══════════════ */}
                    {proyectos.length > 0 && (
                        <section className="glass-card">
                            <div className="filters-bar">
                                <div className="search-wrap">
                                    <Search className="search-icon" />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Buscar por título, código, estudiante o tutor..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        title="Filtra los proyectos instantáneamente"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            className="clear-btn"
                                            onClick={() => setSearch('')}
                                            title="Limpiar búsqueda"
                                            aria-label="Limpiar búsqueda"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {(role === 'docente' || coordinatorMode) && (
                                    <div className="sort-group">
                                        <span className="sort-label">
                                            <Filter className="h-3.5 w-3.5" />
                                            Ordenar:
                                        </span>
                                        <button
                                            type="button"
                                            className={`sort-button ${filters.sort_by === 'ultimo_avance' ? 'is-active' : ''}`}
                                            onClick={() => cambiarOrden('ultimo_avance')}
                                            title="Ordenar por la fecha del último avance"
                                        >
                                            Avance
                                            {filters.sort_by === 'ultimo_avance' && (
                                                filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className={`sort-button ${filters.sort_by === 'estado' ? 'is-active' : ''}`}
                                            onClick={() => cambiarOrden('estado')}
                                            title="Ordenar por estado actual"
                                        >
                                            Estado
                                            {filters.sort_by === 'estado' && (
                                                filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ══════════════ LISTA DE PROYECTOS ══════════════ */}
                    {proyectos.length === 0 ? (
                        <section className="glass-card">
                            <div className="empty-block">
                                <FolderKanban className="h-16 w-16 stroke-[1]" />
                                <strong>Sin proyectos asignados</strong>
                                <p>No hay proyectos vinculados a tu usuario actual.</p>
                            </div>
                        </section>
                    ) : filteredProyectos.length === 0 ? (
                        <section className="glass-card">
                            <div className="empty-block">
                                <Search className="h-16 w-16 stroke-[1]" />
                                <strong>Sin resultados para "{search}"</strong>
                                <p>Ningún proyecto coincide con tu búsqueda.</p>
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#6B1230]/20 text-[#6B1230] dark:border-[#D6B96A]/28 dark:text-[#D6B96A] font-bold text-sm hover:bg-[#6B1230]/8 dark:hover:bg-[#D6B96A]/10"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Limpiar búsqueda
                                </button>
                            </div>
                        </section>
                    ) : (
                        <>
                            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
                                <div className="section-title">
                                    <FolderKanban className="h-5 w-5 text-[#6B1230] dark:text-[#D4849A]" />
                                    {role === 'estudiante'
                                        ? 'Mi proyecto'
                                        : coordinatorMode
                                            ? 'Todos los proyectos'
                                            : 'Proyectos vinculados'}
                                </div>
                                <span className="total-text">
                                    Mostrando <strong>{filteredProyectos.length}</strong> de <strong>{proyectos.length}</strong>
                                </span>
                            </div>

                            <section className="project-list">
                                {filteredProyectos.map((proyecto) => {
                                    const estadoColor = ESTADO_COLOR[proyecto.estado] ?? '#6E6458';

                                    return (
                                        <Link
                                            key={proyecto.id}
                                            href={`/seguimiento/${proyecto.id}`}
                                            className="project-card"
                                            title={`Abrir seguimiento de ${proyecto.titulo}`}
                                        >
                                            <div className="project-main">
                                                <span className="project-code">{proyecto.codigo}</span>
                                                <div className="project-title">{proyecto.titulo}</div>

                                                <div className="project-people">
                                                    <span>
                                                        <UserRound className="h-3.5 w-3.5 text-[#6B1230] dark:text-[#D4849A]" />
                                                        Estudiante: <strong>{proyecto.estudiante?.name || 'Sin asignar'}</strong>
                                                    </span>
                                                    {coordinatorMode && (
                                                        <span>
                                                            <UserRound className="h-3.5 w-3.5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                                            Tutor: <strong>{proyecto.tutor?.name || 'Sin asignar'}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span
                                                className="chip-pill"
                                                style={{ background: `${estadoColor}1A`, color: estadoColor }}
                                                title={`Estado: ${estadoLabel(proyecto.estado)}`}
                                            >
                                                <span className="chip-dot" style={{ background: estadoColor }} />
                                                {estadoLabel(proyecto.estado)}
                                            </span>

                                            <div>
                                                <div className="project-time-label">Último avance</div>
                                                <div className="project-time-value" title={proyecto.ultimo_avance?.fecha || ''}>
                                                    <Clock className="h-3.5 w-3.5 opacity-60" />
                                                    {formatRelative(proyecto.ultimo_avance?.fecha)}
                                                </div>
                                            </div>

                                            <span className="project-action">
                                                Ver seguimiento
                                                <ChevronRight className="h-4 w-4" />
                                            </span>
                                        </Link>
                                    );
                                })}
                            </section>
                        </>
                    )}

                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
    ],
};