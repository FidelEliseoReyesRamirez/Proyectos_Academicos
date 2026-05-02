import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormEvent } from 'react';

type Periodo = {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_cierre: string;
};

type Props = {
    periodo: Periodo;
};

export default function PeriodosEdit({ periodo }: Props) {
    const form = useForm({
        fecha_inicio: periodo.fecha_inicio,
        fecha_cierre: periodo.fecha_cierre,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/periodos/${periodo.id}`);
    };

    return (
        <>
            <Head title="Editar periodo" />

            <div className="users-page">
                <div className="users-shell">

                    <section className="users-card">
                        <div className="users-card-header">
                            <h1 className="users-title">{periodo.nombre}</h1>
                        </div>

                        <form onSubmit={submit} className="p-5 grid gap-4">

                            <Input
                                type="date"
                                value={form.data.fecha_inicio}
                                onChange={e => form.setData('fecha_inicio', e.target.value)}
                            />

                            <Input
                                type="date"
                                value={form.data.fecha_cierre}
                                onChange={e => form.setData('fecha_cierre', e.target.value)}
                            />

                            <Button type="submit">
                                Guardar
                            </Button>

                            <Link href="/periodos">Volver</Link>
                        </form>
                    </section>

                </div>
            </div>
        </>
    );
}