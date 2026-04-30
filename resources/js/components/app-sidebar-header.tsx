import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header
            className="flex h-16 shrink-0 items-center gap-2 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
            style={{
                background:
                    'radial-gradient(circle at top right, color-mix(in srgb, var(--accent-gold) 12%, transparent), transparent 32%), var(--bg-surface)',
                borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            <style>{`
                .univalle-sidebar-header-trigger {
                    color: var(--text-secondary);
                    border-radius: 0.6rem;
                    transition:
                        background-color 0.18s ease,
                        color 0.18s ease;
                }

                .univalle-sidebar-header-trigger:hover {
                    background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
                    color: var(--accent-primary);
                }

                .univalle-sidebar-header-breadcrumbs nav,
                .univalle-sidebar-header-breadcrumbs ol,
                .univalle-sidebar-header-breadcrumbs li,
                .univalle-sidebar-header-breadcrumbs a,
                .univalle-sidebar-header-breadcrumbs span {
                    color: var(--text-secondary);
                }

                .univalle-sidebar-header-breadcrumbs a:hover {
                    color: var(--accent-primary);
                }

                .univalle-sidebar-header-breadcrumbs [aria-current="page"] {
                    color: var(--text-primary);
                    font-weight: 600;
                }
            `}</style>

            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 univalle-sidebar-header-trigger" />

                <div className="univalle-sidebar-header-breadcrumbs min-w-0">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
        </header>
    );
}