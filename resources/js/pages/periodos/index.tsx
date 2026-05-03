import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    LayoutGrid,
} from 'lucide-react';

type Periodo = {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_cierre: string;
    activo: boolean;
};

type Props = {
    periodos: {
        data: Periodo[];
        links: any[];
        total: number;
    };
};

export default function PeriodosIndex({ periodos }: Props) {
    return (
        <>
            <Head title="Periodos académicos" />

            <style>{`
                .periodos-page {
                    width: 100%;
                    min-height: 100vh;
                    overflow-x: hidden;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.22), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.14), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .periodos-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                /* Ajuste de Shell para ocupar todo el ancho disponible */
                .periodos-shell {
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                    width: 100%; /* Ocupa el 100% del contenedor */
                }

                @media (min-width: 768px) {
                    .periodos-shell {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

                .periodos-card {
                    overflow: hidden;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.70);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }

                @media (prefers-color-scheme: dark) {
                    .periodos-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                    }
                }

                .card-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
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
                    margin-bottom: 0.5rem;
                }

                @media (prefers-color-scheme: dark) {
                    .eyebrow { color: #D6B96A; }
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    border-radius: 999px;
                    padding: 0.25rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .status-active { 
                    color: #15803d; 
                    background: rgba(22,163,74,0.10); 
                    border: 1px solid rgba(22,163,74,0.20); 
                }
                .status-inactive { 
                    color: #b91c1c; 
                    background: rgba(220,38,38,0.10); 
                    border: 1px solid rgba(220,38,38,0.20); 
                }
            `}</style>

            <div className="periodos-page">
                <div className="periodos-shell">
                    {/* CABECERA */}
                    <header className="periodos-card">
                        <div className="card-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="eyebrow">
                                    <Calendar className="h-4 w-4" />
                                    Gestión Académica
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mt-1">Periodos Académicos</h1>
                                <p className="text-sm opacity-70 mt-1">Administra las gestiones académicas y sus fechas de vigencia.</p>
                            </div>

                            <Button
                                asChild
                                className="rounded-xl bg-[#6B1230] font-bold text-white hover:bg-[#4A0D21] dark:bg-[#D4849A] dark:text-[#2B1620] shadow-lg shadow-[#6B1230]/10"
                            >
                                <Link href="/periodos/crear">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear periodo
                                </Link>
                            </Button>
                        </div>
                    </header>

                    {/* LISTADO */}
                    <section className="periodos-card">
                        <div className="card-header flex justify-between items-center bg-[#6B1230]/5 dark:bg-white/5">
                            <div className="eyebrow">
                                <LayoutGrid className="h-4 w-4" />
                                Listado de periodos registrados
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                Total: {periodos.total} registros
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-[#6B1230]/10 text-xs uppercase tracking-[0.15em] text-[#8A8074] dark:border-[#D6B96A]/14">
                                        <th className="px-6 py-5 font-black">Nombre de Gestión</th>
                                        <th className="px-6 py-5 font-black">Fecha Inicio</th>
                                        <th className="px-6 py-5 font-black">Fecha Cierre</th>
                                        <th className="px-6 py-5 font-black">Estado Operativo</th>
                                        <th className="px-6 py-5 font-black text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#6B1230]/5 dark:divide-[#D6B96A]/5">
                                    {periodos.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <Calendar className="h-10 w-10 mb-2 stroke-[1]" />
                                                    <p className="font-bold">No hay periodos registrados actualmente.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        periodos.data.map((p) => (
                                            <tr key={p.id} className="group hover:bg-[#6B1230]/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-[#24151A] dark:text-white">
                                                    {p.nombre}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094]">
                                                        <Clock className="h-3.5 w-3.5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                                        {new Date(p.fecha_inicio).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[#6E6458] dark:text-[#A8A094]">
                                                        <Clock className="h-3.5 w-3.5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                                        {new Date(p.fecha_cierre).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`status-badge ${p.activo ? 'status-active' : 'status-inactive'}`}>
                                                        {p.activo ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                        {p.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button asChild variant="outline" size="sm" className="rounded-xl font-bold border-[#6B1230]/10 hover:bg-[#6B1230] hover:text-white transition-all">
                                                        <Link href={`/periodos/${p.id}/editar`}>Editar</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="flex flex-wrap gap-2 p-6 border-t border-[#6B1230]/10 dark:border-[#D6B96A]/14 bg-[#6B1230]/5 dark:bg-white/5">
                            {periodos.links.map((link, index) => (
                                <Button
                                    key={index}
                                    size="sm"
                                    variant={link.active ? 'default' : 'outline'}
                                    disabled={!link.url}
                                    className={`rounded-xl font-bold transition-all ${
                                        link.active 
                                        ? 'bg-[#6B1230] text-white shadow-md' 
                                        : 'border-[#6B1230]/10'
                                    }`}
                                    onClick={() => { if (link.url) window.location.href = link.url; }}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                            .replace('&laquo;', 'Anterior')
                                            .replace('&raquo;', 'Siguiente'),
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}