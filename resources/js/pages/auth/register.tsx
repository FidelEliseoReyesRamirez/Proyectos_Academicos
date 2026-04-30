import { Form, Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { login } from '@/routes';
import { store } from '@/routes/register';

// ── Reglas de contraseña ──────────────────────────────────────
const PWD_RULES = [
    { id: 'len',     label: 'Mínimo 8 caracteres',          test: (v: string) => v.length >= 8 },
    { id: 'upper',   label: 'Una letra mayúscula',           test: (v: string) => /[A-Z]/.test(v) },
    { id: 'lower',   label: 'Una letra minúscula',           test: (v: string) => /[a-z]/.test(v) },
    { id: 'number',  label: 'Un número',                     test: (v: string) => /\d/.test(v) },
    { id: 'special', label: 'Un carácter especial (!@#$...)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const VALID_DOMAINS = ['@gmail.com', '@univalle.edu', '@est.univalle.edu'];

function validateEmail(email: string): string | null {
    if (!email) return null;
    const lower = email.toLowerCase();
    const valid = VALID_DOMAINS.some(d => lower.endsWith(d));
    if (!valid) return 'El correo debe ser Gmail (@gmail.com) o institucional (@univalle.edu)';
    return null;
}

function strengthScore(pwd: string): number {
    return PWD_RULES.filter(r => r.test(pwd)).length;
}

const STRENGTH_LABELS = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Segura'];
const STRENGTH_COLORS = ['', '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#2B6CB0'];

// ── Íconos SVG ────────────────────────────────────────────────
const IconCheck = () => (
    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IconX = () => (
    <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);
const IconEye = ({ off }: { off?: boolean }) => off ? (
    <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
) : (
    <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
);
const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
);
const IconMail = () => (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);
const IconLock = () => (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);
const IconShield = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// ── Componente principal ──────────────────────────────────────
export default function Register() {
    const [pwd, setPwd]           = useState('');
    const [pwdConf, setPwdConf]   = useState('');
    const [showPwd, setShowPwd]   = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [email, setEmail]       = useState('');
    const [touched, setTouched]   = useState<Record<string, boolean>>({});

    const score      = strengthScore(pwd);
    const emailError = touched.email ? validateEmail(email) : null;
    const confError  = touched.pwdConf && pwdConf && pwd !== pwdConf
        ? 'Las contraseñas no coinciden'
        : null;

    const touch = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    return (
        <>
            <Head title="Crear cuenta — UNIVALLE" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                :root {
                    --guindo-900: #2E0812;
                    --guindo-800: #4A0D21;
                    --guindo-700: #5E1029;
                    --guindo-600: #6B1230;
                    --guindo-400: #9B2D50;
                    --guindo-200: #D4849A;
                    --guindo-50:  #F9EDF0;
                    --gold-500:   #C9A84C;
                    --gold-400:   #D6B96A;
                    --gold-100:   #F6EEDC;
                    --warm-950:   #1A1614;
                    --warm-800:   #3A342C;
                    --warm-600:   #6E6458;
                    --warm-400:   #A89E94;
                    --warm-300:   #C4BEB6;
                    --warm-200:   #DCD8D2;
                    --warm-100:   #EEEBE6;
                    --warm-50:    #F5F3EF;
                    --warm-25:    #FAF8F5;

                    --bg-page:    var(--warm-25);
                    --bg-card:    #FEFDFB;
                    --bg-input:   #FAFAF7;
                    --text-main:  var(--warm-950);
                    --text-sec:   var(--warm-800);
                    --text-muted: var(--warm-600);
                    --border:     var(--warm-200);
                    --border-focus: var(--guindo-600);
                    --accent:     var(--guindo-600);
                    --accent-hov: var(--guindo-800);
                    --gold:       var(--gold-500);
                    --shadow-card: 0 2px 8px rgba(26,22,20,0.06), 0 16px 40px rgba(107,18,48,0.07);
                }

                @media (prefers-color-scheme: dark) {
                    :root {
                        --bg-page:    #120A0D;
                        --bg-card:    #1C1018;
                        --bg-input:   #231520;
                        --text-main:  #EDE8E4;
                        --text-sec:   #C2B8B0;
                        --text-muted: #887C74;
                        --border:     #3A2430;
                        --border-focus: #B85070;
                        --accent:     #B85070;
                        --accent-hov: #D4849A;
                        --gold:       #D6B96A;
                        --shadow-card: 0 2px 8px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.35);
                    }
                }

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body {
                    font-family: 'Source Sans 3', sans-serif;
                    background: var(--bg-page);
                    color: var(--text-main);
                    min-height: 100vh;
                    -webkit-font-smoothing: antialiased;
                }
                .df { font-family: 'Playfair Display', serif; }

                /* ── Layout ── */
                .reg-page {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                /* Panel izquierdo decorativo */
                .reg-side {
                    background: var(--guindo-800);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 4rem 3.5rem;
                }

                @media (prefers-color-scheme: dark) {
                    .reg-side { background: #1C0E16; border-right: 1px solid #3A2430; }
                }

                .reg-side-grid {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .reg-side-glow-1 {
                    position: absolute;
                    top: -150px; right: -150px;
                    width: 450px; height: 450px;
                    background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%);
                    animation: side-float 10s ease-in-out infinite;
                }
                .reg-side-glow-2 {
                    position: absolute;
                    bottom: -100px; left: -100px;
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%);
                    animation: side-float 14s ease-in-out infinite reverse;
                }
                @keyframes side-float {
                    0%, 100% { transform: scale(1); }
                    50%       { transform: scale(1.06) translate(8px,-6px); }
                }

                .reg-side-content { position: relative; z-index: 1; }

                .side-logo {
                    display: flex; align-items: center; gap: 0.75rem;
                    margin-bottom: 3rem;
                }
                .side-logo-img {
                    width: 40px; height: 40px; border-radius: 10px;
                    background: rgba(255,255,255,0.12);
                    overflow: hidden;
                    display: flex; align-items: center; justify-content: center;
                }
                .side-logo-img img { width: 100%; height: 100%; object-fit: cover; }
                .side-logo-text { }
                .side-logo-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 0.95rem; font-weight: 700;
                    color: #F0EBE8; line-height: 1.1;
                }
                .side-logo-sub {
                    font-size: 0.65rem;
                    color: rgba(240,235,232,0.45);
                    letter-spacing: 0.07em; text-transform: uppercase;
                }

                .side-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.6rem, 2.5vw, 2.1rem);
                    font-weight: 700; color: #F0EBE8;
                    line-height: 1.2; margin-bottom: 1rem;
                }
                .side-title-gold { color: var(--gold-400); }

                .side-desc {
                    font-size: 0.92rem;
                    color: rgba(240,235,232,0.58);
                    line-height: 1.72; margin-bottom: 2.5rem;
                    max-width: 340px;
                }

                .side-perks { display: flex; flex-direction: column; gap: 0.9rem; }
                .side-perk {
                    display: flex; align-items: flex-start; gap: 0.75rem;
                }
                .perk-icon {
                    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
                    background: rgba(201,168,76,0.18);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--gold-400); margin-top: 1px;
                }
                .perk-text { }
                .perk-title {
                    font-size: 0.88rem; font-weight: 600;
                    color: #F0EBE8; margin-bottom: 0.1rem;
                }
                .perk-desc {
                    font-size: 0.78rem; color: rgba(240,235,232,0.48);
                    line-height: 1.5;
                }

                .side-divider {
                    height: 1px; background: rgba(255,255,255,0.08);
                    margin: 2.5rem 0;
                }
                .side-already {
                    font-size: 0.83rem; color: rgba(240,235,232,0.5);
                }
                .side-already a {
                    color: var(--gold-400); font-weight: 600;
                    text-decoration: none; transition: opacity 0.2s;
                }
                .side-already a:hover { opacity: 0.8; }

                /* ── Panel derecho: formulario ── */
                .reg-form-panel {
                    display: flex; align-items: center; justify-content: center;
                    padding: 3rem 2rem;
                    background: var(--bg-page);
                    overflow-y: auto;
                }

                .reg-form-wrap {
                    width: 100%; max-width: 420px;
                    animation: fade-up 0.5s ease both;
                }

                .form-header { margin-bottom: 2rem; }
                .form-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.7rem; font-weight: 700;
                    color: var(--text-main); margin-bottom: 0.35rem;
                }
                .form-subtitle {
                    font-size: 0.88rem; color: var(--text-muted);
                    line-height: 1.55;
                }

                /* ── Campos ── */
                .field { margin-bottom: 1.2rem; }
                .field-label {
                    display: block;
                    font-size: 0.82rem; font-weight: 600;
                    color: var(--text-sec);
                    margin-bottom: 0.4rem;
                    letter-spacing: 0.01em;
                }
                .field-label span { color: var(--accent); margin-left: 2px; }

                .input-wrap {
                    position: relative;
                    display: flex; align-items: center;
                }
                .input-icon {
                    position: absolute; left: 0.85rem;
                    color: var(--text-muted);
                    pointer-events: none;
                    display: flex; align-items: center;
                    transition: color 0.2s;
                }
                .field-input {
                    width: 100%;
                    padding: 0.72rem 0.9rem 0.72rem 2.5rem;
                    background: var(--bg-input);
                    border: 1.5px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: var(--text-main);
                    font-family: 'Source Sans 3', sans-serif;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    outline: none;
                }
                .field-input::placeholder { color: var(--text-muted); opacity: 0.7; }
                .field-input:focus {
                    border-color: var(--border-focus);
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.08);
                }
                @media (prefers-color-scheme: dark) {
                    .field-input:focus { box-shadow: 0 0 0 3px rgba(184,80,112,0.15); }
                }
                .field-input.has-error { border-color: #E53E3E; }
                .field-input.is-valid  { border-color: #38A169; }

                .input-toggle {
                    position: absolute; right: 0.75rem;
                    background: none; border: none; cursor: pointer;
                    color: var(--text-muted); padding: 0.2rem;
                    display: flex; align-items: center;
                    border-radius: 4px;
                    transition: color 0.2s;
                }
                .input-toggle:hover { color: var(--text-sec); }

                .field-error {
                    display: flex; align-items: center; gap: 0.3rem;
                    font-size: 0.78rem; color: #E53E3E;
                    margin-top: 0.35rem;
                    animation: fade-in 0.2s ease;
                }

                /* ── Indicador de dominio ── */
                .domain-hint {
                    display: flex; align-items: center; gap: 0.3rem;
                    font-size: 0.75rem; color: var(--text-muted);
                    margin-top: 0.3rem;
                }
                .domain-chip {
                    display: inline-flex; align-items: center;
                    background: var(--guindo-50); color: var(--guindo-700);
                    padding: 0.1rem 0.45rem; border-radius: 4px;
                    font-size: 0.72rem; font-weight: 600;
                }
                @media (prefers-color-scheme: dark) {
                    .domain-chip { background: rgba(107,18,48,0.2); color: var(--guindo-200); }
                }

                /* ── Indicador de fortaleza ── */
                .pwd-strength {
                    margin-top: 0.75rem;
                }
                .strength-bars {
                    display: flex; gap: 4px; margin-bottom: 0.4rem;
                }
                .strength-bar {
                    flex: 1; height: 3px; border-radius: 2px;
                    background: var(--border);
                    transition: background 0.35s ease;
                    overflow: hidden;
                }
                .strength-bar.active { }
                .strength-label {
                    font-size: 0.75rem; font-weight: 600;
                    transition: color 0.3s;
                }

                /* ── Reglas de contraseña ── */
                .pwd-rules {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 0.3rem 0.75rem;
                    margin-top: 0.6rem;
                    padding: 0.85rem 1rem;
                    background: var(--bg-input);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                }
                .pwd-rule {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.76rem;
                    transition: color 0.25s;
                }
                .rule-icon {
                    width: 16px; height: 16px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.25s ease;
                }
                .rule-icon.ok {
                    background: rgba(56,161,105,0.15); color: #38A169;
                    transform: scale(1.1);
                }
                .rule-icon.fail { background: var(--border); color: var(--text-muted); }
                .pwd-rule.ok { color: var(--text-sec); }
                .pwd-rule.fail { color: var(--text-muted); }

                /* ── Confirmación ── */
                .conf-match {
                    display: flex; align-items: center; gap: 0.35rem;
                    font-size: 0.77rem; margin-top: 0.35rem;
                    animation: fade-in 0.2s ease;
                }
                .conf-match.ok { color: #38A169; }
                .conf-match.fail { color: #E53E3E; }

                /* ── Rol badge ── */
                .role-note {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: var(--gold-100); border: 1px solid rgba(201,168,76,0.35);
                    border-radius: 8px; padding: 0.65rem 0.9rem;
                    font-size: 0.8rem; color: var(--warm-800);
                    margin-bottom: 1.4rem;
                }
                @media (prefers-color-scheme: dark) {
                    .role-note { background: rgba(201,168,76,0.1); color: #D6B96A; border-color: rgba(201,168,76,0.2); }
                }
                .role-note-icon { color: var(--gold-500); flex-shrink: 0; }

                /* ── Botón submit ── */
                .btn-submit {
                    width: 100%; padding: 0.88rem;
                    background: var(--accent);
                    color: white; border: 2px solid var(--accent);
                    border-radius: 8px;
                    font-size: 0.95rem; font-weight: 700;
                    font-family: 'Source Sans 3', sans-serif;
                    cursor: pointer; letter-spacing: 0.01em;
                    transition: all 0.22s ease;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    margin-top: 1.5rem;
                }
                .btn-submit:hover:not(:disabled) {
                    background: var(--accent-hov);
                    border-color: var(--accent-hov);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(107,18,48,0.22);
                }
                .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

                .btn-submit svg { animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Separador ── */
                .form-footer {
                    text-align: center;
                    font-size: 0.83rem; color: var(--text-muted);
                    margin-top: 1.25rem;
                }
                .form-footer a {
                    color: var(--accent); font-weight: 600;
                    text-decoration: none; transition: opacity 0.2s;
                }
                .form-footer a:hover { opacity: 0.75; }

                /* ── Animaciones ── */
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Responsive ── */
                @media (max-width: 800px) {
                    .reg-page { grid-template-columns: 1fr; }
                    .reg-side { display: none; }
                    .reg-form-panel { padding: 2.5rem 1.5rem; min-height: 100vh; align-items: flex-start; padding-top: 3.5rem; }
                }
            `}</style>

            <div className="reg-page">

                {/* ── Panel izquierdo ── */}
                <aside className="reg-side">
                    <div className="reg-side-grid" />
                    <div className="reg-side-glow-1" />
                    <div className="reg-side-glow-2" />
                    <div className="reg-side-content">
                        <div className="side-logo">
                            <div className="side-logo-img">
                                <img
                                    src="/images/logo.png"
                                    alt="UNIVALLE"
                                    onError={(e) => {
                                        const t = e.currentTarget as HTMLImageElement;
                                        t.style.display = 'none';
                                        const p = t.parentElement;
                                        if (p) p.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z" fill="white" fill-opacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                                    }}
                                />
                            </div>
                            <div className="side-logo-text">
                                <div className="side-logo-name">Universidad Privada del Valle</div>
                                <div className="side-logo-sub">Plataforma Académica · La Paz</div>
                            </div>
                        </div>

                        <h2 className="side-title df">
                            Tu proyecto,<br />
                            <span className="side-title-gold">organizado</span><br />
                            desde el primer día.
                        </h2>
                        <p className="side-desc">
                            Registra tu cuenta y accede a la plataforma oficial de gestión de proyectos académicos estudiantiles.
                        </p>

                        <div className="side-perks">
                            {[
                                {
                                    title: 'Seguimiento centralizado',
                                    desc: 'Estado, documentos y observaciones en un solo lugar.',
                                    icon: <svg viewBox="0 0 20 20" fill="none" width="15" height="15"><path d="M4 5h12M4 10h8M4 15h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
                                },
                                {
                                    title: 'Comunicación oficial',
                                    desc: 'Canal directo con tu tutor sin depender de Teams.',
                                    icon: <svg viewBox="0 0 20 20" fill="none" width="15" height="15"><path d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H5l-3 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
                                },
                                {
                                    title: 'Trazabilidad total',
                                    desc: 'Historial de cada cambio y observación del proceso.',
                                    icon: <svg viewBox="0 0 20 20" fill="none" width="15" height="15"><circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.7"/><circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.7"/><circle cx="10" cy="16" r="2" stroke="currentColor" strokeWidth="1.7"/><path d="M10 6v2M10 12v2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.5 1.5"/></svg>,
                                },
                            ].map((p, i) => (
                                <div className="side-perk" key={i}>
                                    <div className="perk-icon">{p.icon}</div>
                                    <div className="perk-text">
                                        <div className="perk-title">{p.title}</div>
                                        <div className="perk-desc">{p.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="side-divider" />
                        <p className="side-already">
                            ¿Ya tienes cuenta?{' '}
                            <a href="/login">Inicia sesión aquí</a>
                        </p>
                    </div>
                </aside>

                {/* ── Panel derecho: formulario ── */}
                <main className="reg-form-panel">
                    <div className="reg-form-wrap">
                        <div className="form-header">
                            <h1 className="form-title df">Crear cuenta</h1>
                            <p className="form-subtitle">
                                Completa los datos para registrarte en la plataforma académica.
                            </p>
                        </div>

                        {/* Nota de rol */}
                        <div className="role-note">
                            <span className="role-note-icon">
                                <IconShield />
                            </span>
                            Tu cuenta se registrará con rol <strong>Estudiante</strong>. El coordinador puede cambiar tu rol posteriormente.
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            style={{display:'flex', flexDirection:'column'}}
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Nombre */}
                                    <div className="field">
                                        <label className="field-label" htmlFor="name">
                                            Nombre completo <span>*</span>
                                        </label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconUser /></span>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                placeholder="Ej. María López Quispe"
                                                className={`field-input${errors.name ? ' has-error' : ''}`}
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="field-error">
                                                <IconX /> {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Correo */}
                                    <div className="field">
                                        <label className="field-label" htmlFor="email">
                                            Correo electrónico <span>*</span>
                                        </label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconMail /></span>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder="correo@gmail.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                onBlur={() => touch('email')}
                                                className={`field-input${(errors.email || emailError) ? ' has-error' : email && !emailError ? ' is-valid' : ''}`}
                                            />
                                        </div>
                                        <div className="domain-hint">
                                            Dominios aceptados:
                                            {VALID_DOMAINS.map(d => (
                                                <span key={d} className="domain-chip">{d}</span>
                                            ))}
                                        </div>
                                        {(emailError || errors.email) && (
                                            <div className="field-error">
                                                <IconX /> {emailError || errors.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Contraseña */}
                                    <div className="field">
                                        <label className="field-label" htmlFor="password">
                                            Contraseña <span>*</span>
                                        </label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconLock /></span>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPwd ? 'text' : 'password'}
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder="Crea una contraseña segura"
                                                value={pwd}
                                                onChange={e => setPwd(e.target.value)}
                                                className={`field-input${errors.password ? ' has-error' : ''}`}
                                                style={{paddingRight:'2.8rem'}}
                                            />
                                            <button
                                                type="button"
                                                className="input-toggle"
                                                onClick={() => setShowPwd(v => !v)}
                                                tabIndex={-1}
                                                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                <IconEye off={showPwd} />
                                            </button>
                                        </div>

                                        {/* Barra de fortaleza */}
                                        {pwd.length > 0 && (
                                            <div className="pwd-strength">
                                                <div className="strength-bars">
                                                    {[1,2,3,4,5].map(i => (
                                                        <div
                                                            key={i}
                                                            className={`strength-bar${score >= i ? ' active' : ''}`}
                                                            style={{
                                                                background: score >= i
                                                                    ? STRENGTH_COLORS[score]
                                                                    : undefined
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                {score > 0 && (
                                                    <span
                                                        className="strength-label"
                                                        style={{color: STRENGTH_COLORS[score]}}
                                                    >
                                                        {STRENGTH_LABELS[score]}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Reglas */}
                                        {pwd.length > 0 && (
                                            <div className="pwd-rules">
                                                {PWD_RULES.map(r => {
                                                    const ok = r.test(pwd);
                                                    return (
                                                        <div key={r.id} className={`pwd-rule ${ok ? 'ok' : 'fail'}`}>
                                                            <span className={`rule-icon ${ok ? 'ok' : 'fail'}`}>
                                                                {ok ? <IconCheck /> : <IconX />}
                                                            </span>
                                                            {r.label}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {errors.password && (
                                            <div className="field-error">
                                                <IconX /> {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirmar contraseña */}
                                    <div className="field">
                                        <label className="field-label" htmlFor="password_confirmation">
                                            Confirmar contraseña <span>*</span>
                                        </label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconLock /></span>
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type={showConf ? 'text' : 'password'}
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                placeholder="Repite tu contraseña"
                                                value={pwdConf}
                                                onChange={e => setPwdConf(e.target.value)}
                                                onBlur={() => touch('pwdConf')}
                                                className={`field-input${confError ? ' has-error' : pwdConf && pwd === pwdConf ? ' is-valid' : ''}`}
                                                style={{paddingRight:'2.8rem'}}
                                            />
                                            <button
                                                type="button"
                                                className="input-toggle"
                                                onClick={() => setShowConf(v => !v)}
                                                tabIndex={-1}
                                                aria-label={showConf ? 'Ocultar' : 'Mostrar'}
                                            >
                                                <IconEye off={showConf} />
                                            </button>
                                        </div>

                                        {/* Indicador de coincidencia */}
                                        {pwdConf.length > 0 && (
                                            <div className={`conf-match ${pwd === pwdConf ? 'ok' : 'fail'}`}>
                                                {pwd === pwdConf
                                                    ? <><IconCheck /> Las contraseñas coinciden</>
                                                    : <><IconX /> No coinciden</>
                                                }
                                            </div>
                                        )}

                                        {(confError || errors.password_confirmation) && (
                                            <div className="field-error">
                                                <IconX /> {confError || errors.password_confirmation}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        tabIndex={5}
                                        disabled={processing || score < 5 || pwd !== pwdConf || !!emailError}
                                    >
                                        {processing ? (
                                            <>
                                                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                                                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                                                </svg>
                                                Creando cuenta...
                                            </>
                                        ) : (
                                            <>
                                                Crear cuenta
                                                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15" style={{animation:'none'}}>
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                                </svg>
                                            </>
                                        )}
                                    </button>

                                    <div className="form-footer">
                                        ¿Ya tienes cuenta?{' '}
                                        <TextLink href={login()} tabIndex={6}>
                                            Inicia sesión
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </main>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Crear cuenta',
    description: 'Regístrate en la plataforma académica de la Universidad Privada del Valle',
};