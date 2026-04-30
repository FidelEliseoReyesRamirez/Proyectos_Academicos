import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import TextLink from '@/components/text-link';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

// ── Íconos SVG ────────────────────────────────────────────────
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
const IconArrow = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
    </svg>
);

export default function Login({ status, canResetPassword, canRegister }: Props) {
    const [showPwd, setShowPwd] = useState(false);

    return (
        <>
            <Head title="Iniciar Sesión — UNIVALLE" />

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
                    --gold-300:   #E2CA8A;
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

                    --bg-page:      var(--warm-25);
                    --bg-card:      #FEFDFB;
                    --bg-input:     #FAFAF7;
                    --text-main:    var(--warm-950);
                    --text-sec:     var(--warm-800);
                    --text-muted:   var(--warm-600);
                    --border:       var(--warm-200);
                    --border-focus: var(--guindo-600);
                    --accent:       var(--guindo-600);
                    --accent-hov:   var(--guindo-800);
                    --gold:         var(--gold-500);
                    --shadow-card:  0 2px 8px rgba(26,22,20,0.06), 0 16px 40px rgba(107,18,48,0.07);
                }

                @media (prefers-color-scheme: dark) {
                    :root {
                        --bg-page:      #120A0D;
                        --bg-card:      #1C1018;
                        --bg-input:     #231520;
                        --text-main:    #EDE8E4;
                        --text-sec:     #C2B8B0;
                        --text-muted:   #887C74;
                        --border:       #3A2430;
                        --border-focus: #B85070;
                        --accent:       #B85070;
                        --accent-hov:   #D4849A;
                        --gold:         #D6B96A;
                        --shadow-card:  0 2px 8px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.35);
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

                /* ── Layout split ── */
                .login-page {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                /* ── Panel izquierdo: formulario ── */
                .login-form-panel {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    background: var(--bg-page);
                    overflow-y: auto;
                }

                .login-form-wrap {
                    width: 100%; max-width: 400px;
                    animation: fade-up 0.5s ease both;
                }

                /* Logo en mobile (cuando el panel derecho se oculta) */
                .mobile-logo {
                    display: none;
                    align-items: center;
                    gap: 0.65rem;
                    margin-bottom: 2rem;
                }
                .mobile-logo-img {
                    width: 34px; height: 34px;
                    border-radius: 8px;
                    background: var(--accent);
                    overflow: hidden;
                    display: flex; align-items: center; justify-content: center;
                }
                .mobile-logo-img img { width: 100%; height: 100%; object-fit: cover; }
                .mobile-logo-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 0.92rem; font-weight: 700;
                    color: var(--accent); line-height: 1.1;
                }
                .mobile-logo-sub {
                    font-size: 0.63rem; color: var(--text-muted);
                    letter-spacing: 0.07em; text-transform: uppercase;
                }

                .form-header { margin-bottom: 2rem; }
                .form-eyebrow {
                    font-size: 0.7rem; font-weight: 700;
                    letter-spacing: 0.12em; text-transform: uppercase;
                    color: var(--gold); margin-bottom: 0.5rem;
                }
                .form-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.85rem; font-weight: 700;
                    color: var(--text-main); margin-bottom: 0.35rem;
                    line-height: 1.15;
                }
                .form-subtitle {
                    font-size: 0.88rem; color: var(--text-muted);
                    line-height: 1.55;
                }

                /* ── Status message ── */
                .status-msg {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: rgba(56,161,105,0.1);
                    border: 1px solid rgba(56,161,105,0.3);
                    border-radius: 8px;
                    padding: 0.65rem 0.9rem;
                    font-size: 0.83rem; color: #276B34;
                    margin-bottom: 1.4rem;
                    animation: fade-in 0.3s ease;
                }
                @media (prefers-color-scheme: dark) {
                    .status-msg { color: #7BC88A; }
                }

                /* ── Campos ── */
                .field { margin-bottom: 1.2rem; }
                .field-label {
                    display: flex; align-items: center; justify-content: space-between;
                    font-size: 0.82rem; font-weight: 600;
                    color: var(--text-sec);
                    margin-bottom: 0.4rem;
                    letter-spacing: 0.01em;
                }
                .field-label-req { color: var(--accent); margin-left: 2px; }
                .field-label-link {
                    font-size: 0.78rem; font-weight: 500;
                    color: var(--accent); text-decoration: none;
                    transition: opacity 0.2s;
                }
                .field-label-link:hover { opacity: 0.72; }

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
                    padding: 0.75rem 0.9rem 0.75rem 2.5rem;
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

                /* ── Remember me ── */
                .remember-row {
                    display: flex; align-items: center; gap: 0.55rem;
                    margin-bottom: 1.5rem;
                }
                .checkbox-custom {
                    width: 17px; height: 17px;
                    border: 1.5px solid var(--border);
                    border-radius: 4px;
                    background: var(--bg-input);
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                    transition: all 0.18s ease;
                    flex-shrink: 0;
                    position: relative;
                }
                .checkbox-custom:checked {
                    background: var(--accent);
                    border-color: var(--accent);
                }
                .checkbox-custom:checked::after {
                    content: '';
                    position: absolute;
                    top: 2px; left: 5px;
                    width: 5px; height: 8px;
                    border: 2px solid white;
                    border-top: none; border-left: none;
                    transform: rotate(45deg);
                }
                .checkbox-custom:focus { outline: none; box-shadow: 0 0 0 3px rgba(107,18,48,0.1); }
                .remember-label {
                    font-size: 0.83rem; color: var(--text-muted);
                    cursor: pointer; user-select: none;
                }

                /* ── Divider ── */
                .form-divider {
                    display: flex; align-items: center; gap: 0.75rem;
                    margin: 1.5rem 0;
                }
                .divider-line { flex: 1; height: 1px; background: var(--border); }
                .divider-text { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; }

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
                }
                .btn-submit:hover:not(:disabled) {
                    background: var(--accent-hov);
                    border-color: var(--accent-hov);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(107,18,48,0.22);
                }
                @media (prefers-color-scheme: dark) {
                    .btn-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(184,80,112,0.25); }
                }
                .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

                .spinner {
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── Footer del formulario ── */
                .form-footer {
                    text-align: center;
                    font-size: 0.83rem; color: var(--text-muted);
                    margin-top: 1.25rem;
                }
                .form-footer a, .form-footer [href] {
                    color: var(--accent); font-weight: 600;
                    text-decoration: none; transition: opacity 0.2s;
                }
                .form-footer a:hover { opacity: 0.75; }

                /* ── Panel derecho decorativo ── */
                .login-side {
                    background: var(--guindo-800);
                    position: relative; overflow: hidden;
                    display: flex; flex-direction: column;
                    justify-content: center;
                    padding: 4rem 3.5rem;
                }
                @media (prefers-color-scheme: dark) {
                    .login-side { background: #1C0E16; border-left: 1px solid #3A2430; }
                }

                .side-grid {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .side-glow-1 {
                    position: absolute; top: -150px; left: -150px;
                    width: 450px; height: 450px;
                    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%);
                    animation: side-float 11s ease-in-out infinite;
                }
                .side-glow-2 {
                    position: absolute; bottom: -120px; right: -100px;
                    width: 380px; height: 380px;
                    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%);
                    animation: side-float 15s ease-in-out infinite reverse;
                }
                @keyframes side-float {
                    0%, 100% { transform: scale(1) translate(0,0); }
                    50%       { transform: scale(1.05) translate(10px,-8px); }
                }

                .side-content { position: relative; z-index: 1; }

                .side-logo {
                    display: flex; align-items: center; gap: 0.75rem;
                    margin-bottom: 3rem;
                    text-decoration: none;
                }
                .side-logo-img {
                    width: 40px; height: 40px; border-radius: 10px;
                    background: rgba(255,255,255,0.12); overflow: hidden;
                    display: flex; align-items: center; justify-content: center;
                }
                .side-logo-img img { width: 100%; height: 100%; object-fit: cover; }
                .side-logo-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 0.95rem; font-weight: 700;
                    color: #F0EBE8; line-height: 1.1;
                }
                .side-logo-sub {
                    font-size: 0.65rem; color: rgba(240,235,232,0.42);
                    letter-spacing: 0.07em; text-transform: uppercase;
                }

                .side-headline {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.55rem, 2.4vw, 2rem);
                    font-weight: 700; color: #F0EBE8;
                    line-height: 1.2; margin-bottom: 1rem;
                }
                .side-headline-gold { color: var(--gold-400); }

                .side-desc {
                    font-size: 0.9rem; color: rgba(240,235,232,0.55);
                    line-height: 1.72; margin-bottom: 2.5rem;
                    max-width: 340px;
                }

                /* Tarjeta de estado del sistema */
                .side-status-card {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px; padding: 1.25rem 1.4rem;
                    margin-bottom: 1.5rem;
                }
                .side-status-title {
                    font-size: 0.72rem; font-weight: 700;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    color: rgba(240,235,232,0.4); margin-bottom: 1rem;
                }
                .side-status-row {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 0.55rem;
                }
                .side-status-row:last-child { margin-bottom: 0; }
                .side-status-label {
                    font-size: 0.8rem; color: rgba(240,235,232,0.55);
                    display: flex; align-items: center; gap: 0.45rem;
                }
                .status-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    animation: pulse-dot 2.5s ease-in-out infinite;
                }
                .status-dot.green  { background: #68D391; }
                .status-dot.gold   { background: var(--gold-400); }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.6; transform: scale(0.85); }
                }
                .side-status-val {
                    font-size: 0.8rem; font-weight: 600;
                    color: rgba(240,235,232,0.8);
                }

                .side-divider {
                    height: 1px; background: rgba(255,255,255,0.08);
                    margin: 1.75rem 0;
                }
                .side-register {
                    font-size: 0.83rem; color: rgba(240,235,232,0.48);
                }
                .side-register a {
                    color: var(--gold-400); font-weight: 600;
                    text-decoration: none; transition: opacity 0.2s;
                }
                .side-register a:hover { opacity: 0.8; }

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
                    .login-page { grid-template-columns: 1fr; }
                    .login-side { display: none; }
                    .login-form-panel {
                        padding: 2.5rem 1.5rem;
                        min-height: 100vh;
                        align-items: flex-start;
                        padding-top: 3.5rem;
                    }
                    .mobile-logo { display: flex; }
                }
            `}</style>

            <div className="login-page">

                {/* ── Panel izquierdo: formulario ── */}
                <main className="login-form-panel">
                    <div className="login-form-wrap">

                        {/* Logo visible solo en mobile */}
                        <div className="mobile-logo">
                            <div className="mobile-logo-img">
                                <img
                                    src="/images/logo.png"
                                    alt="UNIVALLE"
                                    onError={(e) => {
                                        const t = e.currentTarget as HTMLImageElement;
                                        t.style.display = 'none';
                                        const p = t.parentElement;
                                        if (p) p.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z" fill="white" fill-opacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                                    }}
                                />
                            </div>
                            <div>
                                <div className="mobile-logo-name">Universidad Privada del Valle</div>
                                <div className="mobile-logo-sub">Plataforma Académica · La Paz</div>
                            </div>
                        </div>

                        <div className="form-header">
                            <div className="form-eyebrow">Plataforma Académica</div>
                            <h1 className="form-title df">Bienvenido de vuelta</h1>
                            <p className="form-subtitle">
                                Ingresa tus credenciales para acceder a tu panel académico.
                            </p>
                        </div>

                        {/* Status externo (ej. contraseña restablecida) */}
                        {status && (
                            <div className="status-msg">
                                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email */}
                                    <div className="field">
                                        <label className="field-label" htmlFor="email">
                                            <span>
                                                Correo electrónico
                                                <span className="field-label-req"> *</span>
                                            </span>
                                        </label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconMail /></span>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="correo@gmail.com"
                                                className={`field-input${errors.email ? ' has-error' : ''}`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="field-error">
                                                <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                                                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                                </svg>
                                                {errors.email}
                                            </div>
                                        )}
                                       
                                    </div>

                                    {/* Contraseña */}
                                    <div className="field">
                                        <label className="field-label" htmlFor="password">
                                            <span>
                                                Contraseña
                                                <span className="field-label-req"> *</span>
                                            </span>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    tabIndex={5}
                                                    className="field-label-link"
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </TextLink>
                                            )}
                                        </label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconLock /></span>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPwd ? 'text' : 'password'}
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Tu contraseña"
                                                className={`field-input${errors.password ? ' has-error' : ''}`}
                                                style={{ paddingRight: '2.8rem' }}
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
                                        {errors.password && (
                                            <div className="field-error">
                                                <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                                                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                                </svg>
                                                {errors.password}
                                            </div>
                                        )}
                                        
                                    </div>

                                    {/* Recordarme */}
                                    <div className="remember-row">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="checkbox-custom"
                                        />
                                        <label className="remember-label" htmlFor="remember">
                                            Mantener sesión iniciada
                                        </label>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="spinner" viewBox="0 0 24 24" fill="none" width="16" height="16">
                                                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                                                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                                                </svg>
                                                Ingresando...
                                            </>
                                        ) : (
                                            <>
                                                Ingresar al sistema
                                                <IconArrow />
                                            </>
                                        )}
                                    </button>

                                    {canRegister && (
                                        <div className="form-footer">
                                            ¿No tienes cuenta?{' '}
                                            <TextLink href={register()} tabIndex={6}>
                                                Regístrate aquí
                                            </TextLink>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>
                </main>

                {/* ── Panel derecho decorativo ── */}
                <aside className="login-side">
                    <div className="side-grid" />
                    <div className="side-glow-1" />
                    <div className="side-glow-2" />

                    <div className="side-content">
                        <a href="/" className="side-logo">
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
                            <div>
                                <div className="side-logo-name">Universidad Privada del Valle</div>
                                <div className="side-logo-sub">Plataforma Académica · La Paz</div>
                            </div>
                        </a>

                        <h2 className="side-headline df">
                            Gestiona tu<br />
                            proyecto con<br />
                            <span className="side-headline-gold">claridad total.</span>
                        </h2>
                        <p className="side-desc">
                            La plataforma oficial de seguimiento de proyectos académicos estudiantiles de la UNIVALLE sede La Paz.
                        </p>

                        {/* Tarjeta de estado del sistema */}
                        <div className="side-status-card">
                            <div className="side-status-title">Estado del sistema</div>
                            {[
                                { label: 'Plataforma',       val: 'Operativa',  dot: 'green' },
                                { label: 'Período activo',   val: 'Gestión I — 2025', dot: 'gold' },
                                { label: 'Documentos',       val: 'Disponible', dot: 'green' },
                            ].map((r, i) => (
                                <div className="side-status-row" key={i}>
                                    <span className="side-status-label">
                                        <span className={`status-dot ${r.dot}`} style={{ animationDelay: `${i * 0.4}s` }} />
                                        {r.label}
                                    </span>
                                    <span className="side-status-val">{r.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="side-divider" />

                        {canRegister && (
                            <p className="side-register">
                                ¿Primera vez en la plataforma?{' '}
                                <a href="/register">Crea tu cuenta</a>
                            </p>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Iniciar sesión',
    description: 'Ingresa tus credenciales para acceder a la plataforma académica',
};