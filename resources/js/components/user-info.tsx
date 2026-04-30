import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-9 w-9 overflow-hidden rounded-xl border border-[#C9A84C]/35 bg-[#F9EDF0] shadow-[0_8px_18px_rgba(107,18,48,0.10)] dark:border-[#D6B96A]/28 dark:bg-[#351B28] dark:shadow-none">
                <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    className="object-cover"
                />

                <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#F9EDF0] to-[#F6EEDC] text-sm font-black text-[#6B1230] dark:from-[#351B28] dark:to-[#2B1620] dark:text-[#D6B96A]">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>

            <div className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-bold text-[#24151A] dark:text-[#F4EEE9]">
                    {user.name}
                </span>

                {showEmail && (
                    <span className="mt-0.5 truncate text-xs font-medium text-[#6E6458] dark:text-[#A9978D]">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}