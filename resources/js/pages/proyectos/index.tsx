import { router, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Plus, 
    Search, 
    Filter, 
    FolderKanban, 
    X, 
    Tag, 
    CalendarDays
} from 'lucide-react';

type Periodo = {
    id: number;
    nombre: string;
};

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    estado: string;
    periodo?: Periodo | null;
};

type Filters = {
    periodo_id?: string;
    search?: string;
};

type Props = {
    proyectos: {
        data: Proyecto[];
        total?: number;
    };
    periodos: Periodo[];
    filters: Filters;
};

export default function Index({ proyectos, periodos, filters }: Props) {
    const [values, setValues] = useState<Filters>({
        periodo_id: filters.periodo_id || '',
        search: filters.search || '',
    });

    const handleFilter = (newValues: Filters) => {
        router.get('/proyectos', newValues, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Repositorio de Proyectos" />

            <style>{`
                .page-container {
                    width: 100%;
                    min-height: 100vh;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.22), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.14), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .page-container {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                /* Ajuste de padding para ocupar todo el ancho */
                .shell-container {
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                    width: 100%;
                }

                @media (min-width: 768px) {
                    .shell-container {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

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
                    .eyebrow { color: #D6B96A; }
                }

                .filter-label {
                    display: block;
                    margin-bottom: 0.35rem;
                    color: #6E6458;
                    font-size: 0.72rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
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
            `}</style>

            <div className="page-container">
                <div className="shell-container">
                    
                    {/* ENCABEZADO */}
                    <section className="glass-card">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="eyebrow">
                                    <FolderKanban className="h-4 w-4" />
                                    Gestión de Grado
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mt-1">Repositorio de Proyectos</h1>
                                <p className="text-sm text-[#6E6458] dark:text-[#A9978D] mt-1">
                                    Administración y seguimiento de proyectos de grado activos.
                                </p>
                            </div>

                            <Button
                                asChild
                                className="rounded-xl bg-[#6B1230] font-bold text-white hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620]"
                            >
                                <Link href="/proyectos/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Proyecto
                                </Link>
                            </Button>
                        </div>
                    </section>

                    {/* FILTROS */}
                    <section className="glass-card">
                        <div className="p-6">
                            <div className="eyebrow mb-4">
                                <Filter className="h-4 w-4" /> Parámetros de búsqueda
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-5 space-y-1.5">
                                    <label className="filter-label">Búsqueda general</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                                        <input
                                            type="text"
                                            placeholder="Título o código del proyecto..."
                                            className="custom-select pl-10"
                                            value={values.search}
                                            onChange={(e) => {
                                                const newValues = { ...values, search: e.target.value };
                                                setValues(newValues);
                                                handleFilter(newValues);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="filter-label">Periodo Académico</label>
                                    <select
                                        className="custom-select appearance-none"
                                        value={values.periodo_id}
                                        onChange={(e) => {
                                            const newValues = { ...values, periodo_id: e.target.value };
                                            setValues(newValues);
                                            handleFilter(newValues);
                                        }}
                                    >
                                        <option value="">Todos los periodos</option>
                                        {periodos.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3 flex gap-2">
                                    <Button 
                                        onClick={() => handleFilter(values)}
                                        className="flex-1 rounded-xl bg-[#6B1230] text-white"
                                    >
                                        Filtrar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => {
                                            const reset = { periodo_id: '', search: '' };
                                            setValues(reset);
                                            handleFilter(reset);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TABLA */}
                    <section className="glass-card">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.15em] text-[#8A8074] dark:border-[#D6B96A]/14">
                                        <th className="px-6 py-5 font-black">Identificador</th>
                                        <th className="px-6 py-5 font-black">Título del Proyecto</th>
                                        <th className="px-6 py-5 font-black">Ciclo/Periodo</th>
                                        <th className="px-6 py-5 font-black text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#6B1230]/5 dark:divide-[#D6B96A]/5">
                                    {proyectos.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <FolderKanban className="h-12 w-12 mb-2 stroke-[1]" />
                                                    <p className="font-bold text-lg">No se hallaron resultados</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        proyectos.data.map((p) => (
                                            <tr key={p.id} className="group hover:bg-[#6B1230]/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#6B1230]/5 text-[#6B1230] font-mono text-xs font-bold dark:bg-[#D4849A]/10 dark:text-[#D4849A] border border-[#6B1230]/10">
                                                        <Tag className="h-3 w-3" />
                                                        {p.codigo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[#24151A] dark:text-white leading-snug">
                                                        {p.titulo}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094] font-medium">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {p.periodo?.nombre || 'Pendiente'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                                        {p.estado}
                                                    </span>
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