import { Head, router } from '@inertiajs/react';
import { type CSSProperties, type ReactNode, useMemo, useState } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit3,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';

type Usuario = {
    id: number;
    name: string;
    email?: string;
};

type Actividad = {
    id: number;
    titulo: string;
    descripcion?: string | null;
    tipo: string;
    color: string;
    fecha_inicio: string;
    fecha_fin?: string | null;
    creador?: Usuario | null;
};

type CalendarioData = {
    actividades: Actividad[];
    puedeGestionar: boolean;
    rol: string;
};

type Props = {
    calendarioData: CalendarioData;
};

type FormState = {
    titulo: string;
    descripcion: string;
    tipo: string;
    color: string;
    fecha_inicio: string;
    fecha_fin: string;
};

const initialForm: FormState = {
    titulo: '',
    descripcion: '',
    tipo: 'general',
    color: '#6B1230',
    fecha_inicio: '',
    fecha_fin: '',
};

const tipoLabels: Record<string, string> = {
    general: 'General',
    entrega: 'Entrega',
    reunion: 'Reunión',
    defensa: 'Defensa',
    revision: 'Revisión',
    aviso: 'Aviso',
};

const coloresRapidos = [
    '#6B1230',
    '#C9A84C',
    '#2563EB',
    '#15803D',
    '#B91C1C',
    '#7C3AED',
    '#EA580C',
];

function sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function activityCoversDay(actividad: Actividad, day: Date): boolean {
    const inicio = new Date(actividad.fecha_inicio);
    const fin = actividad.fecha_fin ? new Date(actividad.fecha_fin) : inicio;

    if (Number.isNaN(inicio.getTime())) return false;

    const dayStart = startOfDay(day).getTime();
    const dayEnd = endOfDay(day).getTime();
    const inicioTime = startOfDay(inicio).getTime();
    const finTime = endOfDay(fin).getTime();

    return inicioTime <= dayEnd && finTime >= dayStart;
}

function buildMonthDays(baseDate: Date): Date[] {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;

    start.setDate(first.getDate() - startDay);

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return day;
    });
}

function formatMonth(date: Date): string {
    return new Intl.DateTimeFormat('es-BO', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function formatDateTime(value?: string | null): string {
    if (!value) return 'Sin fecha';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function toInputDateTime(value?: string | null): string {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);

    return local.toISOString().slice(0, 16);
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#6B1230';
    const r = parseInt(clean.slice(1, 3), 16);
    const g = parseInt(clean.slice(3, 5), 16);
    const b = parseInt(clean.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildDayStyle(actividades: Actividad[]): CSSProperties {
    const colors = Array.from(
        new Set(
            actividades
                .map((actividad) => actividad.color || '#6B1230')
                .filter((color) => /^#[0-9A-Fa-f]{6}$/.test(color)),
        ),
    ).slice(0, 4);

    if (colors.length === 0) return {};

    if (colors.length === 1) {
        return {
            background: `linear-gradient(135deg, ${hexToRgba(colors[0], 0.24)}, rgba(255,255,255,.06))`,
            borderColor: colors[0],
        };
    }

    const step = 100 / colors.length;
    const stops = colors
        .map((color, index) => {
            const start = (index * step).toFixed(2);
            const end = ((index + 1) * step).toFixed(2);
            return `${hexToRgba(color, 0.25)} ${start}% ${end}%`;
        })
        .join(', ');

    return {
        background: `linear-gradient(135deg, ${stops})`,
        borderColor: colors[0],
    };
}

function activityForForm(actividad: Actividad): FormState {
    return {
        titulo: actividad.titulo || '',
        descripcion: actividad.descripcion || '',
        tipo: actividad.tipo || 'general',
        color: actividad.color || '#6B1230',
        fecha_inicio: toInputDateTime(actividad.fecha_inicio),
        fecha_fin: toInputDateTime(actividad.fecha_fin),
    };
}

function Badge({ children, color }: { children: ReactNode; color?: string }) {
    return (
        <span
            className="cal-badge"
            style={color ? { background: hexToRgba(color, 0.16), color } : undefined}
        >
            {children}
        </span>
    );
}

export default function Calendario({ calendarioData }: Props) {
    const actividades = calendarioData?.actividades || [];
    const puedeGestionar = Boolean(calendarioData?.puedeGestionar);

    const [month, setMonth] = useState(() => new Date());
    const [selectedDay, setSelectedDay] = useState(() => new Date());
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Actividad | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Actividad | null>(null);
    const [form, setForm] = useState<FormState>(initialForm);
    const [uiError, setUiError] = useState<string | null>(null);

    const formWarnings = useMemo(() => {
        const warnings: string[] = [];

        if (!form.titulo.trim()) {
            warnings.push('Falta el título.');
        }

        if (!form.fecha_inicio) {
            warnings.push('Falta la fecha de inicio.');
        }

        if (
            form.fecha_inicio &&
            form.fecha_fin &&
            new Date(form.fecha_fin).getTime() < new Date(form.fecha_inicio).getTime()
        ) {
            warnings.push('La fecha fin no puede ser anterior a la fecha inicio.');
        }

        return warnings;
    }, [form.titulo, form.fecha_inicio, form.fecha_fin]);

    const days = useMemo(() => buildMonthDays(month), [month]);

    const actividadesOrdenadas = useMemo(
        () => [...actividades].sort(
            (a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
        ),
        [actividades],
    );

    const actividadesDelDia = useMemo(
        () => actividadesOrdenadas.filter((actividad) => activityCoversDay(actividad, selectedDay)),
        [actividadesOrdenadas, selectedDay],
    );

    const proximasActividades = useMemo(
        () => actividadesOrdenadas
            .filter((actividad) => new Date(actividad.fecha_inicio).getTime() >= Date.now())
            .slice(0, 6),
        [actividadesOrdenadas],
    );

    const openCreate = () => {
        setEditing(null);
        setUiError(null);
        setForm({
            ...initialForm,
            fecha_inicio: toInputDateTime(selectedDay.toISOString()),
        });
        setFormOpen(true);
    };

    const openEdit = (actividad: Actividad) => {
        setEditing(actividad);
        setUiError(null);
        setForm(activityForForm(actividad));
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        setUiError(null);
        setForm(initialForm);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (formWarnings.length > 0) {
            setUiError('Completa los campos obligatorios antes de guardar.');
            return;
        }

        setUiError(null);

        const payload = {
            ...form,
            titulo: form.titulo.trim(),
            fecha_fin: form.fecha_fin || null,
            descripcion: form.descripcion.trim() || null,
        };

        if (editing) {
            router.put(`/calendario/${editing.id}`, payload, {
                preserveScroll: true,
                onSuccess: closeForm,
            });
            return;
        }

        router.post('/calendario', payload, {
            preserveScroll: true,
            onSuccess: closeForm,
        });
    };

    const requestDelete = (actividad: Actividad) => {
        setDeleteTarget(actividad);
    };

    const cancelDelete = () => {
        setDeleteTarget(null);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        router.delete(`/calendario/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const moveMonth = (direction: number) => {
        setMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
    };

    return (
        <>
            <Head title="Calendario académico" />

            <style>{`
                .calendar-page{
                    --brand:#6B1230;
                    --brand-2:#C9A84C;
                    --card:rgba(255,255,255,.9);
                    --text:#24151A;
                    --muted:#776A60;
                    --border:rgba(107,18,48,.14);
                    --soft:rgba(107,18,48,.08);
                    min-height:100vh;
                    background:radial-gradient(circle at 90% 8%,rgba(201,168,76,.18),transparent 30%),linear-gradient(135deg,#FBF8F3,#F5EFE8);
                    color:var(--text);
                }

                .dark .calendar-page{
                    --card:rgba(255,255,255,.06);
                    --text:#F5EFE9;
                    --muted:#CDBFB5;
                    --border:rgba(214,185,106,.18);
                    --soft:rgba(214,185,106,.10);
                    --brand:#D4849A;
                    --brand-2:#D6B96A;
                    background:radial-gradient(circle at 90% 8%,rgba(214,185,106,.14),transparent 30%),linear-gradient(135deg,#211119,#351B28);
                }

                .calendar-shell{
                    max-width:1480px;
                    margin:0 auto;
                    padding:1.25rem;
                    display:grid;
                    gap:1rem;
                }

                @media(min-width:980px){
                    .calendar-shell{padding:2rem}
                }

                .calendar-hero,
                .calendar-card{
                    background:var(--card);
                    border:1px solid var(--border);
                    border-radius:1.4rem;
                    box-shadow:0 18px 44px rgba(107,18,48,.08);
                    backdrop-filter:blur(12px);
                }

                .calendar-hero{
                    padding:1.25rem;
                    display:flex;
                    flex-wrap:wrap;
                    align-items:center;
                    justify-content:space-between;
                    gap:1rem;
                }

                .calendar-title{
                    display:flex;
                    align-items:center;
                    gap:.75rem;
                }

                .calendar-title-icon{
                    width:3rem;
                    height:3rem;
                    border-radius:1rem;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:var(--soft);
                    color:var(--brand);
                }

                .calendar-title h1{
                    margin:0;
                    font-size:clamp(1.6rem,3vw,2.35rem);
                    line-height:1.05;
                    font-weight:950;
                    letter-spacing:-.04em;
                }

                .calendar-title p{
                    margin:.35rem 0 0;
                    color:var(--muted);
                    font-size:.92rem;
                }

                .calendar-action{
                    display:inline-flex;
                    align-items:center;
                    gap:.45rem;
                    border:0;
                    border-radius:.85rem;
                    padding:.72rem 1rem;
                    background:linear-gradient(135deg,var(--brand),#4A0D21);
                    color:white;
                    font-size:.86rem;
                    font-weight:900;
                    cursor:pointer;
                    transition:transform .15s ease, box-shadow .15s ease, filter .15s ease;
                }

                .calendar-action:hover{
                    transform:translateY(-1px);
                    box-shadow:0 12px 26px rgba(107,18,48,.18);
                }

                .dark .calendar-action{
                    color:#24151A;
                    background:linear-gradient(135deg,var(--brand),var(--brand-2));
                }

                .calendar-grid{
                    display:grid;
                    gap:1rem;
                    grid-template-columns:1fr;
                }

                @media(min-width:1180px){
                    .calendar-grid{
                        grid-template-columns:minmax(0,1.6fr) minmax(22rem,.8fr);
                    }
                }

                .calendar-card{padding:1rem}

                .calendar-toolbar{
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:1rem;
                    margin-bottom:1rem;
                }

                .calendar-toolbar h2{
                    margin:0;
                    text-transform:capitalize;
                    font-size:1.1rem;
                    font-weight:950;
                }

                .month-controls{display:flex;gap:.45rem}

                .icon-button{
                    min-width:2.25rem;
                    height:2.25rem;
                    border:1px solid var(--border);
                    border-radius:.72rem;
                    background:var(--soft);
                    color:var(--text);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    cursor:pointer;
                    padding:0 .6rem;
                }

                .weekdays,
                .month-grid{
                    display:grid;
                    grid-template-columns:repeat(7,minmax(0,1fr));
                    gap:.45rem;
                }

                .weekday{
                    color:var(--muted);
                    font-size:.72rem;
                    font-weight:950;
                    letter-spacing:.08em;
                    text-transform:uppercase;
                    text-align:center;
                    padding:.35rem 0;
                }

                .day-cell{
                    min-height:7.4rem;
                    border:1px solid var(--border);
                    border-radius:.9rem;
                    background:rgba(255,255,255,.4);
                    padding:.55rem;
                    text-align:left;
                    cursor:pointer;
                    display:flex;
                    flex-direction:column;
                    gap:.4rem;
                    transition:.15s ease;
                }

                .day-cell:hover{
                    transform:translateY(-1px);
                    box-shadow:0 10px 24px rgba(107,18,48,.10);
                }

                .dark .day-cell{
                    background:rgba(255,255,255,.035);
                }

                .day-cell.is-muted{opacity:.48}

                .day-cell.is-selected{
                    border-color:var(--brand);
                    box-shadow:0 0 0 3px var(--soft);
                }

                .day-number{
                    width:1.7rem;
                    height:1.7rem;
                    border-radius:999px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:.78rem;
                    font-weight:950;
                    background:rgba(255,255,255,.5);
                }

                .dark .day-number{
                    background:rgba(0,0,0,.18);
                }

                .day-cell.is-today .day-number{
                    background:var(--brand);
                    color:white;
                }

                .day-activity{
                    width:100%;
                    border:1px solid var(--border);
                    border-left:4px solid var(--brand);
                    border-radius:.55rem;
                    background:var(--soft);
                    padding:.32rem .4rem;
                    color:var(--text);
                    font-size:.68rem;
                    font-weight:850;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }

                .day-more{
                    color:var(--muted);
                    font-size:.66rem;
                    font-weight:900;
                }

                .side-panel{display:grid;gap:1rem}

                .panel-title{
                    display:flex;
                    align-items:center;
                    gap:.5rem;
                    margin:0 0 .75rem;
                    font-size:1rem;
                    font-weight:950;
                }

                .activity-list{display:grid;gap:.65rem}

                .activity-item{
                    border:1px solid var(--border);
                    border-left:5px solid var(--brand);
                    border-radius:.9rem;
                    padding:.8rem;
                    background:rgba(255,255,255,.38);
                }

                .dark .activity-item{
                    background:rgba(255,255,255,.035);
                }

                .activity-top{
                    display:flex;
                    align-items:flex-start;
                    justify-content:space-between;
                    gap:.8rem;
                }

                .activity-item strong{
                    display:block;
                    color:var(--text);
                    font-size:.92rem;
                    font-weight:950;
                    line-height:1.3;
                }

                .activity-meta{
                    display:grid;
                    gap:.35rem;
                    margin-top:.55rem;
                    color:var(--muted);
                    font-size:.76rem;
                    font-weight:760;
                }

                .activity-meta span{
                    display:inline-flex;
                    align-items:center;
                    gap:.35rem;
                    color:inherit;
                    text-decoration:none;
                }

                .activity-description{
                    margin:.55rem 0 0;
                    color:var(--muted);
                    font-size:.78rem;
                    line-height:1.5;
                }

                .activity-actions{
                    display:flex;
                    gap:.35rem;
                }

                .small-action{
                    width:2rem;
                    height:2rem;
                    border:1px solid var(--border);
                    border-radius:.65rem;
                    background:var(--soft);
                    color:var(--text);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    cursor:pointer;
                }

                .small-action.danger{
                    color:#B91C1C;
                    background:rgba(185,28,28,.10);
                }

                .cal-badge{
                    width:fit-content;
                    display:inline-flex;
                    align-items:center;
                    border-radius:999px;
                    padding:.2rem .55rem;
                    background:var(--soft);
                    color:var(--brand);
                    font-size:.68rem;
                    font-weight:900;
                    text-transform:uppercase;
                    letter-spacing:.04em;
                }

                .empty-calendar{
                    min-height:8rem;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    color:var(--muted);
                    border:1px dashed var(--border);
                    border-radius:1rem;
                    padding:1rem;
                    font-size:.85rem;
                }

                .modal-backdrop{
                    position:fixed;
                    inset:0;
                    z-index:50;
                    background:rgba(0,0,0,.62);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:1rem;
                    backdrop-filter:blur(5px);
                }

                .modal-card{
                    width:min(44rem,100%);
                    max-height:92vh;
                    overflow:auto;
                    background:linear-gradient(180deg, rgba(31,17,25,.98), rgba(20,15,18,.98));
                    color:#F5EFE9;
                    border:1px solid rgba(214,185,106,.16);
                    border-radius:1.25rem;
                    box-shadow:0 30px 80px rgba(0,0,0,.42);
                    padding:1rem;
                }

                .modal-header{
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:1rem;
                    margin-bottom:1rem;
                    padding-bottom:.85rem;
                    border-bottom:1px solid rgba(214,185,106,.13);
                }

                .modal-header h2{
                    margin:0;
                    font-size:1.18rem;
                    font-weight:950;
                    color:#F5EFE9;
                }

                .modal-header .icon-button{
                    background:rgba(255,255,255,.06);
                    border-color:rgba(214,185,106,.15);
                    color:#F5EFE9;
                }

                .form-grid{
                    display:grid;
                    gap:.85rem;
                }

                @media(min-width:720px){
                    .form-grid.two{
                        grid-template-columns:repeat(2,minmax(0,1fr));
                    }
                }

                .field{
                    display:grid;
                    gap:.4rem;
                }

                .field label{
                    color:#D8C9BE;
                    font-size:.72rem;
                    font-weight:900;
                    letter-spacing:.07em;
                    text-transform:uppercase;
                }

                .field input,
                .field select,
                .field textarea{
                    width:100%;
                    border:1px solid rgba(214,185,106,.15);
                    border-radius:.85rem;
                    background:rgba(255,255,255,.065);
                    color:#F5EFE9;
                    padding:.78rem .9rem;
                    outline:none;
                    transition:border-color .18s ease, box-shadow .18s ease, background .18s ease;
                }

                .field input:focus,
                .field select:focus,
                .field textarea:focus{
                    border-color:rgba(214,185,106,.55);
                    box-shadow:0 0 0 3px rgba(214,185,106,.10);
                    background:rgba(255,255,255,.085);
                }

                .field input::placeholder,
                .field textarea::placeholder{
                    color:rgba(245,239,233,.45);
                }

                .field select option{
                    background:#24151A;
                    color:#F5EFE9;
                }

                .field textarea{
                    min-height:6.2rem;
                    resize:vertical;
                }

                .color-picker-row{
                    display:flex;
                    align-items:center;
                    gap:.65rem;
                    flex-wrap:wrap;
                }

                .field input.color-input{
                    width:4.6rem;
                    height:2.55rem;
                    padding:.2rem;
                    cursor:pointer;
                    background:rgba(255,255,255,.08);
                }

                .quick-colors{
                    display:flex;
                    align-items:center;
                    gap:.35rem;
                    flex-wrap:wrap;
                }

                .quick-color{
                    width:1.85rem;
                    height:1.85rem;
                    border-radius:999px;
                    border:2px solid rgba(255,255,255,.72);
                    box-shadow:0 0 0 1px rgba(214,185,106,.16);
                    cursor:pointer;
                }

                .quick-color.is-active{
                    box-shadow:0 0 0 3px rgba(214,185,106,.15),0 0 0 1px rgba(214,185,106,.24);
                    transform:scale(1.06);
                }

                .color-code{
                    color:#D8C9BE;
                    font-size:.78rem;
                    font-weight:850;
                }

                .modal-error{
                    margin-top:.9rem;
                    border:1px solid rgba(248,113,113,.22);
                    background:rgba(127,29,29,.20);
                    color:#FECACA;
                    border-radius:.9rem;
                    padding:.85rem 1rem;
                    font-size:.83rem;
                    font-weight:850;
                }

                .form-warning{
                    margin-top:.9rem;
                    border:1px solid rgba(214,185,106,.16);
                    border-radius:.9rem;
                    background:rgba(214,185,106,.08);
                    color:#F5EFE9;
                    padding:.85rem 1rem;
                    font-size:.82rem;
                    font-weight:800;
                    line-height:1.45;
                }

                .form-warning strong{
                    display:block;
                    margin-bottom:.35rem;
                    color:#D6B96A;
                    font-size:.76rem;
                    text-transform:uppercase;
                    letter-spacing:.06em;
                }

                .form-warning ul{
                    margin:.25rem 0 0 1rem;
                    padding:0;
                }

                .form-actions{
                    display:flex;
                    justify-content:flex-end;
                    gap:.75rem;
                    margin-top:1rem;
                    padding-top:1rem;
                    border-top:1px solid rgba(214,185,106,.13);
                }

                .ghost-button{
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    gap:.4rem;
                    border:1px solid rgba(214,185,106,.16);
                    border-radius:.85rem;
                    background:rgba(255,255,255,.055);
                    color:#F5EFE9;
                    padding:.72rem 1rem;
                    font-weight:850;
                    cursor:pointer;
                    transition:transform .15s ease, background .15s ease;
                }

                .ghost-button:hover{
                    transform:translateY(-1px);
                    background:rgba(255,255,255,.08);
                }

                .calendar-save{
                    min-width:12rem;
                    justify-content:center;
                    background:linear-gradient(135deg,#D6B96A,#B8892F);
                    color:#24151A !important;
                    box-shadow:0 12px 24px rgba(214,185,106,.22);
                }

                .calendar-save:hover{
                    transform:translateY(-1px);
                    box-shadow:0 16px 30px rgba(214,185,106,.30);
                    filter:saturate(1.04);
                }

                .confirm-modal{
                    width:min(28rem,100%);
                    background:linear-gradient(180deg, rgba(31,17,25,.98), rgba(20,15,18,.98));
                    color:#F5EFE9;
                    border:1px solid rgba(214,185,106,.16);
                    border-radius:1.25rem;
                    box-shadow:0 30px 80px rgba(0,0,0,.42);
                    padding:1.1rem;
                }

                .confirm-modal h3{
                    margin:0;
                    font-size:1.05rem;
                    font-weight:950;
                }

                .confirm-modal p{
                    margin:.6rem 0 0;
                    color:#D8C9BE;
                    font-size:.88rem;
                    line-height:1.5;
                }

                .danger-button{
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    gap:.4rem;
                    border:0;
                    border-radius:.85rem;
                    background:linear-gradient(135deg,#DC2626,#991B1B);
                    color:white;
                    padding:.72rem 1rem;
                    font-weight:900;
                    cursor:pointer;
                }
            `}</style>

            <main className="calendar-page">
                <div className="calendar-shell">
                    <section className="calendar-hero">
                        <div className="calendar-title">
                            <div className="calendar-title-icon">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <div>
                                <h1>Calendario académico</h1>
                                <p>Consulta entregas, revisiones, defensas, reuniones y avisos académicos.</p>
                            </div>
                        </div>

                        {puedeGestionar && (
                            <button type="button" className="calendar-action" onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                Nueva actividad
                            </button>
                        )}
                    </section>

                    <section className="calendar-grid">
                        <div className="calendar-card">
                            <div className="calendar-toolbar">
                                <h2>{formatMonth(month)}</h2>
                                <div className="month-controls">
                                    <button type="button" className="icon-button" onClick={() => moveMonth(-1)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button type="button" className="icon-button" onClick={() => moveMonth(1)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="weekdays">
                                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                                    <div key={d} className="weekday">{d}</div>
                                ))}
                            </div>

                            <div className="month-grid">
                                {days.map((day, i) => {
                                    const isMuted = day.getMonth() !== month.getMonth();
                                    const isSelected = sameDay(day, selectedDay);
                                    const isToday = sameDay(day, new Date());
                                    const dailyActivities = actividadesOrdenadas.filter((a) => activityCoversDay(a, day));

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`day-cell ${isMuted ? 'is-muted' : ''} ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                                            style={dailyActivities.length > 0 ? buildDayStyle(dailyActivities) : undefined}
                                            onClick={() => setSelectedDay(day)}
                                        >
                                            <span className="day-number">{day.getDate()}</span>
                                            {dailyActivities.slice(0, 2).map((a) => (
                                                <div key={a.id} className="day-activity" style={{ borderColor: a.color }}>
                                                    {a.titulo}
                                                </div>
                                            ))}
                                            {dailyActivities.length > 2 && (
                                                <span className="day-more">+{dailyActivities.length - 2} más</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="side-panel">
                            <div className="calendar-card">
                                <h3 className="panel-title">
                                    <Clock className="h-5 w-5" />
                                    Actividades: {formatMonth(selectedDay).split(' ')[0]} {selectedDay.getDate()}
                                </h3>

                                <div className="activity-list">
                                    {actividadesDelDia.length > 0 ? (
                                        actividadesDelDia.map((a) => (
                                            <div key={a.id} className="activity-item" style={{ borderLeftColor: a.color }}>
                                                <div className="activity-top">
                                                    <strong>{a.titulo}</strong>
                                                    {puedeGestionar && (
                                                        <div className="activity-actions">
                                                            <button className="small-action" onClick={() => openEdit(a)}>
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button className="small-action danger" onClick={() => requestDelete(a)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="activity-meta">
                                                    <span><Badge color={a.color}>{tipoLabels[a.tipo] || a.tipo}</Badge></span>
                                                    <span>{formatDateTime(a.fecha_inicio)} {a.fecha_fin ? ` - ${formatDateTime(a.fecha_fin)}` : ''}</span>
                                                </div>
                                                {a.descripcion && <p className="activity-description">{a.descripcion}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-calendar">No hay actividades programadas para este día.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {formOpen && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <form onSubmit={submit}>
                            <div className="modal-header">
                                <h2>{editing ? 'Editar actividad' : 'Nueva actividad'}</h2>
                                <button type="button" className="icon-button" onClick={closeForm}>
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="form-grid">
                                <div className="field">
                                    <label>Título</label>
                                    <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Entrega Proyecto Final" required />
                                </div>

                                <div className="form-grid two">
                                    <div className="field">
                                        <label>Tipo</label>
                                        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                                            {Object.entries(tipoLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label>Color</label>
                                        <div className="color-picker-row">
                                            <input type="color" className="color-input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                                            <div className="quick-colors">
                                                {coloresRapidos.map((c) => (
                                                    <div key={c} className={`quick-color ${form.color === c ? 'is-active' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-grid two">
                                    <div className="field">
                                        <label>Inicio</label>
                                        <input type="datetime-local" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required />
                                    </div>
                                    <div className="field">
                                        <label>Fin (opcional)</label>
                                        <input type="datetime-local" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} />
                                    </div>
                                </div>

                                <div className="field">
                                    <label>Descripción</label>
                                    <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalles adicionales..." />
                                </div>
                            </div>

                            {uiError && <div className="modal-error">{uiError}</div>}
                            {formWarnings.length > 0 && (
                                <div className="form-warning">
                                    <strong>Atención</strong>
                                    <ul>{formWarnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="ghost-button" onClick={closeForm}>Cancelar</button>
                                <button type="submit" className="ghost-button calendar-save">
                                    <Save className="h-4 w-4" /> Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="modal-backdrop">
                    <div className="confirm-modal">
                        <h3>¿Eliminar actividad?</h3>
                        <p>Esta acción es irreversible. ¿Seguro que deseas eliminar "{deleteTarget.titulo}"?</p>
                        <div className="form-actions">
                            <button type="button" className="ghost-button" onClick={cancelDelete}>Cancelar</button>
                            <button type="button" className="danger-button" onClick={confirmDelete}>Eliminar definitivamente</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
