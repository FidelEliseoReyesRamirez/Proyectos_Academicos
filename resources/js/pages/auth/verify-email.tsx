import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verificar correo — UNIVALLE" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                :root {
                    --guindo-900: #2E0812;
                    --guindo-800: #4A0D21;
                    --guindo-700: #5E1029;
                    --guindo-600: #6B1230;
                    --guindo-400: #9B2D50;
                    --guindo-200: #D4849A;

                    --gold-500: #C9A84C;
                    --gold-400: #D6B96A;
                    --gold-300: #E2CA8A;

                    --warm-950: #1A1614;
                    --warm-800: #3A342C;
                    --warm-600: #6E6458;
                    --warm-300: #C4BEB6;
                    --warm-200: #DCD8D2;
                    --warm-100: #EEEBE6;
                    --warm-50:  #F5F3EF;
                    --warm-25:  #FAF8F5;

                    --bg-page:      var(--warm-25);
                    --bg-input:     #FAFAF7;
                    --text-main:    var(--warm-950);
                    --text-sec:     var(--warm-800);
                    --text-muted:   var(--warm-600);
                    --border:       var(--warm-200);
                    --accent:       var(--guindo-600);
                    --accent-hov:   var(--guindo-800);
                    --gold:         var(--gold-500);
                    --shadow-card:  0 2px 8px rgba(26,22,20,0.06), 0 16px 40px rgba(107,18,48,0.07);
                }

                @media (prefers-color-scheme: dark) {
                    :root {
                        --bg-page:      #120A0D;
                        --bg-input:     #231520;
                        --text-main:    #EDE8E4;
                        --text-sec:     #C2B8B0;
                        --text-muted:   #887C74;
                        --border:       #3A2430;
                        --accent:       #B85070;
                        --accent-hov:   #D4849A;
                        --gold:         #D6B96A;
                        --shadow-card:  0 2px 8px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.35);
                    }
                }

                *, *::before, *::after {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    font-family: 'Source Sans 3', sans-serif;
                    background: var(--bg-page);
                    color: var(--text-main);
                    min-height: 100vh;
                    -webkit-font-smoothing: antialiased;
                }

                .df {
                    font-family: 'Playfair Display', serif;
                }

                .verify-page {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                .verify-form-panel {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    background: var(--bg-page);
                    overflow-y: auto;
                }

                .verify-form-wrap {
                    width: 100%;
                    max-width: 420px;
                    animation: fade-up 0.5s ease both;
                }

                .mobile-logo {
                    display: none;
                    align-items: center;
                    gap: 0.65rem;
                    margin-bottom: 2rem;
                }

                .mobile-logo-img {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    background: var(--accent);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .mobile-logo-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .mobile-logo-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: var(--accent);
                    line-height: 1.1;
                }

                .mobile-logo-sub {
                    font-size: 0.63rem;
                    color: var(--text-muted);
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                }

                .form-header {
                    margin-bottom: 2rem;
                }

                .form-eyebrow {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: var(--gold);
                    margin-bottom: 0.5rem;
                }

                .form-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 0.35rem;
                    line-height: 1.15;
                }

                .form-subtitle {
                    font-size: 0.88rem;
                    color: var(--text-muted);
                    line-height: 1.55;
                }

                .status-msg {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.65rem;
                    background: rgba(56,161,105,0.12);
                    border: 1px solid rgba(56,161,105,0.38);
                    border-left: 4px solid #38A169;
                    border-radius: 10px;
                    padding: 0.85rem 0.95rem;
                    font-size: 0.86rem;
                    color: #276B34;
                    margin-bottom: 1.4rem;
                    line-height: 1.5;
                    animation: fade-in 0.3s ease;
                    box-shadow: 0 8px 22px rgba(56,161,105,0.08);
                }

                .status-msg svg {
                    flex-shrink: 0;
                    margin-top: 0.1rem;
                    color: #2F855A;
                }

                .status-msg strong {
                    display: block;
                    color: #22543D;
                    font-size: 0.9rem;
                    font-weight: 800;
                    margin-bottom: 0.1rem;
                }

                .status-msg span {
                    display: block;
                }

                @media (prefers-color-scheme: dark) {
                    .status-msg {
                        background: rgba(72,187,120,0.12);
                        border-color: rgba(72,187,120,0.35);
                        border-left-color: #68D391;
                        color: #9AE6B4;
                        box-shadow: 0 8px 22px rgba(0,0,0,0.25);
                    }

                    .status-msg svg {
                        color: #68D391;
                    }

                    .status-msg strong {
                        color: #C6F6D5;
                    }
                }

                .info-card {
                    display: flex;
                    gap: 0.75rem;
                    border-radius: 12px;
                    border: 1px solid rgba(201,168,76,0.28);
                    background: rgba(201,168,76,0.08);
                    color: var(--text-muted);
                    font-size: 0.84rem;
                    line-height: 1.6;
                    padding: 0.95rem 1rem;
                    margin-bottom: 1.5rem;
                }

                .info-card svg {
                    flex-shrink: 0;
                    color: var(--gold);
                    margin-top: 0.12rem;
                }

                .btn-submit {
                    width: 100%;
                    padding: 0.88rem;
                    background: var(--accent);
                    color: white;
                    border: 2px solid var(--accent);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    font-family: 'Source Sans 3', sans-serif;
                    cursor: pointer;
                    letter-spacing: 0.01em;
                    transition: all 0.22s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-submit:hover:not(:disabled) {
                    background: var(--accent-hov);
                    border-color: var(--accent-hov);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(107,18,48,0.22);
                }

                @media (prefers-color-scheme: dark) {
                    .btn-submit:hover:not(:disabled) {
                        box-shadow: 0 6px 20px rgba(184,80,112,0.25);
                    }
                }

                .btn-submit:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                    transform: none;
                }

                .spinner {
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .form-footer {
                    text-align: center;
                    font-size: 0.84rem;
                    color: var(--text-muted);
                    margin-top: 1.25rem;
                }

                .logout-link {
                    cursor: pointer;
                    color: var(--accent);
                    font-weight: 700;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .logout-link:hover {
                    opacity: 0.76;
                }

                .verify-side {
                    background: var(--guindo-800);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 4rem 3.5rem;
                }

                @media (prefers-color-scheme: dark) {
                    .verify-side {
                        background: #1C0E16;
                        border-left: 1px solid #3A2430;
                    }
                }

                .side-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }

                .side-glow-1 {
                    position: absolute;
                    top: -150px;
                    left: -150px;
                    width: 450px;
                    height: 450px;
                    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%);
                    animation: side-float 11s ease-in-out infinite;
                }

                .side-glow-2 {
                    position: absolute;
                    bottom: -120px;
                    right: -100px;
                    width: 380px;
                    height: 380px;
                    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%);
                    animation: side-float 15s ease-in-out infinite reverse;
                }

                @keyframes side-float {
                    0%, 100% { transform: scale(1) translate(0,0); }
                    50% { transform: scale(1.05) translate(10px,-8px); }
                }

                .side-content {
                    position: relative;
                    z-index: 1;
                }

                .side-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 3rem;
                    text-decoration: none;
                }

                .side-logo-img {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.12);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .side-logo-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .side-logo-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #F0EBE8;
                    line-height: 1.1;
                }

                .side-logo-sub {
                    font-size: 0.65rem;
                    color: rgba(240,235,232,0.42);
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                }

                .side-headline {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.55rem, 2.4vw, 2rem);
                    font-weight: 700;
                    color: #F0EBE8;
                    line-height: 1.2;
                    margin-bottom: 1rem;
                }

                .side-headline-gold {
                    color: var(--gold-400);
                }

                .side-desc {
                    font-size: 0.9rem;
                    color: rgba(240,235,232,0.55);
                    line-height: 1.72;
                    margin-bottom: 2.5rem;
                    max-width: 340px;
                }

                .side-security-card {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 1.25rem 1.4rem;
                }

                .side-security-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--gold-400);
                    margin-bottom: 0.85rem;
                }

                .side-security-text {
                    font-size: 0.82rem;
                    color: rgba(240,235,232,0.58);
                    line-height: 1.65;
                }

                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 800px) {
                    .verify-page {
                        grid-template-columns: 1fr;
                    }

                    .verify-side {
                        display: none;
                    }

                    .verify-form-panel {
                        padding: 2.5rem 1.5rem;
                        min-height: 100vh;
                        align-items: flex-start;
                        padding-top: 3.5rem;
                    }

                    .mobile-logo {
                        display: flex;
                    }
                }
            `}</style>

            <div className="verify-page">
                <main className="verify-form-panel">
                    <div className="verify-form-wrap">
                        <div className="mobile-logo">
                            <div className="mobile-logo-img">
                                <img
                                    src="/images/logo.png"
                                    alt="UNIVALLE"
                                    onError={(e) => {
                                        const t = e.currentTarget as HTMLImageElement;
                                        t.style.display = 'none';
                                        const p = t.parentElement;
                                        if (p) {
                                            p.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z" fill="white" fill-opacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <div className="mobile-logo-name">
                                    Universidad Privada del Valle
                                </div>
                                <div className="mobile-logo-sub">
                                    Plataforma Académica · La Paz
                                </div>
                            </div>
                        </div>

                        <div className="form-header">
                            <div className="form-eyebrow">Verificación requerida</div>

                            <h1 className="form-title df">
                                Verifica tu correo
                            </h1>

                            <p className="form-subtitle">
                                Para continuar usando la plataforma, confirma tu dirección de correo electrónico desde el enlace que enviamos a tu bandeja de entrada.
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="status-msg">
                                <IconCheck />

                                <span>
                                    <strong>Correo enviado correctamente</strong>
                                    <span>
                                        Ya enviamos un nuevo enlace de verificación. Revisa tu bandeja de entrada o la carpeta de spam.
                                    </span>
                                </span>
                            </div>
                        )}

                        <div className="info-card">
                            <IconMail />

                            <span>
                                Si no encuentras el correo, revisa la carpeta de spam o solicita un nuevo enlace de verificación.
                            </span>
                        </div>

                        <Form
                            {...send.form()}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {({ processing, recentlySuccessful }) => (
                                <>
                                    {recentlySuccessful && status !== 'verification-link-sent' && (
                                        <div className="status-msg">
                                            <IconCheck />

                                            <span>
                                                <strong>Correo enviado correctamente</strong>
                                                <span>
                                                    Ya enviamos un nuevo enlace de verificación. Revisa tu bandeja de entrada o la carpeta de spam.
                                                </span>
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="spinner" viewBox="0 0 24 24" fill="none" width="16" height="16">
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="rgba(255,255,255,0.3)"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        d="M12 2a10 10 0 0110 10"
                                                        stroke="white"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                Enviando enlace...
                                            </>
                                        ) : (
                                            <>
                                                Reenviar correo de verificación
                                                <IconArrow />
                                            </>
                                        )}
                                    </button>

                                    <div className="form-footer">
                                        <TextLink
                                            href={logout()}
                                            className="logout-link"
                                        >
                                            Cerrar sesión
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </main>

                <aside className="verify-side">
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
                                        if (p) {
                                            p.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z" fill="white" fill-opacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <div className="side-logo-name">
                                    Universidad Privada del Valle
                                </div>
                                <div className="side-logo-sub">
                                    Plataforma Académica · La Paz
                                </div>
                            </div>
                        </a>

                        <h2 className="side-headline df">
                            Confirma tu<br />
                            identidad con<br />
                            <span className="side-headline-gold">tu correo institucional.</span>
                        </h2>

                        <p className="side-desc">
                            La verificación de correo ayuda a proteger tu cuenta y asegura que recibas notificaciones importantes de la plataforma.
                        </p>

                        <div className="side-security-card">
                            <div className="side-security-title">
                                <IconShield />
                                Verificación segura
                            </div>

                            <p className="side-security-text">
                                Solo tendrás acceso completo después de confirmar que la dirección de correo registrada te pertenece.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}

const IconMail = () => (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <path
            d="M22 6l-10 7L2 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
        />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
        <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
        />
    </svg>
);

VerifyEmail.layout = {
    title: 'Verificar correo',
    description:
        'Verifica tu dirección de correo electrónico desde el enlace que enviamos a tu bandeja de entrada.',
};