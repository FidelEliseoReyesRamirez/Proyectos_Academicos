import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import {
    Activity,
    ArrowLeft,
    BookOpenCheck,
    CalendarClock,
    CheckCircle2,
    Download,
    ExternalLink,
    FileCheck2,
    FileText,
    Link2,
    MessageSquareText,
    Send,
    Sparkles,
    UploadCloud,
    UserRound,
    UsersRound,
} from 'lucide-react';

type Usuario = {
    id: number;
    name: string;
    email: string;
    rol: string;
} | null;

type Archivo = {
    id: number;
    tipo_archivo: string;
    nombre_original: string;
    ruta_almacenamiento: string;
    mime_type?: string | null;
    tamano_bytes?: number | null;
    created_at: string;
    subido_por: Usuario;
};

type Observacion = {
    id: number;
    tipo: string;
    texto: string;
    estado: string;
    created_at: string;
    autor: Usuario;
    dirigido_a: Usuario;
};

type Revision = {
    id: number;
    rol_revision: string;
    resultado: string;
    comentario?: string | null;
    created_at: string;
    revisor: Usuario;
};

type Entrega = {
    id: number;
    titulo: string;
    descripcion?: string | null;
    numero_version: number;
    estado: string;
    enviado_at?: string | null;
    created_at: string;
    archivos: Archivo[];
    observaciones: Observacion[];
    revisiones: Revision[];
};

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    descripcion?: string | null;
    estado: string;
    modalidad: string;
    area_tematica?: string | null;
    created_at: string;
    updated_at: string;
    documento_trabajo?: {
        titulo?: string | null;
        url?: string | null;
        actualizado_at?: string | null;
        actualizado_por?: Usuario;
    };
    estudiante: Usuario;
    tutor: Usuario;
    revisores: Usuario[];
    entregas: Entrega[];
    archivos: Archivo[];
    observaciones: Observacion[];
    revisiones: Revision[];
    eventos: {
        id: number;
        tipo_evento: string;
        descripcion: string;
        created_at: string;
        actor: Usuario;
    }[];
};

type TimelineItem = {
    tipo: string;
    titulo: string;
    descripcion: string;
    comentario?: string | null;
    fecha: string;
    actor: Usuario;
};

type SeguimientoData = {
    rol: string;
    proyecto: Proyecto;
    linea_tiempo: TimelineItem[];
    permisos: {
        puede_subir_entrega: boolean;
        puede_observar: boolean;
        puede_revisar: boolean;
        puede_administrar: boolean;
    };
};

type Props = {
    seguimientoData: SeguimientoData;
};

const resultadoLabels: Record<string, string> = {
    observado: 'Observado',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    requiere_correcciones: 'Requiere correcciones',
};

function formatDate(value?: string | null): string {
    if (!value) return 'Sin registro';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin registro';

    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function label(value?: string | null): string {
    return value ? value.replaceAll('_', ' ') : 'Sin dato';
}

function formatBytes(value?: number | null): string {
    if (!value) return 'Sin tamaño';

    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;

    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function timelineIcon(tipo: string) {
    if (tipo.includes('entrega')) return <UploadCloud className="h-4 w-4" />;
    if (tipo.includes('revision')) return <FileCheck2 className="h-4 w-4" />;
    if (tipo.includes('observacion')) return <MessageSquareText className="h-4 w-4" />;
    if (tipo.includes('documento')) return <Link2 className="h-4 w-4" />;
    if (tipo.includes('estado')) return <Activity className="h-4 w-4" />;

    return <CalendarClock className="h-4 w-4" />;
}

export default function SeguimientoShow({ seguimientoData }: Props) {
    const { proyecto, linea_tiempo, permisos, rol } = seguimientoData;

    const documentoForm = useForm({
        documento_trabajo_titulo: proyecto.documento_trabajo?.titulo || '',
        documento_trabajo_url: proyecto.documento_trabajo?.url || '',
    });

    const entregaForm = useForm<{
        titulo: string;
        descripcion: string;
        archivo: File | null;
    }>({
        titulo: '',
        descripcion: '',
        archivo: null,
    });

    const revisionForm = useForm<{
        entrega_id: string;
        resultado: string;
        comentario: string;
        archivo: File | null;
    }>({
        entrega_id: proyecto.entregas[0]?.id ? String(proyecto.entregas[0].id) : '',
        resultado: 'requiere_correcciones',
        comentario: '',
        archivo: null,
    });

    const submitDocumentoTrabajo = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        documentoForm.patch(`/seguimiento/${proyecto.id}/documento-trabajo`, {
            preserveScroll: true,
        });
    };

    const submitEntrega = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        entregaForm.post(`/seguimiento/${proyecto.id}/entregas`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                entregaForm.reset('titulo', 'descripcion', 'archivo');

                const input = document.getElementById('archivo-entrega') as HTMLInputElement | null;

                if (input) {
                    input.value = '';
                }
            },
        });
    };

    const submitRevision = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        revisionForm.post(`/seguimiento/${proyecto.id}/archivo-revision`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                revisionForm.reset('comentario', 'archivo');

                const input = document.getElementById('archivo-revision') as HTMLInputElement | null;

                if (input) {
                    input.value = '';
                }
            },
        });
    };

    const archivosEstudiante = (entrega: Entrega) =>
        entrega.archivos.filter((archivo) => archivo.tipo_archivo === 'avance_estudiante');

    const archivosRevision = (entrega: Entrega) =>
        entrega.archivos.filter((archivo) => archivo.tipo_archivo === 'documento_revisado');

    const totalArchivos = proyecto.entregas.reduce((total, entrega) => total + entrega.archivos.length, 0);
    const totalRevisiones = proyecto.entregas.reduce((total, entrega) => total + entrega.revisiones.length, 0);
    const ultimaEntrega = proyecto.entregas[0];

    const accionPrincipal = permisos.puede_subir_entrega
        ? {
              titulo: 'Tu siguiente paso',
              texto: 'Sube el documento más reciente para que tu tutor pueda revisarlo.',
              detalle: 'Usa un título claro, por ejemplo: Capítulo I corregido o Avance metodológico.',
          }
        : permisos.puede_revisar
          ? {
                titulo: 'Tu siguiente paso',
                texto: 'Revisa la última entrega del estudiante y devuelve el archivo con correcciones.',
                detalle: 'Puedes subir el documento con comentarios, control de cambios o matriz de corrección.',
            }
          : {
                titulo: 'Estado del seguimiento',
                texto: 'Consulta el avance del proyecto, los documentos subidos y la línea de tiempo.',
                detalle: 'Toda acción importante queda registrada para trazabilidad académica.',
            };

    return (
        <>
            <Head title={`Seguimiento - ${proyecto.titulo}`} />

            <style>{`
                .seguimiento-page {
                    --surface: rgba(255,255,255,0.9);
                    --surface-strong: #ffffff;
                    --surface-soft: rgba(255,255,255,0.68);
                    --text: #24151a;
                    --muted: #6e6458;
                    --muted-2: #8a8074;
                    --border: rgba(107,18,48,0.13);
                    --border-strong: rgba(107,18,48,0.28);
                    --guindo: #6b1230;
                    --guindo-strong: #551026;
                    --guindo-soft: rgba(107,18,48,0.1);
                    --gold: #9a6c18;
                    --gold-soft: rgba(201,168,76,0.18);
                    --success: #2f7d46;
                    --success-soft: rgba(47,125,70,0.12);
                    --warning: #b86612;
                    --warning-soft: rgba(234,138,31,0.14);
                    --danger: #b91c1c;
                    --danger-soft: rgba(185,28,28,0.1);
                    --blue: #2563eb;
                    --blue-soft: rgba(37,99,235,0.1);
                    --shadow: 0 18px 42px rgba(107,18,48,0.09);
                    --shadow-soft: 0 10px 28px rgba(107,18,48,0.06);

                    min-height: 100vh;
                    color: var(--text);
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.2), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.12), transparent 36%),
                        linear-gradient(135deg, #faf8f5 0%, #f5f0ea 45%, #f6eedc 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .seguimiento-page {
                        --surface: rgba(53,27,40,0.92);
                        --surface-strong: #351b28;
                        --surface-soft: rgba(255,255,255,0.055);
                        --text: #f4eee9;
                        --muted: #d7c9c0;
                        --muted-2: #a9978d;
                        --border: rgba(214,185,106,0.18);
                        --border-strong: rgba(214,185,106,0.34);
                        --guindo: #e3a1b2;
                        --guindo-strong: #f0bcc9;
                        --guindo-soft: rgba(227,161,178,0.12);
                        --gold: #d6b96a;
                        --gold-soft: rgba(214,185,106,0.13);
                        --success: #6fc282;
                        --success-soft: rgba(111,194,130,0.12);
                        --warning: #f4b45e;
                        --warning-soft: rgba(244,180,94,0.13);
                        --danger: #f87171;
                        --danger-soft: rgba(248,113,113,0.12);
                        --blue: #93c5fd;
                        --blue-soft: rgba(147,197,253,0.12);
                        --shadow: 0 18px 45px rgba(18,7,12,0.34);
                        --shadow-soft: 0 12px 30px rgba(18,7,12,0.25);

                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.15), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.15), transparent 34%),
                            linear-gradient(135deg, #2b1620 0%, #24121a 46%, #351b28 100%);
                    }
                }

                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes buttonGlow {
                    0%, 100% {
                        box-shadow: 0 0 0 0 color-mix(in srgb, var(--gold) 0%, transparent);
                    }

                    50% {
                        box-shadow: 0 0 0 7px color-mix(in srgb, var(--gold) 18%, transparent);
                    }
                }

                @keyframes iconFloat {
                    0%, 100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-2px);
                    }
                }

                @keyframes shine {
                    from {
                        transform: translateX(-120%);
                    }

                    to {
                        transform: translateX(220%);
                    }
                }

                .shell {
                    display: grid;
                    gap: 1rem;
                    padding: 1rem;
                    animation: fadeUp 0.28s ease-out;
                }

                @media (min-width: 768px) {
                    .shell {
                        padding: 1.5rem;
                        gap: 1.15rem;
                    }
                }

                .hero,
                .guide-card,
                .panel,
                .document-panel,
                .action-panel,
                .timeline-card,
                .entrega-card {
                    border: 1px solid var(--border);
                    background: var(--surface);
                    box-shadow: var(--shadow-soft);
                    backdrop-filter: blur(10px);
                    transition:
                        transform 0.18s ease,
                        border-color 0.18s ease,
                        box-shadow 0.18s ease,
                        background 0.18s ease;
                }

                .guide-card:hover,
                .panel:hover,
                .document-panel:hover,
                .action-panel:hover,
                .timeline-card:hover,
                .entrega-card:hover {
                    transform: translateY(-1px);
                    border-color: var(--border-strong);
                    box-shadow: var(--shadow);
                }

                .hero {
                    position: relative;
                    overflow: hidden;
                    border-radius: 1.5rem;
                    padding: 1.15rem;
                    background:
                        linear-gradient(135deg, var(--surface-strong), var(--surface)),
                        radial-gradient(circle at 95% 12%, var(--gold-soft), transparent 34%);
                }

                .hero::after {
                    content: '';
                    position: absolute;
                    right: -3rem;
                    bottom: -4.5rem;
                    width: 13rem;
                    height: 13rem;
                    border-radius: 999px;
                    background: var(--gold-soft);
                    pointer-events: none;
                }

                .back-link {
                    position: relative;
                    z-index: 1;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: var(--guindo);
                    font-size: 0.82rem;
                    font-weight: 900;
                    text-decoration: none;
                }

                .back-link:hover {
                    text-decoration: underline;
                    text-underline-offset: 4px;
                }

                .eyebrow {
                    position: relative;
                    z-index: 1;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    margin-top: 1rem;
                    color: var(--gold);
                    font-size: 0.68rem;
                    font-weight: 950;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .title {
                    position: relative;
                    z-index: 1;
                    margin-top: 0.5rem;
                    color: var(--text);
                    font-size: clamp(1.65rem, 3vw, 2.45rem);
                    font-weight: 950;
                    line-height: 1.08;
                    letter-spacing: -0.04em;
                }

                .description {
                    position: relative;
                    z-index: 1;
                    margin-top: 0.62rem;
                    max-width: 58rem;
                    color: var(--muted);
                    font-size: 0.92rem;
                    line-height: 1.6;
                }

                .hero-summary {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    gap: 0.68rem;
                    margin-top: 1rem;
                }

                @media (min-width: 760px) {
                    .hero-summary {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }
                }

                .summary-card {
                    border: 1px solid var(--border);
                    border-radius: 1rem;
                    background: var(--surface-soft);
                    padding: 0.82rem;
                }

                .summary-card span {
                    color: var(--muted-2);
                    font-size: 0.64rem;
                    font-weight: 950;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .summary-card strong {
                    display: block;
                    margin-top: 0.28rem;
                    color: var(--text);
                    font-size: 0.88rem;
                    font-weight: 950;
                    overflow-wrap: anywhere;
                }

                .summary-card.is-state {
                    border-color: color-mix(in srgb, var(--warning) 28%, var(--border));
                    background: color-mix(in srgb, var(--warning-soft) 70%, var(--surface-soft));
                }

                .guide-card {
                    display: grid;
                    grid-template-columns: 2.6rem minmax(0, 1fr);
                    gap: 0.85rem;
                    align-items: start;
                    border-radius: 1.15rem;
                    padding: 1rem;
                    background:
                        linear-gradient(135deg, var(--guindo-soft), transparent 72%),
                        var(--surface);
                }

                .guide-icon {
                    display: flex;
                    width: 2.4rem;
                    height: 2.4rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.95rem;
                    background: var(--guindo-soft);
                    color: var(--guindo);
                }

                .guide-card strong {
                    display: block;
                    color: var(--text);
                    font-size: 0.98rem;
                    font-weight: 950;
                }

                .guide-card p {
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.84rem;
                    line-height: 1.5;
                }

                .workflow {
                    display: grid;
                    gap: 0.7rem;
                }

                @media (min-width: 900px) {
                    .workflow {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                .step-card {
                    border: 1px solid var(--border);
                    border-radius: 1rem;
                    background: var(--surface);
                    padding: 0.85rem;
                    box-shadow: var(--shadow-soft);
                }

                .step-number {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 1.65rem;
                    height: 1.65rem;
                    border-radius: 999px;
                    background: var(--gold-soft);
                    color: var(--gold);
                    font-size: 0.72rem;
                    font-weight: 950;
                }

                .step-card strong {
                    display: block;
                    margin-top: 0.55rem;
                    color: var(--text);
                    font-size: 0.86rem;
                    font-weight: 950;
                }

                .step-card p {
                    margin-top: 0.22rem;
                    color: var(--muted);
                    font-size: 0.76rem;
                    line-height: 1.45;
                }

                .top-grid {
                    display: grid;
                    gap: 1rem;
                }

                @media (min-width: 1120px) {
                    .top-grid {
                        grid-template-columns: minmax(0, 1fr) minmax(360px, 0.62fr);
                        align-items: start;
                    }
                }

                .main-grid {
                    display: grid;
                    gap: 1rem;
                }

                @media (min-width: 1120px) {
                    .main-grid {
                        grid-template-columns: minmax(0, 1fr) minmax(390px, 0.62fr);
                        align-items: start;
                    }
                }

                .panel,
                .document-panel,
                .action-panel {
                    border-radius: 1.15rem;
                    padding: 1rem;
                }

                .document-panel {
                    border-color: color-mix(in srgb, var(--gold) 30%, var(--border));
                }

                .action-panel.is-upload {
                    border-color: color-mix(in srgb, var(--guindo) 30%, var(--border));
                }

                .action-panel.is-review {
                    border-color: color-mix(in srgb, var(--success) 30%, var(--border));
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: var(--text);
                    font-size: 1.02rem;
                    font-weight: 950;
                    margin-bottom: 0.68rem;
                    letter-spacing: -0.02em;
                }

                .section-help {
                    margin-top: -0.35rem;
                    margin-bottom: 0.75rem;
                    color: var(--muted);
                    font-size: 0.8rem;
                    line-height: 1.48;
                }

                .document-box {
                    display: grid;
                    gap: 0.55rem;
                    border: 1px solid color-mix(in srgb, var(--gold) 28%, var(--border));
                    border-radius: 1rem;
                    background:
                        linear-gradient(135deg, var(--gold-soft), transparent 75%),
                        var(--surface-soft);
                    padding: 0.9rem;
                }

                .document-box strong {
                    color: var(--text);
                    font-size: 0.95rem;
                    font-weight: 950;
                    overflow-wrap: anywhere;
                }

                .document-box p,
                .document-box span {
                    color: var(--muted);
                    font-size: 0.78rem;
                    line-height: 1.5;
                }

                .external-link {
                    display: inline-flex;
                    width: fit-content;
                    align-items: center;
                    gap: 0.38rem;
                    border-radius: 0.85rem;
                    background: var(--guindo-soft);
                    color: var(--guindo);
                    padding: 0.52rem 0.72rem;
                    font-size: 0.78rem;
                    font-weight: 950;
                    text-decoration: none;
                    transition: transform 0.18s ease, background 0.18s ease;
                }

                .external-link:hover {
                    transform: translateY(-1px);
                    background: color-mix(in srgb, var(--guindo) 17%, transparent);
                }

                .form {
                    display: grid;
                    gap: 0.74rem;
                    margin-top: 0.85rem;
                }

                .form-grid {
                    display: grid;
                    gap: 0.74rem;
                }

                @media (min-width: 860px) {
                    .form-grid {
                        grid-template-columns: minmax(0, 1fr) minmax(260px, 0.65fr);
                    }
                }

                .field {
                    display: grid;
                    gap: 0.34rem;
                }

                .field label {
                    color: var(--muted-2);
                    font-size: 0.66rem;
                    font-weight: 950;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .field input,
                .field textarea,
                .field select {
                    width: 100%;
                    border: 1px solid var(--border);
                    border-radius: 0.85rem;
                    background: var(--surface-soft);
                    color: var(--text);
                    padding: 0.66rem 0.76rem;
                    font-size: 0.88rem;
                    outline: none;
                    transition:
                        border-color 0.16s ease,
                        box-shadow 0.16s ease,
                        background 0.16s ease,
                        transform 0.16s ease;
                }

                .field textarea {
                    min-height: 5.4rem;
                    resize: vertical;
                }

                .field input:focus,
                .field textarea:focus,
                .field select:focus {
                    border-color: var(--border-strong);
                    background: var(--surface-strong);
                    box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold) 20%, transparent);
                }

                .field input[type="file"] {
                    cursor: pointer;
                }

                .field input[type="file"]::file-selector-button {
                    margin-right: 0.65rem;
                    border: 0;
                    border-radius: 0.72rem;
                    background: var(--guindo-soft);
                    color: var(--guindo);
                    padding: 0.45rem 0.65rem;
                    font-weight: 900;
                    cursor: pointer;
                    transition: transform 0.16s ease, background 0.16s ease;
                }

                .field input[type="file"]::file-selector-button:hover {
                    transform: translateY(-1px);
                    background: color-mix(in srgb, var(--guindo) 17%, transparent);
                }

                .error {
                    color: var(--danger);
                    font-size: 0.76rem;
                    font-weight: 850;
                }

                .help-text {
                    color: var(--muted);
                    font-size: 0.75rem;
                    line-height: 1.42;
                }

                .button-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 0.85rem;
                }

                .submit-btn,
                .status-chip {
                    position: relative;
                    isolation: isolate;
                    overflow: hidden;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.42rem;
                    border: 1px solid var(--border);
                    border-radius: 0.9rem;
                    background: var(--guindo-soft);
                    color: var(--guindo);
                    padding: 0.62rem 0.82rem;
                    font-size: 0.8rem;
                    font-weight: 950;
                    cursor: pointer;
                    transition:
                        transform 0.18s ease,
                        border-color 0.18s ease,
                        background 0.18s ease,
                        box-shadow 0.18s ease,
                        opacity 0.18s ease;
                }

                .submit-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        color-mix(in srgb, #ffffff 38%, transparent),
                        transparent
                    );
                    transform: translateX(-120%);
                }

                .submit-btn svg {
                    transition: transform 0.18s ease;
                }

                .submit-btn:hover {
                    transform: translateY(-2px);
                    border-color: var(--border-strong);
                    box-shadow: var(--shadow);
                }

                .submit-btn:hover::before {
                    animation: shine 0.9s ease;
                }

                .submit-btn:hover svg {
                    animation: iconFloat 0.7s ease-in-out infinite;
                }

                .submit-btn:active {
                    transform: translateY(0) scale(0.98);
                }

                .submit-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .submit-btn.is-primary {
                    background: linear-gradient(135deg, var(--guindo), var(--guindo-strong));
                    color: #ffffff;
                    animation: buttonGlow 2.8s ease-in-out infinite;
                }

                .submit-btn.is-secondary {
                    background: var(--gold-soft);
                    color: var(--gold);
                }

                .submit-btn.is-success {
                    background: var(--success-soft);
                    color: var(--success);
                }

                .status-chip {
                    cursor: default;
                    background: var(--surface-soft);
                }

                .status-chip:nth-child(1) {
                    color: var(--guindo);
                    background: var(--guindo-soft);
                }

                .status-chip:nth-child(2) {
                    color: var(--warning);
                    background: var(--warning-soft);
                }

                .status-chip:nth-child(3) {
                    color: var(--success);
                    background: var(--success-soft);
                }

                .timeline-graph {
                    position: relative;
                    display: grid;
                    gap: 0.85rem;
                    max-height: 38rem;
                    overflow: auto;
                    padding-right: 0.2rem;
                }

                .timeline-graph::before {
                    content: '';
                    position: absolute;
                    left: 1.05rem;
                    top: 0.75rem;
                    bottom: 0.75rem;
                    width: 2px;
                    background: linear-gradient(
                        to bottom,
                        var(--gold),
                        color-mix(in srgb, var(--guindo) 55%, var(--gold)),
                        transparent
                    );
                }

                .timeline-node {
                    position: relative;
                    display: grid;
                    grid-template-columns: 2.2rem minmax(0, 1fr);
                    gap: 0.68rem;
                    align-items: flex-start;
                    animation: fadeUp 0.24s ease-out;
                }

                .timeline-dot {
                    z-index: 1;
                    display: flex;
                    width: 2.15rem;
                    height: 2.15rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 999px;
                    border: 1px solid var(--border-strong);
                    background: var(--surface-strong);
                    color: var(--guindo);
                }

                .timeline-card,
                .entrega-card {
                    border-radius: 1rem;
                    padding: 0.82rem;
                    background: linear-gradient(135deg, var(--surface), var(--surface-soft));
                }

                .timeline-card strong,
                .entrega-card strong {
                    color: var(--text);
                    font-size: 0.88rem;
                    font-weight: 950;
                    line-height: 1.32;
                }

                .timeline-card p,
                .timeline-card span,
                .entrega-card p,
                .entrega-card span {
                    display: block;
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.76rem;
                    line-height: 1.46;
                }

                .entrega-list {
                    display: grid;
                    gap: 0.85rem;
                }

                .badge-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.42rem;
                    margin-top: 0.62rem;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    border-radius: 999px;
                    background: var(--surface-soft);
                    color: var(--muted);
                    padding: 0.3rem 0.52rem;
                    font-size: 0.71rem;
                    font-weight: 850;
                }

                .badge:nth-child(1) {
                    color: var(--guindo);
                    background: var(--guindo-soft);
                }

                .badge:nth-child(2) {
                    color: var(--warning);
                    background: var(--warning-soft);
                }

                .badge:nth-child(3) {
                    color: var(--success);
                    background: var(--success-soft);
                }

                .file-section {
                    display: grid;
                    gap: 0.42rem;
                    margin-top: 0.78rem;
                    padding-top: 0.72rem;
                    border-top: 1px dashed var(--border);
                }

                .file-section-title {
                    color: var(--muted-2);
                    font-size: 0.66rem;
                    font-weight: 950;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .file-chip {
                    display: grid;
                    grid-template-columns: 1.75rem minmax(0, 1fr);
                    gap: 0.48rem;
                    border-radius: 0.85rem;
                    border: 1px solid var(--border);
                    background: var(--surface-soft);
                    color: var(--muted);
                    padding: 0.56rem 0.62rem;
                    font-size: 0.75rem;
                    line-height: 1.38;
                    transition: transform 0.16s ease, border-color 0.16s ease;
                }

                .file-chip:hover {
                    transform: translateY(-1px);
                    border-color: var(--border-strong);
                }

                .file-chip.is-review {
                    border-color: color-mix(in srgb, var(--success) 34%, var(--border));
                    background: var(--success-soft);
                }

                .file-chip strong {
                    display: block;
                    color: var(--text);
                    font-size: 0.78rem;
                    overflow-wrap: anywhere;
                }

                .file-chip span {
                    color: var(--muted);
                }

                .file-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.42rem;
                    margin-top: 0.45rem;
                }

                .download-link {
                    display: inline-flex;
                    width: fit-content;
                    align-items: center;
                    gap: 0.32rem;
                    border: 1px solid var(--border);
                    border-radius: 0.72rem;
                    background: var(--guindo-soft);
                    color: var(--guindo);
                    padding: 0.36rem 0.52rem;
                    font-size: 0.72rem;
                    font-weight: 950;
                    text-decoration: none;
                    transition:
                        transform 0.16s ease,
                        background 0.16s ease,
                        border-color 0.16s ease,
                        box-shadow 0.16s ease;
                }

                .download-link:hover {
                    transform: translateY(-1px);
                    border-color: var(--border-strong);
                    background: color-mix(in srgb, var(--guindo) 17%, transparent);
                    box-shadow: var(--shadow-soft);
                }

                .download-link.is-review {
                    background: var(--success-soft);
                    color: var(--success);
                }

                @media (prefers-reduced-motion: reduce) {
                    .shell,
                    .timeline-node,
                    .submit-btn,
                    .external-link,
                    .file-chip,
                    .hero,
                    .guide-card,
                    .panel,
                    .document-panel,
                    .action-panel,
                    .timeline-card,
                    .entrega-card {
                        animation: none;
                        transition: none;
                    }

                    .submit-btn::before {
                        display: none;
                    }
                }
            `}</style>

            <div className="seguimiento-page">
                <div className="shell">
                    <section className="hero">
                        <Link href="/seguimiento" className="back-link">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al seguimiento
                        </Link>

                        <div className="eyebrow">
                            <BookOpenCheck className="h-4 w-4" />
                            Seguimiento del proyecto
                        </div>

                        <h1 className="title">{proyecto.titulo}</h1>

                        <p className="description">
                            Aquí puedes revisar el documento de trabajo, subir avances, recibir correcciones y ver el historial del proyecto.
                        </p>

                        <div className="hero-summary">
                            <div className="summary-card">
                                <span>Código</span>
                                <strong>{proyecto.codigo}</strong>
                            </div>

                            <div className="summary-card is-state">
                                <span>Estado actual</span>
                                <strong>{label(proyecto.estado)}</strong>
                            </div>

                            <div className="summary-card">
                                <span>Estudiante</span>
                                <strong>{proyecto.estudiante?.name || 'Sin estudiante'}</strong>
                            </div>

                            <div className="summary-card">
                                <span>Tutor</span>
                                <strong>{proyecto.tutor?.name || 'Sin tutor'}</strong>
                            </div>
                        </div>

                        <div className="button-row">
                            {permisos.puede_subir_entrega && (
                                <span className="status-chip">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Puedes subir avances
                                </span>
                            )}

                            {permisos.puede_observar && (
                                <span className="status-chip">
                                    <MessageSquareText className="h-4 w-4" />
                                    Puedes registrar observaciones
                                </span>
                            )}

                            {permisos.puede_revisar && (
                                <span className="status-chip">
                                    <FileCheck2 className="h-4 w-4" />
                                    Puedes devolver revisiones
                                </span>
                            )}
                        </div>
                    </section>

                    <section className="guide-card">
                        <div className="guide-icon">
                            <Sparkles className="h-5 w-5" />
                        </div>

                        <div>
                            <strong>{accionPrincipal.titulo}</strong>
                            <p>{accionPrincipal.texto}</p>
                            <p>{accionPrincipal.detalle}</p>
                        </div>
                    </section>

                    <section className="workflow">
                        <article className="step-card">
                            <span className="step-number">1</span>
                            <strong>Revisar documento activo</strong>
                            <p>Confirma cuál es el documento vigente antes de subir o revisar archivos.</p>
                        </article>

                        <article className="step-card">
                            <span className="step-number">2</span>
                            <strong>Subir o devolver archivo</strong>
                            <p>El estudiante sube avances. El tutor o revisor devuelve el documento corregido.</p>
                        </article>

                        <article className="step-card">
                            <span className="step-number">3</span>
                            <strong>Consultar historial</strong>
                            <p>La línea de tiempo muestra entregas, revisiones y cambios importantes.</p>
                        </article>
                    </section>

                    <section className="top-grid">
                        <article className="document-panel">
                            <h2 className="section-title">
                                <Link2 className="h-5 w-5" />
                                Documento de trabajo activo
                            </h2>

                            <p className="section-help">
                                Este es el enlace principal del documento que se está trabajando. Ayuda a evitar confusión entre varias copias.
                            </p>

                            <div className="document-box">
                                <strong>
                                    {proyecto.documento_trabajo?.titulo || 'Documento de trabajo no definido'}
                                </strong>

                                {proyecto.documento_trabajo?.url ? (
                                    <a
                                        className="external-link"
                                        href={proyecto.documento_trabajo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Abrir documento activo
                                    </a>
                                ) : (
                                    <span>No hay enlace registrado todavía.</span>
                                )}

                                {proyecto.documento_trabajo?.actualizado_at && (
                                    <span>
                                        Actualizado: {formatDate(proyecto.documento_trabajo.actualizado_at)}
                                        {proyecto.documento_trabajo.actualizado_por?.name
                                            ? ` por ${proyecto.documento_trabajo.actualizado_por.name}`
                                            : ''}
                                    </span>
                                )}
                            </div>

                            <form className="form" onSubmit={submitDocumentoTrabajo}>
                                <div className="form-grid">
                                    <div className="field">
                                        <label htmlFor="documento_trabajo_titulo">Nombre visible del documento</label>
                                        <input
                                            id="documento_trabajo_titulo"
                                            type="text"
                                            value={documentoForm.data.documento_trabajo_titulo}
                                            onChange={(event) => documentoForm.setData('documento_trabajo_titulo', event.target.value)}
                                            placeholder="Ejemplo: Documento principal de tesis"
                                        />
                                        {documentoForm.errors.documento_trabajo_titulo && (
                                            <div className="error">{documentoForm.errors.documento_trabajo_titulo}</div>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="documento_trabajo_url">Enlace del documento</label>
                                        <input
                                            id="documento_trabajo_url"
                                            type="url"
                                            value={documentoForm.data.documento_trabajo_url}
                                            onChange={(event) => documentoForm.setData('documento_trabajo_url', event.target.value)}
                                            placeholder="https://..."
                                        />
                                        {documentoForm.errors.documento_trabajo_url && (
                                            <div className="error">{documentoForm.errors.documento_trabajo_url}</div>
                                        )}
                                    </div>
                                </div>

                                <button className="submit-btn is-secondary" type="submit" disabled={documentoForm.processing}>
                                    <Send className="h-4 w-4" />
                                    {documentoForm.processing ? 'Guardando enlace...' : 'Guardar enlace del documento'}
                                </button>
                            </form>
                        </article>

                        {permisos.puede_subir_entrega && (
                            <article className="action-panel is-upload">
                                <h2 className="section-title">
                                    <UploadCloud className="h-5 w-5" />
                                    Subir nuevo avance
                                </h2>

                                <p className="section-help">
                                    Usa esta opción para enviar tu documento al tutor. El sistema notificará automáticamente al tutor y registrará el evento.
                                </p>

                                <form className="form" onSubmit={submitEntrega}>
                                    <div className="field">
                                        <label htmlFor="titulo">¿Qué estás entregando?</label>
                                        <input
                                            id="titulo"
                                            type="text"
                                            value={entregaForm.data.titulo}
                                            onChange={(event) => entregaForm.setData('titulo', event.target.value)}
                                            placeholder="Ejemplo: Capítulo I corregido"
                                        />
                                        {entregaForm.errors.titulo && <div className="error">{entregaForm.errors.titulo}</div>}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="archivo-entrega">Selecciona tu archivo</label>
                                        <input
                                            id="archivo-entrega"
                                            type="file"
                                            accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={(event) => entregaForm.setData('archivo', event.target.files?.[0] || null)}
                                        />
                                        {entregaForm.errors.archivo && <div className="error">{entregaForm.errors.archivo}</div>}
                                        <div className="help-text">Formatos permitidos: DOC, DOCX y PDF. Tamaño máximo: 200 MB.</div>
                                    </div>

                                    <div className="field">
                                        <label htmlFor="descripcion">Comentario para el tutor</label>
                                        <textarea
                                            id="descripcion"
                                            value={entregaForm.data.descripcion}
                                            onChange={(event) => entregaForm.setData('descripcion', event.target.value)}
                                            placeholder="Ejemplo: Subo el capítulo corregido según las observaciones anteriores."
                                        />
                                        {entregaForm.errors.descripcion && <div className="error">{entregaForm.errors.descripcion}</div>}
                                    </div>

                                    <button className="submit-btn is-primary" type="submit" disabled={entregaForm.processing}>
                                        <UploadCloud className="h-4 w-4" />
                                        {entregaForm.processing ? 'Subiendo y notificando...' : 'Subir avance y notificar tutor'}
                                    </button>
                                </form>
                            </article>
                        )}

                        {permisos.puede_revisar && proyecto.entregas.length > 0 && (
                            <article className="action-panel is-review">
                                <h2 className="section-title">
                                    <FileCheck2 className="h-5 w-5" />
                                    Devolver archivo revisado
                                </h2>

                                <p className="section-help">
                                    Sube el documento revisado con comentarios o control de cambios. El estudiante podrá verlo como devolución formal.
                                </p>

                                <form className="form" onSubmit={submitRevision}>
                                    <div className="field">
                                        <label htmlFor="entrega_id">Entrega que estás revisando</label>
                                        <select
                                            id="entrega_id"
                                            value={revisionForm.data.entrega_id}
                                            onChange={(event) => revisionForm.setData('entrega_id', event.target.value)}
                                        >
                                            {proyecto.entregas.map((entrega) => (
                                                <option key={entrega.id} value={String(entrega.id)}>
                                                    Versión {entrega.numero_version}: {entrega.titulo}
                                                </option>
                                            ))}
                                        </select>
                                        {revisionForm.errors.entrega_id && <div className="error">{revisionForm.errors.entrega_id}</div>}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="resultado">Resultado de la revisión</label>
                                        <select
                                            id="resultado"
                                            value={revisionForm.data.resultado}
                                            onChange={(event) => revisionForm.setData('resultado', event.target.value)}
                                        >
                                            {Object.entries(resultadoLabels).map(([value, text]) => (
                                                <option key={value} value={value}>{text}</option>
                                            ))}
                                        </select>
                                        {revisionForm.errors.resultado && <div className="error">{revisionForm.errors.resultado}</div>}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="archivo-revision">Archivo revisado</label>
                                        <input
                                            id="archivo-revision"
                                            type="file"
                                            accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={(event) => revisionForm.setData('archivo', event.target.files?.[0] || null)}
                                        />
                                        {revisionForm.errors.archivo && <div className="error">{revisionForm.errors.archivo}</div>}
                                        <div className="help-text">Sube el archivo con comentarios, cambios o matriz de corrección.</div>
                                    </div>

                                    <div className="field">
                                        <label htmlFor="comentario_revision">Resumen para el estudiante</label>
                                        <textarea
                                            id="comentario_revision"
                                            value={revisionForm.data.comentario}
                                            onChange={(event) => revisionForm.setData('comentario', event.target.value)}
                                            placeholder="Ejemplo: Revisé la estructura y dejé comentarios en el documento."
                                        />
                                        {revisionForm.errors.comentario && <div className="error">{revisionForm.errors.comentario}</div>}
                                    </div>

                                    <button className="submit-btn is-success" type="submit" disabled={revisionForm.processing}>
                                        <FileCheck2 className="h-4 w-4" />
                                        {revisionForm.processing ? 'Devolviendo revisión...' : 'Devolver archivo revisado'}
                                    </button>
                                </form>
                            </article>
                        )}
                    </section>

                    <section className="main-grid">
                        <div className="panel">
                            <h2 className="section-title">
                                <FileText className="h-5 w-5" />
                                Entregas y archivos
                            </h2>

                            <p className="section-help">
                                Aquí se muestran los avances enviados por el estudiante y los archivos corregidos devueltos por el tutor o revisores.
                            </p>

                            {proyecto.entregas.length === 0 ? (
                                <p className="description">Todavía no existen entregas registradas.</p>
                            ) : (
                                <div className="entrega-list">
                                    {proyecto.entregas.map((entrega) => (
                                        <article key={entrega.id} className="entrega-card">
                                            <strong>Versión {entrega.numero_version}: {entrega.titulo}</strong>
                                            <p>{entrega.descripcion || 'Sin comentario del estudiante.'}</p>
                                            <span>Estado: {label(entrega.estado)} · {formatDate(entrega.created_at)}</span>

                                            <div className="badge-row">
                                                <span className="badge"><FileText className="h-3.5 w-3.5" /> {entrega.archivos.length} archivos</span>
                                                <span className="badge"><MessageSquareText className="h-3.5 w-3.5" /> {entrega.observaciones.length} observaciones</span>
                                                <span className="badge"><Activity className="h-3.5 w-3.5" /> {entrega.revisiones.length} revisiones</span>
                                            </div>

                                            {archivosEstudiante(entrega).length > 0 && (
                                                <div className="file-section">
                                                    <div className="file-section-title">Archivo enviado por el estudiante</div>

                                                    {archivosEstudiante(entrega).map((archivo) => (
                                                        <div key={archivo.id} className="file-chip">
                                                            <FileText className="h-4 w-4" />
                                                            <div>
                                                                <strong>{archivo.nombre_original}</strong>
                                                                <span>
                                                                    {label(archivo.tipo_archivo)} · {formatBytes(archivo.tamano_bytes)} · {formatDate(archivo.created_at)}
                                                                </span>

                                                                <div className="file-actions">
                                                                    <a
                                                                        className="download-link"
                                                                        href={`/seguimiento/${proyecto.id}/archivos/${archivo.id}/descargar`}
                                                                    >
                                                                        <Download className="h-3.5 w-3.5" />
                                                                        Descargar
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {archivosRevision(entrega).length > 0 && (
                                                <div className="file-section">
                                                    <div className="file-section-title">Archivos revisados devueltos</div>

                                                    {archivosRevision(entrega).map((archivo) => (
                                                        <div key={archivo.id} className="file-chip is-review">
                                                            <FileCheck2 className="h-4 w-4" />
                                                            <div>
                                                                <strong>{archivo.nombre_original}</strong>
                                                                <span>
                                                                    Devuelto por {archivo.subido_por?.name || 'usuario no identificado'} · {formatBytes(archivo.tamano_bytes)} · {formatDate(archivo.created_at)}
                                                                </span>

                                                                <div className="file-actions">
                                                                    <a
                                                                        className="download-link is-review"
                                                                        href={`/seguimiento/${proyecto.id}/archivos/${archivo.id}/descargar`}
                                                                    >
                                                                        <Download className="h-3.5 w-3.5" />
                                                                        Descargar revisión
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {entrega.revisiones.length > 0 && (
                                                <div className="file-section">
                                                    <div className="file-section-title">Resultados de revisión</div>

                                                    {entrega.revisiones.map((revision) => (
                                                        <div key={revision.id} className="file-chip is-review">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <div>
                                                                <strong>{resultadoLabels[revision.resultado] || label(revision.resultado)}</strong>
                                                                <span>
                                                                    {label(revision.rol_revision)}: {revision.revisor?.name || 'usuario no identificado'} · {formatDate(revision.created_at)}
                                                                </span>
                                                                {revision.comentario && <span>{revision.comentario}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>

                        <aside className="panel">
                            <h2 className="section-title">
                                <CalendarClock className="h-5 w-5" />
                                Línea de tiempo
                            </h2>

                            <p className="section-help">
                                Historial visual de acciones importantes: entregas, documentos activos, revisiones y cambios de estado.
                            </p>

                            {linea_tiempo.length === 0 ? (
                                <p className="description">Todavía no existen eventos de seguimiento.</p>
                            ) : (
                                <div className="timeline-graph">
                                    {linea_tiempo.map((evento, index) => (
                                        <div key={`${evento.tipo}-${index}`} className="timeline-node">
                                            <div className="timeline-dot">
                                                {timelineIcon(evento.tipo)}
                                            </div>

                                            <article className="timeline-card">
                                                <strong>{evento.titulo}</strong>
                                                <p>{evento.descripcion}</p>
                                                <span>{formatDate(evento.fecha)} · {evento.actor?.name || 'Usuario no identificado'}</span>
                                                {evento.comentario && <p>{evento.comentario}</p>}
                                            </article>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>
                    </section>

                    <section className="panel">
                        <h2 className="section-title">
                            <UsersRound className="h-5 w-5" />
                            Participantes
                        </h2>

                        <p className="section-help">
                            Personas vinculadas al seguimiento académico del proyecto.
                        </p>

                        <div className="badge-row">
                            <span className="badge"><UserRound className="h-3.5 w-3.5" /> Estudiante: {proyecto.estudiante?.name || 'Sin estudiante'}</span>
                            <span className="badge"><UserRound className="h-3.5 w-3.5" /> Tutor: {proyecto.tutor?.name || 'Sin tutor'}</span>
                            {proyecto.revisores.map((revisor) => (
                                <span key={revisor?.id} className="badge"><UserRound className="h-3.5 w-3.5" /> Revisor: {revisor?.name}</span>
                            ))}
                            <span className="badge"><Activity className="h-3.5 w-3.5" /> Entregas: {proyecto.entregas.length}</span>
                            <span className="badge"><FileText className="h-3.5 w-3.5" /> Archivos: {totalArchivos}</span>
                            <span className="badge"><FileCheck2 className="h-3.5 w-3.5" /> Revisiones: {totalRevisiones}</span>
                            {ultimaEntrega && (
                                <span className="badge"><CalendarClock className="h-3.5 w-3.5" /> Última entrega: {formatDate(ultimaEntrega.created_at)}</span>
                            )}
                            <span className="badge"><BookOpenCheck className="h-3.5 w-3.5" /> Rol actual: {label(rol)}</span>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

SeguimientoShow.layout = {
    breadcrumbs: [
        {
            title: 'Seguimiento',
            href: '/seguimiento',
        },
    ],
};
