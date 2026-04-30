import { Link } from '@inertiajs/react';
import { Palette, ShieldCheck, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: edit(),
        icon: UserRound,
    },
    {
        title: 'Seguridad',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Apariencia',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="relative px-4 py-6 text-[#24151A] dark:text-[#F4EEE9]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(circle_at_92%_8%,rgba(107,18,48,0.08),transparent_34%),radial-gradient(circle_at_0%_92%,rgba(107,18,48,0.10),transparent_40%)] dark:bg-[radial-gradient(circle_at_95%_6%,rgba(212,132,154,0.08),transparent_34%),radial-gradient(circle_at_2%_98%,rgba(184,80,112,0.12),transparent_40%)]"
            />

            <Heading
                title="Configuración"
                description="Administra tu perfil, seguridad y preferencias de apariencia."
            />

            <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-12">
                <aside className="w-full max-w-xl lg:w-56">
                    <div className="rounded-2xl border border-[#6B1230]/10 bg-white/55 p-2 shadow-[0_14px_34px_rgba(107,18,48,0.08)] backdrop-blur-sm dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none">
                        <p className="px-3 pb-2 pt-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#9A6C18] dark:text-[#D6B96A]">
                            Opciones
                        </p>

                        <nav
                            className="flex flex-col gap-1.5"
                            aria-label="Configuración"
                        >
                            {sidebarNavItems.map((item, index) => {
                                const active = isCurrentOrParentUrl(item.href);

                                return (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'h-10 w-full justify-start rounded-xl border border-transparent px-3 text-sm font-bold text-[#5F4C45] transition-all duration-200 hover:-translate-y-px hover:border-[#6B1230]/14 hover:bg-[#F9EDF0] hover:text-[#6B1230] hover:shadow-[0_10px_24px_rgba(107,18,48,0.08)] dark:text-[#D7C9C0] dark:hover:border-[#D4849A]/24 dark:hover:bg-[#351B28] dark:hover:text-[#D4849A] dark:hover:shadow-none',
                                            active &&
                                                'border-[#6B1230]/18 bg-[#F9EDF0] text-[#6B1230] shadow-[0_10px_24px_rgba(107,18,48,0.08)] dark:border-[#D4849A]/28 dark:bg-[#351B28]/85 dark:text-[#D4849A] dark:shadow-none',
                                        )}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && (
                                                <item.icon className="h-4 w-4 text-[#6B1230] dark:text-[#D4849A]" />
                                            )}
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <Separator className="my-2 bg-[#6B1230]/12 lg:hidden dark:bg-[#D6B96A]/14" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12 rounded-2xl border border-[#6B1230]/10 bg-white/55 p-5 shadow-[0_14px_34px_rgba(107,18,48,0.08)] backdrop-blur-sm dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none md:p-6">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}