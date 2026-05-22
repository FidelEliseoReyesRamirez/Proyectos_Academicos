import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle, ArrowDown, ArrowUp, BookOpenCheck, CheckCircle2, ChevronRight,
    FileCheck2, FileText, FolderKanban, MessageSquareText, Search, UserRound,
    X, RotateCcw, Filter, Clock,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Tipos
   ───────────────────────────────────────────────────────────── */
type Usuario = { id: number; name: string; email: string; rol: string; } | null;

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    descripcion?: string | null;
    estado: string;
    modalidad: string;
    area_tematica?: string | null;
    updated_at?: string | null;
    relacion_usuario: 'estudiante' | 'tutor' | 'revisor' | 'coordinador' | 'admin' | 'general';
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
        mis_tutoriados: number;
        mis_revisiones: number;
        sin_entregas: number;
        con_observaciones: number;
        con_revisiones: number;
    };
    proyectos: Proyecto[];
};

type Props = { seguimientoData: SeguimientoData; };

/* ─────────────────────────────────────────────────────────────
   Catálogos
   ───────────────────────────────────────────────────────────── */
const estadoLabels: Record<string, string> = {
    en_revision:         'En revisión',
    aprobado:            'Aprobado',
    rechazado:           'Rechazado',
    en_desarrollo:       'En desarrollo',
    observado:           'Observado',
    concluido:           'Concluido',
    listo_para_revision: 'Listo para revisión',
    en_revision_final:   'En revisión final',
};

const ESTADO_COLOR: Record<string, string> = {
    en_revision:         '#C9A84C',
    aprobado:            '#3F9D58',
    rechazado:           '#B91C1C',
    en_desarrollo:       '#3B82F6',
    observado:           '#EA8A1F',
    concluido:           '#6E6458',
    listo_para_revision: '#0EA5E9',
    en_revision_final:   '#8B5CF6',
};

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */
function estadoLabel(estado: string): string {
    return estadoLabels[estado] || estado.replaceAll('_', ' ');
}

function formatDate(value?: string | null): string {
    if (!value) return 'Sin registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin registro';
    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(date);
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
    return formatDate(value);
}

function relacionLabel(relacion: Proyecto['relacion_usuario']): string {
    const labels: Record<Proyecto['relacion_usuario'], string> = {
        estudiante: 'Mi proyecto',
        tutor: 'Mis tutorías',
        revisor: 'Mis revisiones',
        coordinador: 'Supervisión',
        admin: 'Administración',
        general: 'Seguimiento',
    };

    return labels[relacion] || 'Seguimiento';
}

function relacionClass(relacion: Proyecto['relacion_usuario']): string {
    if (relacion === 'tutor') return 'is-tutor';
    if (relacion === 'revisor') return 'is-revisor';
    if (relacion === 'estudiante') return 'is-estudiante';
    if (relacion === 'coordinador') return 'is-coordinador';

    return 'is-general';
}

/* ─────────────────────────────────────────────────────────────
   Componente principal
   ───────────────────────────────────────────────────────────── */
export default function SeguimientoIndex({ seguimientoData }: Props) {
    const { rol, filters, summary, proyectos } = seguimientoData;

    /* Heurística 1 — loading bar */
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const offStart  = router.on('start',  () => setLoading(true));
        const offFinish = router.on('finish', () => setLoading(false));
        return () => { offStart(); offFinish(); };
    }, []);

    /* Heurística 7 — búsqueda local en cliente (debounce no necesario, es instantánea) */
    const [search, setSearch] = useState('');
    const [relationFilter, setRelationFilter] = useState<'todos' | 'tutor' | 'revisor'>('todos');

    const filteredProyectos = useMemo(() => {
        const q = search.trim().toLowerCase();

        return proyectos.filter((p) => {
            const matchesRelation = relationFilter === 'todos' || p.relacion_usuario === relationFilter;
            const matchesSearch = !q ||
                p.titulo.toLowerCase().includes(q) ||
                p.codigo.toLowerCase().includes(q) ||
                relacionLabel(p.relacion_usuario).toLowerCase().includes(q) ||
                (p.estudiante?.name || '').toLowerCase().includes(q) ||
                (p.tutor?.name || '').toLowerCase().includes(q) ||
                p.revisores.some((revisor) => (revisor?.name || '').toLowerCase().includes(q));

            return matchesRelation && matchesSearch;
        });
    }, [proyectos, search, relationFilter]);

    const cambiarOrden = (sortBy: 'estado' | 'titulo' | 'ultimo_movimiento') => {
        const nextDirection = filters.sort_by === sortBy && filters.sort_dir === 'desc' ? 'asc' : 'desc';
        router.get('/seguimiento', { sort_by: sortBy, sort_dir: nextDirection }, {
            preserveScroll: true,
            preserveState:  true,
            replace:        true,
        });
    };

    /* Heurística 1 — título contextual al rol */
    const heroTitle = rol === 'estudiante'
        ? 'Tu proyecto de grado'
        : rol === 'docente'
          ? 'Mis tutorías y revisiones'
          : 'Proyectos en seguimiento';

    const heroDescription = rol === 'estudiante'
        ? 'Aquí puedes ver el avance de tu proyecto, subir nuevas entregas y consultar las revisiones recibidas.'
        : rol === 'docente'
          ? 'Aquí puedes separar claramente los proyectos donde eres tutor y los proyectos donde participas como revisor.'
          : 'Selecciona un proyecto para revisar entregas, devolver archivos corregidos y consultar la línea de tiempo.';

    return (
        <>
            <Head title="Seguimiento del Proyecto" />

            <style>{`
                /* ════════════════ PAGE ════════════════ */
                .seguimiento-page {
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
                    .seguimiento-page {
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
                .kpi-card.tone-info .kpi-icon    { background: rgba(154,108,24,0.14); color: #9A6C18; }
                @media (prefers-color-scheme: dark) {
                    .kpi-icon                        { background: rgba(214,185,106,0.14); color: #D6B96A; }
                    .kpi-card.tone-warning .kpi-icon { background: rgba(244,180,94,0.14); color: #F4B45E; }
                    .kpi-card.tone-success .kpi-icon { background: rgba(111,194,130,0.14); color: #6FC282; }
                    .kpi-card.tone-info .kpi-icon    { background: rgba(214,185,106,0.16); color: #D6B96A; }
                }

                .kpi-body {
                    flex: 1; min-width: 0;
                }
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
                    position: absolute;
                    left: 0.85rem; top: 50%;
                    transform: translateY(-50%);
                    height: 1rem; width: 1rem;
                    opacity: 0.4;
                    pointer-events: none;
                    z-index: 2;
                }
                .search-wrap .clear-btn {
                    position: absolute;
                    right: 0.5rem; top: 50%;
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

                .relation-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .relation-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.38rem;
                    height: 2.2rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    border-radius: 999px;
                    background: rgba(255,255,255,0.45);
                    color: #6E6458;
                    padding: 0 0.85rem;
                    font-size: 0.76rem;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all .15s;
                }

                .relation-tab:hover {
                    color: #6B1230;
                    background: rgba(107,18,48,0.07);
                    border-color: rgba(107,18,48,0.24);
                }

                .relation-tab.is-active {
                    background: #6B1230;
                    border-color: #6B1230;
                    color: white;
                    box-shadow: 0 8px 18px rgba(107,18,48,0.18);
                }

                .relation-tab.is-review.is-active {
                    background: #9A6C18;
                    border-color: #9A6C18;
                }

                @media (prefers-color-scheme: dark) {
                    .relation-tab {
                        background: rgba(255,255,255,0.035);
                        border-color: rgba(214,185,106,0.18);
                        color: #D7C9C0;
                    }
                    .relation-tab:hover {
                        color: #D6B96A;
                        background: rgba(214,185,106,0.08);
                        border-color: rgba(214,185,106,0.32);
                    }
                    .relation-tab.is-active {
                        background: #D4849A;
                        border-color: #D4849A;
                        color: #2B1620;
                    }
                    .relation-tab.is-review.is-active {
                        background: #D6B96A;
                        border-color: #D6B96A;
                        color: #2B1620;
                    }
                }

                .sort-group {
                    display: flex; align-items: center; gap: 0.55rem;
                    flex-wrap: wrap;
                }
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

                /* ════════════════ PROJECT CARD ════════════════ */
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
                .project-head {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.45rem;
                    margin-bottom: 0.4rem;
                }

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
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.28rem;
                    border-radius: 999px;
                    padding: 0.18rem 0.55rem;
                    font-size: 0.68rem;
                    font-weight: 950;
                    letter-spacing: 0.02em;
                    border: 1px solid transparent;
                }

                .role-badge.is-tutor {
                    color: #6B1230;
                    background: rgba(107,18,48,0.10);
                    border-color: rgba(107,18,48,0.16);
                }

                .role-badge.is-revisor {
                    color: #9A6C18;
                    background: rgba(154,108,24,0.13);
                    border-color: rgba(154,108,24,0.20);
                }

                .role-badge.is-estudiante {
                    color: #15803D;
                    background: rgba(21,128,61,0.11);
                    border-color: rgba(21,128,61,0.18);
                }

                .role-badge.is-coordinador,
                .role-badge.is-admin,
                .role-badge.is-general {
                    color: #6E6458;
                    background: rgba(110,100,88,0.10);
                    border-color: rgba(110,100,88,0.16);
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
                .project-people span {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                }
                .project-people strong { color: #24151A; font-weight: 700; }
                @media (prefers-color-scheme: dark) {
                    .project-people { color: #A8A094; }
                    .project-people strong { color: #F4EEE9; }
                }

                .project-counters {
                    display: flex; flex-wrap: wrap; gap: 0.35rem;
                    margin-top: 0.6rem;
                }
                .counter-pill {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    padding: 0.2rem 0.55rem;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #6E6458;
                    background: rgba(110,100,88,0.10);
                }
                .counter-pill.has-data { color: #6B1230; background: rgba(107,18,48,0.10); }
                @media (prefers-color-scheme: dark) {
                    .counter-pill { color: #A8A094; background: rgba(255,255,255,0.06); }
                    .counter-pill.has-data { color: #D4849A; background: rgba(212,132,154,0.12); }
                }

                .project-time {
                    min-width: 0;
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

                /* ════════════════ ESTADO CHIP ════════════════ */
                .chip-pill {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    padding: 0.3rem 0.7rem;
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

                .btn-ghost {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.55rem 0.9rem;
                    border: 1px solid rgba(107,18,48,0.20);
                    border-radius: 0.7rem;
                    background: transparent;
                    color: #6B1230;
                    font-size: 0.8rem;
                    font-weight: 800;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all .15s;
                }
                .btn-ghost:hover { background: rgba(107,18,48,0.08); }
                @media (prefers-color-scheme: dark) {
                    .btn-ghost { border-color: rgba(214,185,106,0.28); color: #D6B96A; }
                    .btn-ghost:hover { background: rgba(214,185,106,0.10); }
                }
            `}</style>

            {/* Heurística 1 — barra de progreso */}
            {loading && <div className="progress-bar" aria-hidden="true" />}

            <div className="seguimiento-page">
                <div className="shell">

                    {/* ══════════════ HERO compacto ══════════════ */}
                    <section className="glass-card">
                        <div className="p-6">
                            <div className="eyebrow">
                                <BookOpenCheck className="h-4 w-4" />
                                Seguimiento académico
                            </div>
                            <h1 className="text-3xl font-black tracking-tight mt-1 leading-tight">
                                {heroTitle}
                            </h1>
                            <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-2 max-w-3xl leading-7">
                                {heroDescription}
                            </p>
                        </div>
                    </section>

                    {/* ══════════════ KPI CARDS ══════════════ */}
                    <section className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-icon">
                                <FolderKanban className="h-5 w-5" />
                            </div>
                            <div className="kpi-body">
                                <span>Proyectos</span>
                                <strong>{summary.total}</strong>
                                <p>Visibles para tu rol</p>
                            </div>
                        </div>

                        {rol === 'docente' && (
                            <>
                                <div className="kpi-card tone-info">
                                    <div className="kpi-icon">
                                        <BookOpenCheck className="h-5 w-5" />
                                    </div>
                                    <div className="kpi-body">
                                        <span>Mis tutorías</span>
                                        <strong>{summary.mis_tutoriados}</strong>
                                        <p>Proyectos donde eres tutor</p>
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-icon">
                                        <FileCheck2 className="h-5 w-5" />
                                    </div>
                                    <div className="kpi-body">
                                        <span>Mis revisiones</span>
                                        <strong>{summary.mis_revisiones}</strong>
                                        <p>Proyectos donde eres revisor</p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className={`kpi-card ${summary.sin_entregas > 0 ? 'tone-warning' : 'tone-success'}`}>
                            <div className="kpi-icon">
                                {summary.sin_entregas > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            </div>
                            <div className="kpi-body">
                                <span>Sin entregas</span>
                                <strong>{summary.sin_entregas}</strong>
                                <p>{summary.sin_entregas > 0 ? 'Requieren atención' : 'Todos tienen avance'}</p>
                            </div>
                        </div>

                        <div className="kpi-card tone-info">
                            <div className="kpi-icon">
                                <MessageSquareText className="h-5 w-5" />
                            </div>
                            <div className="kpi-body">
                                <span>Con observaciones</span>
                                <strong>{summary.con_observaciones}</strong>
                                <p>Tienen comentarios pendientes</p>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon">
                                <FileCheck2 className="h-5 w-5" />
                            </div>
                            <div className="kpi-body">
                                <span>Con revisiones</span>
                                <strong>{summary.con_revisiones}</strong>
                                <p>Tienen revisión formal</p>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════ FILTROS Y ORDEN ══════════════ */}
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
                                    title="La búsqueda filtra los proyectos visibles instantáneamente"
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

                            {rol === 'docente' && (
                                <div className="relation-tabs" aria-label="Filtrar por relación académica">
                                    <button
                                        type="button"
                                        className={`relation-tab ${relationFilter === 'todos' ? 'is-active' : ''}`}
                                        onClick={() => setRelationFilter('todos')}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        type="button"
                                        className={`relation-tab ${relationFilter === 'tutor' ? 'is-active' : ''}`}
                                        onClick={() => setRelationFilter('tutor')}
                                    >
                                        Mis tutorías
                                    </button>
                                    <button
                                        type="button"
                                        className={`relation-tab is-review ${relationFilter === 'revisor' ? 'is-active' : ''}`}
                                        onClick={() => setRelationFilter('revisor')}
                                    >
                                        Mis revisiones
                                    </button>
                                </div>
                            )}

                            <div className="sort-group">
                                <span className="sort-label">
                                    <Filter className="h-3.5 w-3.5" />
                                    Ordenar por:
                                </span>
                                <button
                                    type="button"
                                    className={`sort-button ${filters.sort_by === 'ultimo_movimiento' ? 'is-active' : ''}`}
                                    onClick={() => cambiarOrden('ultimo_movimiento')}
                                    title="Ordenar por la fecha del último cambio"
                                >
                                    Movimiento
                                    {filters.sort_by === 'ultimo_movimiento' && (
                                        filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className={`sort-button ${filters.sort_by === 'estado' ? 'is-active' : ''}`}
                                    onClick={() => cambiarOrden('estado')}
                                    title="Ordenar por el estado actual"
                                >
                                    Estado
                                    {filters.sort_by === 'estado' && (
                                        filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className={`sort-button ${filters.sort_by === 'titulo' ? 'is-active' : ''}`}
                                    onClick={() => cambiarOrden('titulo')}
                                    title="Ordenar alfabéticamente por título"
                                >
                                    Título
                                    {filters.sort_by === 'titulo' && (
                                        filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════ LISTA DE PROYECTOS ══════════════ */}
                    {proyectos.length === 0 ? (
                        <section className="glass-card">
                            <div className="empty-block">
                                <FolderKanban className="h-16 w-16 stroke-[1]" />
                                <strong>Sin proyectos asignados</strong>
                                <p>No hay proyectos de seguimiento disponibles para tu rol actual.</p>
                            </div>
                        </section>
                    ) : filteredProyectos.length === 0 ? (
                        <section className="glass-card">
                            <div className="empty-block">
                                <Search className="h-16 w-16 stroke-[1]" />
                                <strong>Sin resultados para "{search}"</strong>
                                <p>Ningún proyecto coincide con tu búsqueda. Prueba con otro término o limpia el filtro.</p>
                                <button type="button" className="btn-ghost" onClick={() => setSearch('')}>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Limpiar búsqueda
                                </button>
                            </div>
                        </section>
                    ) : (
                        <>
                            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
                                <span className="total-text">
                                    Mostrando <strong>{filteredProyectos.length}</strong> de <strong>{proyectos.length}</strong> proyecto{proyectos.length === 1 ? '' : 's'}
                                    {search && (
                                        <> para "<strong>{search}</strong>"</>
                                    )}
                                    {rol === 'docente' && relationFilter !== 'todos' && (
                                        <> en <strong>{relationFilter === 'tutor' ? 'Mis tutorías' : 'Mis revisiones'}</strong></>
                                    )}
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
                                                <div className="project-head">
                                                    <span className="project-code">{proyecto.codigo}</span>
                                                    <span className={`role-badge ${relacionClass(proyecto.relacion_usuario)}`}>
                                                        {relacionLabel(proyecto.relacion_usuario)}
                                                    </span>
                                                </div>
                                                <div className="project-title">{proyecto.titulo}</div>

                                                <div className="project-people">
                                                    <span>
                                                        <UserRound className="h-3.5 w-3.5 text-[#6B1230] dark:text-[#D4849A]" />
                                                        Estudiante: <strong>{proyecto.estudiante?.name || 'Sin asignar'}</strong>
                                                    </span>
                                                    <span>
                                                        <UserRound className="h-3.5 w-3.5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                                        Tutor: <strong>{proyecto.tutor?.name || 'Sin asignar'}</strong>
                                                    </span>
                                                </div>

                                                <div className="project-counters">
                                                    <span className={`counter-pill ${proyecto.entregas_count > 0 ? 'has-data' : ''}`} title="Cantidad de entregas">
                                                        <FileText className="h-3 w-3" />
                                                        {proyecto.entregas_count} entrega{proyecto.entregas_count === 1 ? '' : 's'}
                                                    </span>
                                                    <span className={`counter-pill ${proyecto.observaciones_count > 0 ? 'has-data' : ''}`} title="Cantidad de observaciones">
                                                        <MessageSquareText className="h-3 w-3" />
                                                        {proyecto.observaciones_count} obs.
                                                    </span>
                                                    <span className={`counter-pill ${proyecto.revisiones_count > 0 ? 'has-data' : ''}`} title="Cantidad de revisiones">
                                                        <FileCheck2 className="h-3 w-3" />
                                                        {proyecto.revisiones_count} rev.
                                                    </span>
                                                </div>
                                            </div>

                                            <span
                                                className="chip-pill"
                                                style={{ background: `${estadoColor}1A`, color: estadoColor }}
                                                title={`Estado actual: ${estadoLabel(proyecto.estado)}`}
                                            >
                                                <span className="chip-dot" style={{ background: estadoColor }} />
                                                {estadoLabel(proyecto.estado)}
                                            </span>

                                            <div className="project-time">
                                                <div className="project-time-label">Último movimiento</div>
                                                <div className="project-time-value" title={formatDate(proyecto.updated_at)}>
                                                    <Clock className="h-3.5 w-3.5 opacity-60" />
                                                    {formatRelative(proyecto.updated_at)}
                                                </div>
                                            </div>

                                            <span className="project-action">
                                                Abrir
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

SeguimientoIndex.layout = {
    breadcrumbs: [
        { title: 'Seguimiento', href: '/seguimiento' },
    ],
};