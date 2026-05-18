import { router, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Search, Trash2, FolderKanban, Tag, CalendarDays,
    UserCircle, Briefcase, RotateCcw,
} from 'lucide-react';

type Periodo = { id: number; nombre: string };
type Usuario = { id: number; name: string };

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    estado: string;
    deleted_at: string;
    periodo?: Periodo | null;
    estudiante?: Usuario | null;
    tutor?: Usuario | null;
};

type Filters = { busqueda?: string };

type Props = {
    eliminados: { data: Proyecto[]; total?: number };
    filters: Filters;
};

function formatFecha(iso: string): string {
    try {
        return new Date(iso).toLocaleString('es-BO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export default function Papelera({ eliminados, filters }: Props) {
    const [busqueda, setBusqueda] = useState(filters.busqueda || '');

    const handleSearch = (val: string) => {
        setBusqueda(val);
        router.get('/proyectos/papelera', { busqueda: val }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const restaurar = (p: Proyecto) => {
        if (!confirm(`¿Restaurar el proyecto ${p.codigo}?`)) return;
        router.post(`/proyectos/${p.id}/restore`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Papelera de Proyectos" />

            <style>{`
                .page-container {
                    width: 100%;
                    min-height: 100vh;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.18), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.12), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }
                @media (prefers-color-scheme: dark) {
                    .page-container {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.14), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.14), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }
                .shell-container { padding: 1rem; display: grid; gap: 1.25rem; width: 100%; }
                @media (min-width: 768px) { .shell-container { padding: 1.5rem; gap: 1.5rem; } }

                .glass-card {
                    overflow: hidden;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }
                @media (prefers-color-scheme: dark) {
                    .glass-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }
                }

                .eyebrow {
                    display: inline-flex; align-items: center; gap: 0.45rem;
                    color: #9A6C18;
                    font-size: 0.68rem; font-weight: 900;
                    letter-spacing: 0.13em; text-transform: uppercase;
                }
                @media (prefers-color-scheme: dark) { .eyebrow { color: #D6B96A; } }

                .info-banner {
                    margin: 0 1.5rem 1rem;
                    padding: 0.8rem 1rem;
                    border-radius: 0.85rem;
                    border: 1px dashed rgba(107,18,48,0.25);
                    background: rgba(201,168,76,0.10);
                    color: #6B1230;
                    font-size: 0.85rem;
                    font-weight: 600;
                    line-height: 1.5;
                }
                @media (prefers-color-scheme: dark) {
                    .info-banner {
                        border-color: rgba(214,185,106,0.30);
                        background: rgba(214,185,106,0.08);
                        color: #F4EEE9;
                    }
                }

                .custom-select {
                    width: 100%;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background-color: rgba(255,255,255,0.75);
                    padding: 0.58rem 0.75rem;
                    font-size: 0.9rem;
                    color: #24151A;
                    outline: none;
                }
                @media (prefers-color-scheme: dark) {
                    .custom-select {
                        border-color: rgba(214,185,106,0.14);
                        background-color: #2B1620;
                        color: #F4EEE9;
                    }
                }

                .row-deleted .titulo-text { text-decoration: line-through; opacity: 0.75; }

                .action-btn {
                    display: inline-flex; align-items: center; justify-content: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.75rem;
                    border-radius: 0.6rem;
                    border: 1px solid rgba(63,157,88,0.25);
                    background: rgba(63,157,88,0.08);
                    color: #2E7B41;
                    font-size: 0.78rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all .15s;
                }
                .action-btn:hover { background: rgba(63,157,88,0.18); }
                @media (prefers-color-scheme: dark) {
                    .action-btn {
                        background: rgba(63,157,88,0.14);
                        color: #87D199;
                    }
                    .action-btn:hover { background: rgba(63,157,88,0.24); }
                }
            `}</style>

            <div className="page-container">
                <div className="shell-container">

                    {/* ENCABEZADO */}
                    <section className="glass-card">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="eyebrow">
                                    <Trash2 className="h-4 w-4" />
                                    Proyectos Eliminados
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mt-1">Papelera</h1>
                                <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-1">
                                    Proyectos eliminados que pueden restaurarse al listado activo.
                                </p>
                            </div>

                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/proyectos">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al listado
                                </Link>
                            </Button>
                        </div>

                        <div className="info-banner">
                            Los proyectos eliminados conservan toda su informacion (documentos, observaciones, historial).
                            Al restaurar uno, vuelve a aparecer en el listado principal con el mismo estado y datos.
                        </div>
                    </section>

                    {/* BUSQUEDA */}
                    <section className="glass-card">
                        <div className="p-6">
                            <div className="relative max-w-xl">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none z-10" />
                                <input
                                    type="text"
                                    placeholder="Buscar por titulo o codigo..."
                                    className="custom-select"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={busqueda}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* TABLA */}
                    <section className="glass-card">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.15em] text-[#8A8074] dark:border-[#D6B96A]/14">
                                        <th className="px-6 py-5 font-black">Codigo</th>
                                        <th className="px-6 py-5 font-black">Titulo</th>
                                        <th className="px-6 py-5 font-black">Estudiante</th>
                                        <th className="px-6 py-5 font-black">Tutor</th>
                                        <th className="px-6 py-5 font-black">Periodo</th>
                                        <th className="px-6 py-5 font-black">Eliminado</th>
                                        <th className="px-6 py-5 font-black text-right">Accion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#6B1230]/5 dark:divide-[#D6B96A]/5">
                                    {eliminados.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <FolderKanban className="h-12 w-12 mb-2 stroke-[1]" />
                                                    <p className="font-bold text-lg">La papelera esta vacia</p>
                                                    <p className="text-sm">No hay proyectos eliminados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        eliminados.data.map((p) => (
                                            <tr key={p.id} className="row-deleted group hover:bg-[#6B1230]/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#6B1230]/5 text-[#6B1230] font-mono text-xs font-bold dark:bg-[#D4849A]/10 dark:text-[#D4849A] border border-[#6B1230]/10">
                                                        <Tag className="h-3 w-3" />
                                                        {p.codigo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 max-w-md">
                                                    <div className="titulo-text font-bold text-[#24151A] dark:text-white leading-snug">
                                                        {p.titulo}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                        <UserCircle className="h-4 w-4" />
                                                        {p.estudiante?.name ?? '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                        <Briefcase className="h-4 w-4" />
                                                        {p.tutor?.name ?? '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {p.periodo?.nombre || 'Pendiente'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-[#6E6458] dark:text-[#A8A094] font-mono">
                                                        {formatFecha(p.deleted_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        className="action-btn"
                                                        onClick={() => restaurar(p)}
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        Restaurar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}