import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormEvent } from 'react';
import { ArrowLeft, CalendarPlus, CalendarDays } from 'lucide-react';

export default function PeriodosCreate() {
    const form = useForm({
        fecha_inicio: '',
        fecha_cierre: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/periodos', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Crear periodo" />
            
            <style>{`
                .users-page {
                    width: 100%;
                    min-height: 100%;
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
                    padding: 1.5rem;
                    display: flex;
                    justify-content: center;
                }

                .users-card {
                    width: 100%;
                    max-width: 650px;
                    overflow: hidden;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(12px);
                }

                @media (prefers-color-scheme: dark) {
                    .users-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(0,0,0,0.2);
                    }
                }

                .users-card-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(107,18,48,0.08);
                }

                .users-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #9A6C18;
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }

                @media (prefers-color-scheme: dark) {
                    .users-eyebrow { color: #D6B96A; }
                }

                .users-title {
                    font-size: 1.85rem;
                    font-weight: 900;
                    color: inherit;
                }

                .field-label {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    margin-bottom: 0.6rem;
                    text-transform: uppercase;
                    color: #9A6C18;
                }

                @media (prefers-color-scheme: dark) {
                    .field-label { color: #D6B96A; }
                }

                .field-input {
                    width: 100%;
                    border-radius: 0.85rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.4);
                    padding: 0.75rem 1rem;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    color: inherit;
                }

                .field-input:focus {
                    outline: none;
                    border-color: #6B1230;
                    background: rgba(255,255,255,0.8);
                }

                @media (prefers-color-scheme: dark) {
                    .field-input {
                        background: rgba(0,0,0,0.15);
                        border-color: rgba(214,185,106,0.15);
                    }
                    .field-input:focus {
                        border-color: #D4849A;
                    }
                    .field-input::-webkit-calendar-picker-indicator {
                        filter: invert(0.8);
                    }
                }

                .btn-primary {
                    background: #6B1230;
                    color: white;
                    border-radius: 0.9rem;
                    font-weight: 700;
                    height: 3.2rem;
                    transition: all 0.3s ease;
                }

                @media (prefers-color-scheme: dark) {
                    .btn-primary {
                        background: #D4849A;
                        color: #2B1620;
                    }
                    .btn-primary:hover { background: #E5A3B4; }
                }
            `}</style>

            <div className="users-page">
                <div className="users-shell">
                    <section className="users-card">
                        <div className="users-card-header">
                            <div className="users-eyebrow">
                                <CalendarDays className="h-4 w-4" />
                                Configuración de Ciclos
                            </div>
                            <h1 className="users-title">Nuevo Periodo Académico</h1>
                        </div>

                        <form onSubmit={submit} className="p-8 grid gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="field-label">Fecha de Apertura</label>
                                    <Input
                                        type="date"
                                        className="field-input"
                                        value={form.data.fecha_inicio}
                                        onChange={e => form.setData('fecha_inicio', e.target.value)}
                                    />
                                    {form.errors.fecha_inicio && (
                                        <div className="mt-2 text-xs font-bold text-red-500">{form.errors.fecha_inicio}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="field-label">Fecha de Cierre</label>
                                    <Input
                                        type="date"
                                        className="field-input"
                                        value={form.data.fecha_cierre}
                                        onChange={e => form.setData('fecha_cierre', e.target.value)}
                                    />
                                    {form.errors.fecha_cierre && (
                                        <div className="mt-2 text-xs font-bold text-red-500">{form.errors.fecha_cierre}</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button 
                                    type="submit" 
                                    disabled={form.processing} 
                                    className="btn-primary w-full shadow-lg"
                                >
                                    <CalendarPlus className="mr-2 h-5 w-5" />
                                    {form.processing ? 'Registrando...' : 'Confirmar Nuevo Periodo'}
                                </Button>
                                
                                <Button asChild variant="ghost" className="rounded-xl opacity-60 hover:opacity-100 hover:bg-transparent">
                                    <Link href="/periodos" className="flex items-center justify-center">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> 
                                        Cancelar y volver al listado
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

PeriodosCreate.layout = {
    breadcrumbs: [
        { title: 'Periodos', href: '/periodos' },
        { title: 'Configurar Nuevo', href: '/periodos/crear' },
    ],
};