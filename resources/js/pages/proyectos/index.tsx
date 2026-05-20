import { router, Head, Link } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
    Plus, Search, Filter, FolderKanban, X, CalendarDays,
    Pencil, Trash2, ChevronDown, Check, UserCircle, Briefcase, Activity,
} from 'lucide-react';

type Periodo = { id: number; nombre: string };
type Usuario = { id: number; name: string };

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    estado: string;
    deleted_at: string | null;
    periodo?: Periodo | null;
    estudiante?: Usuario | null;
    tutor?: Usuario | null;
};

type Filters = {
    busqueda?: string;
    periodo_id?: string;
    tutor_id?: string;
    estudiante_buscar?: string;
    estado?: string;
};

type Props = {
    proyectos: { data: Proyecto[]; total?: number };
    periodos: Periodo[];
    tutores: Usuario[];
    eliminados_count?: number;
    filters: Filters;
};

const ESTADO_COLOR: Record<string, { color: string; label: string }> = {
    en_revision:   { color: '#C9A84C', label: 'En revision'   },
    aprobado:      { color: '#3F9D58', label: 'Aprobado'      },
    rechazado:     { color: '#B91C1C', label: 'Rechazado'     },
    en_desarrollo: { color: '#3B82F6', label: 'En desarrollo' },
    observado:     { color: '#EA8A1F', label: 'Observado'     },
    concluido:     { color: '#6E6458', label: 'Concluido'     },
};

const ESTADOS_OPTIONS = [
    { value: 'en_revision',   label: 'En revision'   },
    { value: 'aprobado',      label: 'Aprobado'      },
    { value: 'rechazado',     label: 'Rechazado'     },
    { value: 'en_desarrollo', label: 'En desarrollo' },
    { value: 'observado',     label: 'Observado'     },
    { value: 'concluido',     label: 'Concluido'     },
];

/* ─────────────────────────────────────────────────────────────
   ConfirmModal — renderizado en document.body via createPortal
   para evitar quedar atrapado dentro de contenedores overflow
   ───────────────────────────────────────────────────────────── */
function ConfirmModal({
    open,
    title,
    message,
    confirmText,
    cancelText = 'Cancelar',
    variant = 'default',
    processing = false,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
    processing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!open) return null;

    return createPortal(
        <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card">
                <div className="modal-header">
                    <h2>{title}</h2>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onCancel}
                        disabled={processing}
                        aria-label="Cerrar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="modal-message">{message}</p>

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
    options,
    value,
    onChange,
    placeholder,
    emptyText,
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
            <button
                type="button"
                className="combo-trigger"
                onClick={() => setOpen((o) => !o)}
            >
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
   StatePicker — panel renderizado en document.body via createPortal.
   Calcula la posicion del boton con getBoundingClientRect() y usa
   position: fixed para escapar de cualquier contenedor overflow.
   ───────────────────────────────────────────────────────────── */
function StatePicker({ proyecto }: { proyecto: Proyecto }) {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [pendingEstado, setPendingEstado] = useState<{ value: string; label: string } | null>(null);
    const [processingEstado, setProcessingEstado] = useState(false);
    const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const btnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const PANEL_WIDTH  = 230;
    const PANEL_HEIGHT = 310;
    const MARGIN       = 8;

    const calcularPosicion = (): { top: number; left: number } => {
        if (!btnRef.current) return { top: 0, left: 0 };

        const rect = btnRef.current.getBoundingClientRect();

        let left = rect.right - PANEL_WIDTH;
        if (left < MARGIN) left = MARGIN;
        if (left + PANEL_WIDTH > window.innerWidth - MARGIN) {
            left = window.innerWidth - PANEL_WIDTH - MARGIN;
        }

        let top = rect.bottom + 6;
        if (top + PANEL_HEIGHT > window.innerHeight - MARGIN) {
            top = rect.top - PANEL_HEIGHT - 6;
        }
        if (top < MARGIN) top = MARGIN;

        return { top, left };
    };

    const abrirMenu = () => {
        const mobile = window.innerWidth <= 640;
        setIsMobile(mobile);
        if (!mobile) setPanelPos(calcularPosicion());
        setOpen(true);
    };

    const cerrarPanel = () => setOpen(false);

    /* Cierre al hacer clic afuera, Escape, scroll o resize */
    useEffect(() => {
        if (!open) return;

        const onDocClick = (e: MouseEvent) => {
            if (
                !panelRef.current?.contains(e.target as Node) &&
                !btnRef.current?.contains(e.target as Node)
            ) {
                cerrarPanel();
            }
        };

        const onEsc    = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarPanel(); };
        const onResize = () => cerrarPanel();

        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onEsc);
        window.addEventListener('resize', onResize);

        /* En desktop cerramos tambien al hacer scroll en cualquier contenedor */
        if (!isMobile) {
            window.addEventListener('scroll', onResize, true);
        }

        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onEsc);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize, true);
        };
    }, [open, isMobile]);

    const handlePick = (estado: string) => {
        cerrarPanel();
        if (proyecto.estado === estado) return;
        setPendingEstado({ value: estado, label: ESTADO_COLOR[estado]?.label ?? estado });
    };

    const confirmarCambioEstado = () => {
        if (!pendingEstado) return;
        setProcessingEstado(true);
        router.post(
            `/proyectos/${proyecto.id}/cambiar-estado`,
            { estado: pendingEstado.value },
            {
                preserveScroll: true,
                onSuccess: () => setPendingEstado(null),
                onFinish:  () => setProcessingEstado(false),
            },
        );
    };

    /* Panel de estados — montado en document.body */
    const panelNode = open
        ? createPortal(
            <>
                {/* Backdrop solo en movil */}
                {isMobile && (
                    <div
                        className="state-backdrop"
                        aria-hidden="true"
                        onClick={cerrarPanel}
                    />
                )}

                <div
                    ref={panelRef}
                    className={`state-panel ${isMobile ? 'is-mobile' : ''}`}
                    style={
                        isMobile
                            ? undefined
                            : {
                                position: 'fixed',
                                top: panelPos.top,
                                left: panelPos.left,
                                zIndex: 99999,
                              }
                    }
                >
                    <div className="state-panel-header">
                        <div>
                            <div className="state-panel-title">Cambiar estado</div>
                            <div className="state-panel-subtitle">{proyecto.titulo}</div>
                        </div>

                        {isMobile && (
                            <button
                                type="button"
                                className="state-panel-close"
                                onClick={cerrarPanel}
                                aria-label="Cerrar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {ESTADOS_OPTIONS.map(({ value, label }) => {
                        const meta      = ESTADO_COLOR[value];
                        const isCurrent = proyecto.estado === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                className={`state-panel-item ${isCurrent ? 'is-current' : ''}`}
                                onClick={() => handlePick(value)}
                                disabled={isCurrent}
                            >
                                <span className="estado-dot" style={{ background: meta.color }} />
                                <span>{label}</span>
                                {isCurrent && <Check className="h-3.5 w-3.5 opacity-60 ml-auto" />}
                            </button>
                        );
                    })}
                </div>
            </>,
            document.body,
        )
        : null;

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className="action-btn is-state"
                onClick={() => (open ? cerrarPanel() : abrirMenu())}
                title="Cambiar estado"
                aria-label="Cambiar estado"
            >
                <Activity className="h-4 w-4" />
            </button>

            {panelNode}

            <ConfirmModal
                open={!!pendingEstado}
                title="Cambiar estado del proyecto"
                message={
                    pendingEstado
                        ? `¿Cambiar el estado de "${proyecto.titulo}" a "${pendingEstado.label}"?`
                        : ''
                }
                confirmText="Cambiar estado"
                variant="default"
                processing={processingEstado}
                onCancel={() => { if (!processingEstado) setPendingEstado(null); }}
                onConfirm={confirmarCambioEstado}
            />
        </>
    );
}

/* ─────────────────────────────────────────────────────────────
   Index page
   ───────────────────────────────────────────────────────────── */
export default function Index({ proyectos, periodos, tutores, eliminados_count, filters }: Props) {
    const [values, setValues] = useState<Filters>({
        busqueda:         filters.busqueda         || '',
        periodo_id:       filters.periodo_id       || '',
        tutor_id:         filters.tutor_id         || '',
        estudiante_buscar: filters.estudiante_buscar || '',
        estado:           filters.estado           || '',
    });

    const [deleteTarget,     setDeleteTarget]     = useState<Proyecto | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const handleFilter = (newValues: Filters) => {
        router.get('/proyectos', newValues, {
            preserveState:  true,
            replace:        true,
            preserveScroll: true,
        });
    };

    const updateAndFilter = (patch: Partial<Filters>) => {
        const next = { ...values, ...patch };
        setValues(next);
        handleFilter(next);
    };

    const confirmarEliminar = () => {
        if (!deleteTarget) return;
        setDeleteProcessing(true);
        router.delete(`/proyectos/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onFinish:  () => setDeleteProcessing(false),
        });
    };

    return (
        <>
            <Head title="Repositorio de Proyectos" />

            {/* Modal de confirmacion de eliminacion — montado en body via createPortal dentro de ConfirmModal */}
            <ConfirmModal
                open={!!deleteTarget}
                title="Enviar proyecto a la papelera"
                message={
                    deleteTarget
                        ? `¿Eliminar el proyecto "${deleteTarget.titulo}"? Podras restaurarlo desde la papelera.`
                        : ''
                }
                confirmText="Eliminar"
                variant="danger"
                processing={deleteProcessing}
                onCancel={() => { if (!deleteProcessing) setDeleteTarget(null); }}
                onConfirm={confirmarEliminar}
            />

            <style>{`
                /* ── Modal ── */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    background: rgba(18, 12, 16, 0.55);
                    backdrop-filter: blur(4px);
                }
                .modal-card {
                    width: min(100%, 430px);
                    border-radius: 1.25rem;
                    padding: 1.25rem;
                    background: #fffaf4;
                    color: #24151A;
                    box-shadow: 0 24px 70px rgba(0,0,0,0.25);
                    border: 1px solid rgba(107,18,48,0.16);
                }
                .modal-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                }
                .modal-header h2 {
                    font-size: 1rem;
                    font-weight: 800;
                    margin: 0;
                }
                .modal-close {
                    border: 0;
                    background: transparent;
                    cursor: pointer;
                    color: #6E6458;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                }
                .modal-close:hover:not(:disabled) { background: rgba(107,18,48,0.08); }
                .modal-close:disabled { opacity: 0.55; cursor: not-allowed; }
                .modal-message {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: #6E6458;
                    margin-bottom: 1.25rem;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }
                .modal-btn {
                    border: 0;
                    border-radius: 0.75rem;
                    padding: 0.65rem 1rem;
                    font-size: 0.85rem;
                    font-weight: 800;
                    cursor: pointer;
                }
                .modal-btn:disabled { opacity: 0.65; cursor: not-allowed; }
                .modal-btn-cancel  { background: rgba(110,100,88,0.12); color: #4B4038; }
                .modal-btn-primary { background: #6B1230; color: white; }
                .modal-btn-danger  { background: #B91C1C; color: white; }

                @media (prefers-color-scheme: dark) {
                    .modal-card       { background: #2B1620; color: #F4EEE9; border-color: rgba(255,255,255,0.12); }
                    .modal-message    { color: #CFC4BA; }
                    .modal-close      { color: #CFC4BA; }
                    .modal-btn-cancel { background: rgba(255,255,255,0.1); color: #F4EEE9; }
                }

                /* ── Page ── */
                .page-container {
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

                .shell-container {
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                    width: 100%;
                }
                @media (min-width: 768px) {
                    .shell-container { padding: 1.5rem; gap: 1.5rem; }
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
                @media (prefers-color-scheme: dark) {
                    .eyebrow { color: #D6B96A; }
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

                .custom-select {
                    width: 100%;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background-color: rgba(255,255,255,0.75);
                    padding: 0.58rem 0.75rem;
                    font-size: 0.9rem;
                    color: #24151A;
                    outline: none;
                }
                @media (prefers-color-scheme: dark) {
                    .custom-select {
                        border-color: rgba(214,185,106,0.14);
                        background-color: #2B1620;
                        color: #F4EEE9;
                    }
                }

                .papelera-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.35rem 0.7rem;
                    border-radius: 0.6rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: transparent;
                    color: #6B1230;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    transition: all .15s;
                }
                .papelera-link:hover { background: rgba(107,18,48,0.08); }
                .papelera-link .badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 1.1rem;
                    height: 1.1rem;
                    padding: 0 0.3rem;
                    border-radius: 999px;
                    background: #6B1230;
                    color: white;
                    font-size: 0.62rem;
                    font-weight: 900;
                }
                @media (prefers-color-scheme: dark) {
                    .papelera-link              { border-color: rgba(214,185,106,0.28); color: #D6B96A; }
                    .papelera-link:hover        { background: rgba(214,185,106,0.10); }
                    .papelera-link .badge       { background: #D6B96A; color: #2B1620; }
                }

                /* ── Estado chip — nowrap garantiza una sola linea ── */
                .estado-dot {
                    display: inline-block;
                    width: 0.55rem;
                    height: 0.55rem;
                    border-radius: 999px;
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.6);
                    flex-shrink: 0;
                }
                .estado-chip {
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
                @media (prefers-color-scheme: dark) {
                    .estado-dot  { box-shadow: 0 0 0 3px rgba(255,255,255,0.08); }
                    .estado-chip { border-color: rgba(255,255,255,0.10); }
                }

                /* ── Action buttons ── */
                .action-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 0.55rem;
                    border: 1px solid transparent;
                    background: transparent;
                    color: #6E6458;
                    cursor: pointer;
                    transition: all .15s;
                }
                .action-btn:hover              { background: rgba(107,18,48,0.08); color: #6B1230; }
                .action-btn.is-state:hover     { color: #9A6C18; background: rgba(201,168,76,0.12); }
                .action-btn.is-delete:hover    { color: #B91C1C; background: rgba(185,28,28,0.10); }
                @media (prefers-color-scheme: dark) {
                    .action-btn       { color: #A8A094; }
                    .action-btn:hover { background: rgba(214,185,106,0.12); color: #F4EEE9; }
                }

                /* ── State panel (portal) ── */
                .state-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 99998;
                    background: rgba(18,7,12,0.42);
                    backdrop-filter: blur(2px);
                }
                .state-panel {
                    width: 230px;
                    z-index: 99999;
                    border-radius: 0.85rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: rgba(255,255,255,0.98);
                    box-shadow: 0 18px 40px rgba(40,15,25,0.22);
                    padding: 0.35rem;
                    backdrop-filter: blur(8px);
                }
                .state-panel.is-mobile {
                    position: fixed;
                    left: 1rem;
                    right: 1rem;
                    bottom: 1rem;
                    top: auto;
                    width: auto;
                    max-height: min(76vh, 430px);
                    overflow-y: auto;
                    border-radius: 1.15rem;
                    padding: 0.65rem;
                    z-index: 99999;
                }
                @media (prefers-color-scheme: dark) {
                    .state-panel {
                        background: #2A141D;
                        border-color: rgba(214,185,106,0.22);
                        box-shadow: 0 18px 40px rgba(0,0,0,0.5);
                    }
                }
                .state-panel-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 0.75rem;
                    padding: 0.35rem 0.45rem 0.55rem;
                }
                .state-panel-title {
                    font-size: 0.66rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #9A8B7B;
                }
                .state-panel-subtitle {
                    max-width: 16rem;
                    margin-top: 0.15rem;
                    color: #24151A;
                    font-size: 0.82rem;
                    font-weight: 800;
                    line-height: 1.2;
                }
                .state-panel-close {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    border: 0;
                    border-radius: 0.7rem;
                    background: rgba(107,18,48,0.08);
                    color: #6B1230;
                    cursor: pointer;
                }
                .state-panel-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    padding: 0.58rem 0.65rem;
                    border-radius: 0.65rem;
                    background: transparent;
                    border: none;
                    text-align: left;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: inherit;
                    cursor: pointer;
                    transition: background .12s;
                }
                .state-panel.is-mobile .state-panel-item { padding: 0.8rem 0.75rem; font-size: 0.95rem; }
                .state-panel-item:hover:not(:disabled)    { background: rgba(107,18,48,0.08); }
                .state-panel-item.is-current              { opacity: 0.55; cursor: default; }
                @media (prefers-color-scheme: dark) {
                    .state-panel-subtitle              { color: #F4EEE9; }
                    .state-panel-close                 { background: rgba(214,185,106,0.12); color: #D6B96A; }
                    .state-panel-item:hover:not(:disabled) { background: rgba(214,185,106,0.12); }
                }

                /* ── Combobox ── */
                .combo-root { position: relative; }
                .combo-trigger {
                    width: 100%;
                    min-height: 2.55rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.75);
                    padding: 0.5rem 0.6rem 0.5rem 0.78rem;
                    color: #24151A;
                    font-size: 0.875rem;
                    text-align: left;
                    cursor: pointer;
                    transition: border-color .18s, background .18s, box-shadow .18s;
                }
                .combo-trigger:hover         { border-color: rgba(107,18,48,0.28); }
                .combo-trigger:focus-visible  { outline: none; border-color: #6B1230; box-shadow: 0 0 0 3px rgba(107,18,48,0.10); }
                @media (prefers-color-scheme: dark) {
                    .combo-trigger       { border-color: rgba(214,185,106,0.14); background: #2B1620; color: #F4EEE9; }
                    .combo-trigger:hover { border-color: rgba(214,185,106,0.32); }
                }
                .combo-text        { color: inherit; font-weight: 600; }
                .combo-placeholder { color: #9A8B7B; }
                @media (prefers-color-scheme: dark) {
                    .combo-placeholder { color: #A89889; }
                }
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
                @media (prefers-color-scheme: dark) {
                    .combo-panel { border-color: rgba(214,185,106,0.22); background: #2A141D; box-shadow: 0 16px 36px rgba(0,0,0,0.45); }
                }
                .combo-search {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.55rem 0.7rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                    background: rgba(250,248,245,0.7);
                }
                @media (prefers-color-scheme: dark) {
                    .combo-search { border-bottom-color: rgba(214,185,106,0.16); background: rgba(255,255,255,0.04); }
                }
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
            `}</style>

            <div className="page-container">
                <div className="shell-container">

                    {/* Cabecera */}
                    <section className="glass-card">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="eyebrow">
                                    <FolderKanban className="h-4 w-4" />
                                    Gestion de Grado
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mt-1">
                                    Repositorio de Proyectos
                                </h1>
                                <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-1">
                                    Administracion y seguimiento de proyectos de grado activos.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Link href="/proyectos/papelera" className="papelera-link">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Papelera
                                    {eliminados_count !== undefined && eliminados_count > 0 && (
                                        <span className="badge">{eliminados_count}</span>
                                    )}
                                </Link>

                                <Button
                                    asChild
                                    className="rounded-xl bg-[#6B1230] font-bold text-white hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620]"
                                >
                                    <Link href="/proyectos/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nuevo Proyecto
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Filtros */}
                    <section className="glass-card is-filters">
                        <div className="p-6">
                            <div className="eyebrow mb-4">
                                <Filter className="h-4 w-4" />
                                Parametros de busqueda
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="filter-label">Busqueda general</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            type="text"
                                            placeholder="Titulo del proyecto..."
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={values.busqueda}
                                            onChange={(e) => updateAndFilter({ busqueda: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="filter-label">Estudiante</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                        <input
                                            type="text"
                                            placeholder="Nombre del estudiante..."
                                            className="custom-select"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={values.estudiante_buscar}
                                            onChange={(e) => updateAndFilter({ estudiante_buscar: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="filter-label">Periodo</label>
                                    <SearchableCombobox
                                        options={[
                                            { id: '', label: 'Todos los periodos' },
                                            ...periodos.map((p) => ({ id: String(p.id), label: p.nombre })),
                                        ]}
                                        value={values.periodo_id || ''}
                                        onChange={(v) => updateAndFilter({ periodo_id: v })}
                                        placeholder="Todos los periodos"
                                        emptyText="Sin coincidencias"
                                    />
                                </div>

                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="filter-label">Tutor</label>
                                    <SearchableCombobox
                                        options={[
                                            { id: '', label: 'Todos los tutores' },
                                            ...tutores.map((t) => ({ id: String(t.id), label: t.name })),
                                        ]}
                                        value={values.tutor_id || ''}
                                        onChange={(v) => updateAndFilter({ tutor_id: v })}
                                        placeholder="Todos los tutores"
                                        emptyText="Sin coincidencias"
                                    />
                                </div>

                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="filter-label">Estado</label>
                                    <SearchableCombobox
                                        options={[
                                            { id: '', label: 'Todos los estados' },
                                            ...ESTADOS_OPTIONS.map((e) => ({ id: e.value, label: e.label })),
                                        ]}
                                        value={values.estado || ''}
                                        onChange={(v) => updateAndFilter({ estado: v })}
                                        placeholder="Todos los estados"
                                        emptyText="Sin coincidencias"
                                    />
                                </div>

                                <div className="md:col-span-4">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl w-full"
                                        onClick={() => {
                                            const reset: Filters = {
                                                busqueda: '',
                                                periodo_id: '',
                                                tutor_id: '',
                                                estudiante_buscar: '',
                                                estado: '',
                                            };
                                            setValues(reset);
                                            handleFilter(reset);
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Limpiar filtros
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tabla */}
                    <section className="glass-card is-table">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.15em] text-[#8A8074] dark:border-[#D6B96A]/14">
                                        <th className="px-6 py-5 font-black">Titulo</th>
                                        <th className="px-6 py-5 font-black">Estudiante</th>
                                        <th className="px-6 py-5 font-black">Tutor</th>
                                        <th className="px-6 py-5 font-black">Periodo</th>
                                        <th className="px-6 py-5 font-black">Estado</th>
                                        <th className="px-6 py-5 font-black text-right">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#6B1230]/5 dark:divide-[#D6B96A]/5">
                                    {proyectos.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <FolderKanban className="h-12 w-12 mb-2 stroke-[1]" />
                                                    <p className="font-bold text-lg">No se hallaron resultados</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        proyectos.data.map((p) => {
                                            const estadoMeta = ESTADO_COLOR[p.estado] ?? {
                                                color: '#9A8B7B',
                                                label: p.estado,
                                            };

                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="group hover:bg-[#6B1230]/5 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-6 py-4 max-w-md">
                                                        <div className="font-bold text-[#24151A] dark:text-white leading-snug">
                                                            {p.titulo}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                            <UserCircle className="h-4 w-4" />
                                                            {p.estudiante?.name ?? '—'}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                            <Briefcase className="h-4 w-4" />
                                                            {p.tutor?.name ?? '—'}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                            <CalendarDays className="h-4 w-4" />
                                                            {p.periodo?.nombre || 'Pendiente'}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="estado-chip"
                                                            style={{
                                                                background: `${estadoMeta.color}1A`,
                                                                color: estadoMeta.color,
                                                            }}
                                                        >
                                                            <span
                                                                className="estado-dot"
                                                                style={{ background: estadoMeta.color }}
                                                            />
                                                            {estadoMeta.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={`/proyectos/${p.id}/edit`}
                                                                className="action-btn"
                                                                title="Editar"
                                                                aria-label="Editar"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>

                                                            <StatePicker proyecto={p} />

                                                            <button
                                                                type="button"
                                                                className="action-btn is-delete"
                                                                onClick={() => setDeleteTarget(p)}
                                                                title="Eliminar"
                                                                aria-label="Eliminar"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}