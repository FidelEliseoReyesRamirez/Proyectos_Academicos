import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FolderPlus, Briefcase, Calendar, User, Tag, AlignLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Periodo = {
    id: number;
    nombre: string;
    activo: boolean;
    fecha_inicio: string;
    fecha_fin: string;
};

type Usuario = {
    id: number;
    name: string;
};

type Props = {
    periodos: Periodo[];
    estudiantes: Usuario[];
    tutores: Usuario[];
};

export default function ProyectosCreate({ periodos, estudiantes, tutores }: Props) {
    const form = useForm({
        codigo: '',
        titulo: '',
        descripcion: '',
        modalidad: '',
        area_tematica: '',
        periodo_id: '',
        estudiante_id: '',
        tutor_id: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/proyectos', { 
            preserveScroll: true 
        });
    };

    return (
        <>
            <Head title="Crear proyecto" />

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

                @media (prefers-color-scheme: dark) {
                    .users-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .users-shell {
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                }

                @media (min-width: 768px) {
                    .users-shell {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

                .users-card {
                    max-width: 850px;
                    overflow: hidden;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }

                @media (prefers-color-scheme: dark) {
                    .users-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }
                }

                .users-card-header {
                    padding: 1.25rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                }

                @media (prefers-color-scheme: dark) {
                    .users-card-header {
                        border-bottom-color: rgba(214,185,106,0.14);
                    }
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

                @media (prefers-color-scheme: dark) {
                    .users-eyebrow {
                        color: #D6B96A;
                    }
                }

                .users-title {
                    margin-top: 0.45rem;
                    font-size: 1.65rem;
                    font-weight: 900;
                    color: #24151A;
                }

                @media (prefers-color-scheme: dark) {
                    .users-title {
                        color: #F4EEE9;
                    }
                }

                .users-description {
                    margin-top: 0.35rem;
                    max-width: 48rem;
                    font-size: 0.9rem;
                    line-height: 1.65;
                    color: #6E6458;
                }

                @media (prefers-color-scheme: dark) {
                    .users-description {
                        color: #D7C9C0;
                    }
                }

                .field-label {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #24151A;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                @media (prefers-color-scheme: dark) {
                    .field-label {
                        color: #F4EEE9;
                    }
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
                    transition: all 0.2s;
                }

                .field-input:focus, .select-input:focus {
                    border-color: #6B1230;
                    background: white;
                }

                @media (prefers-color-scheme: dark) {
                    .field-input,
                    .select-input {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.055);
                        color: #F4EEE9;
                    }
                    .field-input:focus, .select-input:focus {
                        border-color: #D6B96A;
                        background: rgba(255,255,255,0.08);
                    }
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
                                <FolderPlus className="h-4 w-4" />
                                Nuevo Registro
                            </div>

                            <h1 className="users-title">
                                Crear Proyecto
                            </h1>

                            <p className="users-description">
                                Complete la información técnica y asigne los responsables correspondientes para el nuevo proyecto de grado.
                            </p>
                        </div>

                        <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
                            {/* Código */}
                            <div>
                                <label className="field-label"><Tag className="h-3 w-3" /> Código</label>
                                <Input
                                    className="field-input font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                                    value="Generado automáticamente"
                                    disabled
                                    readOnly
                                />
                                <div className="text-[0.75rem] text-gray-500 mt-1">El sistema asignará el código al guardar.</div>
                            </div>

                            {/* Título */}
                            <div>
                                <label className="field-label">Título del Proyecto</label>
                                <Input
                                    className="field-input"
                                    value={form.data.titulo}
                                    onChange={e => form.setData('titulo', e.target.value)}
                                    placeholder="Nombre descriptivo"
                                />
                                {form.errors.titulo && <div className="error-text">{form.errors.titulo}</div>}
                            </div>

                            {/* Descripción */}
                            <div className="md:col-span-2">
                                <label className="field-label"><AlignLeft className="h-3 w-3" /> Descripción</label>
                                <textarea
                                    className="field-input min-h-[100px] resize-none"
                                    value={form.data.descripcion}
                                    onChange={e => form.setData('descripcion', e.target.value)}
                                    placeholder="Breve resumen del proyecto..."
                                />
                                {form.errors.descripcion && <div className="error-text">{form.errors.descripcion}</div>}
                            </div>

                            {/* Modalidad */}
                            <div>
                                <label className="field-label">Modalidad</label>
                                <select
                                    className="select-input"
                                    value={form.data.modalidad}
                                    onChange={(e) => form.setData('modalidad', e.target.value)}
                                >
                                    <option value="">Seleccione modalidad</option>
                                    <option value="presencial">Presencial</option>
                                    <option value="virtual">Virtual</option>
                                    <option value="mixto">Mixto</option>
                                </select>
                                {form.errors.modalidad && <div className="error-text">{form.errors.modalidad}</div>}
                            </div>

                            {/* Área Temática */}
                            <div>
                                <label className="field-label">Área temática</label>
                                <select
                                    className="select-input"
                                    value={form.data.area_tematica}
                                    onChange={(e) => form.setData('area_tematica', e.target.value)}
                                >
                                    <option value="">Seleccione área</option>
                                    <option value="Salud">Salud</option>
                                    <option value="Ventas">Ventas</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Educación">Educación</option>
                                    <option value="Finanzas">Finanzas</option>
                                </select>
                                {form.errors.area_tematica && <div className="error-text">{form.errors.area_tematica}</div>}
                            </div>

                            {/* Periodo */}
                            <div>
                                <label className="field-label"><Calendar className="h-3 w-3" /> Periodo Académico</label>
                                <select 
                                    className="select-input" 
                                    value={form.data.periodo_id} 
                                    onChange={e => form.setData('periodo_id', e.target.value)}
                                >
                                    <option value="">Seleccione un periodo</option>
                                    {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                                {form.errors.periodo_id && <div className="error-text">{form.errors.periodo_id}</div>}
                            </div>

                            {/* Estudiante */}
                            <div>
                                <label className="field-label"><User className="h-3 w-3" /> Estudiante Asignado</label>
                                <select 
                                    className="select-input" 
                                    value={form.data.estudiante_id} 
                                    onChange={e => form.setData('estudiante_id', e.target.value)}
                                >
                                    <option value="">Seleccione estudiante</option>
                                    {estudiantes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                                {form.errors.estudiante_id && <div className="error-text">{form.errors.estudiante_id}</div>}
                            </div>

                            {/* Tutor */}
                            <div>
                                <label className="field-label"><Briefcase className="h-3 w-3" /> Tutor Asignado</label>
                                <select 
                                    className="select-input" 
                                    value={form.data.tutor_id} 
                                    onChange={e => form.setData('tutor_id', e.target.value)}
                                >
                                    <option value="">Seleccione tutor</option>
                                    {tutores.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                {form.errors.tutor_id && <div className="error-text">{form.errors.tutor_id}</div>}
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-wrap gap-2 pt-4 md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-[#6B1230] px-6 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620] dark:hover:bg-[#E3A1B2]"
                                >
                                    <FolderPlus className="h-4 w-4" />
                                    {form.processing ? 'Guardando...' : 'Guardar Proyecto'}
                                </Button>

                                <Button asChild type="button" variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800">
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

ProyectosCreate.layout = {
    breadcrumbs: [
        { title: 'Proyectos', href: '/proyectos' },
        { title: 'Crear', href: '/proyectos/crear' },
    ],
};