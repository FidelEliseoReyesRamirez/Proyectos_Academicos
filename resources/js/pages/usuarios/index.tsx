import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    AlertTriangle, ChevronDown, Check, Edit3, Filter, Plus,
    Search, Trash2, UserRound, UsersRound, X, Calendar, Mail,
    RotateCcw, Phone, ShieldOff, AlertCircle,
} from 'lucide-react';
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
    links: { url: string | null; label: string; active: boolean; }[];
    total: number;
};

type Filters = {
    busqueda?: string | null;
    rol?: string | null;
    estado?: string | null;
    fecha_desde?: string | null;
    fecha_hasta?: string | null;
};

type Props = {
    usuarios: PaginatedUsuarios;
    filters: Filters;
    roles: string[];
};

type PageProps = { errors?: Record<string, string>; };

/* ─────────────────────────────────────────────────────────────
   Catálogos
   ───────────────────────────────────────────────────────────── */
const roleLabels: Record<string, string> = {
    estudiante:  'Estudiante',
    tutor:       'Tutor',
    revisor:     'Revisor',
    coordinador: 'Coordinador',
    admin:       'Administrador',
};

const ROLE_COLOR: Record<string, string> = {
    estudiante:  '#3B82F6',
    tutor:       '#9A6C18',
    revisor:     '#8B5CF6',
    coordinador: '#EA8A1F',
    admin:       '#6B1230',
};

const ESTADO_OPTIONS = [
    { id: '',         label: 'Todos los estados' },
    { id: 'activo',   label: 'Solo activos'      },
    { id: 'inactivo', label: 'Solo inactivos'    },
];

const FILTER_LABELS: Partial<Record<keyof Filters, string>> = {
    busqueda:    'Búsqueda',
    rol:         'Rol',
    estado:      'Estado',
    fecha_desde: 'Desde',
    fecha_hasta: 'Hasta',
};

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const todayISO = () => isoDate(new Date());

/* ─────────────────────────────────────────────────────────────
   ConfirmModal — portal en document.body (escapa overflows)
   ───────────────────────────────────────────────────────────── */
function ConfirmModal({
    open, title, message, confirmText, cancelText = 'Cancelar',
    variant = 'default', processing = false, onConfirm, onCancel, icon,
}: {
    open: boolean;
    title: string;
    message: React.ReactNode;
    confirmText: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
    processing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    icon?: React.ReactNode;
}) {
    /* Heurística 5 + 3 — cierre con Escape */
    useEffect(() => {
        if (!open) return;
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !processing) onCancel();
        };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [open, processing, onCancel]);

    if (!open) return null;

    return createPortal(
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => !processing && onCancel()}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className={`modal-icon ${variant === 'danger' ? 'is-danger' : ''}`}>
                        {icon ?? (variant === 'danger' ? <AlertTriangle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />)}
                    </div>
                    <div className="flex-1">
                        <h2>{title}</h2>
                        <p className="modal-message">{message}</p>
                    </div>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onCancel}
                        disabled={processing}
                        aria-label="Cerrar"
                        title="Cerrar (Esc)"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="modal-btn modal-btn-cancel"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={`modal-btn ${variant === 'danger' ? 'modal-btn-danger' : 'modal-btn-primary'}`}
                        onClick={onConfirm}
                        disabled={processing}
                        autoFocus
                    >
                        {processing ? 'Procesando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
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
   Index de Usuarios
   ───────────────────────────────────────────────────────────── */
export default function UsuariosIndex({ usuarios, filters, roles }: Props) {
    const { errors = {} } = usePage<PageProps>().props;
    const firstError = Object.values(errors)[0];

    const [values, setValues] = useState<Filters>({
        busqueda:    filters.busqueda    ?? '',
        rol:         filters.rol         ?? '',
        estado:      filters.estado      ?? '',
        fecha_desde: filters.fecha_desde ?? '',
        fecha_hasta: filters.fecha_hasta ?? '',
    });

    /* Heurística 1 — barra de progreso */
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const offStart  = router.on('start',  () => setLoading(true));
        const offFinish = router.on('finish', () => setLoading(false));
        return () => { offStart(); offFinish(); };
    }, []);

    /* Heurística 5 — Modal de confirmación de desactivación */
    const [deactivateTarget, setDeactivateTarget] = useState<Usuario | null>(null);
    const [deactivateProcessing, setDeactivateProcessing] = useState(false);

    const confirmarDesactivar = () => {
        if (!deactivateTarget) return;
        setDeactivateProcessing(true);
        router.patch(
            `/usuarios/${deactivateTarget.id}/estado`,
            { activo: false },
            {
                preserveScroll: true,
                onSuccess: () => setDeactivateTarget(null),
                onFinish:  () => setDeactivateProcessing(false),
            },
        );
    };

    const applyFilters = (next: Filters) => {
        router.get('/usuarios', {
            busqueda:    next.busqueda    || undefined,
            rol:         next.rol         || undefined,
            estado:      next.estado      || undefined,
            fecha_desde: next.fecha_desde || undefined,
            fecha_hasta: next.fecha_hasta || undefined,
        }, {
            preserveScroll: true,
            preserveState:  true,
            replace:        true,
        });
    };

    const updateAndFilter = (patch: Partial<Filters>) => {
        const next = { ...values, ...patch };
        setValues(next);
        applyFilters(next);
    };

    /* Heurística 7 — Búsqueda con debounce */
    const [searchInput, setSearchInput] = useState<string>(String(values.busqueda ?? ''));
    const firstRunRef = useRef(true);

    useEffect(() => {
        if (firstRunRef.current) {
            firstRunRef.current = false;
            return;
        }
        const t = setTimeout(() => {
            if ((values.busqueda ?? '') !== searchInput) {
                updateAndFilter({ busqueda: searchInput });
            }
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const removeFilter = (key: keyof Filters) => {
        if (key === 'busqueda') setSearchInput('');
        updateAndFilter({ [key]: '' });
    };

    const clearFilters = () => {
        const reset: Filters = {
            busqueda: '', rol: '', estado: '', fecha_desde: '', fecha_hasta: '',
        };
        setSearchInput('');
        setValues(reset);
        applyFilters(reset);
    };

    /* Heurísticas 1 + 6 — Filtros activos visibles */
    const activeFilters = useMemo(() => {
        const keys: (keyof Filters)[] = ['busqueda', 'rol', 'estado', 'fecha_desde', 'fecha_hasta'];
        return keys
            .filter((k) => {
                const v = values[k];
                return v !== null && v !== undefined && String(v).trim() !== '';
            })
            .map((k) => {
                const raw = String(values[k]);
                let display = raw;
                if (k === 'rol')    display = roleLabels[raw] ?? raw;
                if (k === 'estado') display = raw === 'activo' ? 'Activo' : raw === 'inactivo' ? 'Inactivo' : raw;
                return { key: k, label: FILTER_LABELS[k] ?? k, value: display };
            });
    }, [values]);

    /* Heurística 5 — bounds de fechas */
    const dateFromMax = values.fecha_hasta ? String(values.fecha_hasta) : todayISO();
    const dateToMin   = values.fecha_desde ? String(values.fecha_desde) : undefined;
    const dateToMax   = todayISO();

    return (
        <>
            <Head title="Directorio de usuarios" />

            {/* ════════════════ MODAL CONFIRMACIÓN ════════════════ */}
            <ConfirmModal
                open={!!deactivateTarget}
                title="Desactivar usuario"
                message={
                    deactivateTarget && (
                        <>
                            ¿Estás seguro de desactivar a <strong>{deactivateTarget.name}</strong> ({deactivateTarget.email})? <br />
                            El usuario no podrá iniciar sesión hasta que sea reactivado.
                        </>
                    )
                }
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
                variant="danger"
                processing={deactivateProcessing}
                icon={<ShieldOff className="h-5 w-5" />}
                onCancel={() => { if (!deactivateProcessing) setDeactivateTarget(null); }}
                onConfirm={confirmarDesactivar}
            />

            <style>{`
                /* ════════════════ PAGE ════════════════ */
                .users-page {
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
                    .users-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                /* Heurística 1 — barra de progreso */
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

                .users-shell {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                }
                @media (min-width: 768px)  { .users-shell { padding: 1.5rem; gap: 1.5rem; } }
                @media (min-width: 1280px) { .users-shell { padding: 2rem 2.25rem; } }

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

                /* ════════════════ INPUTS ════════════════ */
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

                /* ════════════════ CHIPS ════════════════ */
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
                }
                .active-chip strong { font-weight: 900; margin-right: 0.15rem; }
                .active-chip .chip-value {
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 18rem;
                }
                .active-chip button {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 1.25rem; height: 1.25rem;
                    border-radius: 999px; border: 0;
                    background: rgba(107,18,48,0.16);
                    color: inherit; cursor: pointer;
                    transition: background .15s;
                }
                .active-chip button:hover { background: rgba(107,18,48,0.30); }
                @media (prefers-color-scheme: dark) {
                    .active-chip { background: rgba(214,185,106,0.10); color: #D6B96A; border-color: rgba(214,185,106,0.22); }
                    .active-chip button { background: rgba(214,185,106,0.18); }
                    .active-chip button:hover { background: rgba(214,185,106,0.36); }
                }

                /* ════════════════ BUTTONS ════════════════ */
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
                .action-btn.is-danger        { color: #B91C1C; border-color: rgba(185,28,28,0.25); }
                .action-btn.is-danger:hover  { background: rgba(185,28,28,0.10); }
                @media (prefers-color-scheme: dark) {
                    .action-btn       { border-color: rgba(214,185,106,0.28); color: #D6B96A; }
                    .action-btn:hover { background: rgba(214,185,106,0.10); }
                    .action-btn.is-danger       { color: #FCA5A5; border-color: rgba(252,165,165,0.32); }
                    .action-btn.is-danger:hover { background: rgba(220,38,38,0.16); }
                }

                /* ════════════════ COMBOBOX ════════════════ */
                .combo-root { position: relative; }
                .combo-trigger {
                    width: 100%;
                    height: 2.65rem;
                    display: flex; align-items: center; gap: 0.5rem;
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
                    position: absolute; z-index: 100;
                    top: calc(100% + 6px); left: 0; right: 0;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: rgba(255,255,255,0.98);
                    box-shadow: 0 16px 36px rgba(40,15,25,0.18);
                    overflow: hidden;
                    backdrop-filter: blur(8px);
                }
                @media (prefers-color-scheme: dark) { .combo-panel { border-color: rgba(214,185,106,0.22); background: #2A141D; box-shadow: 0 16px 36px rgba(0,0,0,0.45); } }
                .combo-search {
                    display: flex; align-items: center; gap: 0.4rem;
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
                    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
                    padding: 0.5rem 0.65rem;
                    border-radius: 0.55rem;
                    background: transparent; border: none;
                    text-align: left;
                    font-size: 0.875rem; color: inherit;
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

                /* ════════════════ BADGES ════════════════ */
                .total-badge {
                    display: inline-flex; align-items: center; gap: 0.4rem;
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
                    display: inline-flex; align-items: center; justify-content: center;
                    min-width: 1.3rem; height: 1.3rem;
                    padding: 0 0.4rem;
                    margin-left: 0.4rem;
                    border-radius: 999px;
                    background: #6B1230;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 900;
                }
                @media (prefers-color-scheme: dark) { .count-badge { background: #D6B96A; color: #2B1620; } }

                /* ════════════════ MODAL ════════════════ */
                .modal-backdrop {
                    position: fixed; inset: 0;
                    z-index: 99999;
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    background: rgba(18,12,16,0.55);
                    backdrop-filter: blur(4px);
                    animation: fadeIn .15s ease-out;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .modal-card {
                    width: min(100%, 480px);
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    background: #fffaf4;
                    color: #24151A;
                    box-shadow: 0 24px 70px rgba(0,0,0,0.30);
                    border: 1px solid rgba(107,18,48,0.16);
                    animation: slideUp .2s ease-out;
                }
                @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .modal-header {
                    display: flex; align-items: flex-start; gap: 1rem;
                    margin-bottom: 1.25rem;
                }
                .modal-icon {
                    flex-shrink: 0;
                    width: 2.5rem; height: 2.5rem;
                    border-radius: 0.85rem;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(154,108,24,0.12);
                    color: #9A6C18;
                }
                .modal-icon.is-danger { background: rgba(185,28,28,0.12); color: #B91C1C; }
                .modal-header h2 { font-size: 1.05rem; font-weight: 900; margin: 0; line-height: 1.3; }
                .modal-message { font-size: 0.88rem; line-height: 1.55; color: #6E6458; margin: 0.4rem 0 0; }
                .modal-message strong { color: #24151A; font-weight: 800; }
                .modal-close {
                    flex-shrink: 0;
                    border: 0; background: transparent; cursor: pointer;
                    color: #6E6458;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                    transition: background .15s;
                }
                .modal-close:hover:not(:disabled) { background: rgba(107,18,48,0.08); }
                .modal-close:disabled { opacity: 0.55; cursor: not-allowed; }
                .modal-actions {
                    display: flex; justify-content: flex-end; gap: 0.6rem;
                }
                .modal-btn {
                    border: 0;
                    border-radius: 0.75rem;
                    padding: 0.7rem 1.1rem;
                    font-size: 0.85rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all .15s;
                }
                .modal-btn:disabled { opacity: 0.65; cursor: not-allowed; }
                .modal-btn-cancel        { background: rgba(110,100,88,0.12); color: #4B4038; }
                .modal-btn-cancel:hover:not(:disabled)  { background: rgba(110,100,88,0.20); }
                .modal-btn-primary       { background: #6B1230; color: white; }
                .modal-btn-primary:hover:not(:disabled) { background: #4A0D21; }
                .modal-btn-danger        { background: #B91C1C; color: white; }
                .modal-btn-danger:hover:not(:disabled)  { background: #8B1414; }

                @media (prefers-color-scheme: dark) {
                    .modal-card { background: #2B1620; color: #F4EEE9; border-color: rgba(255,255,255,0.12); }
                    .modal-message { color: #CFC4BA; }
                    .modal-message strong { color: #F4EEE9; }
                    .modal-close { color: #CFC4BA; }
                    .modal-btn-cancel { background: rgba(255,255,255,0.1); color: #F4EEE9; }
                    .modal-btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.16); }
                }
            `}</style>

            {/* Heurística 1 — Indicador de estado del sistema */}
            {loading && <div className="progress-bar" aria-hidden="true" />}

            <div className="users-page">
                <div className="users-shell">

                    {/* ════════════════ Cabecera ════════════════ */}
                    <section className="glass-card">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="eyebrow">
                                        <UsersRound className="h-4 w-4" />
                                        Coordinación académica
                                    </div>

                                    <h1 className="text-3xl font-black tracking-tight mt-1">
                                        Directorio de usuarios
                                    </h1>

                                    <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-2 max-w-3xl leading-7">
                                        Consulta los usuarios registrados en la plataforma. Puedes filtrar por nombre, correo, rol, estado y fecha de registro.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        asChild
                                        className="rounded-xl bg-[#6B1230] font-bold text-white hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620] dark:hover:bg-[#E3A1B2]"
                                        title="Registrar un nuevo usuario en el sistema"
                                    >
                                        <Link href="/usuarios/crear">
                                            <Plus className="h-4 w-4 mr-1" />
                                            Crear usuario
                                        </Link>
                                    </Button>

                                    <Button
                                        asChild
                                        variant="outline"
                                        className="rounded-xl"
                                        title="Ver usuarios eliminados y restaurarlos"
                                    >
                                        <Link href="/usuarios/papelera">
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Papelera
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════ Filtros ════════════════ */}
                    <section className="glass-card is-filters">
                        <div className="p-6 space-y-5">

                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="eyebrow">
                                    <Filter className="h-4 w-4" />
                                    Filtros del directorio
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

                            {/* Búsqueda principal con debounce */}
                            <div className="space-y-1.5">
                                <label className="filter-label" htmlFor="search-input">Búsqueda por nombre o correo</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                    <input
                                        id="search-input"
                                        type="text"
                                        placeholder="Escribe un nombre o correo y se filtrará automáticamente..."
                                        className="custom-select"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        title="La búsqueda se aplica automáticamente al dejar de escribir"
                                    />
                                </div>
                            </div>

                            {/* Filtros secundarios — grid 1/2/4 */}
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-1.5">
                                    <label className="filter-label">Rol</label>
                                    <SearchableCombobox
                                        options={[
                                            { id: '', label: 'Todos los roles' },
                                            ...roles.map((r) => ({ id: r, label: roleLabels[r] ?? r })),
                                        ]}
                                        value={String(values.rol ?? '')}
                                        onChange={(v) => updateAndFilter({ rol: v })}
                                        placeholder="Todos los roles"
                                        emptyText="Sin coincidencias"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label">Estado</label>
                                    <SearchableCombobox
                                        options={ESTADO_OPTIONS}
                                        value={String(values.estado ?? '')}
                                        onChange={(v) => updateAndFilter({ estado: v })}
                                        placeholder="Todos los estados"
                                        emptyText="Sin opciones"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="date-from">Registro desde</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="date-from"
                                            type="date"
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.fecha_desde ?? '')}
                                            max={dateFromMax}
                                            onChange={(e) => updateAndFilter({ fecha_desde: e.target.value })}
                                            title="Fecha inicial del rango. No puede ser posterior a 'Hasta'."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="filter-label" htmlFor="date-to">Registro hasta</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            id="date-to"
                                            type="date"
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            defaultValue={String(values.fecha_hasta ?? '')}
                                            min={dateToMin}
                                            max={dateToMax}
                                            onChange={(e) => updateAndFilter({ fecha_hasta: e.target.value })}
                                            title="Fecha final del rango. No puede ser anterior a 'Desde' ni posterior a hoy."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Chips de filtros activos */}
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

                    {/* ════════════════ Tabla ════════════════ */}
                    <section className="glass-card is-table">
                        <div className="p-6 pb-4 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <div className="eyebrow">
                                    <Search className="h-4 w-4" />
                                    Resultado de búsqueda
                                </div>
                                <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-1">
                                    Listado de usuarios registrados en la plataforma.
                                </p>
                            </div>

                            <span className="total-badge" title="Total de usuarios que coinciden con los filtros aplicados">
                                {usuarios.total} usuario{usuarios.total === 1 ? '' : 's'}
                            </span>
                        </div>

                        {firstError && (
                            <div className="mx-6 mb-4 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-bold text-red-700 dark:text-red-300">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>{firstError}</div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.15em] text-[#8A8074] dark:border-[#D6B96A]/14 dark:text-[#A9978D]">
                                        <th className="px-6 py-5 font-black">Nombre</th>
                                        <th className="px-6 py-5 font-black">Correo</th>
                                        <th className="px-6 py-5 font-black">Celular</th>
                                        <th className="px-6 py-5 font-black">Rol</th>
                                        <th className="px-6 py-5 font-black">Estado</th>
                                        <th className="px-6 py-5 font-black">Registro</th>
                                        <th className="px-6 py-5 font-black text-right">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#6B1230]/5 dark:divide-[#D6B96A]/5">
                                    {usuarios.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="opacity-30">
                                                        <UsersRound className="h-14 w-14 stroke-[1] mx-auto" />
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
                                                                title="Quitar todos los filtros"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Limpiar filtros
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="font-black text-lg text-[#24151A] dark:text-white">
                                                                Aún no hay usuarios registrados
                                                            </p>
                                                            <p className="text-sm text-[#6E6458] dark:text-[#A9978D] max-w-md">
                                                                Crea el primer usuario para empezar a usar el directorio.
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios.data.map((usuario) => {
                                            const roleColor = ROLE_COLOR[usuario.rol] ?? '#9A8B7B';
                                            const roleLabel = roleLabels[usuario.rol] ?? usuario.rol;

                                            return (
                                                <tr
                                                    key={usuario.id}
                                                    className="group hover:bg-[#6B1230]/5 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 font-bold text-[#24151A] dark:text-white">
                                                            <UserRound className="h-4 w-4 text-[#6B1230] dark:text-[#D4849A]" />
                                                            {usuario.name}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094]">
                                                            <Mail className="h-3.5 w-3.5 opacity-60" />
                                                            {usuario.email}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-[#6E6458] dark:text-[#A8A094]">
                                                        {usuario.telefono_contacto ? (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3.5 w-3.5 opacity-60" />
                                                                {usuario.telefono_contacto}
                                                            </div>
                                                        ) : (
                                                            <span className="italic opacity-60">No registrado</span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="chip-pill"
                                                            style={{ background: `${roleColor}1A`, color: roleColor }}
                                                        >
                                                            <span className="chip-dot" style={{ background: roleColor }} />
                                                            {roleLabel}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {usuario.activo ? (
                                                            <span
                                                                className="chip-pill"
                                                                style={{ background: 'rgba(22,163,74,0.12)', color: '#15803D' }}
                                                            >
                                                                <span className="chip-dot" style={{ background: '#15803D' }} />
                                                                Activo
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className="chip-pill"
                                                                style={{ background: 'rgba(185,28,28,0.12)', color: '#B91C1C' }}
                                                            >
                                                                <span className="chip-dot" style={{ background: '#B91C1C' }} />
                                                                Inactivo
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-[#6E6458] dark:text-[#A8A094] whitespace-nowrap">
                                                        {new Date(usuario.created_at).toLocaleDateString()}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/usuarios/${usuario.id}/editar`}
                                                                className="action-btn"
                                                                title={`Editar a ${usuario.name}`}
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                                Editar
                                                            </Link>

                                                            {usuario.activo && (
                                                                <button
                                                                    type="button"
                                                                    className="action-btn is-danger"
                                                                    onClick={() => setDeactivateTarget(usuario)}
                                                                    title={`Desactivar a ${usuario.name}`}
                                                                >
                                                                    <ShieldOff className="h-4 w-4" />
                                                                    Desactivar
                                                                </button>
                                                            )}
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
                        <div className="flex flex-wrap gap-2 border-t border-[#6B1230]/10 dark:border-[#D6B96A]/14 p-4">
                            {usuarios.links.map((link, index) => {
                                const cleanLabel = link.label
                                    .replace('&laquo;', '←')
                                    .replace('&raquo;', '→')
                                    .replace('pagination.previous', 'Anterior')
                                    .replace('pagination.next', 'Siguiente');

                                return (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url || loading}
                                        className="rounded-xl"
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                    preserveState:  true,
                                                });
                                            }
                                        }}
                                        title={link.active ? 'Página actual' : link.url ? `Ir a ${cleanLabel}` : 'No disponible'}
                                        dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                    />
                                );
                            })}
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