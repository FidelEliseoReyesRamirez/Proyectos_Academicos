import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';

type AuthUser = {
    id?: number;
    name?: string;
    email?: string;
    role?: string | null;
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

export default function Dashboard() {
    const page = usePage<SharedPageProps>();

    const user = page.props.auth?.user;
    const userName = user?.name || 'Usuario';
    const userEmail = user?.email || 'Sin correo registrado';

    const role = normalizeRole(user?.role);
    const roleLabel = roleLabels[role] || role;

    return (
        <>
            <Head title="Dashboard" />

            <style>{`
                .dashboard-page {
                    min-height: 100%;
                    background: var(--bg-base);
                    color: var(--text-primary);
                }

                .dashboard-shell {
                    display: flex;
                    height: 100%;
                    flex: 1;
                    flex-direction: column;
                    gap: 1.5rem;
                    overflow-x: auto;
                    padding: 1rem;
                }

                @media (min-width: 768px) {
                    .dashboard-shell {
                        padding: 1.5rem;
                    }
                }

                .dashboard-hero {
                    position: relative;
                    overflow: hidden;
                    border-radius: 1.25rem;
                    border: 1px solid var(--border-subtle);
                    background: var(--bg-surface);
                    box-shadow: var(--shadow-lg);
                }

                .dashboard-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at top right, rgba(201,168,76,0.18), transparent 34%),
                        radial-gradient(circle at bottom left, rgba(107,18,48,0.22), transparent 40%);
                    pointer-events: none;
                }

                .dashboard-hero::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0.08;
                    background-image:
                        linear-gradient(var(--border-subtle) 1px, transparent 1px),
                        linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
                    background-size: 44px 44px;
                    pointer-events: none;
                    mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 35%, transparent 100%);
                }

                .dashboard-hero-content {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    gap: 1.5rem;
                    padding: 1.5rem;
                }

                @media (min-width: 768px) {
                    .dashboard-hero-content {
                        grid-template-columns: 1.5fr 0.8fr;
                        align-items: center;
                        padding: 2rem;
                    }
                }

                .dashboard-badge {
                    margin-bottom: 1rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-radius: 999px;
                    border: 1px solid color-mix(in srgb, var(--accent-gold) 45%, transparent);
                    background: color-mix(in srgb, var(--accent-gold) 12%, transparent);
                    padding: 0.35rem 0.85rem;
                    color: var(--accent-gold);
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                }

                .dashboard-badge-dot {
                    height: 0.45rem;
                    width: 0.45rem;
                    border-radius: 999px;
                    background: var(--accent-gold);
                }

                .dashboard-title {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: clamp(1.65rem, 3vw, 2.1rem);
                    font-weight: 800;
                    line-height: 1.15;
                    letter-spacing: -0.03em;
                }

                .dashboard-description {
                    margin-top: 0.65rem;
                    max-width: 42rem;
                    color: var(--text-secondary);
                    font-size: 0.92rem;
                    line-height: 1.7;
                }

                .dashboard-info-row {
                    margin-top: 1.35rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.8rem;
                }

                .dashboard-info-card {
                    border-radius: 0.9rem;
                    border: 1px solid var(--border-subtle);
                    background: var(--bg-subtle);
                    padding: 0.85rem 1rem;
                }

                .dashboard-info-card.is-role {
                    border-color: color-mix(in srgb, var(--accent-primary) 42%, transparent);
                    background: color-mix(in srgb, var(--accent-primary) 13%, transparent);
                }

                .dashboard-info-label {
                    color: var(--text-muted);
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .dashboard-info-value {
                    margin-top: 0.25rem;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    font-weight: 700;
                }

                .dashboard-info-card.is-role .dashboard-info-value {
                    color: var(--accent-primary);
                }

                .dashboard-profile-card {
                    border-radius: 1.1rem;
                    border: 1px solid var(--border-subtle);
                    background: color-mix(in srgb, var(--bg-subtle) 82%, transparent);
                    padding: 1.2rem;
                    backdrop-filter: blur(10px);
                }

                .dashboard-profile-main {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .dashboard-avatar {
                    display: flex;
                    height: 3.5rem;
                    width: 3.5rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 1rem;
                    border: 1px solid color-mix(in srgb, var(--accent-gold) 45%, transparent);
                    background: color-mix(in srgb, var(--accent-gold) 12%, transparent);
                    color: var(--accent-gold);
                    font-size: 1rem;
                    font-weight: 800;
                }

                .dashboard-profile-name {
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    font-weight: 800;
                }

                .dashboard-profile-role {
                    margin-top: 0.15rem;
                    color: var(--text-muted);
                    font-size: 0.78rem;
                }

                .dashboard-profile-note {
                    margin-top: 1rem;
                    border-top: 1px solid var(--border-subtle);
                    padding-top: 1rem;
                    color: var(--text-muted);
                    font-size: 0.78rem;
                    line-height: 1.6;
                }

                .dashboard-panel {
                    border-radius: 1.25rem;
                    border: 1px solid var(--border-subtle);
                    background: var(--bg-surface);
                    padding: 1.5rem;
                    box-shadow: var(--shadow-md);
                }

                .dashboard-panel-label {
                    color: var(--accent-gold);
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                }

                .dashboard-panel-title {
                    margin-top: 0.45rem;
                    color: var(--text-primary);
                    font-size: 1.2rem;
                    font-weight: 800;
                    line-height: 1.25;
                }

                .dashboard-panel-text {
                    margin-top: 0.6rem;
                    max-width: 45rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    line-height: 1.7;
                }

                .dashboard-role-box {
                    margin-top: 1.25rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.65rem;
                    border-radius: 0.85rem;
                    border: 1px solid color-mix(in srgb, var(--accent-primary) 42%, transparent);
                    background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
                    padding: 0.75rem 1rem;
                }

                .dashboard-role-dot {
                    height: 0.65rem;
                    width: 0.65rem;
                    border-radius: 999px;
                    background: var(--accent-primary);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 14%, transparent);
                }

                .dashboard-role-text {
                    color: var(--accent-primary);
                    font-size: 0.88rem;
                    font-weight: 800;
                }
            `}</style>

            <div className="dashboard-page">
                <div className="dashboard-shell">
                    <section className="dashboard-hero">
                        <div className="dashboard-hero-content">
                            <div>
                                <div className="dashboard-badge">
                                    <span className="dashboard-badge-dot" />
                                    Plataforma Académica
                                </div>

                                <h1 className="dashboard-title">
                                    Bienvenido, {userName}
                                </h1>

                                <p className="dashboard-description">
                                    Accediste al panel principal de la plataforma académica de la Universidad Privada del Valle.
                                    La información visible se ajustará al rol asignado en el sistema.
                                </p>

                                <div className="dashboard-info-row">
                                    <div className="dashboard-info-card is-role">
                                        <p className="dashboard-info-label">Rol actual</p>
                                        <p className="dashboard-info-value">{roleLabel}</p>
                                    </div>

                                    <div className="dashboard-info-card">
                                        <p className="dashboard-info-label">Correo</p>
                                        <p className="dashboard-info-value">{userEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-profile-card">
                                <div className="dashboard-profile-main">
                                    <div className="dashboard-avatar">
                                        {getInitials(userName)}
                                    </div>

                                    <div>
                                        <p className="dashboard-profile-name">
                                            {userName}
                                        </p>
                                        <p className="dashboard-profile-role">
                                            Sesión activa como {roleLabel}
                                        </p>
                                    </div>
                                </div>

                               
                               
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-panel">
                        <p className="dashboard-panel-label">
                            Panel por rol
                        </p>

                        <h2 className="dashboard-panel-title">
                            Vista principal de {roleLabel}
                        </h2>

                        <p className="dashboard-panel-text">
                            Este espacio queda reservado para el contenido funcional correspondiente al rol del usuario.
                            Por ahora solo se muestra la identificación del usuario autenticado y su rol asignado.
                        </p>

                        <div className="dashboard-role-box">
                            <span className="dashboard-role-dot" />
                            <span className="dashboard-role-text">
                                Rol detectado: {roleLabel}
                            </span>
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
            href: dashboard(),
        },
    ],
};