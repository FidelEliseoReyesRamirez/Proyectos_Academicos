import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, FolderPlus, Briefcase, Calendar, User as UserIcon,
    Tag, AlignLeft, Search, X, Check, ChevronDown, Layers, BookOpen, Users,
} from 'lucide-react';
import { FormEvent, useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Periodo = { id: number; nombre: string };
type Usuario = { id: number; name: string };

type Props = {
    periodos: Periodo[];
    estudiantes: Usuario[];
    tutores: Usuario[];
    revisores: Usuario[];
};

const MODALIDADES = [
    { value: 'proyecto_grado',   label: 'Proyecto de Grado' },
    { value: 'tesis',            label: 'Tesis' },
    { value: 'excelencia',       label: 'Excelencia' },
    { value: 'trabajo_dirigido', label: 'Trabajo Dirigido' },
];

const AREAS_TEMATICAS = [
    'Inteligencia Artificial',
    'Aprendizaje Automatico',
    'Procesamiento de Lenguaje Natural',
    'Vision por Computadora',
    'Sistemas Web',
    'Aplicaciones Moviles',
    'Bases de Datos',
    'Big Data y Analitica',
    'Ciberseguridad',
    'Redes y Telecomunicaciones',
    'Cloud Computing',
    'Internet de las Cosas (IoT)',
    'Blockchain',
    'Realidad Virtual / Aumentada',
    'Sistemas Embebidos',
    'DevOps',
    'Sistemas Distribuidos',
    'Desarrollo de Videojuegos',
];

// ============================================================
// Combobox de seleccion unica con busqueda.
// ============================================================
function SearchableCombobox({
    options, value, onChange, placeholder, emptyText,
}: {
    options: { id: number | string; label: string }[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    emptyText: string;
}) {
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef        = useRef<HTMLDivElement>(null);

    const selected = useMemo(
        () => options.find(o => String(o.id) === String(value)),
        [options, value],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
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
            <button type="button" className="combo-trigger" onClick={() => setOpen(o => !o)}>
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
                            onChange={e => setQuery(e.target.value)}
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
                        ) : filtered.map(opt => {
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
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================
// Multiseleccion con chips para areas tematicas (valores string).
// ============================================================
function MultiSelectChips({
    options, values, onChange, placeholder,
}: {
    options: string[];
    values: string[];
    onChange: (vals: string[]) => void;
    placeholder: string;
}) {
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef        = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? options.filter(o => o.toLowerCase().includes(q)) : options;
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

    const toggle = (val: string) =>
        onChange(values.includes(val) ? values.filter(v => v !== val) : [...values, val]);

    return (
        <div className="combo-root" ref={wrapperRef}>
            <button type="button" className="combo-trigger combo-trigger-multi" onClick={() => setOpen(o => !o)}>
                {values.length === 0 ? (
                    <span className="combo-placeholder">{placeholder}</span>
                ) : (
                    <div className="chips">
                        {values.map(v => (
                            <span
                                key={v}
                                className="chip"
                                onClick={e => { e.stopPropagation(); toggle(v); }}
                            >
                                {v}
                                <X className="h-3 w-3 opacity-80" />
                            </span>
                        ))}
                    </div>
                )}
                <ChevronDown className="combo-chev" />
            </button>

            {open && (
                <div className="combo-panel">
                    <div className="combo-search">
                        <Search className="h-3.5 w-3.5 opacity-60" />
                        <input
                            autoFocus
                            className="combo-search-input"
                            placeholder="Buscar areas..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="combo-list">
                        {filtered.length === 0 ? (
                            <div className="combo-empty">Sin coincidencias</div>
                        ) : filtered.map(opt => {
                            const checked = values.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`combo-item ${checked ? 'is-selected' : ''}`}
                                    onClick={() => toggle(opt)}
                                >
                                    <span>{opt}</span>
                                    {checked && <Check className="h-4 w-4" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================
// Multiseleccion con busqueda e IDs (para revisores).
// Soporta limite maximo y exclusion dinamica de opciones.
// ============================================================
function SearchableMultiCombobox({
    options, values, onChange, placeholder, emptyText,
    maxSelections, excludeIds = [], hintText,
}: {
    options: { id: number | string; label: string }[];
    values: string[];
    onChange: (vals: string[]) => void;
    placeholder: string;
    emptyText: string;
    maxSelections?: number;
    excludeIds?: string[];
    hintText?: string;
}) {
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef        = useRef<HTMLDivElement>(null);

    const excludeSet = useMemo(() => new Set(excludeIds.map(String)), [excludeIds]);

    const visibleOptions = useMemo(
        () => options.filter(o => !excludeSet.has(String(o.id))),
        [options, excludeSet],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? visibleOptions.filter(o => o.label.toLowerCase().includes(q)) : visibleOptions;
    }, [visibleOptions, query]);

    const selectedItems = useMemo(
        () => values
            .map(v => options.find(o => String(o.id) === String(v)))
            .filter((o): o is { id: number | string; label: string } => Boolean(o)),
        [values, options],
    );

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

    // Si cambia la exclusion (ej: el tutor) y un revisor seleccionado coincide, lo quita.
    useEffect(() => {
        const filteredValues = values.filter(v => !excludeSet.has(String(v)));
        if (filteredValues.length !== values.length) {
            onChange(filteredValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [excludeSet]);

    const toggle = (id: string) => {
        if (values.includes(id)) {
            onChange(values.filter(v => v !== id));
            return;
        }
        if (maxSelections !== undefined && values.length >= maxSelections) return;
        onChange([...values, id]);
    };

    const atLimit = maxSelections !== undefined && values.length >= maxSelections;

    return (
        <div className="combo-root" ref={wrapperRef}>
            <button type="button" className="combo-trigger combo-trigger-multi" onClick={() => setOpen(o => !o)}>
                {selectedItems.length === 0 ? (
                    <span className="combo-placeholder">{placeholder}</span>
                ) : (
                    <div className="chips">
                        {selectedItems.map(item => (
                            <span
                                key={item.id}
                                className="chip"
                                onClick={e => { e.stopPropagation(); toggle(String(item.id)); }}
                            >
                                {item.label}
                                <X className="h-3 w-3 opacity-80" />
                            </span>
                        ))}
                    </div>
                )}
                <ChevronDown className="combo-chev" />
            </button>

            {open && (
                <div className="combo-panel">
                    <div className="combo-search">
                        <Search className="h-3.5 w-3.5 opacity-60" />
                        <input
                            autoFocus
                            className="combo-search-input"
                            placeholder="Escribe para buscar..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="combo-list">
                        {filtered.length === 0 ? (
                            <div className="combo-empty">{emptyText}</div>
                        ) : filtered.map(opt => {
                            const id = String(opt.id);
                            const checked = values.includes(id);
                            const blocked = !checked && atLimit;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    disabled={blocked}
                                    className={`combo-item ${checked ? 'is-selected' : ''} ${blocked ? 'is-disabled' : ''}`}
                                    onClick={() => toggle(id)}
                                >
                                    <span>{opt.label}</span>
                                    {checked && <Check className="h-4 w-4" />}
                                </button>
                            );
                        })}
                    </div>
                    {(maxSelections !== undefined || hintText) && (
                        <div className="combo-hint">
                            {hintText ?? ''}
                            {maxSelections !== undefined && (
                                <span style={{ float: 'right' }}>
                                    {values.length} / {maxSelections}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================================
// Pagina: crear proyecto.
// ============================================================
export default function ProyectosCreate({ periodos, estudiantes, tutores, revisores }: Props) {
    const form = useForm<{
        titulo: string;
        descripcion: string;
        modalidad: string;
        area_tematica: string[];
        periodo_id: string;
        estudiante_id: string;
        tutor_id: string;
        revisores_ids: string[];
    }>({
        titulo: '',
        descripcion: '',
        modalidad: '',
        area_tematica: [],
        periodo_id: periodos.length === 1 ? String(periodos[0].id) : '',
        estudiante_id: '',
        tutor_id: '',
        revisores_ids: [],
    });

    const sinPeriodos = periodos.length === 0;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/proyectos', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Crear proyecto" />

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

                .users-shell { padding: 1rem; display: grid; gap: 1.25rem; }
                @media (min-width: 768px) { .users-shell { padding: 1.5rem; gap: 1.5rem; } }

                .users-card {
                    max-width: 880px;
                    overflow: visible;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.78);
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
                    padding: 1.5rem 1.5rem 1.25rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                    position: relative;
                }
                .users-card-header::before {
                    content: '';
                    position: absolute;
                    left: 1.5rem; top: 1.5rem; bottom: 1.25rem;
                    width: 3px;
                    border-radius: 2px;
                    background: linear-gradient(180deg, #6B1230, #C9A84C);
                }
                @media (prefers-color-scheme: dark) {
                    .users-card-header { border-bottom-color: rgba(214,185,106,0.14); }
                    .users-card-header::before { background: linear-gradient(180deg, #D4849A, #D6B96A); }
                }
                .users-card-header-inner { padding-left: 1rem; }

                .users-eyebrow {
                    display: inline-flex; align-items: center; gap: 0.45rem;
                    color: #9A6C18;
                    font-size: 0.68rem; font-weight: 900;
                    letter-spacing: 0.13em; text-transform: uppercase;
                }
                @media (prefers-color-scheme: dark) { .users-eyebrow { color: #D6B96A; } }

                .users-title {
                    margin-top: 0.5rem;
                    font-size: 1.75rem;
                    line-height: 1.15;
                    font-weight: 900;
                    letter-spacing: -0.01em;
                    color: #24151A;
                }
                @media (prefers-color-scheme: dark) { .users-title { color: #F4EEE9; } }

                .users-description {
                    margin-top: 0.45rem;
                    max-width: 48rem;
                    font-size: 0.9rem; line-height: 1.65;
                    color: #6E6458;
                }
                @media (prefers-color-scheme: dark) { .users-description { color: #D7C9C0; } }

                .field-label {
                    font-size: 0.78rem; font-weight: 800;
                    color: #24151A;
                    display: flex; align-items: center; gap: 0.4rem;
                    letter-spacing: 0.01em;
                }
                .field-label .opt { font-weight: 600; color: #9A8B7B; letter-spacing: 0; }
                @media (prefers-color-scheme: dark) { .field-label { color: #F4EEE9; } }

                .field-input {
                    width: 100%;
                    margin-top: 0.35rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    background: rgba(255,255,255,0.72);
                    padding: 0.62rem 0.78rem;
                    color: #24151A;
                    outline: none;
                    transition: border-color .18s, background .18s, box-shadow .18s;
                }
                .field-input:focus {
                    border-color: #6B1230;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) {
                    .field-input {
                        border-color: rgba(214,185,106,0.16);
                        background: rgba(255,255,255,0.055);
                        color: #F4EEE9;
                    }
                    .field-input:focus {
                        border-color: #D6B96A;
                        background: rgba(255,255,255,0.08);
                        box-shadow: 0 0 0 3px rgba(214,185,106,0.14);
                    }
                }

                .error-text {
                    margin-top: 0.3rem;
                    font-size: 0.78rem;
                    color: #b91c1c;
                    font-weight: 700;
                }
                @media (prefers-color-scheme: dark) { .error-text { color: #fda4af; } }

                .info-banner {
                    margin: 0 1.5rem 0;
                    padding: 0.7rem 0.9rem;
                    border-radius: 0.8rem;
                    border: 1px dashed rgba(107,18,48,0.25);
                    background: rgba(201,168,76,0.10);
                    color: #6B1230;
                    font-size: 0.82rem;
                    font-weight: 600;
                }
                @media (prefers-color-scheme: dark) {
                    .info-banner {
                        border-color: rgba(214,185,106,0.30);
                        background: rgba(214,185,106,0.08);
                        color: #F4EEE9;
                    }
                }

                /* ===== Combobox ===== */
                .combo-root { position: relative; margin-top: 0.35rem; }

                .combo-trigger {
                    width: 100%;
                    min-height: 2.55rem;
                    display: flex; align-items: center; gap: 0.5rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    background: rgba(255,255,255,0.72);
                    padding: 0.5rem 0.6rem 0.5rem 0.78rem;
                    color: #24151A;
                    font-size: 0.875rem;
                    text-align: left;
                    cursor: pointer;
                    transition: border-color .18s, background .18s, box-shadow .18s;
                }
                .combo-trigger:hover { border-color: rgba(107,18,48,0.28); }
                .combo-trigger:focus-visible {
                    outline: none;
                    border-color: #6B1230;
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) {
                    .combo-trigger {
                        border-color: rgba(214,185,106,0.16);
                        background: rgba(255,255,255,0.055);
                        color: #F4EEE9;
                    }
                    .combo-trigger:hover { border-color: rgba(214,185,106,0.32); }
                    .combo-trigger:focus-visible {
                        border-color: #D6B96A;
                        box-shadow: 0 0 0 3px rgba(214,185,106,0.14);
                    }
                }

                .combo-trigger-multi { align-items: flex-start; padding: 0.4rem 0.5rem 0.4rem 0.55rem; }
                .combo-text { color: inherit; font-weight: 600; }
                .combo-placeholder { color: #9A8B7B; }
                @media (prefers-color-scheme: dark) { .combo-placeholder { color: #A89889; } }
                .combo-chev { margin-left: auto; height: 1rem; width: 1rem; opacity: 0.6; flex-shrink: 0; }

                .chips { display: flex; flex-wrap: wrap; gap: 0.3rem; }
                .chip {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    padding: 0.18rem 0.55rem;
                    border-radius: 999px;
                    background: rgba(107,18,48,0.10);
                    color: #6B1230;
                    font-size: 0.74rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background .15s;
                }
                .chip:hover { background: rgba(107,18,48,0.18); }
                @media (prefers-color-scheme: dark) {
                    .chip { background: rgba(214,185,106,0.16); color: #F4EEE9; }
                    .chip:hover { background: rgba(214,185,106,0.26); }
                }

                .combo-panel {
                    position: absolute;
                    z-index: 50;
                    top: calc(100% + 6px);
                    left: 0; right: 0;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: rgba(255,255,255,0.98);
                    box-shadow: 0 16px 36px rgba(40,15,25,0.18);
                    overflow: hidden;
                    backdrop-filter: blur(8px);
                }
                @media (prefers-color-scheme: dark) {
                    .combo-panel {
                        border-color: rgba(214,185,106,0.22);
                        background: #2A141D;
                        box-shadow: 0 16px 36px rgba(0,0,0,0.45);
                    }
                }

                .combo-search {
                    display: flex; align-items: center; gap: 0.4rem;
                    padding: 0.55rem 0.7rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                    background: rgba(250,248,245,0.7);
                }
                @media (prefers-color-scheme: dark) {
                    .combo-search {
                        border-bottom-color: rgba(214,185,106,0.16);
                        background: rgba(255,255,255,0.04);
                    }
                }
                .combo-search-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 0.85rem;
                    color: inherit;
                }
                .combo-clear {
                    background: transparent; border: none; cursor: pointer;
                    color: inherit; opacity: 0.55; padding: 0.1rem;
                }
                .combo-clear:hover { opacity: 1; }

                .combo-list { max-height: 240px; overflow-y: auto; padding: 0.3rem; }
                .combo-item {
                    width: 100%;
                    display: flex; align-items: center; justify-content: space-between;
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
                .combo-item:hover { background: rgba(107,18,48,0.08); }
                .combo-item.is-selected {
                    background: rgba(107,18,48,0.12);
                    color: #6B1230;
                    font-weight: 700;
                }
                .combo-item.is-disabled {
                    opacity: 0.38;
                    cursor: not-allowed;
                }
                .combo-item.is-disabled:hover {
                    background: transparent;
                }
                @media (prefers-color-scheme: dark) {
                    .combo-item:hover { background: rgba(214,185,106,0.10); }
                    .combo-item.is-selected { background: rgba(214,185,106,0.16); color: #F4EEE9; }
                }
                .combo-empty {
                    padding: 0.9rem;
                    text-align: center;
                    font-size: 0.82rem;
                    color: #9A8B7B;
                }

                .combo-hint {
                    padding: 0.45rem 0.75rem;
                    border-top: 1px solid rgba(107,18,48,0.10);
                    background: rgba(250,248,245,0.7);
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    color: #6E6458;
                }
                @media (prefers-color-scheme: dark) {
                    .combo-hint {
                        border-top-color: rgba(214,185,106,0.16);
                        background: rgba(255,255,255,0.04);
                        color: #D7C9C0;
                    }
                }
            `}</style>

            <div className="users-page">
                <div className="users-shell">
                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="users-card-header-inner">
                                <div className="users-eyebrow">
                                    <FolderPlus className="h-4 w-4" />
                                    Nuevo Registro
                                </div>
                                <h1 className="users-title">Crear Proyecto Academico</h1>
                                <p className="users-description">
                                    Completa la informacion del proyecto. El codigo se genera automaticamente
                                    al guardar y el estado inicial sera <strong>En revision</strong>.
                                </p>
                            </div>
                        </div>

                        {sinPeriodos && (
                            <div className="info-banner" style={{ marginTop: '1rem' }}>
                                No hay periodos academicos activos y vigentes en este momento.
                                Pide al coordinador que active o cree uno antes de registrar proyectos.
                            </div>
                        )}

                        <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">

                            {/* Codigo (read-only, autogenerado) */}
                            <div>
                                <label className="field-label">
                                    <Tag className="h-3 w-3" /> Codigo
                                </label>
                                <Input
                                    className="field-input font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                                    value="Se asigna al guardar"
                                    disabled
                                    readOnly
                                />
                            </div>

                            {/* Periodo */}
                            <div>
                                <label className="field-label">
                                    <Calendar className="h-3 w-3" /> Periodo Academico
                                </label>
                                <SearchableCombobox
                                    options={periodos.map(p => ({ id: p.id, label: p.nombre }))}
                                    value={form.data.periodo_id}
                                    onChange={v => form.setData('periodo_id', v)}
                                    placeholder={sinPeriodos ? 'Sin periodos vigentes' : 'Selecciona un periodo'}
                                    emptyText="No hay coincidencias"
                                />
                                {form.errors.periodo_id && <div className="error-text">{form.errors.periodo_id}</div>}
                            </div>

                            {/* Titulo */}
                            <div className="md:col-span-2">
                                <label className="field-label">
                                    <BookOpen className="h-3 w-3" /> Titulo del proyecto
                                </label>
                                <Input
                                    className="field-input"
                                    value={form.data.titulo}
                                    onChange={e => form.setData('titulo', e.target.value)}
                                    placeholder="Ej: Sistema de recomendacion academica basado en redes neuronales"
                                    maxLength={255}
                                />
                                {form.errors.titulo && <div className="error-text">{form.errors.titulo}</div>}
                            </div>

                            {/* Descripcion */}
                            <div className="md:col-span-2">
                                <label className="field-label">
                                    <AlignLeft className="h-3 w-3" /> Descripcion
                                    <span className="opt">(opcional)</span>
                                </label>
                                <textarea
                                    className="field-input min-h-[110px] resize-y"
                                    value={form.data.descripcion}
                                    onChange={e => form.setData('descripcion', e.target.value)}
                                    placeholder="Resumen breve del problema, el aporte principal y el alcance..."
                                />
                                {form.errors.descripcion && <div className="error-text">{form.errors.descripcion}</div>}
                            </div>

                            {/* Modalidad */}
                            <div>
                                <label className="field-label">
                                    <Briefcase className="h-3 w-3" /> Modalidad
                                </label>
                                <SearchableCombobox
                                    options={MODALIDADES.map(m => ({ id: m.value, label: m.label }))}
                                    value={form.data.modalidad}
                                    onChange={v => form.setData('modalidad', v)}
                                    placeholder="Selecciona modalidad"
                                    emptyText="Sin coincidencias"
                                />
                                {form.errors.modalidad && <div className="error-text">{form.errors.modalidad}</div>}
                            </div>

                            {/* Areas tematicas */}
                            <div>
                                <label className="field-label">
                                    <Layers className="h-3 w-3" /> Areas tematicas
                                    <span className="opt">(opcional, puedes elegir varias)</span>
                                </label>
                                <MultiSelectChips
                                    options={AREAS_TEMATICAS}
                                    values={form.data.area_tematica}
                                    onChange={v => form.setData('area_tematica', v)}
                                    placeholder="Selecciona una o mas areas"
                                />
                                {form.errors.area_tematica && <div className="error-text">{form.errors.area_tematica}</div>}
                            </div>

                            {/* Estudiante */}
                            <div>
                                <label className="field-label">
                                    <UserIcon className="h-3 w-3" /> Estudiante asignado
                                </label>
                                <SearchableCombobox
                                    options={estudiantes.map(e => ({ id: e.id, label: e.name }))}
                                    value={form.data.estudiante_id}
                                    onChange={v => form.setData('estudiante_id', v)}
                                    placeholder="Escribe para buscar..."
                                    emptyText="Sin coincidencias"
                                />
                                {form.errors.estudiante_id && <div className="error-text">{form.errors.estudiante_id}</div>}
                            </div>

                            {/* Tutor */}
                            <div>
                                <label className="field-label">
                                    <Briefcase className="h-3 w-3" /> Tutor asignado
                                </label>
                                <SearchableCombobox
                                    options={tutores.map(t => ({ id: t.id, label: t.name }))}
                                    value={form.data.tutor_id}
                                    onChange={v => form.setData('tutor_id', v)}
                                    placeholder="Escribe para buscar..."
                                    emptyText="Sin coincidencias"
                                />
                                {form.errors.tutor_id && <div className="error-text">{form.errors.tutor_id}</div>}
                            </div>

                            {/* Revisores - opcional, maximo 2, excluye al tutor */}
                            <div className="md:col-span-2">
                                <label className="field-label">
                                    <Users className="h-3 w-3" /> Revisores asignados
                                    <span className="opt">(opcional, hasta 2 docentes)</span>
                                </label>
                                <SearchableMultiCombobox
                                    options={revisores.map(r => ({ id: r.id, label: r.name }))}
                                    values={form.data.revisores_ids}
                                    onChange={v => form.setData('revisores_ids', v)}
                                    placeholder="Busca y selecciona hasta 2 revisores..."
                                    emptyText="Sin coincidencias"
                                    maxSelections={2}
                                    excludeIds={form.data.tutor_id ? [form.data.tutor_id] : []}
                                    hintText="El tutor del proyecto no aparece en la lista"
                                />
                                {form.errors.revisores_ids && (
                                    <div className="error-text">{form.errors.revisores_ids}</div>
                                )}
                                {form.errors['revisores_ids.0'] && (
                                    <div className="error-text">{form.errors['revisores_ids.0']}</div>
                                )}
                                {form.errors['revisores_ids.1'] && (
                                    <div className="error-text">{form.errors['revisores_ids.1']}</div>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-wrap gap-2 pt-4 md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing || sinPeriodos}
                                    className="rounded-xl bg-[#6B1230] px-6 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620] dark:hover:bg-[#E3A1B2]"
                                >
                                    <FolderPlus className="h-4 w-4" />
                                    {form.processing ? 'Guardando...' : 'Guardar proyecto'}
                                </Button>

                                <Button asChild type="button" variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                    <Link href="/proyectos">
                                        <ArrowLeft className="h-4 w-4" />
                                        Volver
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}

ProyectosCreate.layout = {
    breadcrumbs: [
        { title: 'Proyectos', href: '/proyectos' },
        { title: 'Crear',     href: '/proyectos/crear' },
    ],
};