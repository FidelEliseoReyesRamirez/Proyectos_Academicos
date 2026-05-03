import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, UsersRound } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { FolderKanban } from 'lucide-react';

type AuthUser = {
    id?: number;
    name?: string;
    email?: string;
    rol?: string | null;
    role?: string | null;
};

type SharedPageProps = {
    auth?: {
        user?: AuthUser | null;
    };
};

export function AppSidebar() {
    const page = usePage<SharedPageProps>();

    const user = page.props.auth?.user;
    const userRole = String(user?.rol ?? user?.role ?? '').toLowerCase();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (userRole === 'coordinador') {
        mainNavItems.push({
            title: 'Usuarios',
            href: '/usuarios',
            icon: UsersRound,
        },
        {
            title: 'Proyectos',
            href: '/proyectos',
            icon: FolderKanban,
        },
        {
            title: 'Periodos',
            href: '/periodos',
            icon: FolderKanban,
        }
        );
    }

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r"
            style={
                {
                    '--sidebar': 'var(--bg-surface)',
                    '--sidebar-foreground': 'var(--text-primary)',
                    '--sidebar-primary': 'var(--accent-primary)',
                    '--sidebar-primary-foreground': 'var(--text-on-guindo)',
                    '--sidebar-accent': 'var(--bg-subtle)',
                    '--sidebar-accent-foreground': 'var(--accent-primary)',
                    '--sidebar-border': 'var(--border-subtle)',
                    '--sidebar-ring': 'var(--accent-gold)',
                } as React.CSSProperties
            }
        >
            <style>{`
                [data-sidebar="sidebar"] {
                    background:
                        radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 34%),
                        linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 38%),
                        var(--bg-surface) !important;
                    color: var(--text-primary) !important;
                    border-color: var(--border-subtle) !important;
                }

                [data-sidebar="header"] {
                    border-bottom: 1px solid var(--border-subtle) !important;
                    background: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-surface)) !important;
                }

                [data-sidebar="content"] {
                    background: transparent !important;
                }

                [data-sidebar="footer"] {
                    border-top: 1px solid var(--border-subtle) !important;
                    background: color-mix(in srgb, var(--bg-subtle) 70%, transparent) !important;
                }

                [data-sidebar="menu-button"] {
                    color: var(--text-secondary) !important;
                    border: 1px solid transparent !important;
                }

                [data-sidebar="menu-button"] svg {
                    color: var(--accent-primary) !important;
                }

                [data-sidebar="menu-button"]:hover {
                    background: color-mix(in srgb, var(--accent-primary) 13%, transparent) !important;
                    color: var(--accent-primary) !important;
                    border-color: color-mix(in srgb, var(--accent-primary) 22%, transparent) !important;
                }

                [data-sidebar="menu-button"][data-active="true"] {
                    background: color-mix(in srgb, var(--accent-primary) 18%, transparent) !important;
                    color: var(--accent-primary) !important;
                    border-color: color-mix(in srgb, var(--accent-primary) 32%, transparent) !important;
                }

                .univalle-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                    min-width: 0;
                }

                .univalle-brand-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2.35rem;
                    height: 2.35rem;
                    flex-shrink: 0;
                    overflow: hidden;
                    border-radius: 0.7rem;
                    border: 1px solid color-mix(in srgb, var(--accent-gold) 35%, transparent);
                    background: var(--bg-subtle);
                    box-shadow: var(--shadow-sm);
                }

                .univalle-brand-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 0.16rem;
                }

                .univalle-brand-fallback {
                    display: none;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, var(--accent-primary), var(--guindo-800));
                    color: var(--accent-gold-light);
                    font-size: 0.8rem;
                    font-weight: 800;
                }

                .univalle-brand-text {
                    min-width: 0;
                    line-height: 1.1;
                }

                .univalle-brand-title {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    color: var(--text-primary);
                    font-size: 0.88rem;
                    font-weight: 800;
                }

                .univalle-brand-subtitle {
                    margin-top: 0.15rem;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    color: var(--text-muted);
                    font-size: 0.67rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
            `}</style>

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="univalle-brand">
                                    <div className="univalle-brand-logo">
                                        <img
                                            src="/images/logo.png"
                                            alt="Univalle"
                                            onError={(event) => {
                                                const image = event.currentTarget;
                                                const fallback =
                                                    image.nextElementSibling as HTMLElement | null;

                                                image.style.display = 'none';

                                                if (fallback) {
                                                    fallback.style.display = 'flex';
                                                }
                                            }}
                                        />

                                        <div className="univalle-brand-fallback">
                                            UV
                                        </div>
                                    </div>

                                    <div className="univalle-brand-text">
                                        <div className="univalle-brand-title">
                                            Univalle
                                        </div>
                                        <div className="univalle-brand-subtitle">
                                            Plataforma Académica
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}