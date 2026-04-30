import { router } from '@inertiajs/react';
import { useState } from 'react';

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
        });
    };

    return (
        <div className="space-y-4">

            {/* FILTROS */}
            <div className="flex gap-3">

                <input
                    type="text"
                    placeholder="Buscar..."
                    className="border px-3 py-2 rounded"
                    value={values.search}
                    onChange={(e) => {
                        const newValues = { ...values, search: e.target.value };
                        setValues(newValues);
                        handleFilter(newValues);
                    }}
                />

                <select
                    className="border px-3 py-2 rounded"
                    value={values.periodo_id}
                    onChange={(e) => {
                        const newValues = { ...values, periodo_id: e.target.value };
                        setValues(newValues);
                        handleFilter(newValues);
                    }}
                >
                    <option value="">Todos los periodos</option>
                    {periodos.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.nombre}
                        </option>
                    ))}
                </select>

                <button
                    className="px-3 py-2 bg-gray-200 rounded"
                    onClick={() => {
                        const reset = { periodo_id: '', search: '' };
                        setValues(reset);
                        handleFilter(reset);
                    }}
                >
                    Limpiar
                </button>
            </div>

            {/* TABLA */}
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">Código</th>
                        <th className="p-2">Título</th>
                        <th className="p-2">Periodo</th>
                        <th className="p-2">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {proyectos.data.map((p) => (
                        <tr key={p.id} className="border-t">
                            <td className="p-2">{p.codigo}</td>
                            <td className="p-2">{p.titulo}</td>
                            <td className="p-2">{p.periodo?.nombre}</td>
                            <td className="p-2">{p.estado}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}