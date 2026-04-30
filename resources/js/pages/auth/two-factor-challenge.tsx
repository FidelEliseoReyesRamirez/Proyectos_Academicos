import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

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

const IconKey = () => (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <circle cx="7.5" cy="14.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path
            d="M10 12l9-9 2 2-2 2 2 2-2 2-2-2-5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const IconLock = () => (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
        eyebrow: string;
        button: string;
        placeholder: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Código de recuperación',
                description:
                    'Ingresa uno de tus códigos de emergencia para confirmar el acceso a tu cuenta.',
                toggleText: 'usar código de autenticación',
                eyebrow: 'Acceso alternativo',
                button: 'Continuar con código de recuperación',
                placeholder: 'Ingresa tu código de recuperación',
            };
        }

        return {
            title: 'Código de autenticación',
            description:
                'Ingresa el código generado por tu aplicación de autenticación para continuar.',
            toggleText: 'usar código de recuperación',
            eyebrow: 'Verificación en dos pasos',
            button: 'Continuar',
            placeholder: '',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Verificación en dos pasos — UNIVALLE" />

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

                .two-factor-page {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                .two-factor-form-panel {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    background: var(--bg-page);
                    overflow-y: auto;
                }

                .two-factor-form-wrap {
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

                .field {
                    margin-bottom: 1.2rem;
                }

                .field-label {
                    display: block;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--text-sec);
                    margin-bottom: 0.4rem;
                    letter-spacing: 0.01em;
                }

                .input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 0.85rem;
                    color: var(--text-muted);
                    pointer-events: none;
                    display: flex;
                    align-items: center;
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

                .field-input::placeholder {
                    color: var(--text-muted);
                    opacity: 0.7;
                }

                .field-input:focus {
                    border-color: var(--border-focus);
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.08);
                }

                @media (prefers-color-scheme: dark) {
                    .field-input:focus {
                        box-shadow: 0 0 0 3px rgba(184,80,112,0.15);
                    }
                }

                .field-input.has-error {
                    border-color: #E53E3E;
                }

                .field-error {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.78rem;
                    color: #E53E3E;
                    margin-top: 0.45rem;
                    animation: fade-in 0.2s ease;
                }

                .otp-box {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 0.65rem;
                }

                .otp-box [data-slot="input-otp-group"] {
                    gap: 0.45rem;
                }

                .otp-box [data-slot="input-otp-slot"] {
                    width: 2.75rem;
                    height: 3.15rem;
                    border-radius: 10px;
                    border: 1.5px solid var(--border);
                    background: var(--bg-input);
                    color: var(--text-main);
                    font-size: 1.05rem;
                    font-weight: 800;
                    box-shadow: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
                }

                .otp-box [data-slot="input-otp-slot"][data-active="true"] {
                    border-color: var(--border-focus);
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.08);
                }

                @media (prefers-color-scheme: dark) {
                    .otp-box [data-slot="input-otp-slot"][data-active="true"] {
                        box-shadow: 0 0 0 3px rgba(184,80,112,0.15);
                    }
                }

                .helper-card {
                    display: flex;
                    gap: 0.65rem;
                    border-radius: 12px;
                    border: 1px solid rgba(201,168,76,0.28);
                    background: rgba(201,168,76,0.08);
                    color: var(--text-muted);
                    font-size: 0.82rem;
                    line-height: 1.55;
                    padding: 0.85rem 0.95rem;
                    margin-bottom: 1.35rem;
                }

                .helper-card svg {
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
                    margin-top: 1.2rem;
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

                .toggle-row {
                    margin-top: 1.25rem;
                    text-align: center;
                    font-size: 0.84rem;
                    color: var(--text-muted);
                }

                .toggle-button {
                    cursor: pointer;
                    border: none;
                    background: transparent;
                    color: var(--accent);
                    font-weight: 700;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .toggle-button:hover {
                    opacity: 0.76;
                }

                .two-factor-side {
                    background: var(--guindo-800);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 4rem 3.5rem;
                }

                @media (prefers-color-scheme: dark) {
                    .two-factor-side {
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
                    margin-bottom: 1.5rem;
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
                    .two-factor-page {
                        grid-template-columns: 1fr;
                    }

                    .two-factor-side {
                        display: none;
                    }

                    .two-factor-form-panel {
                        padding: 2.5rem 1.5rem;
                        min-height: 100vh;
                        align-items: flex-start;
                        padding-top: 3.5rem;
                    }

                    .mobile-logo {
                        display: flex;
                    }

                    .otp-box [data-slot="input-otp-slot"] {
                        width: 2.35rem;
                        height: 2.85rem;
                    }
                }
            `}</style>

            <div className="two-factor-page">
                <main className="two-factor-form-panel">
                    <div className="two-factor-form-wrap">
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
                            <div className="form-eyebrow">
                                {authConfigContent.eyebrow}
                            </div>

                            <h1 className="form-title df">
                                {authConfigContent.title}
                            </h1>

                            <p className="form-subtitle">
                                {authConfigContent.description}
                            </p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnError
                            resetOnSuccess={!showRecoveryInput}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {({ errors, processing, clearErrors }) => (
                                <>
                                    {showRecoveryInput ? (
                                        <>
                                            <div className="helper-card">
                                                <IconKey />
                                                <span>
                                                    Usa uno de los códigos de recuperación guardados al activar la verificación en dos pasos.
                                                </span>
                                            </div>

                                            <div className="field">
                                                <label className="field-label" htmlFor="recovery_code">
                                                    Código de recuperación
                                                </label>

                                                <div className="input-wrap">
                                                    <span className="input-icon">
                                                        <IconKey />
                                                    </span>

                                                    <input
                                                        id="recovery_code"
                                                        name="recovery_code"
                                                        type="text"
                                                        placeholder={authConfigContent.placeholder}
                                                        autoFocus={showRecoveryInput}
                                                        required
                                                        className={`field-input${errors.recovery_code ? ' has-error' : ''}`}
                                                    />
                                                </div>

                                                {errors.recovery_code && (
                                                    <div className="field-error">
                                                        <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                                                            <path
                                                                d="M4 4l8 8M12 4l-8 8"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        {errors.recovery_code}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="helper-card">
                                                <IconShield />
                                                <span>
                                                    Abre tu aplicación de autenticación y escribe el código de seis dígitos.
                                                </span>
                                            </div>

                                            <div className="otp-box">
                                                <InputOTP
                                                    name="code"
                                                    maxLength={OTP_MAX_LENGTH}
                                                    value={code}
                                                    onChange={(value) => setCode(value)}
                                                    disabled={processing}
                                                    pattern={REGEXP_ONLY_DIGITS}
                                                >
                                                    <InputOTPGroup>
                                                        {Array.from(
                                                            { length: OTP_MAX_LENGTH },
                                                            (_, index) => (
                                                                <InputOTPSlot
                                                                    key={index}
                                                                    index={index}
                                                                />
                                                            ),
                                                        )}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </div>

                                            {errors.code && (
                                                <div className="field-error" style={{ justifyContent: 'center' }}>
                                                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                                                        <path
                                                            d="M4 4l8 8M12 4l-8 8"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    {errors.code}
                                                </div>
                                            )}
                                        </>
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
                                                Verificando...
                                            </>
                                        ) : (
                                            <>
                                                {authConfigContent.button}
                                                <IconArrow />
                                            </>
                                        )}
                                    </button>

                                    <div className="toggle-row">
                                        <span>También puedes </span>
                                        <button
                                            type="button"
                                            className="toggle-button"
                                            onClick={() => toggleRecoveryMode(clearErrors)}
                                        >
                                            {authConfigContent.toggleText}
                                        </button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </main>

                <aside className="two-factor-side">
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
                            Verificación<br />
                            adicional para<br />
                            <span className="side-headline-gold">proteger tu cuenta.</span>
                        </h2>

                        <p className="side-desc">
                            Este paso confirma que el acceso pertenece al titular de la cuenta y reduce el riesgo de ingresos no autorizados.
                        </p>

                        <div className="side-security-card">
                            <div className="side-security-title">
                                <IconShield />
                                Seguridad activa
                            </div>

                            <p className="side-security-text">
                                La autenticación de dos factores agrega una capa extra de protección antes de ingresar al sistema académico.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}