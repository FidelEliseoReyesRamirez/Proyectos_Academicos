import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContext = {
    state: 'expanded' | 'collapsed';
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);

    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }

    return context;
}

function SidebarProvider({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
}: React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;

    const setOpen = React.useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === 'function' ? value(open) : value;

            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                _setOpen(openState);
            }

            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        },
        [setOpenProp, open],
    );

    const toggleSidebar = React.useCallback(() => {
        return isMobile
            ? setOpenMobile((open) => !open)
            : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? 'expanded' : 'collapsed';

    const contextValue = React.useMemo<SidebarContext>(
        () => ({
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
        }),
        [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
    );

    return (
        <SidebarContext.Provider value={contextValue}>
            <div
                data-slot="sidebar-wrapper"
                style={
                    {
                        '--sidebar-width': SIDEBAR_WIDTH,
                        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                        ...style,
                    } as React.CSSProperties
                }
                className={cn(
                    'group/sidebar-wrapper flex min-h-screen w-full overflow-x-hidden',
                    'bg-[#FAF8F5] text-[#24151A]',
                    'dark:bg-[#24121A] dark:text-[#F4EEE9]',
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        </SidebarContext.Provider>
    );
}

function Sidebar({
    side = 'left',
    variant = 'sidebar',
    collapsible = 'offcanvas',
    className,
    children,
    ...props
}: React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === 'none') {
        return (
            <div
                data-slot="sidebar"
                className={cn(
                    'flex h-full w-(--sidebar-width) flex-col border-r',
                    'border-[#E2D3CA] bg-[#FAF8F5] text-[#24151A]',
                    'dark:border-[#5A3344] dark:bg-[#2B1620] dark:text-[#F4EEE9]',
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetHeader className="sr-only">
                    <SheetTitle>Sidebar</SheetTitle>
                    <SheetDescription>Displays the mobile sidebar.</SheetDescription>
                </SheetHeader>

                <SheetContent
                    data-sidebar="sidebar"
                    data-slot="sidebar"
                    data-mobile="true"
                    className={cn(
                        'w-(--sidebar-width) border-[#E2D3CA] p-0 text-[#24151A] [&>button]:hidden',
                        'bg-[#FAF8F5]',
                        'dark:border-[#5A3344] dark:bg-[#24121A] dark:text-[#F4EEE9]',
                    )}
                    style={
                        {
                            '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                        } as React.CSSProperties
                    }
                    side={side}
                >
                    <div className="relative flex h-full w-full flex-col overflow-hidden">
                        <SidebarDecorations />
                        <div className="relative z-1 flex h-full w-full flex-col">
                            {children}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            className="group peer hidden text-[#24151A] dark:text-[#F4EEE9] md:block"
            data-state={state}
            data-collapsible={state === 'collapsed' ? collapsible : ''}
            data-variant={variant}
            data-side={side}
            data-slot="sidebar"
        >
            <div
                className={cn(
                    'relative h-screen w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
                    'group-data-[collapsible=offcanvas]:w-0',
                    'group-data-[side=right]:rotate-180',
                    variant === 'floating' || variant === 'inset'
                        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
                        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
                )}
            />

            <div
                className={cn(
                    'fixed inset-y-0 z-10 hidden h-screen w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
                    side === 'left'
                        ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                        : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                    variant === 'floating' || variant === 'inset'
                        ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
                        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
                    className,
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    className={cn(
                        'relative flex h-full w-full flex-col overflow-hidden rounded-2xl border',
                        'border-[#E2D3CA] bg-[#FAF8F5] text-[#24151A]',
                        'shadow-[0_18px_45px_rgba(107,18,48,0.10),0_8px_18px_rgba(26,22,20,0.06)]',
                        'dark:border-[#5A3344] dark:bg-[#2B1620] dark:text-[#F4EEE9]',
                        'dark:shadow-[0_18px_45px_rgba(18,7,12,0.38)]',
                    )}
                >
                    <SidebarDecorations />

                    <div className="relative z-1 flex h-full w-full flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarDecorations() {
    return (
        <>
            <div
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute inset-0',
                    'bg-[radial-gradient(circle_at_92%_8%,rgba(107,18,48,0.08),transparent_34%),radial-gradient(circle_at_0%_92%,rgba(107,18,48,0.10),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.76),rgba(249,237,240,0.64)_48%,rgba(245,243,239,0.70))]',
                    'dark:bg-[radial-gradient(circle_at_95%_6%,rgba(212,132,154,0.08),transparent_34%),radial-gradient(circle_at_2%_98%,rgba(184,80,112,0.12),transparent_40%),linear-gradient(135deg,#2B1620_0%,#24121A_48%,#351B28_100%)]',
                )}
            />

            <div
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute inset-0 opacity-[0.08]',
                    'bg-[linear-gradient(rgba(107,18,48,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(107,18,48,0.18)_1px,transparent_1px)] bg-[size:42px_42px]',
                    'dark:opacity-[0.06] dark:bg-[linear-gradient(rgba(212,132,154,0.30)_1px,transparent_1px),linear-gradient(90deg,rgba(212,132,154,0.30)_1px,transparent_1px)] dark:bg-[size:42px_42px]',
                )}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(107,18,48,0.10),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(212,132,154,0.10),transparent_70%)]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(107,18,48,0.10),transparent_72%)] dark:bg-[radial-gradient(circle,rgba(184,80,112,0.11),transparent_72%)]"
            />
        </>
    );
}

function SidebarTrigger({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { toggleSidebar, isMobile, state } = useSidebar();

    return (
        <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            variant="ghost"
            size="icon"
            className={cn(
                'h-8 w-8 rounded-xl border border-transparent',
                'text-[#6E6458] transition-all duration-200',
                'hover:border-[#6B1230]/15 hover:bg-[#F9EDF0] hover:text-[#6B1230] hover:shadow-[0_8px_18px_rgba(107,18,48,0.08)]',
                'dark:text-[#B9A69C] dark:hover:border-[#D4849A]/25 dark:hover:bg-[#351B28] dark:hover:text-[#D4849A] dark:hover:shadow-none',
                className,
            )}
            onClick={(event) => {
                onClick?.(event);
                toggleSidebar();
            }}
            {...props}
        >
            {isMobile || state === 'collapsed' ? (
                <PanelLeftOpenIcon />
            ) : (
                <PanelLeftCloseIcon />
            )}

            <span className="sr-only">Toggle sidebar</span>
        </Button>
    );
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
    const { toggleSidebar } = useSidebar();

    return (
        <button
            data-sidebar="rail"
            data-slot="sidebar-rail"
            aria-label="Toggle sidebar"
            tabIndex={-1}
            onClick={toggleSidebar}
            title="Toggle sidebar"
            className={cn(
                'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:bg-transparent hover:after:bg-[#C9A84C]/55 sm:flex',
                'dark:hover:after:bg-[#D6B96A]/55',
                'group-data-[side=left]:-right-4 group-data-[side=right]:left-0',
                'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
                '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
                'hover:group-data-[collapsible=offcanvas]:bg-[#F9EDF0] dark:hover:group-data-[collapsible=offcanvas]:bg-[#351B28] group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
                '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
                '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
                className,
            )}
            {...props}
        />
    );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
    return (
        <main
            data-slot="sidebar-inset"
            className={cn(
                'relative flex min-h-screen max-w-full flex-1 flex-col overflow-x-hidden',
                'bg-[#FAF8F5] text-[#24151A]',
                'dark:bg-[#24121A] dark:text-[#F4EEE9]',
                'peer-data-[variant=inset]:min-h-[calc(100vh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:border-[#E2D3CA] md:peer-data-[variant=inset]:shadow-none md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0',
                'dark:md:peer-data-[variant=inset]:border-[#5A3344]',
                className,
            )}
            {...props}
        />
    );
}

function SidebarInput({
    className,
    ...props
}: React.ComponentProps<typeof Input>) {
    return (
        <Input
            data-slot="sidebar-input"
            data-sidebar="input"
            className={cn(
                'h-8 w-full rounded-xl border-[#E2D3CA] bg-white/55 text-[#24151A] shadow-[0_8px_18px_rgba(107,18,48,0.05)] placeholder:text-[#8A8074] focus-visible:ring-[#B88A28]',
                'dark:border-[#5A3344] dark:bg-white/[0.055] dark:text-[#F4EEE9] dark:placeholder:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]',
                className,
            )}
            {...props}
        />
    );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sidebar-header"
            data-sidebar="header"
            className={cn(
                'relative flex flex-col gap-2 border-b p-2',
                'border-[#6B1230]/10 bg-white/28 backdrop-blur-sm',
                'dark:border-[#D6B96A]/14 dark:bg-white/[0.035]',
                className,
            )}
            {...props}
        />
    );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sidebar-footer"
            data-sidebar="footer"
            className={cn(
                'relative flex flex-col gap-2 border-t p-2',
                'border-[#6B1230]/10 bg-white/24 backdrop-blur-sm',
                'dark:border-[#D6B96A]/14 dark:bg-white/[0.035]',
                className,
            )}
            {...props}
        />
    );
}

function SidebarSeparator({
    className,
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="sidebar-separator"
            data-sidebar="separator"
            className={cn(
                'mx-2 w-auto bg-[#6B1230]/12 dark:bg-[#D6B96A]/14',
                className,
            )}
            {...props}
        />
    );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sidebar-content"
            data-sidebar="content"
            className={cn(
                'relative flex min-h-0 flex-1 flex-col gap-2 overflow-auto bg-transparent p-1 text-[#24151A] group-data-[collapsible=icon]:overflow-hidden',
                'dark:text-[#F4EEE9]',
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sidebar-group"
            data-sidebar="group"
            className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
            {...props}
        />
    );
}

function SidebarGroupLabel({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'div';

    return (
        <Comp
            data-slot="sidebar-group-label"
            data-sidebar="group-label"
            className={cn(
                'flex h-8 shrink-0 items-center rounded-md px-2 text-[0.68rem] font-black uppercase tracking-[0.12em]',
                'text-[#8A8074] outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 focus-visible:ring-[#B88A28]',
                'dark:text-[#A9978D] dark:focus-visible:ring-[#D6B96A]',
                '[&>svg]:size-4 [&>svg]:shrink-0',
                'group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:select-none group-data-[collapsible=icon]:opacity-0',
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupAction({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="sidebar-group-action"
            data-sidebar="group-action"
            className={cn(
                'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-lg p-0',
                'text-[#6E6458] outline-hidden transition-transform hover:bg-[#F9EDF0] hover:text-[#6B1230] focus-visible:ring-2 focus-visible:ring-[#B88A28]',
                'dark:text-[#A9978D] dark:hover:bg-[#351B28] dark:hover:text-[#D4849A] dark:focus-visible:ring-[#D6B96A]',
                '[&>svg]:size-4 [&>svg]:shrink-0',
                'after:absolute after:-inset-2 md:after:hidden',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupContent({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sidebar-group-content"
            data-sidebar="group-content"
            className={cn('w-full text-sm', className)}
            {...props}
        />
    );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="sidebar-menu"
            data-sidebar="menu"
            className={cn('flex w-full min-w-0 flex-col gap-1.5', className)}
            {...props}
        />
    );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
    return (
        <li
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
            className={cn('group/menu-item relative', className)}
            {...props}
        />
    );
}

const sidebarMenuButtonVariants = cva(
    cn(
        'peer/menu-button relative flex w-full items-center gap-2 overflow-hidden rounded-xl border p-2 text-left text-sm outline-hidden',
        'transition-[width,height,padding,background-color,color,border-color,box-shadow,transform] duration-200',
        'border-transparent text-[#5F4C45]',
        'hover:-translate-y-px hover:border-[#6B1230]/14 hover:bg-white/55 hover:text-[#6B1230] hover:shadow-[0_10px_24px_rgba(107,18,48,0.08)]',
        'focus-visible:ring-2 focus-visible:ring-[#B88A28]',
        'active:translate-y-0 active:bg-[#F9EDF0] active:text-[#6B1230]',
        'disabled:pointer-events-none disabled:opacity-50',
        'dark:text-[#D7C9C0]',
        'dark:hover:border-[#D6B96A]/20 dark:hover:bg-white/[0.055] dark:hover:text-[#D4849A] dark:hover:shadow-none',
        'dark:focus-visible:ring-[#D6B96A]',
        'dark:active:bg-[#351B28] dark:active:text-[#E3A1B2]',
        'group-has-data-[sidebar=menu-action]/menu-item:pr-8',
        'aria-disabled:pointer-events-none aria-disabled:opacity-50',
        'data-[active=true]:border-[#6B1230]/18 data-[active=true]:bg-[#F9EDF0] data-[active=true]:font-bold data-[active=true]:text-[#6B1230] data-[active=true]:shadow-[0_10px_24px_rgba(107,18,48,0.08)]',
        'dark:data-[active=true]:border-[#D4849A]/28 dark:data-[active=true]:bg-[#351B28]/85 dark:data-[active=true]:text-[#D4849A] dark:data-[active=true]:shadow-none',
        'data-[state=open]:hover:bg-white/55 data-[state=open]:hover:text-[#6B1230]',
        'dark:data-[state=open]:hover:bg-white/[0.055] dark:data-[state=open]:hover:text-[#D4849A]',
        'group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!',
        '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        '[&>svg]:text-[#6B1230] dark:[&>svg]:text-[#D4849A]',
    ),
    {
        variants: {
            variant: {
                default:
                    'hover:bg-white/55 hover:text-[#6B1230] dark:hover:bg-white/[0.055] dark:hover:text-[#D4849A]',
                outline:
                    'bg-white/46 shadow-[0_0_0_1px_rgba(107,18,48,0.08)] hover:bg-[#F9EDF0] hover:text-[#6B1230] hover:shadow-[0_10px_24px_rgba(107,18,48,0.10)] dark:bg-white/[0.045] dark:shadow-[0_0_0_1px_rgba(214,185,106,0.14)] dark:hover:bg-[#351B28] dark:hover:text-[#D4849A]',
            },
            size: {
                default: 'h-9 text-sm',
                sm: 'h-8 text-xs',
                lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function SidebarMenuButton({
    asChild = false,
    isActive = false,
    variant = 'default',
    size = 'default',
    tooltip,
    className,
    ...props
}: React.ComponentProps<'button'> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
    const Comp = asChild ? Slot : 'button';
    const { isMobile, state } = useSidebar();

    const button = (
        <Comp
            data-slot="sidebar-menu-button"
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
            {...props}
        />
    );

    if (!tooltip) {
        return button;
    }

    if (typeof tooltip === 'string') {
        tooltip = {
            children: tooltip,
        };
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent
                side="right"
                align="center"
                hidden={state !== 'collapsed' || isMobile}
                className="border-[#E2D3CA] bg-[#FAF8F5] text-[#24151A] shadow-[0_14px_34px_rgba(107,18,48,0.10)] dark:border-[#5A3344] dark:bg-[#2B1620] dark:text-[#F4EEE9] dark:shadow-[0_14px_34px_rgba(18,7,12,0.35)]"
                {...tooltip}
            />
        </Tooltip>
    );
}

function SidebarMenuAction({
    className,
    asChild = false,
    showOnHover = false,
    ...props
}: React.ComponentProps<'button'> & {
    asChild?: boolean;
    showOnHover?: boolean;
}) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="sidebar-menu-action"
            data-sidebar="menu-action"
            className={cn(
                'absolute top-2 right-1 flex aspect-square w-5 items-center justify-center rounded-lg p-0',
                'text-[#6E6458] outline-hidden transition-transform hover:bg-[#F9EDF0] hover:text-[#6B1230] focus-visible:ring-2 focus-visible:ring-[#B88A28] peer-hover/menu-button:text-[#6B1230]',
                'dark:text-[#A9978D] dark:hover:bg-[#351B28] dark:hover:text-[#D4849A] dark:focus-visible:ring-[#D6B96A] dark:peer-hover/menu-button:text-[#D4849A]',
                '[&>svg]:size-4 [&>svg]:shrink-0',
                'after:absolute after:-inset-2 md:after:hidden',
                'peer-data-[size=sm]/menu-button:top-1.5',
                'peer-data-[size=default]/menu-button:top-2',
                'peer-data-[size=lg]/menu-button:top-3',
                'group-data-[collapsible=icon]:hidden',
                showOnHover &&
                    'peer-data-[active=true]/menu-button:text-[#6B1230] dark:peer-data-[active=true]/menu-button:text-[#D4849A] group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuBadge({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
            className={cn(
                'pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-semibold tabular-nums select-none',
                'text-[#6E6458] peer-hover/menu-button:text-[#6B1230] peer-data-[active=true]/menu-button:text-[#6B1230]',
                'dark:text-[#A9978D] dark:peer-hover/menu-button:text-[#D4849A] dark:peer-data-[active=true]/menu-button:text-[#D4849A]',
                'peer-data-[size=sm]/menu-button:top-1.5',
                'peer-data-[size=default]/menu-button:top-2',
                'peer-data-[size=lg]/menu-button:top-3',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSkeleton({
    className,
    showIcon = false,
    ...props
}: React.ComponentProps<'div'> & {
    showIcon?: boolean;
}) {
    const [skeletonStyle] = React.useState(
        () =>
            ({
                '--skeleton-width': `${Math.floor(Math.random() * 40) + 50}%`,
            }) as React.CSSProperties,
    );

    return (
        <div
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className="size-4 rounded-md bg-[#6B1230]/12 dark:bg-[#D6B96A]/14"
                    data-sidebar="menu-skeleton-icon"
                />
            )}

            <Skeleton
                className="h-4 max-w-(--skeleton-width) flex-1 bg-[#6B1230]/12 dark:bg-[#D6B96A]/14"
                data-sidebar="menu-skeleton-text"
                style={skeletonStyle}
            />
        </div>
    );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            className={cn(
                'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
                'border-[#6B1230]/12 dark:border-[#D6B96A]/14',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSubItem({
    className,
    ...props
}: React.ComponentProps<'li'>) {
    return (
        <li
            data-slot="sidebar-menu-sub-item"
            data-sidebar="menu-sub-item"
            className={cn('group/menu-sub-item relative', className)}
            {...props}
        />
    );
}

function SidebarMenuSubButton({
    asChild = false,
    size = 'md',
    isActive = false,
    className,
    ...props
}: React.ComponentProps<'a'> & {
    asChild?: boolean;
    size?: 'sm' | 'md';
    isActive?: boolean;
}) {
    const Comp = asChild ? Slot : 'a';

    return (
        <Comp
            data-slot="sidebar-menu-sub-button"
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-lg px-2 outline-hidden',
                'text-[#5F4C45] hover:bg-white/55 hover:text-[#6B1230] focus-visible:ring-2 focus-visible:ring-[#B88A28] active:bg-[#F9EDF0] active:text-[#6B1230]',
                'dark:text-[#D7C9C0] dark:hover:bg-white/[0.055] dark:hover:text-[#D4849A] dark:focus-visible:ring-[#D6B96A] dark:active:bg-[#351B28] dark:active:text-[#E3A1B2]',
                'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
                'data-[active=true]:bg-[#F9EDF0] data-[active=true]:font-semibold data-[active=true]:text-[#6B1230]',
                'dark:data-[active=true]:bg-[#351B28] dark:data-[active=true]:text-[#D4849A]',
                '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-[#6B1230] dark:[&>svg]:text-[#D4849A]',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
}

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};