import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Periodo = {
    id: number;
    nombre: string;
};

type Usuario = {
    id: number;
    name: string;
};

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    descripcion?: string;
    estado: string;
    modalidad?: string;
    area_tematica?: string;
    periodo_id: number | null;
    estudiante_id?: number | null;
    tutor_id?: number | null;
};

type Props = {
    proyecto: Proyecto;
    periodos: Periodo[];
    estudiantes: Usuario[];
    tutores: Usuario[];
};

export default function ProyectosEdit({ proyecto, periodos, estudiantes, tutores }: Props) {
    const form = useForm({
        codigo: proyecto.codigo,
        titulo: proyecto.titulo,
        descripcion: proyecto.descripcion ?? '',
        estado: proyecto.estado,
        modalidad: proyecto.modalidad ?? '',
        area_tematica: proyecto.area_tematica ?? '',
        periodo_id: proyecto.periodo_id ?? '',
        estudiante_id: proyecto.estudiante_id ?? '',
        tutor_id: proyecto.tutor_id ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        form.put(`/proyectos/${proyecto.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Editar proyecto" />

            <style>{`
                .users-page {
                    width: 100%;
                    min-height: 100%;
                    overflow-x: hidden;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.22), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.14), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                .users-shell {
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                }

                .users-card {
                    max-width: 760px;
                    overflow: hidden;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }

                .users-card-header {
                    padding: 1.25rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                }

                .users-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: #9A6C18;
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .users-title {
                    margin-top: 0.45rem;
                    font-size: 1.65rem;
                    font-weight: 900;
                    color: #24151A;
                }

                .users-description {
                    margin-top: 0.35rem;
                    max-width: 48rem;
                    font-size: 0.9rem;
                    line-height: 1.65;
                    color: #6E6458;
                }

                .field-label {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #24151A;
                }

                .field-input,
                .select-input {
                    width: 100%;
                    margin-top: 0.35rem;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.65);
                    padding: 0.58rem 0.75rem;
                    color: #24151A;
                    outline: none;
                }

                .error-text {
                    margin-top: 0.25rem;
                    font-size: 0.78rem;
                    color: #dc2626;
                    font-weight: 600;
                }
            `}</style>

            <div className="users-page">
                <div className="users-shell">
                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="users-eyebrow">
                                Edición de proyecto
                            </div>

                            <h1 className="users-title">
                                Editar proyecto
                            </h1>

                            <p className="users-description">
                                Modifica la información principal del proyecto.
                            </p>
                        </div>

                        <form
                            onSubmit={submit}
                            className="grid gap-4 p-5 md:grid-cols-2"
                        >
                            {/* CODIGO */}
                            <div>
                                <label className="field-label">Código</label>
                                <Input
                                    className="field-input"
                                    value={form.data.codigo}
                                    onChange={(e) =>
                                        form.setData('codigo', e.target.value)
                                    }
                                />
                                {form.errors.codigo && (
                                    <div className="error-text">
                                        {form.errors.codigo}
                                    </div>
                                )}
                            </div>

                            {/* TITULO */}
                            <div>
                                <label className="field-label">Título</label>
                                <Input
                                    className="field-input"
                                    value={form.data.titulo}
                                    onChange={(e) =>
                                        form.setData('titulo', e.target.value)
                                    }
                                />
                                {form.errors.titulo && (
                                    <div className="error-text">
                                        {form.errors.titulo}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="field-label">Descripción</label>
                                <textarea
                                    className="field-input"
                                    value={form.data.descripcion}
                                    onChange={(e) => form.setData('descripcion', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="field-label">Modalidad</label>
                                <select
                                    className="select-input"
                                    value={form.data.modalidad}
                                    onChange={(e) => form.setData('modalidad', e.target.value)}
                                >
                                    <option value="">Seleccione</option>
                                    <option value="presencial">Presencial</option>
                                    <option value="virtual">Virtual</option>
                                    <option value="mixto">Mixto</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Área temática</label>
                                <select
                                    className="select-input"
                                    value={form.data.area_tematica}
                                    onChange={(e) => form.setData('area_tematica', e.target.value)}
                                >
                                    <option value="">Seleccione</option>
                                    <option value="Salud">Salud</option>
                                    <option value="Ventas">Ventas</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Educación">Educación</option>
                                    <option value="Finanzas">Finanzas</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Estudiante</label>
                                <select
                                    className="select-input"
                                    value={form.data.estudiante_id ?? ''}
                                    onChange={(e) => form.setData('estudiante_id', Number(e.target.value))}
                                >
                                    <option value="">Seleccione</option>
                                    {estudiantes.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Tutor</label>
                                <select
                                    className="select-input"
                                    value={form.data.tutor_id ?? ''}
                                    onChange={(e) => form.setData('tutor_id', Number(e.target.value))}
                                >
                                    <option value="">Seleccione</option>
                                    {tutores.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* PERIODO */}
                            <div>
                                <label className="field-label">Periodo</label>
                                <select
                                    className="select-input"
                                    value={form.data.periodo_id ?? ''}
                                    onChange={(e) =>
                                        form.setData(
                                            'periodo_id',
                                            Number(e.target.value),
                                        )
                                    }
                                >
                                    <option value="">Seleccione</option>
                                    {periodos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.periodo_id && (
                                    <div className="error-text">
                                        {form.errors.periodo_id}
                                    </div>
                                )}
                            </div>

                            {/* ESTADO */}
                            <div>
                                <label className="field-label">Estado</label>
                                <select
                                    className="select-input"
                                    value={form.data.estado}
                                    onChange={(e) =>
                                        form.setData('estado', e.target.value)
                                    }
                                >
                                    <option value="borrador">Borrador</option>
                                    <option value="activo">Activo</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                                {form.errors.estado && (
                                    <div className="error-text">
                                        {form.errors.estado}
                                    </div>
                                )}
                            </div>

                            {/* BOTONES */}
                            <div className="flex flex-wrap gap-2 pt-2 md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-[#6B1230] px-5 font-bold text-white hover:bg-[#4A0D21]"
                                >
                                    <Save className="h-4 w-4" />
                                    {form.processing
                                        ? 'Guardando...'
                                        : 'Guardar cambios'}
                                </Button>

                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    <Link href="/proyectos">
                                        <ArrowLeft className="h-4 w-4" />
                                        Volver
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}

ProyectosEdit.layout = {
    breadcrumbs: [
        {
            title: 'Editar proyecto',
            href: '/proyectos',
        },
    ],
};