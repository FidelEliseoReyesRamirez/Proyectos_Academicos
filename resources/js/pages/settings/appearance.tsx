import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Configuración de apariencia" />

            <h1 className="sr-only">Configuración de apariencia</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Configuración de apariencia"
                    description="Personaliza el modo visual de tu cuenta dentro de la plataforma."
                />

                <div className="rounded-2xl border border-[#6B1230]/10 bg-white/55 p-5 shadow-[0_14px_34px_rgba(107,18,48,0.08)] backdrop-blur-sm dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none">
                    <div className="mb-4">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#9A6C18] dark:text-[#D6B96A]">
                            Preferencia visual
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#6E6458] dark:text-[#D7C9C0]">
                            Selecciona cómo deseas visualizar la interfaz del sistema.
                        </p>
                    </div>

                    <AppearanceTabs />
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Configuración de apariencia',
            href: editAppearance(),
        },
    ],
};