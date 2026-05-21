import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    AlertCircle, ArrowLeft, Check, ChevronDown, Eye, EyeOff, IdCard,
    KeyRound, Mail, Phone, Search, ShieldCheck, Sparkles, UserPlus, UserRound,
    X, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = { roles: string[]; };

const roleLabels: Record<string, string> = {
    estudiante:  'Estudiante',
    tutor:       'Tutor',
    revisor:     'Revisor',
    coordinador: 'Coordinador',
    admin:       'Administrador',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
    estudiante:  'Usuario que cursa una carrera y desarrolla proyectos de grado.',
    tutor:       'Acompaña a estudiantes durante su proyecto de grado.',
    revisor:     'Evalúa proyectos y emite observaciones formales.',
    coordinador: 'Administra periodos, proyectos y revisores del programa.',
    admin:       'Acceso total al sistema (gestiona usuarios y configuración).',
};

const ESTADO_OPTIONS = [
    { id: '1', label: 'Activo (puede iniciar sesión)' },
    { id: '0', label: 'Inactivo (no puede iniciar sesión)' },
];

/* ─────────────────────────────────────────────────────────────
   SearchableCombobox
   ───────────────────────────────────────────────────────────── */
function SearchableCombobox({
    options, value, onChange, placeholder, emptyText, error,
}: {
    options: { id: number | string; label: string }[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    emptyText: string;
    error?: boolean;
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
                className={`combo-trigger ${error ? 'has-error' : ''}`}
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
   ConfirmModal (al salir con cambios sin guardar)
   ───────────────────────────────────────────────────────────── */
function ConfirmModal({
    open, title, message, confirmText, cancelText, variant = 'default', onConfirm, onCancel,
}: {
    open: boolean;
    title: string;
    message: React.ReactNode;
    confirmText: string;
    cancelText: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [open, onCancel]);

    if (!open) return null;

    return createPortal(
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className={`modal-icon ${variant === 'danger' ? 'is-danger' : ''}`}>
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h2>{title}</h2>
                        <p className="modal-message">{message}</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onCancel} title="Cerrar (Esc)">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="modal-actions">
                    <button type="button" className="modal-btn modal-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`modal-btn ${variant === 'danger' ? 'modal-btn-danger' : 'modal-btn-primary'}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ─────────────────────────────────────────────────────────────
   Helpers de contraseña
   ───────────────────────────────────────────────────────────── */
const passwordChecks = (pwd: string) => ({
    length:    pwd.length >= 8,
    upper:     /[A-Z]/.test(pwd),
    lower:     /[a-z]/.test(pwd),
    number:    /[0-9]/.test(pwd),
    symbol:    /[^A-Za-z0-9]/.test(pwd),
});

const generatePassword = (): string => {
    const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower   = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*?-_';
    const all     = upper + lower + numbers + symbols;
    const pick    = (pool: string) => pool[Math.floor(Math.random() * pool.length)];
    const base    = [pick(upper), pick(lower), pick(numbers), pick(symbols)];
    for (let i = 0; i < 8; i++) base.push(pick(all));
    return base.sort(() => Math.random() - 0.5).join('');
};

/* ─────────────────────────────────────────────────────────────
   Componente principal
   ───────────────────────────────────────────────────────────── */
export default function UsuariosCreate({ roles }: Props) {
    const form = useForm({
        name: '',
        email: '',
        telefono_contacto: '',
        rol: 'estudiante',
        activo: true as boolean,
        password: '',
        password_confirmation: '',
    });

    /* Heurística 1 — loading bar */
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const offStart  = router.on('start',  () => setLoading(true));
        const offFinish = router.on('finish', () => setLoading(false));
        return () => { offStart(); offFinish(); };
    }, []);

    /* Heurística 5 — track de cambios sin guardar para advertir al salir */
    const isDirty = useMemo(() => {
        return !!(
            form.data.name ||
            form.data.email ||
            form.data.telefono_contacto ||
            form.data.password ||
            form.data.password_confirmation ||
            form.data.rol !== 'estudiante' ||
            form.data.activo !== true
        );
    }, [form.data]);

    /* Heurística 5 — advertir al cerrar la pestaña / refrescar */
    useEffect(() => {
        if (!isDirty || form.processing) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty, form.processing]);

    /* Heurística 5 — modal al hacer clic en "Volver" con cambios */
    const [confirmLeave, setConfirmLeave] = useState(false);
    const handleBack = (e: React.MouseEvent) => {
        if (isDirty && !form.processing) {
            e.preventDefault();
            setConfirmLeave(true);
        }
    };

    /* Heurística 1 — autofocus en el primer campo */
    const nameRef = useRef<HTMLInputElement>(null);
    useEffect(() => { nameRef.current?.focus(); }, []);

    /* Mostrar/ocultar contraseña */
    const [showPwd, setShowPwd]   = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);

    /* Heurística 6 — fortaleza de contraseña en vivo */
    const checks = passwordChecks(form.data.password);
    const checksPassed = Object.values(checks).filter(Boolean).length;
    const strengthLabel =
        form.data.password.length === 0 ? '' :
        checksPassed <= 2 ? 'Débil'      :
        checksPassed === 3 ? 'Media'     :
        checksPassed === 4 ? 'Fuerte'    : 'Excelente';
    const strengthColor =
        checksPassed <= 2 ? '#B91C1C'  :
        checksPassed === 3 ? '#EA8A1F' :
        checksPassed === 4 ? '#15803D' : '#0EA5E9';

    /* Match de contraseñas en vivo */
    const pwdMatch =
        form.data.password_confirmation.length === 0
            ? null
            : form.data.password === form.data.password_confirmation;

    /* Generador de contraseña segura */
    const handleGenerate = () => {
        const pwd = generatePassword();
        form.setData('password', pwd);
        form.setData('password_confirmation', pwd);
        setShowPwd(true);
        setShowPwd2(true);
    };

    /* Heurística 9 — foco automático en el primer campo con error */
    const firstErrorKey = Object.keys(form.errors)[0] as keyof typeof form.errors | undefined;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/usuarios', { preserveScroll: true });
    };

    const errorCount = Object.keys(form.errors).length;

    return (
        <>
            <Head title="Crear usuario" />

            {/* Modal: salir sin guardar */}
            <ConfirmModal
                open={confirmLeave}
                title="¿Salir sin guardar?"
                message="Tienes cambios sin guardar en el formulario. Si sales ahora, se perderán."
                confirmText="Sí, salir"
                cancelText="Quedarme"
                variant="danger"
                onCancel={() => setConfirmLeave(false)}
                onConfirm={() => router.visit('/usuarios')}
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

                .users-shell {
                    width: 100%;
                    max-width: 920px;
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

                /* ════════════════ FIELDS ════════════════ */
                .field-group { display: grid; gap: 0.35rem; }

                .field-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.78rem;
                    font-weight: 900;
                    color: #4B4038;
                    letter-spacing: 0.02em;
                }
                .field-label .req { color: #B91C1C; font-weight: 900; }
                @media (prefers-color-scheme: dark) { .field-label { color: #E8DED4; } }

                .field-help {
                    font-size: 0.72rem;
                    color: #8A8074;
                    line-height: 1.45;
                }
                @media (prefers-color-scheme: dark) { .field-help { color: #A9978D; } }

                .input-wrap { position: relative; }
                .input-icon {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 1rem; width: 1rem;
                    opacity: 0.4;
                    pointer-events: none;
                    z-index: 2;
                }
                .input-trailing {
                    position: absolute;
                    right: 0.4rem;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 2;
                }
                .input-trailing button {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 2rem; height: 2rem;
                    border: 0;
                    border-radius: 0.6rem;
                    background: transparent;
                    color: #8A8074;
                    cursor: pointer;
                    transition: background .15s;
                }
                .input-trailing button:hover { background: rgba(107,18,48,0.08); color: #6B1230; }
                @media (prefers-color-scheme: dark) {
                    .input-trailing button       { color: #A89889; }
                    .input-trailing button:hover { background: rgba(214,185,106,0.10); color: #D6B96A; }
                }

                .custom-input {
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
                .custom-input:focus-visible {
                    border-color: #6B1230;
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.10);
                }
                .custom-input.has-icon     { padding-left: 2.5rem; }
                .custom-input.has-trailing { padding-right: 2.7rem; }
                .custom-input.has-error    { border-color: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
                @media (prefers-color-scheme: dark) {
                    .custom-input {
                        border-color: rgba(214,185,106,0.14);
                        background-color: #2B1620;
                        color: #F4EEE9;
                    }
                }

                .error-text {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    margin-top: 0.15rem;
                    font-size: 0.74rem;
                    color: #DC2626;
                    font-weight: 700;
                }
                @media (prefers-color-scheme: dark) { .error-text { color: #FCA5A5; } }

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
                    transition: border-color .18s, box-shadow .18s;
                }
                .combo-trigger:hover         { border-color: rgba(107,18,48,0.28); }
                .combo-trigger:focus-visible { outline: none; border-color: #6B1230; box-shadow: 0 0 0 3px rgba(107,18,48,0.10); }
                .combo-trigger.has-error     { border-color: #DC2626; }
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
                @media (prefers-color-scheme: dark) {
                    .combo-panel { border-color: rgba(214,185,106,0.22); background: #2A141D; box-shadow: 0 16px 36px rgba(0,0,0,0.45); }
                }
                .combo-search {
                    display: flex; align-items: center; gap: 0.4rem;
                    padding: 0.55rem 0.7rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                    background: rgba(250,248,245,0.7);
                }
                @media (prefers-color-scheme: dark) { .combo-search { border-bottom-color: rgba(214,185,106,0.16); background: rgba(255,255,255,0.04); } }
                .combo-search-input { flex: 1; background: transparent; border: none; outline: none; font-size: 0.85rem; color: inherit; }
                .combo-list { max-height: 240px; overflow-y: auto; padding: 0.3rem; }
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

                /* ════════════════ SECTION HEADER ════════════════ */
                .section-divider {
                    display: flex; align-items: center; gap: 0.6rem;
                    margin: 0.5rem 0 -0.25rem;
                }
                .section-divider .line { flex: 1; height: 1px; background: rgba(107,18,48,0.12); }
                @media (prefers-color-scheme: dark) { .section-divider .line { background: rgba(214,185,106,0.16); } }

                /* ════════════════ PASSWORD STRENGTH ════════════════ */
                .strength-bar {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.3rem;
                    margin-top: 0.5rem;
                }
                .strength-segment {
                    height: 0.35rem;
                    border-radius: 999px;
                    background: rgba(107,18,48,0.10);
                    transition: background .25s;
                }
                @media (prefers-color-scheme: dark) { .strength-segment { background: rgba(214,185,106,0.10); } }
                .strength-label {
                    margin-top: 0.4rem;
                    font-size: 0.72rem;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .strength-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 0.4rem;
                    margin-top: 0.55rem;
                    padding: 0.7rem 0.85rem;
                    border-radius: 0.85rem;
                    background: rgba(107,18,48,0.04);
                    border: 1px solid rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) {
                    .strength-grid { background: rgba(214,185,106,0.05); border-color: rgba(214,185,106,0.14); }
                }
                .check-row {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.72rem;
                    color: #8A8074;
                    transition: color .2s;
                }
                .check-row.is-ok       { color: #15803D; font-weight: 700; }
                .check-row .indicator  {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 0.95rem; height: 0.95rem;
                    border-radius: 999px;
                    background: rgba(110,100,88,0.16);
                    color: rgba(110,100,88,0.55);
                    flex-shrink: 0;
                }
                .check-row.is-ok .indicator {
                    background: rgba(22,163,74,0.16);
                    color: #15803D;
                }
                @media (prefers-color-scheme: dark) {
                    .check-row { color: #A9978D; }
                    .check-row.is-ok { color: #4ADE80; }
                    .check-row.is-ok .indicator { background: rgba(74,222,128,0.18); color: #4ADE80; }
                }

                .match-hint {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    margin-top: 0.3rem;
                    font-size: 0.74rem;
                    font-weight: 700;
                }
                .match-hint.is-ok   { color: #15803D; }
                .match-hint.is-bad  { color: #DC2626; }
                @media (prefers-color-scheme: dark) {
                    .match-hint.is-ok  { color: #4ADE80; }
                    .match-hint.is-bad { color: #FCA5A5; }
                }

                .helper-btn {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.3rem 0.65rem;
                    border-radius: 0.55rem;
                    background: rgba(154,108,24,0.10);
                    color: #9A6C18;
                    border: 1px solid rgba(154,108,24,0.20);
                    font-size: 0.72rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all .15s;
                }
                .helper-btn:hover { background: rgba(154,108,24,0.18); }
                @media (prefers-color-scheme: dark) {
                    .helper-btn       { background: rgba(214,185,106,0.10); color: #D6B96A; border-color: rgba(214,185,106,0.22); }
                    .helper-btn:hover { background: rgba(214,185,106,0.20); }
                }

                /* ════════════════ ERROR SUMMARY ════════════════ */
                .error-summary {
                    display: flex; align-items: flex-start; gap: 0.65rem;
                    border-radius: 1rem;
                    border: 1px solid rgba(220,38,38,0.22);
                    background: rgba(220,38,38,0.08);
                    padding: 0.9rem 1rem;
                    color: #B91C1C;
                    font-size: 0.85rem;
                    font-weight: 700;
                }
                @media (prefers-color-scheme: dark) {
                    .error-summary {
                        border-color: rgba(252,165,165,0.28);
                        background: rgba(220,38,38,0.12);
                        color: #FCA5A5;
                    }
                }

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
                .modal-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
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
                .modal-close {
                    flex-shrink: 0;
                    border: 0; background: transparent; cursor: pointer;
                    color: #6E6458;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                }
                .modal-close:hover { background: rgba(107,18,48,0.08); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
                .modal-btn {
                    border: 0;
                    border-radius: 0.75rem;
                    padding: 0.7rem 1.1rem;
                    font-size: 0.85rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all .15s;
                }
                .modal-btn-cancel        { background: rgba(110,100,88,0.12); color: #4B4038; }
                .modal-btn-cancel:hover  { background: rgba(110,100,88,0.20); }
                .modal-btn-primary       { background: #6B1230; color: white; }
                .modal-btn-primary:hover { background: #4A0D21; }
                .modal-btn-danger        { background: #B91C1C; color: white; }
                .modal-btn-danger:hover  { background: #8B1414; }
                @media (prefers-color-scheme: dark) {
                    .modal-card { background: #2B1620; color: #F4EEE9; border-color: rgba(255,255,255,0.12); }
                    .modal-message { color: #CFC4BA; }
                    .modal-close { color: #CFC4BA; }
                    .modal-btn-cancel { background: rgba(255,255,255,0.1); color: #F4EEE9; }
                }

                .role-help {
                    margin-top: 0.4rem;
                    padding: 0.55rem 0.75rem;
                    border-radius: 0.75rem;
                    background: rgba(154,108,24,0.08);
                    border: 1px solid rgba(154,108,24,0.16);
                    color: #6E5318;
                    font-size: 0.74rem;
                    line-height: 1.45;
                }
                @media (prefers-color-scheme: dark) {
                    .role-help { background: rgba(214,185,106,0.06); border-color: rgba(214,185,106,0.18); color: #D6B96A; }
                }
            `}</style>

            {/* Heurística 1 — progreso del sistema */}
            {(loading || form.processing) && <div className="progress-bar" aria-hidden="true" />}

            <div className="users-page">
                <div className="users-shell">
                    <section className="glass-card">
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="eyebrow">
                                        <UserPlus className="h-4 w-4" />
                                        Nuevo usuario
                                    </div>
                                    <h1 className="text-3xl font-black tracking-tight mt-1">
                                        Crear cuenta de usuario
                                    </h1>
                                    <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-2 max-w-2xl leading-7">
                                        Registra una nueva cuenta asignando nombre, correo, rol, estado y contraseña temporal. Los campos marcados con <span className="text-[#B91C1C] font-black">*</span> son obligatorios.
                                    </p>
                                </div>

                                <Link
                                    href="/usuarios"
                                    onClick={handleBack}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#6B1230]/20 px-3.5 py-2 text-sm font-bold text-[#6B1230] hover:bg-[#6B1230]/8 dark:border-[#D6B96A]/30 dark:text-[#D6B96A] dark:hover:bg-[#D6B96A]/10"
                                    title="Volver al directorio de usuarios"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Volver
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card">
                        <form onSubmit={submit} className="p-6 space-y-6">

                            {/* Heurística 9 — Resumen de errores arriba */}
                            {errorCount > 0 && (
                                <div className="error-summary">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div>
                                            {errorCount === 1
                                                ? 'Hay 1 campo con error. Corrígelo antes de continuar.'
                                                : `Hay ${errorCount} campos con errores. Corrígelos antes de continuar.`}
                                        </div>
                                        {firstErrorKey && (
                                            <div className="font-medium opacity-90 mt-0.5">
                                                Primer error: {form.errors[firstErrorKey]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─────────── Sección: Identidad ─────────── */}
                            <div className="section-divider">
                                <div className="eyebrow">
                                    <IdCard className="h-4 w-4" />
                                    Identidad
                                </div>
                                <div className="line" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="field-group">
                                    <label className="field-label" htmlFor="name">
                                        Nombre completo <span className="req">*</span>
                                    </label>
                                    <div className="input-wrap">
                                        <UserRound className="input-icon" />
                                        <input
                                            id="name"
                                            ref={nameRef}
                                            type="text"
                                            className={`custom-input has-icon ${form.errors.name ? 'has-error' : ''}`}
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            placeholder="Ej. Ana María López"
                                            autoComplete="name"
                                            title="Nombre y apellidos completos del usuario"
                                        />
                                    </div>
                                    {form.errors.name && (
                                        <div className="error-text">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {form.errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="field-group">
                                    <label className="field-label" htmlFor="email">
                                        Correo electrónico <span className="req">*</span>
                                    </label>
                                    <div className="input-wrap">
                                        <Mail className="input-icon" />
                                        <input
                                            id="email"
                                            type="email"
                                            className={`custom-input has-icon ${form.errors.email ? 'has-error' : ''}`}
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            autoComplete="email"
                                            title="Será usado para iniciar sesión y recibir notificaciones"
                                        />
                                    </div>
                                    {form.errors.email && (
                                        <div className="error-text">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {form.errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="field-group md:col-span-2">
                                    <label className="field-label" htmlFor="telefono">
                                        Número de celular
                                    </label>
                                    <div className="input-wrap">
                                        <Phone className="input-icon" />
                                        <input
                                            id="telefono"
                                            type="tel"
                                            className={`custom-input has-icon ${form.errors.telefono_contacto ? 'has-error' : ''}`}
                                            value={form.data.telefono_contacto}
                                            onChange={(e) => form.setData('telefono_contacto', e.target.value)}
                                            placeholder="Ej. 76543210"
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <span className="field-help">Opcional. Se usará para contacto académico.</span>
                                    {form.errors.telefono_contacto && (
                                        <div className="error-text">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {form.errors.telefono_contacto}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─────────── Sección: Permisos ─────────── */}
                            <div className="section-divider">
                                <div className="eyebrow">
                                    <ShieldCheck className="h-4 w-4" />
                                    Permisos
                                </div>
                                <div className="line" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="field-group">
                                    <label className="field-label">
                                        Rol <span className="req">*</span>
                                    </label>
                                    <SearchableCombobox
                                        options={roles.map((r) => ({ id: r, label: roleLabels[r] ?? r }))}
                                        value={form.data.rol}
                                        onChange={(v) => form.setData('rol', v)}
                                        placeholder="Selecciona un rol"
                                        emptyText="Sin coincidencias"
                                        error={!!form.errors.rol}
                                    />
                                    {ROLE_DESCRIPTIONS[form.data.rol] && (
                                        <div className="role-help">
                                            {ROLE_DESCRIPTIONS[form.data.rol]}
                                        </div>
                                    )}
                                    {form.errors.rol && (
                                        <div className="error-text">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {form.errors.rol}
                                        </div>
                                    )}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">
                                        Estado inicial <span className="req">*</span>
                                    </label>
                                    <SearchableCombobox
                                        options={ESTADO_OPTIONS}
                                        value={form.data.activo ? '1' : '0'}
                                        onChange={(v) => form.setData('activo', v === '1')}
                                        placeholder="Selecciona un estado"
                                        emptyText="Sin opciones"
                                        error={!!form.errors.activo}
                                    />
                                    <span className="field-help">
                                        Un usuario inactivo no puede iniciar sesión hasta ser reactivado.
                                    </span>
                                    {form.errors.activo && (
                                        <div className="error-text">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {form.errors.activo}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─────────── Sección: Acceso ─────────── */}
                            <div className="section-divider">
                                <div className="eyebrow">
                                    <KeyRound className="h-4 w-4" />
                                    Acceso
                                </div>
                                <div className="line" />
                                <button
                                    type="button"
                                    className="helper-btn"
                                    onClick={handleGenerate}
                                    title="Generar una contraseña segura aleatoria"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Generar segura
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="field-group">
                                    <label className="field-label" htmlFor="password">
                                        Contraseña temporal <span className="req">*</span>
                                    </label>
                                    <div className="input-wrap">
                                        <KeyRound className="input-icon" />
                                        <input
                                            id="password"
                                            type={showPwd ? 'text' : 'password'}
                                            className={`custom-input has-icon has-trailing ${form.errors.password ? 'has-error' : ''}`}
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            autoComplete="new-password"
                                        />
                                        <div className="input-trailing">
                                            <button
                                                type="button"
                                                onClick={() => setShowPwd((v) => !v)}
                                                title={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Heurística 6 — fortaleza visible en vivo */}
                                    {form.data.password.length > 0 && (
                                        <>
                                            <div className="strength-bar">
                                                {[0, 1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className="strength-segment"
                                                        style={{ background: i < checksPassed ? strengthColor : undefined }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="strength-label" style={{ color: strengthColor }}>
                                                Fortaleza: {strengthLabel}
                                            </div>
                                        </>
                                    )}

                                    {/* Heurística 6 — requisitos visibles con checks dinámicos */}
                                    <div className="strength-grid">
                                        <span className={`check-row ${checks.length ? 'is-ok' : ''}`}>
                                            <span className="indicator">
                                                {checks.length ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                                            </span>
                                            Al menos 8 caracteres
                                        </span>
                                        <span className={`check-row ${checks.upper ? 'is-ok' : ''}`}>
                                            <span className="indicator">
                                                {checks.upper ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                                            </span>
                                            Una mayúscula (A-Z)
                                        </span>
                                        <span className={`check-row ${checks.lower ? 'is-ok' : ''}`}>
                                            <span className="indicator">
                                                {checks.lower ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                                            </span>
                                            Una minúscula (a-z)
                                        </span>
                                        <span className={`check-row ${checks.number ? 'is-ok' : ''}`}>
                                            <span className="indicator">
                                                {checks.number ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                                            </span>
                                            Un número (0-9)
                                        </span>
                                        <span className={`check-row ${checks.symbol ? 'is-ok' : ''}`}>
                                            <span className="indicator">
                                                {checks.symbol ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                                            </span>
                                            Un símbolo (! @ # $)
                                        </span>
                                    </div>

                                    {form.errors.password && (
                                        <div className="error-text">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {form.errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="field-group">
                                    <label className="field-label" htmlFor="password_confirmation">
                                        Confirmar contraseña <span className="req">*</span>
                                    </label>
                                    <div className="input-wrap">
                                        <KeyRound className="input-icon" />
                                        <input
                                            id="password_confirmation"
                                            type={showPwd2 ? 'text' : 'password'}
                                            className={`custom-input has-icon has-trailing ${pwdMatch === false ? 'has-error' : ''}`}
                                            value={form.data.password_confirmation}
                                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                            placeholder="Repite la misma contraseña"
                                            autoComplete="new-password"
                                        />
                                        <div className="input-trailing">
                                            <button
                                                type="button"
                                                onClick={() => setShowPwd2((v) => !v)}
                                                title={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                aria-label={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {showPwd2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Heurística 5 — match en vivo */}
                                    {pwdMatch === true && (
                                        <div className="match-hint is-ok">
                                            <Check className="h-3.5 w-3.5" />
                                            Las contraseñas coinciden
                                        </div>
                                    )}
                                    {pwdMatch === false && (
                                        <div className="match-hint is-bad">
                                            <X className="h-3.5 w-3.5" />
                                            Las contraseñas no coinciden
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─────────── Acciones ─────────── */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#6B1230]/10 dark:border-[#D6B96A]/14">
                                <Button
                                    type="submit"
                                    disabled={form.processing || pwdMatch === false}
                                    className="rounded-xl bg-[#6B1230] px-5 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] hover:bg-[#4A0D21] disabled:opacity-60 dark:bg-[#D4849A] dark:text-[#2B1620] dark:hover:bg-[#E3A1B2]"
                                    title="Guardar y crear el usuario en el sistema"
                                >
                                    <ShieldCheck className="h-4 w-4 mr-1" />
                                    {form.processing ? 'Guardando...' : 'Crear usuario'}
                                </Button>

                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    title="Cancelar y volver al directorio"
                                >
                                    <Link href="/usuarios" onClick={handleBack}>
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        Cancelar
                                    </Link>
                                </Button>

                                {isDirty && !form.processing && (
                                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#9A6C18] dark:text-[#D6B96A]">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Tienes cambios sin guardar
                                    </span>
                                )}
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}

UsuariosCreate.layout = {
    breadcrumbs: [
        {
            title: 'Crear usuario',
            href: '/usuarios/crear',
        },
    ],
};