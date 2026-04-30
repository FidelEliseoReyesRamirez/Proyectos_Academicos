import { Head, Link } from '@inertiajs/react';

const features = [
    {
        title: 'Seguimiento Estructurado',
        description: 'Centraliza el ciclo completo de tu proyecto académico desde el registro hasta la aprobación final, eliminando la dispersión de información.',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feat-icon-svg">
                <rect x="6" y="8" width="36" height="4" rx="2" fill="currentColor" opacity="0.25"/>
                <rect x="6" y="18" width="28" height="4" rx="2" fill="currentColor" opacity="0.55"/>
                <rect x="6" y="28" width="20" height="4" rx="2" fill="currentColor" opacity="0.8"/>
                <circle cx="38" cy="36" r="8" fill="currentColor"/>
                <path d="M34 36l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    },
    {
        title: 'Gestión Documental',
        description: 'Carga y versiona tus avances en PDF con control automático. Tu tutor recibe notificación inmediata al subir cada entrega.',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feat-icon-svg">
                <path d="M12 6h16l10 10v26a2 2 0 01-2 2H12a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08"/>
                <path d="M28 6v10h10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M18 24h12M18 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="34" cy="36" r="7" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M34 33v6M31 36h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        title: 'Comunicación Oficial',
        description: 'Canal de mensajería interno vinculado a cada proyecto. Historial trazable, sin dispersión en grupos externos.',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feat-icon-svg">
                <path d="M8 10h32a2 2 0 012 2v20a2 2 0 01-2 2H14l-8 6V12a2 2 0 012-2z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="18" cy="21" r="2.5" fill="currentColor"/>
                <circle cx="24" cy="21" r="2.5" fill="currentColor"/>
                <circle cx="30" cy="21" r="2.5" fill="currentColor"/>
            </svg>
        ),
    },
    {
        title: 'Panel por Roles',
        description: 'Vistas personalizadas para coordinadores, tutores, revisores y estudiantes. Cada actor ve exactamente lo que necesita.',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feat-icon-svg">
                <circle cx="24" cy="14" r="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
                <circle cx="10" cy="32" r="5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="38" cy="32" r="5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M18 34c0-4 2.7-6 6-6s6 2 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 42c0-3 2-5 5-5M38 42c0-3 2-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        title: 'Trazabilidad Total',
        description: 'Historial completo de cambios de estado, observaciones y reuniones. Evidencia documentada de cada etapa del proyecto.',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feat-icon-svg">
                <circle cx="24" cy="8"  r="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="24" cy="24" r="4" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="24" cy="40" r="4" fill="currentColor" fillOpacity="0.9"  stroke="currentColor" strokeWidth="1.5"/>
                <path d="M24 12v8M24 28v8" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
                <path d="M16 8h-4a2 2 0 00-2 2v4M16 24h-8M16 40h-4a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        title: 'Reportes Institucionales',
        description: 'El coordinador genera reportes exportables en PDF con diseño institucional para rendición de cuentas.',
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="feat-icon-svg">
                <rect x="6" y="6" width="36" height="36" rx="3" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="2"/>
                <rect x="12" y="28" width="5" height="10" rx="1" fill="currentColor" fillOpacity="0.35"/>
                <rect x="21" y="22" width="5" height="16" rx="1" fill="currentColor" fillOpacity="0.55"/>
                <rect x="30" y="14" width="5" height="24" rx="1" fill="currentColor" fillOpacity="0.85"/>
                <path d="M12 20l9-6 9-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    },
];

const steps = [
    { number: '01', title: 'Registro', description: 'El estudiante registra su proyecto con título, modalidad y área temática.' },
    { number: '02', title: 'Asignación', description: 'El coordinador asigna tutor y configura el período académico correspondiente.' },
    { number: '03', title: 'Desarrollo', description: 'El estudiante carga avances en PDF y el tutor registra observaciones formales.' },
    { number: '04', title: 'Evaluación', description: 'Se asignan revisores y el proyecto transita hacia su aprobación final.' },
];

const roles = [
    {
        name: 'Coordinador',
        desc: 'Administra usuarios, supervisa todos los proyectos activos y genera reportes institucionales.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zM4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M18 9l2 2 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    },
    {
        name: 'Tutor',
        desc: 'Revisa avances, registra observaciones y documenta las reuniones de seguimiento académico.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zM4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M16 14h6M19 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        name: 'Revisor',
        desc: 'Evalúa el proyecto en fase final como parte del tribunal académico evaluador asignado.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    },
    {
        name: 'Estudiante',
        desc: 'Registra su proyecto, carga avances y consulta el estado y las observaciones del tutor.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 12v5c3.3 2 8.7 2 12 0v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    },
];

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    return (
        <>
            <Head title="Plataforma Académica — Universidad Privada del Valle" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                /* ── Variables de color ── */
                :root {
                    --guindo-900: #2E0812;
                    --guindo-800: #4A0D21;
                    --guindo-700: #5E1029;
                    --guindo-600: #6B1230;
                    --guindo-400: #9B2D50;
                    --guindo-200: #D4849A;
                    --guindo-50:  #F9EDF0;

                    --gold-500: #C9A84C;
                    --gold-400: #D6B96A;
                    --gold-300: #E2CA8A;
                    --gold-100: #F6EEDC;
                    --gold-50:  #FBF7EE;

                    --warm-950: #1A1614;
                    --warm-800: #3A342C;
                    --warm-600: #6E6458;
                    --warm-400: #A89E94;
                    --warm-300: #C4BEB6;
                    --warm-200: #DCD8D2;
                    --warm-100: #EEEBE6;
                    --warm-50:  #F5F3EF;
                    --warm-25:  #FAF8F5;

                    --bg-base:     var(--warm-25);
                    --bg-surface:  #FEFDFB;
                    --bg-subtle:   var(--warm-50);
                    --bg-muted:    var(--warm-100);

                    --text-primary:   var(--warm-950);
                    --text-secondary: var(--warm-800);
                    --text-muted:     var(--warm-600);

                    --border-subtle: var(--warm-200);
                    --border-medium: var(--warm-300);

                    --accent:        var(--guindo-600);
                    --accent-hover:  var(--guindo-800);
                    --accent-gold:   var(--gold-500);

                    --shadow-md: 0 4px 16px rgba(26,22,20,0.07), 0 1px 4px rgba(26,22,20,0.04);
                    --shadow-lg: 0 8px 32px rgba(107,18,48,0.09), 0 2px 8px rgba(26,22,20,0.05);
                    --shadow-xl: 0 20px 56px rgba(107,18,48,0.11), 0 6px 18px rgba(26,22,20,0.05);

                    --nav-bg:     rgba(250,248,245,0.88);
                    --nav-border: var(--warm-200);
                }

                @media (prefers-color-scheme: dark) {
                    :root {
                        --bg-base:    #120A0D;
                        --bg-surface: #1C1018;
                        --bg-subtle:  #231520;
                        --bg-muted:   #2C1A26;

                        --text-primary:   #EDE8E4;
                        --text-secondary: #C2B8B0;
                        --text-muted:     #887C74;

                        --border-subtle: #3A2430;
                        --border-medium: #4E3040;

                        --accent:       #B85070;
                        --accent-hover: #D4849A;
                        --accent-gold:  #D6B96A;

                        --shadow-md: 0 4px 16px rgba(0,0,0,0.35);
                        --shadow-lg: 0 8px 32px rgba(0,0,0,0.45);
                        --shadow-xl: 0 20px 56px rgba(0,0,0,0.55);

                        --nav-bg:     rgba(18,10,13,0.90);
                        --nav-border: #3A2430;
                    }
                }

                /* ── Reset base ── */
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                html { scroll-behavior: smooth; }

                body {
                    font-family: 'Source Sans 3', sans-serif;
                    background: var(--bg-base);
                    color: var(--text-primary);
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                }

                .df { font-family: 'Playfair Display', serif; }

                /* ── Navbar ── */
                .nav {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 1rem 3rem;
                    background: var(--nav-bg);
                    backdrop-filter: blur(14px) saturate(1.4);
                    border-bottom: 1px solid var(--nav-border);
                    transition: background 0.3s;
                }

                .nav-brand {
                    display: flex; align-items: center; gap: 0.7rem;
                    text-decoration: none;
                }

                .nav-logo {
                    width: 34px; height: 34px; border-radius: 8px;
                    overflow: hidden; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: var(--guindo-600);
                }

                .nav-logo img { width: 100%; height: 100%; object-fit: cover; }

                .nav-brand-text { }

                .nav-brand-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 0.95rem; font-weight: 700;
                    color: var(--accent); letter-spacing: 0.01em;
                    line-height: 1.1;
                }

                .nav-brand-sub {
                    font-size: 0.65rem; color: var(--text-muted);
                    letter-spacing: 0.07em; text-transform: uppercase;
                }

                .nav-actions { display: flex; align-items: center; gap: 0.6rem; }

                .btn-ghost {
                    padding: 0.45rem 1.1rem;
                    border: 1.5px solid var(--accent);
                    background: transparent; color: var(--accent);
                    border-radius: 6px; font-size: 0.85rem; font-weight: 500;
                    cursor: pointer; text-decoration: none;
                    transition: all 0.2s ease;
                    font-family: 'Source Sans 3', sans-serif;
                }
                .btn-ghost:hover { background: var(--accent); color: #fff; }

                .btn-solid {
                    padding: 0.45rem 1.2rem;
                    background: var(--accent); color: #fff;
                    border: 1.5px solid var(--accent);
                    border-radius: 6px; font-size: 0.85rem; font-weight: 600;
                    cursor: pointer; text-decoration: none;
                    transition: all 0.2s ease;
                    font-family: 'Source Sans 3', sans-serif;
                }
                .btn-solid:hover {
                    background: var(--accent-hover);
                    border-color: var(--accent-hover);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                /* ── Hero ── */
                .hero {
                    min-height: 100vh;
                    display: flex; align-items: center;
                    position: relative; overflow: hidden;
                    padding: 8rem 3rem 5rem;
                }

                /* Fondo animado sutil */
                .hero-bg {
                    position: absolute; inset: 0; z-index: 0;
                    background: var(--bg-base);
                }

                /* Ruido de textura */
                .hero-noise {
                    position: absolute; inset: 0; z-index: 1;
                    opacity: 0.018;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    background-repeat: repeat;
                    pointer-events: none;
                }

                /* Grid sutil */
                .hero-grid {
                    position: absolute; inset: 0; z-index: 1;
                    background-image:
                        linear-gradient(var(--border-subtle) 1px, transparent 1px),
                        linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
                    background-size: 52px 52px;
                    opacity: 0.28;
                    mask-image: radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 100%);
                }

                /* Gradiente radial guindo esquina */
                .hero-glow-1 {
                    position: absolute; z-index: 1;
                    top: -220px; right: -200px;
                    width: 640px; height: 640px;
                    background: radial-gradient(circle, rgba(107,18,48,0.07) 0%, transparent 68%);
                    animation: float-glow 9s ease-in-out infinite;
                }

                .hero-glow-2 {
                    position: absolute; z-index: 1;
                    bottom: -180px; left: -160px;
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 68%);
                    animation: float-glow 12s ease-in-out infinite reverse;
                }

                /* Partículas decorativas */
                .hero-orb {
                    position: absolute; z-index: 1;
                    border-radius: 50%;
                    animation: drift 20s linear infinite;
                    opacity: 0;
                }
                .hero-orb-1 {
                    width: 6px; height: 6px;
                    background: var(--accent-gold);
                    top: 25%; left: 15%;
                    animation-duration: 22s; animation-delay: 0s;
                }
                .hero-orb-2 {
                    width: 4px; height: 4px;
                    background: var(--accent);
                    top: 65%; left: 60%;
                    animation-duration: 18s; animation-delay: -7s;
                }
                .hero-orb-3 {
                    width: 5px; height: 5px;
                    background: var(--accent-gold);
                    top: 40%; right: 18%;
                    animation-duration: 25s; animation-delay: -12s;
                }

                @keyframes float-glow {
                    0%, 100% { transform: scale(1) translate(0,0); }
                    33%       { transform: scale(1.04) translate(12px,-8px); }
                    66%       { transform: scale(0.97) translate(-8px,10px); }
                }

                @keyframes drift {
                    0%   { opacity: 0; transform: translateY(0) scale(1); }
                    10%  { opacity: 0.6; }
                    90%  { opacity: 0.4; }
                    100% { opacity: 0; transform: translateY(-120px) scale(0.6); }
                }

                .hero-inner {
                    position: relative; z-index: 2;
                    max-width: 1160px; margin: 0 auto; width: 100%;
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 5rem; align-items: center;
                }

                .hero-badge {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--accent-gold);
                    color: var(--text-secondary);
                    padding: 0.3rem 0.9rem;
                    border-radius: 100px;
                    font-size: 0.73rem; font-weight: 600;
                    letter-spacing: 0.07em; text-transform: uppercase;
                    margin-bottom: 1.4rem;
                    box-shadow: 0 2px 8px rgba(201,168,76,0.12);
                    animation: fade-up 0.55s ease both;
                }

                .badge-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: var(--accent-gold);
                    animation: blink 2.2s ease-in-out infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.25; }
                }

                .hero-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2rem, 3.8vw, 3rem);
                    font-weight: 700; line-height: 1.14;
                    color: var(--text-primary);
                    margin-bottom: 1.4rem;
                    animation: fade-up 0.55s ease 0.08s both;
                }

                .hero-title-hl {
                    color: var(--accent);
                    position: relative; display: inline-block;
                }

                .hero-title-hl::after {
                    content: '';
                    position: absolute; bottom: 1px; left: 0; right: 0;
                    height: 2.5px; background: var(--accent-gold);
                    border-radius: 2px; transform-origin: left;
                    animation: ul-in 0.8s ease 0.65s both;
                }

                @keyframes ul-in {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }

                .hero-desc {
                    font-size: 1rem; line-height: 1.78;
                    color: var(--text-secondary);
                    margin-bottom: 2.2rem; max-width: 460px;
                    animation: fade-up 0.55s ease 0.16s both;
                }

                .hero-actions {
                    display: flex; gap: 0.9rem; flex-wrap: wrap;
                    animation: fade-up 0.55s ease 0.24s both;
                }

                .btn-hero-primary {
                    display: inline-flex; align-items: center; gap: 0.45rem;
                    padding: 0.82rem 1.8rem;
                    background: var(--accent); color: #fff;
                    border-radius: 8px; font-size: 0.93rem; font-weight: 600;
                    text-decoration: none; border: 2px solid var(--accent);
                    transition: all 0.22s ease;
                    font-family: 'Source Sans 3', sans-serif;
                }
                .btn-hero-primary:hover {
                    background: var(--accent-hover);
                    border-color: var(--accent-hover);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                .btn-hero-outline {
                    display: inline-flex; align-items: center; gap: 0.45rem;
                    padding: 0.82rem 1.8rem;
                    background: transparent; color: var(--accent);
                    border-radius: 8px; font-size: 0.93rem; font-weight: 600;
                    text-decoration: none; border: 2px solid var(--accent);
                    transition: all 0.22s ease;
                    font-family: 'Source Sans 3', sans-serif;
                }
                .btn-hero-outline:hover {
                    background: var(--accent); color: #fff;
                    transform: translateY(-2px);
                }

                /* ── Mockup Dashboard ── */
                .hero-visual { animation: fade-up 0.7s ease 0.18s both; }

                .mockup-wrap {
                    background: var(--bg-surface);
                    border-radius: 14px;
                    box-shadow: var(--shadow-xl);
                    overflow: hidden;
                    border: 1px solid var(--border-subtle);
                    transform: perspective(1100px) rotateY(-5deg) rotateX(2deg);
                    transition: transform 0.5s ease;
                }
                .mockup-wrap:hover {
                    transform: perspective(1100px) rotateY(-1.5deg) rotateX(0.5deg);
                }

                .mockup-bar {
                    background: var(--guindo-700);
                    padding: 0.85rem 1.1rem;
                    display: flex; align-items: center; gap: 0.5rem;
                }
                .mk-dot {
                    width: 9px; height: 9px; border-radius: 50%;
                    background: rgba(255,255,255,0.22);
                }
                .mk-title {
                    margin: 0 auto;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.65);
                    font-weight: 500; letter-spacing: 0.04em;
                }

                .mockup-body {
                    padding: 1.1rem;
                    background: var(--bg-subtle);
                    display: flex; flex-direction: column; gap: 0.65rem;
                }

                .mk-card {
                    background: var(--bg-surface);
                    border-radius: 9px; padding: 0.9rem;
                    border: 1px solid var(--border-subtle);
                }

                .mk-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.55rem; }

                .mk-line {
                    height: 7px; border-radius: 4px;
                    background: var(--border-medium);
                }

                .mk-badge {
                    padding: 0.18rem 0.55rem; border-radius: 100px;
                    font-size: 0.6rem; font-weight: 700; white-space: nowrap;
                }
                .mk-b-green  { background: #E6F4EA; color: #276B34; }
                .mk-b-gold   { background: var(--gold-100); color: #7A5510; }
                .mk-b-guindo { background: var(--guindo-50); color: var(--guindo-600); }

                @media (prefers-color-scheme: dark) {
                    .mk-b-green  { background: rgba(39,107,52,0.25); color: #7BC88A; }
                    .mk-b-gold   { background: rgba(122,85,16,0.25); color: #D6B96A; }
                    .mk-b-guindo { background: rgba(107,18,48,0.25); color: #D4849A; }
                }

                .mk-bar {
                    height: 3px; border-radius: 2px;
                    background: var(--border-subtle);
                    overflow: hidden; margin-top: 0.45rem;
                }
                .mk-bar-fill {
                    height: 100%; border-radius: 2px;
                    background: linear-gradient(90deg, var(--guindo-600), var(--gold-500));
                    animation: shimmer 2.5s ease-in-out infinite alternate;
                }
                @keyframes shimmer {
                    from { opacity: 0.65; }
                    to   { opacity: 1; }
                }

                .mk-notif {
                    background: var(--guindo-50);
                    border-left: 3px solid var(--guindo-600);
                    border-radius: 0 8px 8px 0;
                    padding: 0.55rem 0.7rem;
                }
                @media (prefers-color-scheme: dark) {
                    .mk-notif { background: rgba(107,18,48,0.15); border-left-color: var(--guindo-400); }
                }

                /* ── Secciones ── */
                .sec {
                    padding: 5.5rem 3rem;
                }
                .sec-inner { max-width: 1160px; margin: 0 auto; }

                .sec-eyebrow {
                    font-size: 0.7rem; font-weight: 700;
                    letter-spacing: 0.13em; text-transform: uppercase;
                    color: var(--accent-gold); margin-bottom: 0.6rem;
                }

                .sec-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.65rem, 2.8vw, 2.3rem);
                    font-weight: 700; color: var(--text-primary);
                    line-height: 1.2; margin-bottom: 0.9rem;
                }

                .sec-sub {
                    font-size: 0.95rem; color: var(--text-muted);
                    max-width: 520px; line-height: 1.72;
                }

                /* ── Features ── */
                .features-bg { background: var(--bg-surface); }

                .feat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.6rem; margin-top: 3rem;
                }

                .feat-card {
                    padding: 1.75rem 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-subtle);
                    background: var(--bg-base);
                    position: relative; overflow: hidden;
                    transition: all 0.3s ease;
                }
                .feat-card::before {
                    content: '';
                    position: absolute; top: 0; left: 0; right: 0;
                    height: 2.5px;
                    background: linear-gradient(90deg, var(--guindo-600), var(--gold-500));
                    transform: scaleX(0); transform-origin: left;
                    transition: transform 0.3s ease;
                }
                .feat-card:hover {
                    border-color: rgba(201,168,76,0.4);
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-3px);
                }
                .feat-card:hover::before { transform: scaleX(1); }

                .feat-icon-wrap {
                    color: var(--accent);
                    margin-bottom: 1.1rem;
                }
                .feat-icon-svg { width: 40px; height: 40px; }

                .feat-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.05rem; font-weight: 600;
                    color: var(--text-primary); margin-bottom: 0.5rem;
                }

                .feat-desc {
                    font-size: 0.875rem; color: var(--text-muted);
                    line-height: 1.65;
                }

                /* ── Steps ── */
                .steps-bg {
                    background: var(--guindo-800);
                    position: relative; overflow: hidden;
                }
                .steps-bg::before {
                    content: '';
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    pointer-events: none;
                }
                /* Modo oscuro: ajuste de fondo para pasos */
                @media (prefers-color-scheme: dark) {
                    .steps-bg { background: #1C0E16; }
                }

                .steps-bg .sec-title { color: #F0EBE8; }
                .steps-bg .sec-eyebrow { color: var(--gold-400); }
                .steps-bg .sec-sub { color: rgba(240,235,232,0.55); }

                .steps-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem; margin-top: 3rem;
                    position: relative; z-index: 1;
                }

                .steps-connector {
                    position: absolute; top: 2rem;
                    left: calc(12.5% + 0.75rem);
                    right: calc(12.5% + 0.75rem);
                    height: 1px;
                    background: rgba(255,255,255,0.12);
                }

                .step-item { text-align: center; position: relative; z-index: 1; }

                .step-circle {
                    width: 60px; height: 60px;
                    margin: 0 auto 1.1rem;
                    background: rgba(255,255,255,0.08);
                    border: 1.5px solid rgba(255,255,255,0.18);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Playfair Display', serif;
                    font-size: 1rem; font-weight: 700;
                    color: var(--gold-400);
                    transition: all 0.3s ease;
                }
                .step-item:hover .step-circle {
                    background: rgba(201,168,76,0.15);
                    border-color: var(--gold-400);
                    transform: scale(1.06);
                }

                .step-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1rem; font-weight: 600; color: #F0EBE8;
                    margin-bottom: 0.5rem;
                }
                .step-desc {
                    font-size: 0.83rem; color: rgba(240,235,232,0.55);
                    line-height: 1.6;
                }

                /* ── Roles ── */
                .roles-bg { background: var(--bg-subtle); }

                .roles-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem; margin-top: 2.75rem;
                }

                .role-card {
                    background: var(--bg-surface);
                    border-radius: 12px; padding: 1.75rem 1.25rem;
                    text-align: center;
                    border: 1px solid var(--border-subtle);
                    transition: all 0.28s ease;
                }
                .role-card:hover {
                    border-color: var(--accent);
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-3px);
                }

                .role-icon-box {
                    width: 52px; height: 52px;
                    background: var(--guindo-50);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                    color: var(--guindo-600);
                    transition: all 0.28s ease;
                }
                @media (prefers-color-scheme: dark) {
                    .role-icon-box { background: rgba(107,18,48,0.18); color: var(--guindo-200); }
                }
                .role-card:hover .role-icon-box {
                    background: var(--accent);
                    color: #fff;
                }

                .role-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 0.98rem; font-weight: 600;
                    color: var(--text-primary); margin-bottom: 0.45rem;
                }
                .role-desc {
                    font-size: 0.82rem; color: var(--text-muted);
                    line-height: 1.58;
                }

                /* ── CTA ── */
                .cta-bg { background: var(--bg-surface); text-align: center; }

                .cta-divider {
                    display: flex; align-items: center; gap: 1rem;
                    margin-bottom: 2.75rem;
                }
                .cta-line { flex: 1; height: 1px; background: var(--border-subtle); }
                .cta-gem {
                    width: 38px; height: 38px;
                    background: var(--accent);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                .cta-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.65rem, 2.8vw, 2.3rem);
                    font-weight: 700; color: var(--text-primary);
                    margin-bottom: 0.9rem; line-height: 1.2;
                }
                .cta-desc {
                    font-size: 0.95rem; color: var(--text-muted);
                    margin-bottom: 2.25rem; line-height: 1.72;
                    max-width: 500px; margin-left: auto; margin-right: auto;
                }
                .cta-actions {
                    display: flex; justify-content: center;
                    gap: 0.9rem; flex-wrap: wrap;
                }

                /* ── Footer ── */
                .footer {
                    background: var(--guindo-900);
                    padding: 2.25rem 3rem;
                    display: flex; align-items: center; justify-content: space-between;
                }
                @media (prefers-color-scheme: dark) {
                    .footer { background: #0E080C; border-top: 1px solid var(--border-subtle); }
                }
                .footer-brand {
                    font-family: 'Playfair Display', serif;
                    color: #F0EBE8; font-size: 0.9rem;
                }
                .footer-sub { font-size: 0.72rem; color: rgba(240,235,232,0.38); margin-top: 0.18rem; }
                .footer-right { font-size: 0.72rem; color: rgba(240,235,232,0.4); text-align: right; }
                .footer-gold { color: var(--gold-400); }

                /* ── Animaciones ── */
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Responsive ── */
                @media (max-width: 960px) {
                    .nav { padding: 0.9rem 1.5rem; }
                    .hero { padding: 7rem 1.5rem 4rem; }
                    .hero-inner { grid-template-columns: 1fr; gap: 3rem; }
                    .mockup-wrap { transform: none; }
                    .sec { padding: 4rem 1.5rem; }
                    .feat-grid { grid-template-columns: 1fr 1fr; }
                    .steps-grid { grid-template-columns: 1fr 1fr; }
                    .steps-connector { display: none; }
                    .roles-grid { grid-template-columns: 1fr 1fr; }
                    .footer { flex-direction: column; gap: 1rem; text-align: center; }
                    .footer-right { text-align: center; }
                }

                @media (max-width: 580px) {
                    .feat-grid { grid-template-columns: 1fr; }
                    .steps-grid { grid-template-columns: 1fr; }
                    .roles-grid { grid-template-columns: 1fr; }
                    .nav-brand-sub { display: none; }
                    .hero-title { font-size: 1.85rem; }
                }
            `}</style>

            {/* ── NAVBAR ── */}
            <nav className="nav">
                <div className="nav-brand">
                    <div className="nav-logo">
                        <img src="/images/logo.png" alt="UNIVALLE" onError={(e) => {
                            const t = e.currentTarget as HTMLImageElement;
                            t.style.display = 'none';
                            const parent = t.parentElement;
                            if (parent) {
                                parent.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z" fill="white" fill-opacity="0.9"/><path d="M9 12l2 2 4-4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                            }
                        }} />
                    </div>
                    <div className="nav-brand-text">
                        <div className="nav-brand-name">Universidad Privada del Valle</div>
                        <div className="nav-brand-sub">Plataforma Académica · La Paz</div>
                    </div>
                </div>
                <div className="nav-actions">
                    <Link href="/login" className="btn-ghost">Iniciar Sesión</Link>
                    {canRegister && (
                        <Link href="/register" className="btn-solid">Registrarse</Link>
                    )}
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="hero-noise" />
                <div className="hero-grid" />
                <div className="hero-glow-1" />
                <div className="hero-glow-2" />
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />
                <div className="hero-orb hero-orb-3" />

                <div className="hero-inner">
                    <div>
                        <div className="hero-badge">
                            <span className="badge-dot" />
                            Plataforma Académica Oficial
                        </div>
                        <h1 className="hero-title df">
                            Gestiona tu proyecto<br />
                            <span className="hero-title-hl">académico</span> con<br />
                            orden y trazabilidad
                        </h1>
                        <p className="hero-desc">
                            Una plataforma centralizada para el seguimiento de proyectos estudiantiles en la Universidad Privada del Valle. Sin chats dispersos, sin archivos perdidos.
                        </p>
                        <div className="hero-actions">
                            {canRegister && (
                                <Link href="/register" className="btn-hero-primary">
                                    Comenzar ahora
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                </Link>
                            )}
                            <Link href="/login" className="btn-hero-outline">
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>

                    {/* Mockup */}
                    <div className="hero-visual">
                        <div className="mockup-wrap">
                            <div className="mockup-bar">
                                <div className="mk-dot" /><div className="mk-dot" /><div className="mk-dot" />
                                <span className="mk-title">Panel de Seguimiento</span>
                            </div>
                            <div className="mockup-body">
                                {[
                                    { label: 'PROJ-2025-0012', badge: 'Aprobado', cls: 'mk-b-green', w: '85%', lw: '62%' },
                                    { label: 'PROJ-2025-0018', badge: 'En desarrollo', cls: 'mk-b-gold', w: '54%', lw: '55%' },
                                    { label: 'PROJ-2025-0023', badge: 'Observado', cls: 'mk-b-guindo', w: '32%', lw: '48%' },
                                ].map((c, i) => (
                                    <div className="mk-card" key={i}>
                                        <div className="mk-row">
                                            <div className="mk-line" style={{width: c.lw}} />
                                            <span className={`mk-badge ${c.cls}`}>{c.badge}</span>
                                        </div>
                                        <div className="mk-line" style={{width:'88%'}} />
                                        <div className="mk-bar" style={{marginTop:'0.5rem'}}>
                                            <div className="mk-bar-fill" style={{width: c.w}} />
                                        </div>
                                    </div>
                                ))}
                                <div className="mk-notif">
                                    <div className="mk-line" style={{width:'78%', background:'rgba(107,18,48,0.18)'}} />
                                    <div className="mk-line" style={{width:'52%', background:'rgba(107,18,48,0.12)', marginTop:'0.3rem'}} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="sec features-bg">
                <div className="sec-inner">
                    <div className="sec-eyebrow">Funcionalidades</div>
                    <h2 className="sec-title df">Todo lo que necesitas<br />en un solo lugar</h2>
                    <p className="sec-sub">
                        Diseñado para reemplazar los grupos de Teams y los archivos dispersos con una solución estructurada y formal.
                    </p>
                    <div className="feat-grid">
                        {features.map((f, i) => (
                            <div className="feat-card" key={i}>
                                <div className="feat-icon-wrap">{f.icon}</div>
                                <div className="feat-title df">{f.title}</div>
                                <p className="feat-desc">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STEPS ── */}
            <section className="sec steps-bg">
                <div className="sec-inner" style={{position:'relative', zIndex:1}}>
                    <div className="sec-eyebrow">Proceso</div>
                    <h2 className="sec-title df">¿Cómo funciona?</h2>
                    <p className="sec-sub">
                        Un flujo claro desde el registro hasta la aprobación final del proyecto académico.
                    </p>
                    <div className="steps-grid" style={{position:'relative'}}>
                        <div className="steps-connector" />
                        {steps.map((s, i) => (
                            <div className="step-item" key={i}>
                                <div className="step-circle">{s.number}</div>
                                <div className="step-title df">{s.title}</div>
                                <p className="step-desc">{s.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ROLES ── */}
            <section className="sec roles-bg">
                <div className="sec-inner">
                    <div className="sec-eyebrow">Actores del sistema</div>
                    <h2 className="sec-title df">Una plataforma<br />para todos los roles</h2>
                    <div className="roles-grid">
                        {roles.map((r, i) => (
                            <div className="role-card" key={i}>
                                <div className="role-icon-box">{r.icon}</div>
                                <div className="role-name df">{r.name}</div>
                                <p className="role-desc">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="sec cta-bg">
                <div className="sec-inner" style={{maxWidth:'600px', margin:'0 auto', textAlign:'center'}}>
                    <div className="cta-divider">
                        <div className="cta-line" />
                        <div className="cta-gem">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                <path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z" fill="white" fillOpacity="0.9"/>
                                <path d="M9 12l2 2 4-4" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="cta-line" />
                    </div>
                    <h2 className="cta-title df">¿Listo para organizar<br />tu seguimiento académico?</h2>
                    <p className="cta-desc">
                        Únete a la plataforma oficial de gestión de proyectos estudiantiles de la Universidad Privada del Valle sede La Paz.
                    </p>
                    <div className="cta-actions">
                        {canRegister && (
                            <Link href="/register" className="btn-hero-primary">
                                Crear cuenta
                                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                </svg>
                            </Link>
                        )}
                        <Link href="/login" className="btn-hero-outline">
                            Ya tengo cuenta
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div>
                    <div className="footer-brand df">Universidad Privada del Valle</div>
                    <div className="footer-sub">Plataforma de Gestión Académica · Sede La Paz</div>
                </div>
                <div className="footer-right">
                    <div>Desarrollado por <span className="footer-gold">SudoSquad</span></div>
                    <div style={{marginTop:'0.18rem'}}>Ingeniería de Sistemas · 2025</div>
                </div>
            </footer>
        </>
    );
}