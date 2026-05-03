import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';

type AuthUser = {
    id?: number;
    name?: string;
    email?: string;
    role?: string | null;
    rol?: string | null;
};

type SharedPageProps = {
    auth?: {
        user?: AuthUser | null;
    };
};

const roleLabels: Record<string, string> = {
    estudiante: 'Estudiante',
    tutor: 'Tutor',
    revisor: 'Revisor',
    coordinador: 'Coordinador',
    admin: 'Administrador',
    administrador: 'Administrador',
};

function normalizeRole(role?: string | null): string {
    return String(role || 'estudiante').toLowerCase();
}

function getInitials(name?: string): string {
    if (!name) return 'U';

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const IconMail = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconSpark = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path
            d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    </svg>
);

const IconBook = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const IconClock = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconLayers = () => (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M12 3L3 8l9 5 9-5-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 18l9 5 9-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Dashboard() {
    const page = usePage<SharedPageProps>();

    const user = page.props.auth?.user;
    const userName = user?.name || 'Usuario';
    const userEmail = user?.email || 'Sin correo registrado';

    const rawRole = user?.role ?? user?.rol;
    const role = normalizeRole(rawRole);
    const roleLabel = roleLabels[role] || role;

    return (
        <>
            <Head title="Dashboard" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600;700;800&display=swap');

                .dashboard-page,
                .dashboard-page * {
                    box-sizing: border-box;
                }

                .dashboard-page {
                    width: 100%;
                    position: relative;
                    overflow-x: hidden;
                    overflow-y: visible;
                    color: #24151A;
                    font-family: 'Source Sans 3', sans-serif;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.26), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.16), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.20), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.18), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .dashboard-page::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    opacity: 0.16;
                    background-image:
                        linear-gradient(rgba(107,18,48,0.18) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(107,18,48,0.18) 1px, transparent 1px);
                    background-size: 48px 48px;
                    mask-image: radial-gradient(ellipse 80% 65% at 50% 42%, black 20%, transparent 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-page::before {
                        opacity: 0.10;
                        background-image:
                            linear-gradient(rgba(214,185,106,0.45) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(214,185,106,0.45) 1px, transparent 1px);
                    }
                }

                .dashboard-shell {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    width: 100%;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding: 1rem;
                }

                @media (min-width: 768px) {
                    .dashboard-shell {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

                .dashboard-hero {
                    position: relative;
                    overflow: hidden;
                    border-radius: 1.6rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    background:
                        radial-gradient(circle at 90% 10%, rgba(201,168,76,0.30), transparent 32%),
                        radial-gradient(circle at 0% 100%, rgba(107,18,48,0.12), transparent 38%),
                        linear-gradient(135deg, rgba(255,255,255,0.88), rgba(249,237,240,0.92) 46%, rgba(246,238,220,0.88));
                    box-shadow: 0 18px 45px rgba(107,18,48,0.10), 0 8px 18px rgba(26,22,20,0.06);
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-hero {
                        border-color: rgba(214,185,106,0.24);
                        background:
                            radial-gradient(circle at 90% 10%, rgba(214,185,106,0.22), transparent 30%),
                            radial-gradient(circle at 0% 100%, rgba(212,132,154,0.22), transparent 38%),
                            linear-gradient(135deg, rgba(67,34,50,0.96), rgba(43,22,32,0.96) 48%, rgba(53,27,40,0.96));
                        box-shadow: 0 18px 45px rgba(18,7,12,0.38);
                    }
                }

                .dashboard-hero::before {
                    content: '';
                    position: absolute;
                    top: -120px;
                    right: -90px;
                    width: 320px;
                    height: 320px;
                    border-radius: 999px;
                    background: radial-gradient(circle, rgba(201,168,76,0.32), transparent 68%);
                    pointer-events: none;
                }

                .dashboard-hero::after {
                    content: '';
                    position: absolute;
                    bottom: -160px;
                    left: -120px;
                    width: 360px;
                    height: 360px;
                    border-radius: 999px;
                    background: radial-gradient(circle, rgba(107,18,48,0.16), transparent 68%);
                    pointer-events: none;
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-hero::before {
                        background: radial-gradient(circle, rgba(214,185,106,0.22), transparent 68%);
                    }

                    .dashboard-hero::after {
                        background: radial-gradient(circle, rgba(212,132,154,0.20), transparent 68%);
                    }
                }

                .dashboard-hero-content {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    gap: 1.4rem;
                    padding: 1.35rem;
                }

                @media (min-width: 900px) {
                    .dashboard-hero-content {
                        grid-template-columns: minmax(0, 1.5fr) minmax(310px, 0.8fr);
                        align-items: stretch;
                        padding: 2rem;
                    }
                }

                .dashboard-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    border-radius: 999px;
                    border: 1px solid rgba(184,138,40,0.34);
                    background: rgba(201,168,76,0.14);
                    padding: 0.38rem 0.9rem;
                    color: #9A6C18;
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-eyebrow {
                        border-color: rgba(214,185,106,0.38);
                        background: rgba(214,185,106,0.10);
                        color: #D6B96A;
                    }
                }

                .dashboard-eyebrow svg {
                    width: 0.9rem;
                    height: 0.9rem;
                }

                .dashboard-title {
                    margin: 0;
                    color: #24151A;
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2rem, 4vw, 3.1rem);
                    font-weight: 700;
                    line-height: 1.06;
                    letter-spacing: -0.035em;
                }

                .dashboard-title span {
                    color: #6B1230;
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-title {
                        color: #F4EEE9;
                    }

                    .dashboard-title span {
                        color: #E2CA8A;
                    }
                }

                .dashboard-description {
                    margin-top: 0.9rem;
                    max-width: 43rem;
                    color: #6E6458;
                    font-size: 0.96rem;
                    line-height: 1.78;
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-description {
                        color: #D7C9C0;
                    }
                }

                .dashboard-details-grid {
                    margin-top: 1.45rem;
                    display: grid;
                    gap: 0.85rem;
                }

                @media (min-width: 640px) {
                    .dashboard-details-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                .dashboard-detail-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 1.1rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.62);
                    padding: 1rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 28px rgba(107,18,48,0.06);
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-detail-card {
                        border-color: rgba(214,185,106,0.16);
                        background: rgba(255,255,255,0.055);
                        box-shadow: none;
                    }
                }

                .dashboard-detail-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at top right, rgba(201,168,76,0.16), transparent 40%);
                    pointer-events: none;
                }

                .dashboard-detail-head {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    color: #8A8074;
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .dashboard-detail-head svg {
                    color: #B88A28;
                }

                .dashboard-detail-value {
                    position: relative;
                    z-index: 1;
                    margin-top: 0.38rem;
                    color: #24151A;
                    font-size: 0.96rem;
                    font-weight: 900;
                    line-height: 1.35;
                    overflow-wrap: anywhere;
                }

                .dashboard-detail-card.is-role {
                    border-color: rgba(107,18,48,0.22);
                    background: rgba(249,237,240,0.76);
                }

                .dashboard-detail-card.is-role .dashboard-detail-value {
                    color: #6B1230;
                }

                @media (prefers-color-scheme: dark) {
                    .dashboard-detail-head {
                        color: #A9978D;
                    }

                    .dashboard-detail-head svg {
                        color: #D6B96A;
                    }

                    .dashboard-detail-value {
                        color: #F4EEE9;
                    }

                    .dashboard-detail-card.is-role {
                        border-color: rgba(212,132,154,0.35);
                        background: rgba(212,132,154,0.10);
                    }

                    .dashboard-detail-card.is-role .dashboard-detail-value {
                        color: #D4849A;
                    }
                }

                .profile-card {
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 100%;
                    border-radius: 1.35rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    background:
                        radial-gradient(circle at top right, rgba(201,168,76,0.22), transparent 42%),
                        linear-gradient(180deg, rgba(255,255,255,0.74), rgba(255,255,255,0.46));
                    padding: 1.25rem;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                }

                .profile-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #6B1230, #C9A84C);
                }

                @media (prefers-color-scheme: dark) {
                    .profile-card {
                        border-color: rgba(214,185,106,0.22);
                        background:
                            radial-gradient(circle at top right, rgba(214,185,106,0.14), transparent 42%),
                            linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035));
                        box-shadow: none;
                    }

                    .profile-card::before {
                        background: linear-gradient(90deg, #D4849A, #D6B96A);
                    }
                }

                .profile-main {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .profile-avatar {
                    display: flex;
                    height: 4.4rem;
                    width: 4.4rem;
                    flex-shrink: 0;
                    align-items: center;
                    justify-content: center;
                    border-radius: 1.2rem;
                    border: 1px solid rgba(184,138,40,0.34);
                    background:
                        linear-gradient(135deg, rgba(107,18,48,0.14), rgba(201,168,76,0.22));
                    color: #6B1230;
                    font-size: 1.18rem;
                    font-weight: 900;
                    box-shadow: 0 12px 30px rgba(107,18,48,0.10);
                }

                .profile-name {
                    margin: 0;
                    color: #24151A;
                    font-size: 1rem;
                    font-weight: 900;
                    line-height: 1.3;
                }

                .profile-email {
                    margin-top: 0.2rem;
                    color: #6E6458;
                    font-size: 0.8rem;
                    line-height: 1.45;
                    overflow-wrap: anywhere;
                }

                @media (prefers-color-scheme: dark) {
                    .profile-avatar {
                        border-color: rgba(214,185,106,0.46);
                        background:
                            linear-gradient(135deg, rgba(212,132,154,0.28), rgba(214,185,106,0.18));
                        color: #E2CA8A;
                        box-shadow: 0 12px 30px rgba(18,7,12,0.28);
                    }

                    .profile-name {
                        color: #F4EEE9;
                    }

                    .profile-email {
                        color: #A9978D;
                    }
                }

                .profile-status {
                    position: relative;
                    z-index: 1;
                    margin-top: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    border-radius: 0.95rem;
                    border: 1px solid rgba(107,18,48,0.20);
                    background: rgba(249,237,240,0.70);
                    padding: 0.85rem 0.95rem;
                }

                .profile-status-dot {
                    height: 0.65rem;
                    width: 0.65rem;
                    flex-shrink: 0;
                    border-radius: 999px;
                    background: #6B1230;
                    box-shadow: 0 0 0 4px rgba(107,18,48,0.12);
                }

                .profile-status-text {
                    color: #6B1230;
                    font-size: 0.86rem;
                    font-weight: 900;
                }

                .profile-note {
                    position: relative;
                    z-index: 1;
                    margin-top: 1rem;
                    border-top: 1px solid rgba(107,18,48,0.10);
                    padding-top: 1rem;
                    color: #6E6458;
                    font-size: 0.8rem;
                    line-height: 1.65;
                }

                @media (prefers-color-scheme: dark) {
                    .profile-status {
                        border-color: rgba(212,132,154,0.34);
                        background: rgba(212,132,154,0.10);
                    }

                    .profile-status-dot {
                        background: #D4849A;
                        box-shadow: 0 0 0 4px rgba(212,132,154,0.16);
                    }

                    .profile-status-text {
                        color: #E3A1B2;
                    }

                    .profile-note {
                        border-top-color: rgba(214,185,106,0.14);
                        color: #A9978D;
                    }
                }

                .visual-strip {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 0.8rem;
                }

                @media (max-width: 820px) {
                    .visual-strip {
                        grid-template-columns: 1fr;
                    }
                }

                .mini-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 1.1rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background:
                        radial-gradient(circle at top right, rgba(201,168,76,0.22), transparent 38%),
                        rgba(255,255,255,0.70);
                    padding: 1rem;
                    min-height: 7.5rem;
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                }

                .mini-icon {
                    display: flex;
                    height: 2.25rem;
                    width: 2.25rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.8rem;
                    border: 1px solid rgba(184,138,40,0.28);
                    background: rgba(201,168,76,0.14);
                    color: #9A6C18;
                    margin-bottom: 0.75rem;
                }

                .mini-label {
                    color: #8A8074;
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .mini-value {
                    margin-top: 0.3rem;
                    color: #24151A;
                    font-size: 0.9rem;
                    font-weight: 900;
                    line-height: 1.35;
                }

                @media (prefers-color-scheme: dark) {
                    .mini-card {
                        border-color: rgba(214,185,106,0.18);
                        background:
                            radial-gradient(circle at top right, rgba(214,185,106,0.12), transparent 38%),
                            rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }

                    .mini-icon {
                        border-color: rgba(214,185,106,0.24);
                        background: rgba(214,185,106,0.10);
                        color: #D6B96A;
                    }

                    .mini-label {
                        color: #A9978D;
                    }

                    .mini-value {
                        color: #F4EEE9;
                    }
                }

                .dashboard-content-grid {
                    display: grid;
                    gap: 1.25rem;
                }

                @media (min-width: 900px) {
                    .dashboard-content-grid {
                        grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
                    }
                }

                .soft-panel {
                    position: relative;
                    overflow: hidden;
                    border-radius: 1.25rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background:
                        radial-gradient(circle at 100% 0%, rgba(201,168,76,0.18), transparent 34%),
                        linear-gradient(145deg, rgba(255,255,255,0.82), rgba(249,237,240,0.80));
                    padding: 1.35rem;
                    box-shadow: 0 14px 38px rgba(107,18,48,0.08);
                }

                .soft-panel::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #6B1230, #C9A84C);
                    opacity: 0.95;
                }

                .soft-panel-label {
                    color: #9A6C18;
                    font-size: 0.72rem;
                    font-weight: 900;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                }

                .soft-panel-title {
                    margin-top: 0.5rem;
                    color: #24151A;
                    font-family: 'Playfair Display', serif;
                    font-size: 1.42rem;
                    font-weight: 700;
                    line-height: 1.25;
                }

                .soft-panel-text {
                    margin-top: 0.65rem;
                    color: #6E6458;
                    font-size: 0.9rem;
                    line-height: 1.72;
                }

                @media (prefers-color-scheme: dark) {
                    .soft-panel {
                        border-color: rgba(214,185,106,0.20);
                        background:
                            radial-gradient(circle at 100% 0%, rgba(214,185,106,0.12), transparent 34%),
                            linear-gradient(145deg, rgba(67,34,50,0.92), rgba(43,22,32,0.96));
                        box-shadow: 0 14px 38px rgba(18,7,12,0.28);
                    }

                    .soft-panel::before {
                        background: linear-gradient(90deg, #D4849A, #D6B96A);
                    }

                    .soft-panel-label {
                        color: #D6B96A;
                    }

                    .soft-panel-title {
                        color: #F4EEE9;
                    }

                    .soft-panel-text {
                        color: #D7C9C0;
                    }
                }

                .role-card {
                    margin-top: 1.1rem;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.85rem;
                    border-radius: 1rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    background: rgba(249,237,240,0.74);
                    padding: 1rem;
                }

                .role-card-icon {
                    display: flex;
                    height: 2.25rem;
                    width: 2.25rem;
                    flex-shrink: 0;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.75rem;
                    background: rgba(107,18,48,0.10);
                    color: #6B1230;
                }

                .role-card-title {
                    margin: 0;
                    color: #6B1230;
                    font-size: 0.95rem;
                    font-weight: 900;
                }

                .role-card-text {
                    margin-top: 0.25rem;
                    color: #6E6458;
                    font-size: 0.82rem;
                    line-height: 1.6;
                }

                @media (prefers-color-scheme: dark) {
                    .role-card {
                        border-color: rgba(212,132,154,0.34);
                        background: rgba(212,132,154,0.10);
                    }

                    .role-card-icon {
                        background: rgba(212,132,154,0.14);
                        color: #D4849A;
                    }

                    .role-card-title {
                        color: #E3A1B2;
                    }

                    .role-card-text {
                        color: #D7C9C0;
                    }
                }

                .empty-panel {
                    position: relative;
                    display: flex;
                    min-height: 100%;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-radius: 1.25rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background:
                        radial-gradient(circle at top right, rgba(201,168,76,0.22), transparent 40%),
                        linear-gradient(145deg, rgba(255,255,255,0.82), rgba(246,238,220,0.80));
                    padding: 1.5rem;
                    text-align: center;
                    box-shadow: 0 14px 38px rgba(107,18,48,0.08);
                }

                .empty-panel::before {
                    content: '';
                    position: absolute;
                    inset: 1rem;
                    border-radius: 1rem;
                    border: 1px dashed rgba(107,18,48,0.20);
                    pointer-events: none;
                }

                .empty-panel-inner {
                    position: relative;
                    z-index: 1;
                    max-width: 22rem;
                }

                .empty-icon {
                    display: inline-flex;
                    height: 3.25rem;
                    width: 3.25rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 1rem;
                    border: 1px solid rgba(184,138,40,0.30);
                    background: rgba(201,168,76,0.14);
                    color: #9A6C18;
                    margin-bottom: 0.9rem;
                }

                .empty-title {
                    color: #24151A;
                    font-size: 0.98rem;
                    font-weight: 900;
                }

                .empty-text {
                    margin-top: 0.45rem;
                    color: #6E6458;
                    font-size: 0.83rem;
                    line-height: 1.65;
                }

                @media (prefers-color-scheme: dark) {
                    .empty-panel {
                        border-color: rgba(214,185,106,0.20);
                        background:
                            radial-gradient(circle at top right, rgba(214,185,106,0.14), transparent 40%),
                            linear-gradient(145deg, rgba(53,27,40,0.95), rgba(43,22,32,0.96));
                        box-shadow: 0 14px 38px rgba(18,7,12,0.24);
                    }

                    .empty-panel::before {
                        border-color: rgba(214,185,106,0.22);
                    }

                    .empty-icon {
                        border-color: rgba(214,185,106,0.32);
                        background: rgba(214,185,106,0.10);
                        color: #D6B96A;
                    }

                    .empty-title {
                        color: #F4EEE9;
                    }

                    .empty-text {
                        color: #A9978D;
                    }
                }
            `}</style>

            <div className="dashboard-page">
                <div className="dashboard-shell">
                    <section className="dashboard-hero">
                        <div className="dashboard-hero-content">
                            <div>
                                <div className="dashboard-eyebrow">
                                    <IconSpark />
                                    Plataforma Académica
                                </div>

                                <h1 className="dashboard-title">
                                    Bienvenido,<br />
                                    <span>{userName}</span>
                                </h1>

                                <p className="dashboard-description">
                                    Accediste al panel principal de la plataforma académica de la Universidad Privada del Valle.
                                    La información visible se organizará según tu rol y los permisos definidos para tu cuenta.
                                </p>

                                <div className="dashboard-details-grid">
                                    <div className="dashboard-detail-card is-role">
                                        <div className="dashboard-detail-head">
                                            <IconShield />
                                            Rol actual
                                        </div>
                                        <div className="dashboard-detail-value">{roleLabel}</div>
                                    </div>

                                    <div className="dashboard-detail-card">
                                        <div className="dashboard-detail-head">
                                            <IconMail />
                                            Correo registrado
                                        </div>
                                        <div className="dashboard-detail-value">{userEmail}</div>
                                    </div>
                                </div>
                            </div>

                            <aside className="profile-card">
                                <div>
                                    <div className="profile-main">
                                        <div className="profile-avatar">
                                            {getInitials(userName)}
                                        </div>

                                        <div>
                                            <p className="profile-name">{userName}</p>
                                            <p className="profile-email">{userEmail}</p>
                                        </div>
                                    </div>

                                    <div className="profile-status">
                                        <span className="profile-status-dot" />
                                        <span className="profile-status-text">
                                            Sesión activa como {roleLabel}
                                        </span>
                                    </div>
                                </div>

                                <p className="profile-note">
                                    Este panel mostrará únicamente las opciones y módulos habilitados para tu perfil de usuario.
                                </p>
                            </aside>
                        </div>
                    </section>

                    <section className="visual-strip">
                        <div className="mini-card">
                            <div className="mini-icon">
                                <IconShield />
                            </div>
                            <div className="mini-label">Acceso</div>
                            <div className="mini-value">Permisos definidos por rol</div>
                        </div>

                        <div className="mini-card">
                            <div className="mini-icon">
                                <IconBook />
                            </div>
                            <div className="mini-label">Sistema</div>
                            <div className="mini-value">Plataforma académica activa</div>
                        </div>

                        <div className="mini-card">
                            <div className="mini-icon">
                                <IconClock />
                            </div>
                            <div className="mini-label">Estado</div>
                            <div className="mini-value">Sesión verificada</div>
                        </div>
                    </section>

                    <section className="dashboard-content-grid">
                        <div className="soft-panel">
                            <p className="soft-panel-label">Panel por rol</p>

                            <h2 className="soft-panel-title">
                                Vista principal de {roleLabel}
                            </h2>

                            <p className="soft-panel-text">
                                Este espacio queda reservado para el contenido funcional correspondiente al rol autenticado.
                                Por ahora se muestra la identificación del usuario, su correo y el rol detectado por el sistema.
                            </p>

                            <div className="role-card">
                                <div className="role-card-icon">
                                    <IconShield />
                                </div>

                                <div>
                                    <p className="role-card-title">
                                        Rol detectado: {roleLabel}
                                    </p>
                                    <p className="role-card-text">
                                        Las siguientes funciones se cargarán progresivamente según los permisos definidos para este perfil.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="empty-panel">
                            <div className="empty-panel-inner">
                                <div className="empty-icon">
                                    <IconLayers />
                                </div>

                                <p className="empty-title">
                                    Módulos en preparación
                                </p>

                                <p className="empty-text">
                                    Este bloque se usará para accesos rápidos, actividades recientes o avisos importantes cuando los módulos sean implementados.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};