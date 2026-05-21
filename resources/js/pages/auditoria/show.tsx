import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, ClipboardList, ShieldCheck, Copy, Check,
    Hash, User, Target, Globe, Calendar, FileJson, Monitor,
    Fingerprint, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type AuditEventDetail = {
    id: number;
    event_id: string;
    event: string;
    module: string | null;
    aggregate_type: string | null;
    aggregate_id: string | null;
    actor_id: string | null;
    actor_name: string | null;
    actor_email: string | null;
    actor_role: string | null;
    target_name: string | null;
    target_email: string | null;
    description: string | null;
    ip_address: string | null;
    user_agent: string | null;
    payload: unknown;
    occurred_at: string | null;
    created_at: string;
};

type Props = {
    evento: AuditEventDetail | null;
    error?: string | null;
};

/* ─────────────────────────────────────────────────────────────
   Catálogos (idénticos al index para mantener coherencia)
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

function valueOrDash(value?: string | number | null): string {
    return value === null || value === undefined || value === '' ? '—' : String(value);
}

function formatDate(value?: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

/* ─────────────────────────────────────────────────────────────
   Botón de copia al portapapeles
   ───────────────────────────────────────────────────────────── */
function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* noop */
        }
    };

    return (
        <button type="button" className="copy-btn" onClick={handleCopy} title={label}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado' : label}
        </button>
    );
}

/* ─────────────────────────────────────────────────────────────
   Show
   ───────────────────────────────────────────────────────────── */
export default function AuditoriaShow({ evento, error }: Props) {
    const moduleKey = evento?.module ?? '';
    const moduleColor = MODULE_COLOR[moduleKey] ?? '#9A8B7B';
    const moduleLabel = moduleLabels[moduleKey] ?? valueOrDash(evento?.module);
    const eventLabel = evento ? (eventLabels[evento.event] ?? evento.event) : '';

    const payloadString = evento ? JSON.stringify(evento.payload, null, 2) : '';

    /* Tarjetas de información: ícono + label + valor */
    const cards: { icon: typeof Hash; label: string; value: string; mono?: boolean; span?: number }[] =
        evento
            ? [
                  { icon: Hash,        label: 'Evento (código)',     value: evento.event, mono: true },
                  { icon: Layers,      label: 'Módulo',              value: moduleLabel },
                  { icon: Layers,      label: 'Tipo agregado',       value: valueOrDash(evento.aggregate_type) },
                  { icon: Fingerprint, label: 'ID agregado',         value: valueOrDash(evento.aggregate_id), mono: true },
                  { icon: User,        label: 'Actor',               value: `${valueOrDash(evento.actor_name)}\n${valueOrDash(evento.actor_email)}` },
                  { icon: Target,      label: 'Objetivo',            value: `${valueOrDash(evento.target_name)}\n${valueOrDash(evento.target_email)}` },
                  { icon: Globe,       label: 'Dirección IP',        value: valueOrDash(evento.ip_address), mono: true },
                  { icon: Calendar,    label: 'Fecha del evento',    value: formatDate(evento.occurred_at) },
                  { icon: Calendar,    label: 'Registro auditoría',  value: formatDate(evento.created_at) },
                  { icon: Fingerprint, label: 'Event ID',            value: evento.event_id, mono: true, span: 3 },
                  { icon: Monitor,     label: 'User Agent',          value: valueOrDash(evento.user_agent), mono: true, span: 3 },
              ]
            : [];

    return (
        <>
            <Head title="Detalle de auditoría" />

            <style>{`
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
                    overflow: hidden;
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
                @media (prefers-color-scheme: dark) {
                    .eyebrow { color: #D6B96A; }
                }

                /* ── Hero chips ── */
                .chip-dot {
                    display: inline-block;
                    width: 0.55rem;
                    height: 0.55rem;
                    border-radius: 999px;
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.6);
                    flex-shrink: 0;
                }
                @media (prefers-color-scheme: dark) {
                    .chip-dot { box-shadow: 0 0 0 3px rgba(255,255,255,0.08); }
                }
                .chip-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.3rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.78rem;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    border: 1px solid rgba(0,0,0,0.06);
                    white-space: nowrap;
                    width: max-content;
                }
                @media (prefers-color-scheme: dark) {
                    .chip-pill { border-color: rgba(255,255,255,0.10); }
                }

                /* ── Detail card (info field) ── */
                .info-card {
                    position: relative;
                    border-radius: 1.1rem;
                    border: 1px solid rgba(107,18,48,0.10);
                    background: rgba(255,255,255,0.55);
                    padding: 1rem 1.05rem;
                    transition: border-color .18s, transform .18s;
                }
                .info-card:hover {
                    border-color: rgba(107,18,48,0.22);
                    transform: translateY(-1px);
                }
                @media (prefers-color-scheme: dark) {
                    .info-card {
                        background: rgba(255,255,255,0.035);
                        border-color: rgba(214,185,106,0.14);
                    }
                    .info-card:hover { border-color: rgba(214,185,106,0.30); }
                }
                .info-card-head {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: #8A8074;
                    font-size: 0.66rem;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }
                @media (prefers-color-scheme: dark) {
                    .info-card-head { color: #A9978D; }
                }
                .info-card-value {
                    margin-top: 0.55rem;
                    font-size: 0.92rem;
                    font-weight: 700;
                    line-height: 1.45;
                    white-space: pre-line;
                    word-break: break-word;
                    color: #24151A;
                }
                .info-card-value.is-mono {
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                    font-size: 0.82rem;
                    font-weight: 600;
                    letter-spacing: 0;
                }
                @media (prefers-color-scheme: dark) {
                    .info-card-value { color: #F4EEE9; }
                }

                /* ── Copy button ── */
                .copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.35rem 0.6rem;
                    border-radius: 0.55rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: rgba(255,255,255,0.5);
                    color: #6B1230;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    cursor: pointer;
                    transition: all .15s;
                }
                .copy-btn:hover { background: rgba(107,18,48,0.08); }
                @media (prefers-color-scheme: dark) {
                    .copy-btn {
                        background: rgba(255,255,255,0.05);
                        border-color: rgba(214,185,106,0.28);
                        color: #D6B96A;
                    }
                    .copy-btn:hover { background: rgba(214,185,106,0.10); }
                }

                /* ── Payload viewer ── */
                .payload-shell {
                    margin: 1.25rem;
                    border-radius: 1.1rem;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.16);
                    background: #1a1216;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.22);
                }
                .payload-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.55rem 0.9rem;
                    background: #221619;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .payload-dots {
                    display: inline-flex;
                    gap: 0.35rem;
                }
                .payload-dots span {
                    width: 0.6rem;
                    height: 0.6rem;
                    border-radius: 999px;
                    background: #ff5f56;
                }
                .payload-dots span:nth-child(2) { background: #ffbd2e; }
                .payload-dots span:nth-child(3) { background: #27c93f; }
                .payload-title {
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                    font-size: 0.72rem;
                    color: #C9A84C;
                    letter-spacing: 0.04em;
                    font-weight: 700;
                }
                .payload-body {
                    max-height: 640px;
                    overflow: auto;
                    margin: 0;
                    padding: 1.1rem 1.25rem;
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                    font-size: 0.78rem;
                    line-height: 1.65;
                    color: #F4EEE9;
                    background: transparent;
                }
                .payload-empty {
                    padding: 2rem;
                    text-align: center;
                    color: #A9978D;
                    font-size: 0.85rem;
                    font-style: italic;
                }

                /* ── Section header (con borde inferior) ── */
                .section-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) {
                    .section-head { border-bottom-color: rgba(214,185,106,0.14); }
                }
            `}</style>

            <div className="page-container">
                <div className="shell-container">

                    {/* ── Cabecera con back ── */}
                    <section className="glass-card">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
                            <div>
                                <div className="eyebrow">
                                    <ShieldCheck className="h-4 w-4" />
                                    Detalle de trazabilidad
                                </div>

                                <h1 className="text-3xl font-black tracking-tight mt-1">
                                    Evento de auditoría
                                </h1>

                                {evento && (
                                    <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-2">
                                        Registrado el {formatDate(evento.created_at)}.
                                    </p>
                                )}
                            </div>

                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/auditoria">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Volver al listado
                                </Link>
                            </Button>
                        </div>

                        {/* Chips resumen */}
                        {evento && (
                            <div className="px-6 pb-6 flex flex-wrap items-center gap-2">
                                <span
                                    className="chip-pill"
                                    style={{ background: '#9A6C181A', color: '#7A570D' }}
                                >
                                    <span className="chip-dot" style={{ background: '#9A6C18' }} />
                                    {eventLabel}
                                </span>

                                <span
                                    className="chip-pill"
                                    style={{ background: `${moduleColor}1A`, color: moduleColor }}
                                >
                                    <span className="chip-dot" style={{ background: moduleColor }} />
                                    {moduleLabel}
                                </span>

                                {evento.ip_address && (
                                    <span className="chip-pill" style={{ background: 'rgba(110,100,88,0.10)', color: '#6E6458' }}>
                                        <Globe className="h-3.5 w-3.5" />
                                        {evento.ip_address}
                                    </span>
                                )}

                                {evento.occurred_at && (
                                    <span className="chip-pill" style={{ background: 'rgba(110,100,88,0.10)', color: '#6E6458' }}>
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formatDate(evento.occurred_at)}
                                    </span>
                                )}
                            </div>
                        )}
                        <br />
                    </section>

                    {/* ── Error ── */}
                    {error && (
                        <section className="rounded-3xl border border-red-500/25 bg-red-500/10 p-5 text-sm font-bold text-red-700 dark:text-red-300">
                            {error}
                        </section>
                    )}

                    {evento && (
                        <>
                            {/* ── Descripción narrativa (si existe) ── */}
                            {evento.description && (
                                <section className="glass-card">
                                    <div className="section-head">
                                        <div className="eyebrow">
                                            <ClipboardList className="h-4 w-4" />
                                            Descripción
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm leading-7 text-[#3A2D33] dark:text-[#E8DED4] font-medium">
                                            {evento.description}
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* ── Datos principales ── */}
                            <section className="glass-card">
                                <div className="section-head">
                                    <div className="eyebrow">
                                        <ClipboardList className="h-4 w-4" />
                                        Datos principales
                                    </div>

                                    <CopyButton text={evento.event_id} label="Copiar Event ID" />
                                </div>

                                <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                                    {cards.map((card, i) => {
                                        const Icon = card.icon;
                                        const spanClass =
                                            card.span === 3
                                                ? 'md:col-span-2 xl:col-span-3'
                                                : card.span === 2
                                                    ? 'md:col-span-2'
                                                    : '';

                                        return (
                                            <div key={`${card.label}-${i}`} className={`info-card ${spanClass}`}>
                                                <div className="info-card-head">
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {card.label}
                                                </div>
                                                <div className={`info-card-value ${card.mono ? 'is-mono' : ''}`}>
                                                    {card.value}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* ── Payload JSON ── */}
                            <section className="glass-card">
                                <div className="section-head">
                                    <div className="eyebrow">
                                        <FileJson className="h-4 w-4" />
                                        Payload completo
                                    </div>

                                    {payloadString && payloadString !== 'null' && (
                                        <CopyButton text={payloadString} label="Copiar JSON" />
                                    )}
                                </div>

                                <div className="payload-shell">
                                    <div className="payload-head">
                                        <div className="payload-dots">
                                            <span /><span /><span />
                                        </div>
                                        <div className="payload-title">payload.json</div>
                                        <div style={{ width: '2.4rem' }} />
                                    </div>

                                    {payloadString && payloadString !== 'null' ? (
                                        <pre className="payload-body">{payloadString}</pre>
                                    ) : (
                                        <div className="payload-empty">
                                            Sin payload adicional registrado para este evento.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}

                </div>
            </div>
        </>
    );
}

AuditoriaShow.layout = {
    breadcrumbs: [
        {
            title: 'Auditoría',
            href: '/auditoria',
        },
        {
            title: 'Detalle',
            href: '#',
        },
    ],
};