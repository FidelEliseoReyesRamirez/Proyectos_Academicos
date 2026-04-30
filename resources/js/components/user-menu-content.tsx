import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="rounded-xl border border-[#6B1230]/10 bg-white/55 px-3 py-3 text-left shadow-[0_10px_24px_rgba(107,18,48,0.08)] backdrop-blur-sm dark:border-[#D4849A]/18 dark:bg-white/[0.055] dark:shadow-none">
                    <p className="mb-2 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#9A6C18] dark:text-[#D6B96A]">
                        Cuenta activa
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                        <UserInfo user={user} showEmail={true} />
                    </div>
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-2 bg-[#6B1230]/12 dark:bg-[#D6B96A]/14" />

            <DropdownMenuGroup>
                <DropdownMenuItem
                    asChild
                    className="rounded-xl p-0 text-[#5F4C45] outline-none transition-colors hover:bg-[#F9EDF0] hover:text-[#6B1230] focus:bg-[#F9EDF0] focus:text-[#6B1230] dark:text-[#D7C9C0] dark:hover:bg-[#351B28] dark:hover:text-[#D4849A] dark:focus:bg-[#351B28] dark:focus:text-[#D4849A]"
                >
                    <Link
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm font-semibold"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="h-4 w-4 text-[#6B1230] dark:text-[#D4849A]" />
                        Configuración
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2 bg-[#6B1230]/12 dark:bg-[#D6B96A]/14" />

            <DropdownMenuItem
                asChild
                className="rounded-xl p-0 text-[#5F4C45] outline-none transition-colors hover:bg-[#F9EDF0] hover:text-[#6B1230] focus:bg-[#F9EDF0] focus:text-[#6B1230] dark:text-[#D7C9C0] dark:hover:bg-[#351B28] dark:hover:text-[#D4849A] dark:focus:bg-[#351B28] dark:focus:text-[#D4849A]"
            >
                <Link
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm font-semibold"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="h-4 w-4 text-[#6B1230] dark:text-[#D4849A]" />
                    Cerrar sesión
                </Link>
            </DropdownMenuItem>
        </>
    );
}