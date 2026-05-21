import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ClipboardList, Eye, Filter, Search, ShieldCheck, X,
    ChevronDown, Check, Mail, UserCircle, Calendar, Hash,
    Clock, CalendarDays, CalendarRange, AlertCircle, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type AuditEvent = {
    id: number;
    event_id: string;
    event: string;
    module: string | null;
    aggregate_type: string | null;
    aggregate_id: string | null;
    actor_name: string | null;
    actor_email: string | null;
    actor_role: string | null;
    target_name: string | null;
    target_email: string | null;
    description: string | null;
    ip_address: string | null;
    occurred_at: string | null;
    created_at: string;
};

type Meta = {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
};

type Filters = {
    event?: string | null;
    module?: string | null;
    aggregate_type?: string | null;
    aggregate_id?: string | null;
    actor_email?: string | null;
    target_email?: string | null;
    date_from?: string | null;
    date_to?: string | null;
    search?: string | null;
    page?: number | string | null;
    per_page?: number | string | null;
};

type Props = {
    eventos: AuditEvent[];
    meta: Meta;
    filters: Filters;
    error?: string | null;
};

/* ─────────────────────────────────────────────────────────────
   Catálogos y helpers
   ───────────────────────────────────────────────────────────── */
const moduleLabels: Record<string, string> = {
    auth: 'Autenticación',
    usuarios: 'Usuarios',
    proyectos: 'Proyectos',
    documentos: 'Documentos',
    chat: 'Chat',
    observaciones: 'Observaciones',
    reuniones: 'Reuniones',
    notificaciones: 'Notificaciones',
    periodos: 'Periodos',
};

const MODULE_COLOR: Record<string, string> = {
    auth: '#3B82F6',
    usuarios: '#6B1230',
    proyectos: '#9A6C18',
    documentos: '#3F9D58',
    chat: '#8B5CF6',
    observaciones: '#EA8A1F',
    reuniones: '#0EA5E9',
    notificaciones: '#C9A84C',
    periodos: '#6E6458',
};

const eventLabels: Record<string, string> = {
    'auth.login_exitoso': 'Inicio exitoso',
    'auth.login_fallido': 'Inicio fallido',
    'auth.cuenta_bloqueada': 'Cuenta bloqueada',
    'auth.logout': 'Cierre de sesión',
    'usuario.creado': 'Usuario creado',
    'usuario.actualizado': 'Usuario actualizado',
    'usuario.desactivado': 'Usuario desactivado',
    'usuario.restaurado': 'Usuario restaurado',
    'usuario.password_actualizada': 'Contraseña actualizada',
    'proyecto.actualizado': 'Proyecto actualizado',
    'proyecto.eliminado': 'Proyecto eliminado',
    'proyecto.restaurado': 'Proyecto restaurado',
};

const PER_PAGE_OPTIONS = [
    { id: '10',  label: '10 por página'  },
    { id: '20',  label: '20 por página'  },
    { id: '50',  label: '50 por página'  },
    { id: '100', label: '100 por página' },
];

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const todayISO = () => isoDate(new Date());
const daysAgoISO = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return isoDate(d);
};

const FILTER_LABELS: Partial<Record<keyof Filters, string>> = {
    search:         'Búsqueda',
    module:         'Módulo',
    event:          'Evento',
    actor_email:    'Actor',
    target_email:   'Objetivo',
    aggregate_type: 'Tipo',
    date_from:      'Desde',
    date_to:        'Hasta',
};

function valueOrDash(value?: string | number | null): string {
    return value === null || value === undefined || value === '' ? '—' : String(value);
}

function formatDate(value?: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

/* ─────────────────────────────────────────────────────────────
   SearchableCombobox
   ───────────────────────────────────────────────────────────── */
function SearchableCombobox({
    options, value, onChange, placeholder, emptyText,
}: {
    options: { id: number | string; label: string }[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    emptyText: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = useMemo(
        () => options.find((o) => String(o.id) === String(value)),
        [options, value],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    }, [options, query]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        if (open) document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    return (
        <div className="combo-root" ref={wrapperRef}>
            <button type="button" className="combo-trigger" onClick={() => setOpen((o) => !o)}>
                <span className={selected ? 'combo-text' : 'combo-placeholder'}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className="combo-chev" />
            </button>

            {open && (
                <div className="combo-panel">
                    <div className="combo-search">
                        <Search className="h-3.5 w-3.5 opacity-60" />
                        <input
                            autoFocus
                            className="combo-search-input"
                            placeholder="Buscar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {value && (
                            <button
                                type="button"
                                className="combo-clear"
                                onClick={() => { onChange(''); setQuery(''); }}
                                aria-label="Limpiar"
                                title="Quitar selección"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="combo-list">
                        {filtered.length === 0 ? (
                            <div className="combo-empty">{emptyText}</div>
                        ) : (
                            filtered.map((opt) => {
                                const isSel = String(opt.id) === String(value);
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`combo-item ${isSel ? 'is-selected' : ''}`}
                                        onClick={() => { onChange(String(opt.id)); setOpen(false); setQuery(''); }}
                                    >
                                        <span>{opt.label}</span>
                                        {isSel && <Check className="h-4 w-4" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Index de Auditoría
   ───────────────────────────────────────────────────────────── */
export default function AuditoriaIndex({ eventos, meta, filters, error }: Props) {
    const [values, setValues] = useState<Filters>({
        search:         filters.search         ?? '',
        module:         filters.module         ?? '',
        event:          filters.event          ?? '',
        actor_email:    filters.actor_email    ?? '',
        target_email:   filters.target_email   ?? '',
        aggregate_type: filters.aggregate_type ?? '',
        date_from:      filters.date_from      ?? '',
        date_to:        filters.date_to        ?? '',
        per_page:       filters.per_page       ?? 20,
    });

    /* Heurística 1 — Visibilidad del estado: barra de progreso */
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const offStart  = router.on('start',  () => setLoading(true));
        const offFinish = router.on('finish', () => setLoading(false));
        return () => { offStart(); offFinish(); };
    }, []);

    const goto = (next: Filters, page: number | string = 1) => {
        router.get('/auditoria', { ...next, page }, {
            preserveScroll: true,
            preserveState:  true,
            replace:        true,
        });
    };

    const updateAndFilter = (patch: Partial<Filters>) => {
        const next = { ...values, ...patch };
        setValues(next);
        goto(next);
    };

    /* Heurística 7 — Búsqueda con debounce (no requiere Enter) */
    const [searchInput, setSearchInput] = useState<string>(String(values.search ?? ''));
    const firstRunRef = useRef(true);

    useEffect(() => {
        if (firstRunRef.current) {
            firstRunRef.current = false;
            return;
        }
        const t = setTimeout(() => {
            if ((values.search ?? '') !== searchInput) {
                updateAndFilter({ search: searchInput });
            }
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const handleEnter = (key: keyof Filters) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            updateAndFilter({ [key]: e.currentTarget.value || '' } as Partial<Filters>);
        }
    };

    /* Heurística 3 — Control y libertad: quitar un filtro individual */
    const removeFilter = (key: keyof Filters) => {
        if (key === 'search') setSearchInput('');
        updateAndFilter({ [key]: '' } as Partial<Filters>);
    };

    const clearFilters = () => {
        const reset: Filters = {
            search: '', module: '', event: '', actor_email: '',
            target_email: '', aggregate_type: '', date_from: '', date_to: '',
            per_page: values.per_page ?? 20,
        };
        setSearchInput('');
        setValues(reset);
        goto(reset);
    };

    /* Heurística 7 — Filtros rápidos de período (atajos) */
    const applyPeriod = (kind: 'today' | '24h' | '7d' | '30d') => {
        let date_from = '';
        const date_to = todayISO();
        switch (kind) {
            case 'today': date_from = todayISO();        break;
            case '24h':   date_from = daysAgoISO(1);     break;
            case '7d':    date_from = daysAgoISO(7);     break;
            case '30d':   date_from = daysAgoISO(30);    break;
        }
        updateAndFilter({ date_from, date_to });
    };

    /* Heurísticas 1 + 6 — Chips de filtros activos (estado visible) */
    const activeFilters = useMemo(() => {
        const keys: (keyof Filters)[] = [
            'search', 'module', 'event', 'actor_email',
            'target_email', 'aggregate_type', 'date_from', 'date_to',
        ];
        return keys
            .filter((k) => {
                const v = values[k];
                return v !== null && v !== undefined && String(v).trim() !== '';
            })
            .map((k) => {
                const raw = String(values[k]);
                let display = raw;
                if (k === 'module') display = moduleLabels[raw] ?? raw;
                if (k === 'event')  display = eventLabels[raw]  ?? raw;
                return { key: k, label: FILTER_LABELS[k] ?? k, value: display };
            });
    }, [values]);

    /* Heurística 5 — Prevención de errores: límites en fechas */
    const dateFromMax = values.date_to ? String(values.date_to) : todayISO();
    const dateToMin   = values.date_from ? String(values.date_from) : undefined;
    const dateToMax   = todayISO();

    return (
        <>
            <Head title="Auditoría del sistema" />

            <style>{`
                /* ═══════════════════════════════════════════════
                   PAGE — max-width centrado para pantalla amplia
                   ═══════════════════════════════════════════════ */
                .page-container {
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
                    .page-container {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                /* Heurística 1 — Barra de progreso superior */
                .progress-bar {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    z-index: 999;
                    background: linear-gradient(90deg, transparent, #6B1230, #C9A84C, transparent);
                    background-size: 200% 100%;
                    animation: progress-slide 1.1s linear infinite;
                }
                @keyframes progress-slide {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* Contenedor con max-width — evita que los inputs se estiren en pantalla ultra ancha */
                .shell-container {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                }
                @media (min-width: 768px) {
                    .shell-container { padding: 1.5rem; gap: 1.5rem; }
                }
                @media (min-width: 1280px) {
                    .shell-container { padding: 2rem 2.25rem; }
                }

                .glass-card {
                    position: relative;
                    overflow: visible;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }
                .glass-card.is-filters { z-index: 40; }
                .glass-card.is-table   { z-index: 1; overflow: hidden; }
                @media (prefers-color-scheme: dark) {
                    .glass-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }
                }

                .eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: #9A6C18;
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }
                @media (prefers-color-scheme: dark) { .eyebrow { color: #D6B96A; } }

                .filter-label {
                    display: block;
                    margin-bottom: 0.35rem;
                    color: #6E6458;
                    font-size: 0.72rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                /* ═══════════════════════════════════════════════
                   INPUTS — altura uniforme, padding cómodo
                   ═══════════════════════════════════════════════ */
                .custom-select {
                    width: 100%;
                    height: 2.65rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background-color: rgba(255,255,255,0.75);
                    padding: 0 0.85rem;
                    font-size: 0.9rem;
                    color: #24151A;
                    outline: none;
                    transition: border-color .18s, box-shadow .18s;
                }
                .custom-select:focus-visible {
                    border-color: #6B1230;
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) {
                    .custom-select {
                        border-color: rgba(214,185,106,0.14);
                        background-color: #2B1620;
                        color: #F4EEE9;
                    }
                }

                /* ═══════════════════════════════════════════════
                   CHIPS
                   ═══════════════════════════════════════════════ */
                .chip-dot {
                    display: inline-block;
                    width: 0.55rem;
                    height: 0.55rem;
                    border-radius: 999px;
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.6);
                    flex-shrink: 0;
                }
                @media (prefers-color-scheme: dark) { .chip-dot { box-shadow: 0 0 0 3px rgba(255,255,255,0.08); } }

                .chip-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.25rem 0.65rem;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    border: 1px solid rgba(0,0,0,0.06);
                    white-space: nowrap;
                    width: max-content;
                }
                @media (prefers-color-scheme: dark) { .chip-pill { border-color: rgba(255,255,255,0.10); } }

                /* Chip de filtro activo — con X individual (Heurística 3) */
                .active-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.3rem 0.4rem 0.3rem 0.75rem;
                    border-radius: 999px;
                    background: rgba(107,18,48,0.08);
                    color: #6B1230;
                    font-size: 0.74rem;
                    font-weight: 700;
                    border: 1px solid rgba(107,18,48,0.18);
                    max-width: 100%;
                }
                .active-chip strong { font-weight: 900; margin-right: 0.15rem; }
                .active-chip .chip-value {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 18rem;
                }
                .active-chip button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 1.25rem;
                    height: 1.25rem;
                    border-radius: 999px;
                    border: 0;
                    background: rgba(107,18,48,0.16);
                    color: inherit;
                    cursor: pointer;
                    transition: background .15s;
                }
                .active-chip button:hover { background: rgba(107,18,48,0.30); }
                @media (prefers-color-scheme: dark) {
                    .active-chip {
                        background: rgba(214,185,106,0.10);
                        color: #D6B96A;
                        border-color: rgba(214,185,106,0.22);
                    }
                    .active-chip button       { background: rgba(214,185,106,0.18); }
                    .active-chip button:hover { background: rgba(214,185,106,0.36); }
                }

                /* Quick filter chip (período rápido) — Heurística 7 */
                .quick-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.45rem 0.85rem;
                    border-radius: 999px;
                    background: transparent;
                    color: #6E6458;
                    border: 1px solid rgba(107,18,48,0.16);
                    font-size: 0.74rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all .15s;
                }
                .quick-chip:hover { background: rgba(107,18,48,0.06); border-color: rgba(107,18,48,0.30); color: #6B1230; }
                @media (prefers-color-scheme: dark) {
                    .quick-chip       { color: #A89889; border-color: rgba(214,185,106,0.22); }
                    .quick-chip:hover { background: rgba(214,185,106,0.08); border-color: rgba(214,185,106,0.40); color: #D6B96A; }
                }

                .event-code {
                    margin-top: 0.3rem;
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                    font-size: 0.68rem;
                    color: #8A8074;
                    letter-spacing: 0;
                }
                @media (prefers-color-scheme: dark) { .event-code { color: #A9978D; } }

                /* ═══════════════════════════════════════════════
                   BUTTONS
                   ═══════════════════════════════════════════════ */
                .action-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    height: 2.1rem;
                    padding: 0 0.85rem;
                    border-radius: 0.65rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: transparent;
                    color: #6B1230;
                    cursor: pointer;
                    font-size: 0.78rem;
                    font-weight: 800;
                    text-decoration: none;
                    transition: all .15s;
                }
                .action-btn:hover { background: rgba(107,18,48,0.08); }
                @media (prefers-color-scheme: dark) {
                    .action-btn       { border-color: rgba(214,185,106,0.28); color: #D6B96A; }
                    .action-btn:hover { background: rgba(214,185,106,0.10); }
                }

                /* ═══════════════════════════════════════════════
                   COMBOBOX
                   ═══════════════════════════════════════════════ */
                .combo-root { position: relative; }
                .combo-trigger {
                    width: 100%;
                    height: 2.65rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.75);
                    padding: 0 0.6rem 0 0.85rem;
                    color: #24151A;
                    font-size: 0.875rem;
                    text-align: left;
                    cursor: pointer;
                    transition: border-color .18s, background .18s, box-shadow .18s;
                }
                .combo-trigger:hover         { border-color: rgba(107,18,48,0.28); }
                .combo-trigger:focus-visible { outline: none; border-color: #6B1230; box-shadow: 0 0 0 3px rgba(107,18,48,0.10); }
                @media (prefers-color-scheme: dark) {
                    .combo-trigger       { border-color: rgba(214,185,106,0.14); background: #2B1620; color: #F4EEE9; }
                    .combo-trigger:hover { border-color: rgba(214,185,106,0.32); }
                }
                .combo-text        { color: inherit; font-weight: 600; }
                .combo-placeholder { color: #9A8B7B; }
                @media (prefers-color-scheme: dark) { .combo-placeholder { color: #A89889; } }
                .combo-chev { margin-left: auto; height: 1rem; width: 1rem; opacity: 0.6; flex-shrink: 0; }
                .combo-panel {
                    position: absolute;
                    z-index: 100;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: rgba(255,255,255,0.98);
                    box-shadow: 0 16px 36px rgba(40,15,25,0.18);
                    overflow: hidden;
                    backdrop-filter: blur(8px);
                }
                @media (prefers-color-scheme: dark) { .combo-panel { border-color: rgba(214,185,106,0.22); background: #2A141D; box-shadow: 0 16px 36px rgba(0,0,0,0.45); } }
                .combo-search {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.55rem 0.7rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                    background: rgba(250,248,245,0.7);
                }
                @media (prefers-color-scheme: dark) { .combo-search { border-bottom-color: rgba(214,185,106,0.16); background: rgba(255,255,255,0.04); } }
                .combo-search-input { flex: 1; background: transparent; border: none; outline: none; font-size: 0.85rem; color: inherit; }
                .combo-clear { background: transparent; border: none; cursor: pointer; color: inherit; opacity: 0.55; padding: 0.1rem; }
                .combo-clear:hover { opacity: 1; }
                .combo-list  { max-height: 240px; overflow-y: auto; padding: 0.3rem; }
                .combo-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                    padding: 0.5rem 0.65rem;
                    border-radius: 0.55rem;
                    background: transparent;
                    border: none;
                    text-align: left;
                    font-size: 0.875rem;
                    color: inherit;
                    cursor: pointer;
                    transition: background .12s;
                }
                .combo-item:hover       { background: rgba(107,18,48,0.08); }
                .combo-item.is-selected { background: rgba(107,18,48,0.12); color: #6B1230; font-weight: 700; }
                @media (prefers-color-scheme: dark) {
                    .combo-item:hover       { background: rgba(214,185,106,0.10); }
                    .combo-item.is-selected { background: rgba(214,185,106,0.16); color: #F4EEE9; }
                }
                .combo-empty { padding: 0.9rem; text-align: center; font-size: 0.82rem; color: #9A8B7B; }

                /* ═══════════════════════════════════════════════
                   BADGES
                   ═══════════════════════════════════════════════ */
                .total-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.8rem;
                    border-radius: 999px;
                    background: rgba(107,18,48,0.08);
                    color: #6B1230;
                    font-size: 0.74rem;
                    font-weight: 900;
                    letter-spacing: 0.02em;
                }
                @media (prefers-color-scheme: dark) { .total-badge { background: rgba(214,185,106,0.12); color: #D6B96A; } }

                .count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 1.3rem;
                    height: 1.3rem;
                    padding: 0 0.4rem;
                    margin-left: 0.4rem;
                    border-radius: 999px;
                    background: #6B1230;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 900;
                }
                @media (prefers-color-scheme: dark) { .count-badge { background: #D6B96A; color: #2B1620; } }
            `}</style>

            {/* Heurística 1 — Indicador del estado del sistema */}
            {loading && <div className="progress-bar" aria-hidden="true" />}

            <div className="page-container">
                <div className="shell-container">

                    {/* ══════════════════════════════════════════
                       Cabecera
                       ══════════════════════════════════════════ */}
                    <section className="glass-card">
                        <div className="p-6">
                            <div className="eyebrow">
                                <ShieldCheck className="h-4 w-4" />
                                Seguridad y trazabilidad
                            </div>

                            <h1 className="text-3xl font-black tracking-tight mt-1">
                                Auditoría del sistema
                            </h1>

                            <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-2 max-w-3xl leading-7">
                                Consulta general de eventos registrados por el microservicio de auditoría. Este módulo es solo lectura y permite revisar acciones de autenticación, usuarios, proyectos y futuros módulos como documentos, chat, reuniones u observaciones.
                            </p>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════
                       Filtros
                       ══════════════════════════════════════════ */}
                    <section className="glass-card is-filters">
                        <div className="p-6 space-y-5">

                            {/* Encabezado con contador (Heurística 1, 6) */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="eyebrow">
                                    <Filter className="h-4 w-4" />
                                    Parámetros de búsqueda
                                    {activeFilters.length > 0 && (
                                        <span className="count-badge" title={`${activeFilters.length} filtro(s) activo(s)`}>
                                            {activeFilters.length}
                                        </span>
                                    )}
                                </div>

                                {activeFilters.length > 0 && (
                                    <button
                                        type="button"
                                        className="action-btn"
                                        onClick={clearFilters}
                                        title="Restablecer todos los filtros y volver al listado completo"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Limpiar todo
                                    </button>
                                )}
                            </div>

                            {/* Heurística 7 — Quick filters de período */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-[#6E6458] dark:text-[#A89889] mr-1">
                                    Período rápido:
                                </span>
                                <button type="button" className="quick-chip" onClick={() => applyPeriod('today')} title="Eventos registrados hoy">
                                    <Clock className="h-3.5 w-3.5" /> Hoy
                                </button>
                                <button type="button" className="quick-chip" onClick={() => applyPeriod('24h')} title="Últimas 24 horas">
                                    <Clock className="h-3.5 w-3.5" /> 24 h
                                </button>
                                <button type="button" className="quick-chip" onClick={() => applyPeriod('7d')} title="Últimos 7 días">
                                    <CalendarDays className="h-3.5 w-3.5" /> 7 días
                                </button>
                                <button type="button" className="quick-chip" onClick={() => applyPeriod('30d')} title="Últimos 30 días">
                                    <CalendarRange className="h-3.5 w-3.5" /> 30 días
                                </button>
                            </div>

                            {/* Búsqueda principal con debounce (Heurística 7) */}
                            <div className="space-y-1.5">
                                <label className="filter-label" htmlFor="search-input">Búsqueda general</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                    <input
                                        id="search-input"
                                        type="text"
                                        placeholder="Escribe un evento, módulo, correo o descripción..."
                                        className="custom-select"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        title="La búsqueda se aplica automáticamente al dejar de escribir"
                                    />
                                </div>
                            </div>

                            {/* Filtros principales — grid responsivo 1/2/4 */}
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-1.5">
                                    <label className="filter-label">Módulo</label>
                                    <SearchableCombobox
                                        options={[
                                            { id: '', label: 'Todos los módulos' },
                                            ...Object.entries(moduleLabels).map(([v, l]) => ({ id: v, label: l })),
                                        ]}
                                        value={String(values.module ?? '')}
                                        onChange={(v) => updateAndFilter({ module: v })}
                                        placeholder="Todos los módulos"
                                        emptyText="Sin coincidencias"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="event-input">Evento (código)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="event-input"
                                            type="text"
                                            placeholder="auth.login_fallido"
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.event ?? '')}
                                            onKeyDown={handleEnter('event')}
                                            onBlur={(e) => {
                                                if ((values.event ?? '') !== e.target.value) {
                                                    updateAndFilter({ event: e.target.value });
                                                }
                                            }}
                                            title="Presiona Enter o sal del campo para aplicar"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="actor-input">Actor (correo)</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="actor-input"
                                            type="text"
                                            placeholder="correo@ejemplo.com"
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.actor_email ?? '')}
                                            onKeyDown={handleEnter('actor_email')}
                                            onBlur={(e) => {
                                                if ((values.actor_email ?? '') !== e.target.value) {
                                                    updateAndFilter({ actor_email: e.target.value });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="target-input">Objetivo (correo)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="target-input"
                                            type="text"
                                            placeholder="correo@ejemplo.com"
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.target_email ?? '')}
                                            onKeyDown={handleEnter('target_email')}
                                            onBlur={(e) => {
                                                if ((values.target_email ?? '') !== e.target.value) {
                                                    updateAndFilter({ target_email: e.target.value });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filtros secundarios — grid 1/2/4 */}
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="date-from">Desde</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="date-from"
                                            type="date"
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.date_from ?? '')}
                                            max={dateFromMax}
                                            onChange={(e) => updateAndFilter({ date_from: e.target.value })}
                                            title="Fecha inicial del rango. No puede ser posterior a la fecha 'Hasta'."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="date-to">Hasta</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="date-to"
                                            type="date"
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.date_to ?? '')}
                                            min={dateToMin}
                                            max={dateToMax}
                                            onChange={(e) => updateAndFilter({ date_to: e.target.value })}
                                            title="Fecha final del rango. No puede ser anterior a 'Desde' ni posterior a hoy."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="agg-input">Tipo agregado</label>
                                    <div className="relative">
                                        <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="agg-input"
                                            type="text"
                                            placeholder="usuario, auth, proyecto..."
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.aggregate_type ?? '')}
                                            onKeyDown={handleEnter('aggregate_type')}
                                            onBlur={(e) => {
                                                if ((values.aggregate_type ?? '') !== e.target.value) {
                                                    updateAndFilter({ aggregate_type: e.target.value });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label">Resultados por página</label>
                                    <SearchableCombobox
                                        options={PER_PAGE_OPTIONS}
                                        value={String(values.per_page ?? 20)}
                                        onChange={(v) => updateAndFilter({ per_page: v })}
                                        placeholder="20 por página"
                                        emptyText="Sin opciones"
                                    />
                                </div>
                            </div>

                            {/* Chips de filtros activos (Heurísticas 3, 6) */}
                            {activeFilters.length > 0 && (
                                <div className="pt-2 border-t border-[#6B1230]/10 dark:border-[#D6B96A]/14">
                                    <div className="text-xs font-black uppercase tracking-wider text-[#6E6458] dark:text-[#A89889] mb-2">
                                        Filtros activos
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeFilters.map((af) => (
                                            <span key={af.key} className="active-chip">
                                                <strong>{af.label}:</strong>
                                                <span className="chip-value" title={af.value}>{af.value}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFilter(af.key)}
                                                    title={`Quitar filtro de ${af.label.toLowerCase()}`}
                                                    aria-label={`Quitar filtro ${af.label}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════
                       Tabla de eventos
                       ══════════════════════════════════════════ */}
                    <section className="glass-card is-table">
                        <div className="p-6 pb-4 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <div className="eyebrow">
                                    <ClipboardList className="h-4 w-4" />
                                    Eventos registrados
                                </div>
                                <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-1">
                                    Listado cronológico de eventos auditados.
                                </p>
                            </div>

                            <span className="total-badge" title="Total de eventos que coinciden con los filtros aplicados">
                                {meta.total} evento{meta.total === 1 ? '' : 's'}
                            </span>
                        </div>

                        {/* Heurística 9 — Mensaje de error claro */}
                        {error && (
                            <div className="mx-6 mb-4 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-bold text-red-700 dark:text-red-300">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div>Error al consultar el microservicio de auditoría</div>
                                    <div className="font-medium opacity-90 mt-0.5">{error}</div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.15em] text-[#8A8074] dark:border-[#D6B96A]/14 dark:text-[#A9978D]">
                                        <th className="px-6 py-5 font-black">Fecha</th>
                                        <th className="px-6 py-5 font-black">Evento</th>
                                        <th className="px-6 py-5 font-black">Módulo</th>
                                        <th className="px-6 py-5 font-black">Actor</th>
                                        <th className="px-6 py-5 font-black">Objetivo</th>
                                        <th className="px-6 py-5 font-black">Descripción</th>
                                        <th className="px-6 py-5 font-black text-right">Acción</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#6B1230]/5 dark:divide-[#D6B96A]/5">
                                    {eventos.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                {/* Heurística 9 — Empty state inteligente */}
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="opacity-30">
                                                        <ShieldCheck className="h-14 w-14 stroke-[1] mx-auto" />
                                                    </div>
                                                    {activeFilters.length > 0 ? (
                                                        <>
                                                            <p className="font-black text-lg text-[#24151A] dark:text-white">
                                                                Sin resultados para los filtros aplicados
                                                            </p>
                                                            <p className="text-sm text-[#6E6458] dark:text-[#A9978D] max-w-md">
                                                                Prueba ampliar el rango de fechas o quitar algunos filtros activos.
                                                            </p>
                                                            <button
                                                                type="button"
                                                                className="action-btn mt-2"
                                                                onClick={clearFilters}
                                                                title="Quitar todos los filtros para ver todos los eventos"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Limpiar filtros
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="font-black text-lg text-[#24151A] dark:text-white">
                                                                Aún no hay eventos registrados
                                                            </p>
                                                            <p className="text-sm text-[#6E6458] dark:text-[#A9978D] max-w-md">
                                                                Cuando ocurran acciones en el sistema, aparecerán aquí.
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        eventos.map((evento) => {
                                            const moduleKey   = evento.module ?? '';
                                            const moduleColor = MODULE_COLOR[moduleKey] ?? '#9A8B7B';
                                            const moduleLabel = moduleLabels[moduleKey] ?? valueOrDash(evento.module);
                                            const eventLabel  = eventLabels[evento.event] ?? evento.event;

                                            return (
                                                <tr
                                                    key={evento.id}
                                                    className="group hover:bg-[#6B1230]/5 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                        {formatDate(evento.occurred_at)}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="chip-pill"
                                                            style={{ background: '#9A6C181A', color: '#7A570D' }}
                                                        >
                                                            <span className="chip-dot" style={{ background: '#9A6C18' }} />
                                                            {eventLabel}
                                                        </span>
                                                        <div className="event-code">{evento.event}</div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="chip-pill"
                                                            style={{ background: `${moduleColor}1A`, color: moduleColor }}
                                                        >
                                                            <span className="chip-dot" style={{ background: moduleColor }} />
                                                            {moduleLabel}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[#24151A] dark:text-white">
                                                            {valueOrDash(evento.actor_name)}
                                                        </div>
                                                        <div className="text-xs text-[#6E6458] dark:text-[#A8A094] mt-0.5">
                                                            {valueOrDash(evento.actor_email)}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[#24151A] dark:text-white">
                                                            {valueOrDash(evento.target_name)}
                                                        </div>
                                                        <div className="text-xs text-[#6E6458] dark:text-[#A8A094] mt-0.5">
                                                            {valueOrDash(evento.target_email)}
                                                        </div>
                                                    </td>

                                                    <td className="max-w-[320px] px-6 py-4 text-[#6E6458] dark:text-[#A8A094]">
                                                        {valueOrDash(evento.description)}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end">
                                                            <Link
                                                                href={`/auditoria/${evento.id}`}
                                                                className="action-btn"
                                                                title="Abrir el detalle completo del evento, incluyendo payload"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                Ver detalle
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#6B1230]/10 dark:border-[#D6B96A]/14 px-6 py-4">
                            <div className="text-sm font-semibold text-[#6E6458] dark:text-[#A8A094]">
                                Página <span className="font-black text-[#24151A] dark:text-white">{meta.page}</span> de{' '}
                                <span className="font-black text-[#24151A] dark:text-white">{meta.last_page || 1}</span>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    disabled={meta.page <= 1 || loading}
                                    onClick={() => goto(values, meta.page - 1)}
                                    title="Ir a la página anterior"
                                >
                                    Anterior
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    disabled={meta.page >= meta.last_page || loading}
                                    onClick={() => goto(values, meta.page + 1)}
                                    title="Ir a la página siguiente"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}

AuditoriaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Auditoría',
            href: '/auditoria',
        },
    ],
};