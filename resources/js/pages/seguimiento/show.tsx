import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowLeft, BookOpenCheck, CalendarClock, CheckCircle2, ChevronDown,
    Download, ExternalLink, FileCheck2, FileText, Link2, MessageSquareText,
    UploadCloud, UserRound, X, AlertTriangle, Pencil, Plus, Activity,
    FileWarning, Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Tipos
   ───────────────────────────────────────────────────────────── */
type Usuario = { id: number; name: string; email: string; rol: string; } | null;

type Archivo = {
    id: number;
    tipo_archivo: string;
    estado?: string;
    reemplazado_por_archivo_id?: number | null;
    reemplazado_at?: string | null;
    motivo_reemplazo?: string | null;
    nombre_original: string;
    ruta_almacenamiento: string;
    mime_type?: string | null;
    tamano_bytes?: number | null;
    created_at: string;
    subido_por: Usuario;
};

type Observacion = {
    id: number; tipo: string; texto: string; estado: string;
    created_at: string; autor: Usuario; dirigido_a: Usuario;
};

type Revision = {
    id: number; rol_revision: string; resultado: string;
    comentario?: string | null; created_at: string; revisor: Usuario;
};

type ReunionTutoria = {
    id: number;
    fecha_reunion: string;
    modalidad: 'presencial' | 'virtual' | string;
    temas_tratados: string;
    acuerdos: string;
    created_at: string;
    tutor: {
        name?: string | null;
        email?: string | null;
    } | null;
};

type Entrega = {
    id: number; titulo: string; descripcion?: string | null;
    numero_version: number; estado: string;
    enviado_at?: string | null; created_at: string;
    archivos: Archivo[]; observaciones: Observacion[]; revisiones: Revision[];
};

type Proyecto = {
    id: number; codigo: string; titulo: string; descripcion?: string | null;
    estado: string; modalidad: string; area_tematica?: string | null;
    created_at: string; updated_at: string;
    documento_trabajo?: {
        titulo?: string | null; url?: string | null;
        actualizado_at?: string | null; actualizado_por?: Usuario;
    };
    estudiante: Usuario; tutor: Usuario; revisores: Usuario[];
    entregas: Entrega[]; archivos: Archivo[];
    observaciones: Observacion[]; revisiones: Revision[];
    reuniones_tutoria?: ReunionTutoria[];
    eventos: { id: number; tipo_evento: string; descripcion: string; created_at: string; actor: Usuario; }[];
};

type TimelineItem = {
    tipo: string; titulo: string; descripcion: string;
    comentario?: string | null; fecha: string; actor: Usuario;
};

type SeguimientoData = {
    rol: string;
    proyecto: Proyecto;
    linea_tiempo: TimelineItem[];
    permisos: {
        puede_subir_entrega: boolean;
        puede_observar: boolean;
        puede_revisar: boolean;
        puede_accion_tutor: boolean;
        puede_devolver_revision: boolean;
        puede_administrar: boolean;
    };
};

type Props = { seguimientoData: SeguimientoData; };

/* ─────────────────────────────────────────────────────────────
   Catálogos
   ───────────────────────────────────────────────────────────── */
const resultadoLabels: Record<string, string> = {
    aprobado: 'Aprobado',
    requiere_correcciones: 'Requiere correcciones',
    rechazado: 'Rechazado',
};

const RESULTADO_COLOR: Record<string, string> = {
    observado:             '#EA8A1F',
    aprobado:              '#15803D',
    rechazado:             '#B91C1C',
    requiere_correcciones: '#9A6C18',
};

const ESTADO_COLOR: Record<string, string> = {
    en_revision: '#C9A84C', aprobado: '#3F9D58', rechazado: '#B91C1C',
    en_desarrollo: '#3B82F6', observado: '#EA8A1F', concluido: '#6E6458',
    pendiente: '#9A8B7B', enviada: '#3B82F6', revisada: '#15803D',
};

const MAX_FILE_MB = 200;
const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx';

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */
function formatDate(value?: string | null): string {
    if (!value) return 'Sin registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin registro';
    return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(date);
}

function formatRelative(value?: string | null): string {
    if (!value) return 'Sin registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin registro';
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)         return 'hace un momento';
    if (diff < 3600)       return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400)      return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 86400 * 7)  return `hace ${Math.floor(diff / 86400)} días`;
    return formatDate(value);
}

function label(value?: string | null): string {
    return value ? value.replaceAll('_', ' ') : 'Sin dato';
}

function formatBytes(value?: number | null): string {
    if (!value) return '— KB';
    if (value < 1024)         return `${value} B`;
    if (value < 1024 * 1024)  return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function timelineIcon(tipo: string) {
    if (tipo.includes('entrega'))     return <UploadCloud className="h-3.5 w-3.5" />;
    if (tipo.includes('revision'))    return <FileCheck2 className="h-3.5 w-3.5" />;
    if (tipo.includes('observacion')) return <MessageSquareText className="h-3.5 w-3.5" />;
    if (tipo.includes('documento'))   return <Link2 className="h-3.5 w-3.5" />;
    if (tipo.includes('estado'))      return <Activity className="h-3.5 w-3.5" />;
    return <CalendarClock className="h-3.5 w-3.5" />;
}

/* ─────────────────────────────────────────────────────────────
   FormDrawer — modal grande para formularios
   ───────────────────────────────────────────────────────────── */
function FormDrawer({
    open, title, subtitle, icon, onClose, children, processing,
}: {
    open: boolean;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    processing?: boolean;
}) {
    useEffect(() => {
        if (!open) return;
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !processing) onClose();
        };
        document.addEventListener('keydown', onEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onEsc);
            document.body.style.overflow = '';
        };
    }, [open, processing, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="drawer-backdrop" role="dialog" aria-modal="true" onClick={() => !processing && onClose()}>
            <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                    {icon && <div className="drawer-icon">{icon}</div>}
                    <div className="flex-1 min-w-0">
                        <h2>{title}</h2>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        className="drawer-close"
                        onClick={onClose}
                        disabled={processing}
                        title="Cerrar (Esc)"
                        aria-label="Cerrar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="drawer-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* ─────────────────────────────────────────────────────────────
   Componente principal
   ───────────────────────────────────────────────────────────── */
export default function SeguimientoShow({ seguimientoData }: Props) {
    const { proyecto, linea_tiempo, permisos } = seguimientoData;

    /* Heurística 1 — barra de progreso */
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const offStart  = router.on('start',  () => setLoading(true));
        const offFinish = router.on('finish', () => setLoading(false));
        return () => { offStart(); offFinish(); };
    }, []);

    /* Modales */
    const [showEntrega, setShowEntrega]   = useState(false);
    const [showRevision, setShowRevision] = useState(false);
    const [showTutorDecision, setShowTutorDecision] = useState(false);
    const [showDoc, setShowDoc]           = useState(false);
    const [showReunion, setShowReunion]   = useState(false);

    /* Forms */
    const documentoForm = useForm({
        documento_trabajo_titulo: proyecto.documento_trabajo?.titulo || '',
        documento_trabajo_url:    proyecto.documento_trabajo?.url || '',
    });

    const reunionForm = useForm<{
        fecha_reunion: string;
        modalidad: 'presencial' | 'virtual';
        temas_tratados: string;
        acuerdos: string;
    }>({
        fecha_reunion: '',
        modalidad: 'presencial',
        temas_tratados: '',
        acuerdos: '',
    });

    const entregaForm = useForm<{ titulo: string; descripcion: string; archivo: File | null; }>({
        titulo: '', descripcion: '', archivo: null,
    });

    const revisionForm = useForm<{ entrega_id: string; resultado: string; comentario: string; archivo: File | null; }>({
        entrega_id: proyecto.entregas[0]?.id ? String(proyecto.entregas[0].id) : '',
        resultado: 'requiere_correcciones',
        comentario: '',
        archivo: null,
    });

    /* Heurística 5 — validación de archivo en cliente */
    const validateFile = (file: File | null): string | null => {
        if (!file) return null;
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            return `El archivo supera ${MAX_FILE_MB} MB.`;
        }
        const validExt = /\.(pdf|doc|docx|xls|xlsx)$/i.test(file.name);
        if (!validExt) return 'Solo se aceptan archivos PDF, DOC, DOCX, XLS o XLSX.';
        return null;
    };

    const tutorDecisionForm = useForm<{
        entrega_id: string;
        decision: 'correcciones' | 'derivar';
        comentario: string;
    }>({
        entrega_id: proyecto.entregas[0]?.id ? String(proyecto.entregas[0].id) : '',
        decision: 'correcciones',
        comentario: '',
    });

    const replaceArchivoForm = useForm<{
        archivo: File | null;
        motivo_reemplazo: string;
    }>({
        archivo: null,
        motivo_reemplazo: '',
    });

    const [entregaFileError,  setEntregaFileError]  = useState<string | null>(null);
    const [revisionFileError, setRevisionFileError] = useState<string | null>(null);
    const [replaceFileError, setReplaceFileError] = useState<string | null>(null);
    const [selectedArchivoReplace, setSelectedArchivoReplace] = useState<Archivo | null>(null);

    const puedeReemplazarArchivo = (archivo: Archivo): boolean => {
        if ((archivo.estado || 'activo') !== 'activo') {
            return false;
        }

        if (permisos.puede_subir_entrega && archivo.tipo_archivo === 'avance_estudiante') {
            return true;
        }

        if (permisos.puede_devolver_revision && archivo.tipo_archivo === 'documento_revisado') {
            return true;
        }

        return permisos.puede_administrar;
    };

    const abrirReemplazoArchivo = (archivo: Archivo) => {
        setSelectedArchivoReplace(archivo);
        replaceArchivoForm.reset();
        setReplaceFileError(null);
    };

    /* Submits */
    const submitDocumento = (e: FormEvent) => {
        e.preventDefault();
        documentoForm.patch(`/seguimiento/${proyecto.id}/documento-trabajo`, {
            preserveScroll: true,
            onSuccess: () => setShowDoc(false),
        });
    };

    const submitReunion = (e: FormEvent) => {
        e.preventDefault();

        reunionForm.post(`/seguimiento/${proyecto.id}/reuniones-tutoria`, {
            preserveScroll: true,
            onSuccess: () => {
                reunionForm.reset();
                setShowReunion(false);
            },
        });
    };

    const submitEntrega = (e: FormEvent) => {
        e.preventDefault();
        const err = validateFile(entregaForm.data.archivo);
        if (err) { setEntregaFileError(err); return; }
        entregaForm.post(`/seguimiento/${proyecto.id}/entregas`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                entregaForm.reset();
                setShowEntrega(false);
                setEntregaFileError(null);
            },
        });
    };

    const submitTutorDecision = (e: FormEvent) => {
        e.preventDefault();

        const url = tutorDecisionForm.data.decision === 'correcciones'
            ? `/seguimiento/${proyecto.id}/tutor/solicitar-correcciones`
            : `/seguimiento/${proyecto.id}/tutor/derivar-revision`;

        tutorDecisionForm.patch(url, {
            preserveScroll: true,
            onSuccess: () => {
                tutorDecisionForm.reset('comentario');
                setShowTutorDecision(false);
            },
        });
    };

    const submitReplaceArchivo = (e: FormEvent) => {
        e.preventDefault();

        if (!selectedArchivoReplace) {
            return;
        }

        const err = validateFile(replaceArchivoForm.data.archivo);

        if (err) {
            setReplaceFileError(err);
            return;
        }

        replaceArchivoForm.post(`/seguimiento/${proyecto.id}/archivos/${selectedArchivoReplace.id}/reemplazar`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                replaceArchivoForm.reset();
                setSelectedArchivoReplace(null);
                setReplaceFileError(null);
            },
        });
    };

    const submitRevision = (e: FormEvent) => {
        e.preventDefault();
        const err = validateFile(revisionForm.data.archivo);
        if (err) { setRevisionFileError(err); return; }
        if (!permisos.puede_devolver_revision) {
            return;
        }

        revisionForm.post(`/seguimiento/${proyecto.id}/archivo-revision`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                revisionForm.reset('comentario', 'archivo');
                setShowRevision(false);
                setRevisionFileError(null);
            },
        });
    };

    /* Resumen */
    const totalArchivos   = proyecto.entregas.reduce((t, e) => t + e.archivos.length, 0);
    const totalRevisiones = proyecto.entregas.reduce((t, e) => t + e.revisiones.length, 0);
    const ultimaEntrega   = proyecto.entregas[0];

    /* Heurística 6 — acción contextual única */
    const nextAction = useMemo(() => {
        if (permisos.puede_subir_entrega) {
            return {
                eyebrow: 'Tu próximo paso',
                titulo: '¿Tienes un nuevo avance listo?',
                texto: 'Sube el documento más reciente para que tu tutor pueda revisarlo. Se notificará automáticamente cuando recibas la revisión.',
                cta: { label: 'Subir avance', icon: <UploadCloud className="h-4 w-4" />, onClick: () => setShowEntrega(true) },
            };
        }
        if (permisos.puede_accion_tutor && proyecto.entregas.length > 0) {
            return {
                eyebrow: 'Tu próximo paso',
                titulo: 'Hay entregas esperando decisión del tutor',
                texto: `${proyecto.estudiante?.name || 'El estudiante'} envió "${ultimaEntrega?.titulo}". Decide si debe corregir o si esta versión puede pasar a revisión por revisores.`,
                cta: { label: 'Decisión del tutor', icon: <BookOpenCheck className="h-4 w-4" />, onClick: () => setShowTutorDecision(true) },
            };
        }

        if (permisos.puede_devolver_revision && proyecto.entregas.length > 0) {
            return {
                eyebrow: 'Tu próximo paso',
                titulo: 'Hay entregas esperando tu revisión',
                texto: `${proyecto.estudiante?.name || 'El estudiante'} envió "${ultimaEntrega?.titulo}". Devuelve el documento con tus correcciones o comentarios.`,
                cta: { label: 'Devolver revisión', icon: <FileCheck2 className="h-4 w-4" />, onClick: () => setShowRevision(true) },
            };
        }
        return {
            eyebrow: 'Estado actual',
            titulo: 'Consulta el avance del proyecto',
            texto: 'Revisa las entregas, el documento de trabajo y la línea de tiempo del proyecto.',
            cta: null,
        };
    }, [permisos, proyecto.entregas, proyecto.estudiante, ultimaEntrega]);

    /* Color de estado */
    const estadoColor = ESTADO_COLOR[proyecto.estado] ?? '#6E6458';

    return (
        <>
            <Head title={`Seguimiento - ${proyecto.titulo}`} />

            {/* ════════════════ MODALES ════════════════ */}

            <FormDrawer
                open={showDoc}
                title="Editar enlace del documento de trabajo"
                subtitle="Define cuál es el documento vigente para evitar confusiones."
                icon={<Link2 className="h-5 w-5" />}
                onClose={() => !documentoForm.processing && setShowDoc(false)}
                processing={documentoForm.processing}
            >
                <form onSubmit={submitDocumento} className="space-y-4">
                    <div className="field-group">
                        <label className="field-label" htmlFor="doc-titulo">Nombre visible del documento</label>
                        <input
                            id="doc-titulo"
                            type="text"
                            className="custom-input"
                            value={documentoForm.data.documento_trabajo_titulo}
                            onChange={(e) => documentoForm.setData('documento_trabajo_titulo', e.target.value)}
                            placeholder="Ej. Documento principal de tesis"
                        />
                        {documentoForm.errors.documento_trabajo_titulo && (
                            <div className="error-text">{documentoForm.errors.documento_trabajo_titulo}</div>
                        )}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="doc-url">Enlace del documento</label>
                        <input
                            id="doc-url"
                            type="url"
                            className="custom-input"
                            value={documentoForm.data.documento_trabajo_url}
                            onChange={(e) => documentoForm.setData('documento_trabajo_url', e.target.value)}
                            placeholder="https://docs.google.com/..."
                        />
                        <span className="field-help">Puede ser un enlace a Google Docs, OneDrive, Drive o cualquier plataforma colaborativa.</span>
                        {documentoForm.errors.documento_trabajo_url && (
                            <div className="error-text">{documentoForm.errors.documento_trabajo_url}</div>
                        )}
                    </div>

                    <div className="drawer-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowDoc(false)} disabled={documentoForm.processing}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={documentoForm.processing}>
                            {documentoForm.processing ? 'Guardando...' : 'Guardar enlace'}
                        </button>
                    </div>
                </form>
            </FormDrawer>

            <FormDrawer
                open={showReunion}
                title="Registrar reunión de tutoría"
                subtitle="Deja constancia formal de la sesión, los temas tratados y los acuerdos definidos."
                icon={<CalendarClock className="h-5 w-5" />}
                onClose={() => !reunionForm.processing && setShowReunion(false)}
                processing={reunionForm.processing}
            >
                <form onSubmit={submitReunion} className="space-y-4">
                    <div className="field-group">
                        <label className="field-label" htmlFor="reunion-fecha">Fecha y hora de reunión *</label>
                        <input
                            id="reunion-fecha"
                            type="datetime-local"
                            className="custom-input"
                            value={reunionForm.data.fecha_reunion}
                            onChange={(e) => reunionForm.setData('fecha_reunion', e.target.value)}
                        />
                        {reunionForm.errors.fecha_reunion && <div className="error-text">{reunionForm.errors.fecha_reunion}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="reunion-modalidad">Modalidad *</label>
                        <select
                            id="reunion-modalidad"
                            className="custom-input"
                            value={reunionForm.data.modalidad}
                            onChange={(e) => reunionForm.setData('modalidad', e.target.value as 'presencial' | 'virtual')}
                        >
                            <option value="presencial">Presencial</option>
                            <option value="virtual">Virtual</option>
                        </select>
                        {reunionForm.errors.modalidad && <div className="error-text">{reunionForm.errors.modalidad}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="reunion-temas">Temas tratados *</label>
                        <textarea
                            id="reunion-temas"
                            className="custom-input"
                            rows={4}
                            value={reunionForm.data.temas_tratados}
                            onChange={(e) => reunionForm.setData('temas_tratados', e.target.value)}
                            placeholder="Ej. Revisión de objetivos, alcance, cronograma y observaciones del último avance."
                        />
                        {reunionForm.errors.temas_tratados && <div className="error-text">{reunionForm.errors.temas_tratados}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="reunion-acuerdos">Acuerdos y compromisos *</label>
                        <textarea
                            id="reunion-acuerdos"
                            className="custom-input"
                            rows={4}
                            value={reunionForm.data.acuerdos}
                            onChange={(e) => reunionForm.setData('acuerdos', e.target.value)}
                            placeholder="Ej. El estudiante enviará el capítulo corregido hasta el viernes; el tutor revisará la nueva versión."
                        />
                        {reunionForm.errors.acuerdos && <div className="error-text">{reunionForm.errors.acuerdos}</div>}
                    </div>

                    <div className="drawer-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowReunion(false)} disabled={reunionForm.processing}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={reunionForm.processing}>
                            <CalendarClock className="h-4 w-4 mr-1" />
                            {reunionForm.processing ? 'Registrando...' : 'Registrar reunión'}
                        </button>
                    </div>
                </form>
            </FormDrawer>

            <FormDrawer
                open={showEntrega}
                title="Subir nuevo avance"
                subtitle="Tu tutor recibirá una notificación automáticamente."
                icon={<UploadCloud className="h-5 w-5" />}
                onClose={() => !entregaForm.processing && setShowEntrega(false)}
                processing={entregaForm.processing}
            >
                <form onSubmit={submitEntrega} className="space-y-4">
                    <div className="field-group">
                        <label className="field-label" htmlFor="entrega-titulo">¿Qué estás entregando? *</label>
                        <input
                            id="entrega-titulo"
                            type="text"
                            className="custom-input"
                            value={entregaForm.data.titulo}
                            onChange={(e) => entregaForm.setData('titulo', e.target.value)}
                            placeholder="Ej. Capítulo I corregido"
                            autoFocus
                        />
                        <span className="field-help">Un título claro ayuda a tu tutor a ubicar la entrega.</span>
                        {entregaForm.errors.titulo && <div className="error-text">{entregaForm.errors.titulo}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="entrega-archivo">Archivo *</label>
                        <input
                            id="entrega-archivo"
                            type="file"
                            className="custom-input file-input"
                            accept={ACCEPTED_TYPES}
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                entregaForm.setData('archivo', file);
                                setEntregaFileError(validateFile(file));
                            }}
                        />
                        {entregaForm.data.archivo && !entregaFileError && (
                            <div className="file-preview">
                                <FileText className="h-4 w-4" />
                                <div className="flex-1 min-w-0">
                                    <strong className="truncate">{entregaForm.data.archivo.name}</strong>
                                    <span>{formatBytes(entregaForm.data.archivo.size)}</span>
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                        )}
                        <span className="field-help">Formatos: PDF, DOC, DOCX, XLS, XLSX · Máximo {MAX_FILE_MB} MB</span>
                        {entregaFileError && <div className="error-text"><AlertTriangle className="h-3.5 w-3.5" /> {entregaFileError}</div>}
                        {entregaForm.errors.archivo && <div className="error-text">{entregaForm.errors.archivo}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="entrega-desc">Comentario para tu tutor</label>
                        <textarea
                            id="entrega-desc"
                            className="custom-input"
                            rows={3}
                            value={entregaForm.data.descripcion}
                            onChange={(e) => entregaForm.setData('descripcion', e.target.value)}
                            placeholder="Ej. Apliqué las observaciones del capítulo anterior."
                        />
                        {entregaForm.errors.descripcion && <div className="error-text">{entregaForm.errors.descripcion}</div>}
                    </div>

                    <div className="drawer-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowEntrega(false)} disabled={entregaForm.processing}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={entregaForm.processing || !!entregaFileError || !entregaForm.data.archivo}>
                            <UploadCloud className="h-4 w-4 mr-1" />
                            {entregaForm.processing ? 'Subiendo...' : 'Subir avance'}
                        </button>
                    </div>
                </form>
            </FormDrawer>

            <FormDrawer
                open={showTutorDecision}
                title="Decisión del tutor"
                subtitle="Define si la entrega vuelve al estudiante o pasa a revisión por revisores."
                icon={<BookOpenCheck className="h-5 w-5" />}
                onClose={() => !tutorDecisionForm.processing && setShowTutorDecision(false)}
                processing={tutorDecisionForm.processing}
            >
                <form onSubmit={submitTutorDecision} className="space-y-4">
                    <div className="field-group">
                        <label className="field-label" htmlFor="tutor-entrega">Entrega evaluada *</label>
                        <select
                            id="tutor-entrega"
                            className="custom-input"
                            value={tutorDecisionForm.data.entrega_id}
                            onChange={(e) => tutorDecisionForm.setData('entrega_id', e.target.value)}
                        >
                            {proyecto.entregas.map((entrega) => (
                                <option key={entrega.id} value={String(entrega.id)}>
                                    V{entrega.numero_version}: {entrega.titulo}
                                </option>
                            ))}
                        </select>
                        {tutorDecisionForm.errors.entrega_id && <div className="error-text">{tutorDecisionForm.errors.entrega_id}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="tutor-decision">Decisión *</label>
                        <select
                            id="tutor-decision"
                            className="custom-input"
                            value={tutorDecisionForm.data.decision}
                            onChange={(e) => tutorDecisionForm.setData('decision', e.target.value as 'correcciones' | 'derivar')}
                        >
                            <option value="correcciones">Solicitar correcciones al estudiante</option>
                            <option value="derivar">Derivar esta versión a revisores</option>
                        </select>
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="tutor-comentario">
                            {tutorDecisionForm.data.decision === 'correcciones'
                                ? 'Correcciones para el estudiante *'
                                : 'Comentario para revisores'}
                        </label>
                        <textarea
                            id="tutor-comentario"
                            className="custom-input"
                            rows={4}
                            value={tutorDecisionForm.data.comentario}
                            onChange={(e) => tutorDecisionForm.setData('comentario', e.target.value)}
                            placeholder={
                                tutorDecisionForm.data.decision === 'correcciones'
                                    ? 'Ej. Corregir objetivos, alcance y justificación antes de continuar.'
                                    : 'Ej. La versión está lista para revisión técnica y metodológica.'
                            }
                        />
                        {tutorDecisionForm.errors.comentario && <div className="error-text">{tutorDecisionForm.errors.comentario}</div>}
                    </div>

                    <div className="drawer-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowTutorDecision(false)} disabled={tutorDecisionForm.processing}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={tutorDecisionForm.processing}>
                            <BookOpenCheck className="h-4 w-4 mr-1" />
                            {tutorDecisionForm.processing
                                ? 'Registrando decisión...'
                                : tutorDecisionForm.data.decision === 'correcciones'
                                  ? 'Solicitar correcciones'
                                  : 'Derivar a revisores'}
                        </button>
                    </div>
                </form>
            </FormDrawer>

            <FormDrawer
                open={showRevision && permisos.puede_devolver_revision}
                title="Devolver revisión"
                subtitle="Sube el documento con correcciones y comparte tu resumen."
                icon={<FileCheck2 className="h-5 w-5" />}
                onClose={() => !revisionForm.processing && setShowRevision(false)}
                processing={revisionForm.processing}
            >
                <form onSubmit={submitRevision} className="space-y-4">
                    <div className="field-group">
                        <label className="field-label" htmlFor="rev-entrega">Entrega que estás revisando *</label>
                        <select
                            id="rev-entrega"
                            className="custom-input"
                            value={revisionForm.data.entrega_id}
                            onChange={(e) => revisionForm.setData('entrega_id', e.target.value)}
                        >
                            {proyecto.entregas.map((entrega) => (
                                <option key={entrega.id} value={String(entrega.id)}>
                                    V{entrega.numero_version}: {entrega.titulo}
                                </option>
                            ))}
                        </select>
                        {revisionForm.errors.entrega_id && <div className="error-text">{revisionForm.errors.entrega_id}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="rev-resultado">Resultado *</label>
                        <select
                            id="rev-resultado"
                            className="custom-input"
                            value={revisionForm.data.resultado}
                            onChange={(e) => revisionForm.setData('resultado', e.target.value)}
                        >
                            {Object.entries(resultadoLabels).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                        </select>
                        {revisionForm.errors.resultado && <div className="error-text">{revisionForm.errors.resultado}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="rev-archivo">Archivo revisado *</label>
                        <input
                            id="rev-archivo"
                            type="file"
                            className="custom-input file-input"
                            accept={ACCEPTED_TYPES}
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                revisionForm.setData('archivo', file);
                                setRevisionFileError(validateFile(file));
                            }}
                        />
                        {revisionForm.data.archivo && !revisionFileError && (
                            <div className="file-preview">
                                <FileText className="h-4 w-4" />
                                <div className="flex-1 min-w-0">
                                    <strong className="truncate">{revisionForm.data.archivo.name}</strong>
                                    <span>{formatBytes(revisionForm.data.archivo.size)}</span>
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                        )}
                        <span className="field-help">Sube el documento con comentarios, control de cambios o matriz de corrección.</span>
                        {revisionFileError && <div className="error-text"><AlertTriangle className="h-3.5 w-3.5" /> {revisionFileError}</div>}
                        {revisionForm.errors.archivo && <div className="error-text">{revisionForm.errors.archivo}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="rev-comentario">Resumen para el estudiante</label>
                        <textarea
                            id="rev-comentario"
                            className="custom-input"
                            rows={3}
                            value={revisionForm.data.comentario}
                            onChange={(e) => revisionForm.setData('comentario', e.target.value)}
                            placeholder="Ej. Revisé la estructura y dejé comentarios en el documento."
                        />
                        {revisionForm.errors.comentario && <div className="error-text">{revisionForm.errors.comentario}</div>}
                    </div>

                    <div className="drawer-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowRevision(false)} disabled={revisionForm.processing}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={revisionForm.processing || !!revisionFileError || !revisionForm.data.archivo}>
                            <FileCheck2 className="h-4 w-4 mr-1" />
                            {revisionForm.processing ? 'Enviando...' : 'Devolver revisión'}
                        </button>
                    </div>
                </form>
            </FormDrawer>

            <FormDrawer
                open={!!selectedArchivoReplace}
                title="Reemplazar archivo"
                subtitle="El archivo anterior no se elimina; queda marcado como reemplazado para mantener trazabilidad."
                icon={<UploadCloud className="h-5 w-5" />}
                onClose={() => !replaceArchivoForm.processing && setSelectedArchivoReplace(null)}
                processing={replaceArchivoForm.processing}
            >
                <form onSubmit={submitReplaceArchivo} className="space-y-4">
                    {selectedArchivoReplace && (
                        <div className="file-preview">
                            <FileText className="h-4 w-4" />
                            <div className="flex-1 min-w-0">
                                <strong className="truncate">{selectedArchivoReplace.nombre_original}</strong>
                                <span>Archivo actual que será reemplazado</span>
                            </div>
                        </div>
                    )}

                    <div className="field-group">
                        <label className="field-label" htmlFor="replace-file">Nuevo archivo *</label>
                        <input
                            id="replace-file"
                            type="file"
                            className="custom-input file-input"
                            accept={ACCEPTED_TYPES}
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                replaceArchivoForm.setData('archivo', file);
                                setReplaceFileError(validateFile(file));
                            }}
                        />
                        {replaceArchivoForm.data.archivo && !replaceFileError && (
                            <div className="file-preview">
                                <FileText className="h-4 w-4" />
                                <div className="flex-1 min-w-0">
                                    <strong className="truncate">{replaceArchivoForm.data.archivo.name}</strong>
                                    <span>{formatBytes(replaceArchivoForm.data.archivo.size)}</span>
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                        )}
                        <span className="field-help">Formatos: PDF, DOC, DOCX, XLS, XLSX · Máximo {MAX_FILE_MB} MB</span>
                        {replaceFileError && <div className="error-text"><AlertTriangle className="h-3.5 w-3.5" /> {replaceFileError}</div>}
                        {replaceArchivoForm.errors.archivo && <div className="error-text">{replaceArchivoForm.errors.archivo}</div>}
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="replace-motivo">Motivo del reemplazo *</label>
                        <textarea
                            id="replace-motivo"
                            className="custom-input"
                            rows={3}
                            value={replaceArchivoForm.data.motivo_reemplazo}
                            onChange={(e) => replaceArchivoForm.setData('motivo_reemplazo', e.target.value)}
                            placeholder="Ej. Subí una versión incorrecta del documento."
                        />
                        {replaceArchivoForm.errors.motivo_reemplazo && <div className="error-text">{replaceArchivoForm.errors.motivo_reemplazo}</div>}
                    </div>

                    <div className="drawer-actions">
                        <button type="button" className="btn-secondary" onClick={() => setSelectedArchivoReplace(null)} disabled={replaceArchivoForm.processing}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={replaceArchivoForm.processing || !!replaceFileError || !replaceArchivoForm.data.archivo}>
                            <UploadCloud className="h-4 w-4 mr-1" />
                            {replaceArchivoForm.processing ? 'Reemplazando...' : 'Reemplazar archivo'}
                        </button>
                    </div>
                </form>
            </FormDrawer>

            <style>{`
                /* ════════════════ PAGE ════════════════ */
                .seguimiento-page {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.22), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.14), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }
                @media (prefers-color-scheme: dark) {
                    .seguimiento-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .progress-bar {
                    position: fixed; top: 0; left: 0; right: 0;
                    height: 3px; z-index: 999;
                    background: linear-gradient(90deg, transparent, #6B1230, #C9A84C, transparent);
                    background-size: 200% 100%;
                    animation: progress-slide 1.1s linear infinite;
                }
                @keyframes progress-slide {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .shell {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1rem;
                    display: grid;
                    gap: 1.25rem;
                }
                @media (min-width: 768px)  { .shell { padding: 1.5rem; gap: 1.5rem; } }
                @media (min-width: 1280px) { .shell { padding: 2rem 2.25rem; } }

                .glass-card {
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

                .back-link {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    color: #6B1230;
                    font-size: 0.82rem; font-weight: 800;
                    text-decoration: none;
                    margin-bottom: 0.75rem;
                }
                .back-link:hover { text-decoration: underline; text-underline-offset: 4px; }
                @media (prefers-color-scheme: dark) { .back-link { color: #D6B96A; } }

                /* ════════════════ HERO (más compacto) ════════════════ */
                .hero-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                    margin-top: 1.25rem;
                }
                @media (min-width: 640px)  { .hero-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .hero-grid { grid-template-columns: repeat(4, 1fr); } }

                .stat-card {
                    border-radius: 1rem;
                    border: 1px solid rgba(107,18,48,0.10);
                    background: rgba(255,255,255,0.55);
                    padding: 0.85rem 1rem;
                }
                @media (prefers-color-scheme: dark) {
                    .stat-card { background: rgba(255,255,255,0.035); border-color: rgba(214,185,106,0.14); }
                }
                .stat-card-label {
                    color: #8A8074;
                    font-size: 0.64rem;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    margin-bottom: 0.35rem;
                }
                @media (prefers-color-scheme: dark) { .stat-card-label { color: #A9978D; } }
                .stat-card-value {
                    color: #24151A;
                    font-size: 0.95rem;
                    font-weight: 800;
                    line-height: 1.3;
                    overflow-wrap: anywhere;
                }
                @media (prefers-color-scheme: dark) { .stat-card-value { color: #F4EEE9; } }

                /* ════════════════ CHIPS ════════════════ */
                .chip-pill {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    padding: 0.25rem 0.65rem;
                    border-radius: 999px;
                    font-size: 0.7rem; font-weight: 800;
                    border: 1px solid rgba(0,0,0,0.06);
                    white-space: nowrap;
                    width: max-content;
                }
                .chip-dot {
                    display: inline-block;
                    width: 0.5rem; height: 0.5rem;
                    border-radius: 999px;
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.6);
                    flex-shrink: 0;
                }
                @media (prefers-color-scheme: dark) {
                    .chip-pill { border-color: rgba(255,255,255,0.10); }
                    .chip-dot  { box-shadow: 0 0 0 3px rgba(255,255,255,0.08); }
                }

                /* ════════════════ NEXT ACTION ════════════════ */
                .next-action {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    background:
                        linear-gradient(135deg, rgba(154,108,24,0.10), rgba(107,18,48,0.06)),
                        rgba(255,255,255,0.70);
                }
                @media (max-width: 767px) {
                    .next-action { flex-direction: column; align-items: flex-start; gap: 1rem; }
                }
                @media (prefers-color-scheme: dark) {
                    .next-action {
                        background:
                            linear-gradient(135deg, rgba(214,185,106,0.10), rgba(212,132,154,0.06)),
                            rgba(255,255,255,0.045);
                    }
                }
                .next-action-icon {
                    flex-shrink: 0;
                    width: 3rem; height: 3rem;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 1rem;
                    background: linear-gradient(135deg, #9A6C18, #6B1230);
                    color: white;
                }
                .next-action-body {
                    flex: 1; min-width: 0;
                }
                .next-action-body h2 {
                    margin: 0.35rem 0 0.4rem;
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: #24151A;
                    line-height: 1.3;
                }
                @media (prefers-color-scheme: dark) { .next-action-body h2 { color: #F4EEE9; } }
                .next-action-body p {
                    margin: 0;
                    color: #6E6458;
                    font-size: 0.9rem;
                    line-height: 1.55;
                    max-width: 50rem;
                }
                @media (prefers-color-scheme: dark) { .next-action-body p { color: #D7C9C0; } }

                /* ════════════════ BUTTONS ════════════════ */
                .btn-primary {
                    display: inline-flex; align-items: center; justify-content: center;
                    gap: 0.4rem;
                    padding: 0.75rem 1.2rem;
                    border: 0;
                    border-radius: 0.85rem;
                    background: #6B1230;
                    color: white;
                    font-size: 0.88rem;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 8px 20px rgba(107,18,48,0.20);
                    transition: all .15s;
                }
                .btn-primary:hover:not(:disabled)  { background: #4A0D21; transform: translateY(-1px); box-shadow: 0 10px 24px rgba(107,18,48,0.28); }
                .btn-primary:disabled              { opacity: 0.55; cursor: not-allowed; }
                @media (prefers-color-scheme: dark) {
                    .btn-primary { background: #D4849A; color: #2B1620; box-shadow: 0 8px 20px rgba(212,132,154,0.20); }
                    .btn-primary:hover:not(:disabled) { background: #E3A1B2; }
                }

                .btn-secondary {
                    display: inline-flex; align-items: center; justify-content: center;
                    gap: 0.4rem;
                    padding: 0.7rem 1.1rem;
                    border: 1px solid rgba(107,18,48,0.18);
                    border-radius: 0.85rem;
                    background: transparent;
                    color: #6B1230;
                    font-size: 0.85rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all .15s;
                }
                .btn-secondary:hover:not(:disabled) { background: rgba(107,18,48,0.08); }
                .btn-secondary:disabled             { opacity: 0.55; cursor: not-allowed; }
                @media (prefers-color-scheme: dark) {
                    .btn-secondary { border-color: rgba(214,185,106,0.28); color: #D6B96A; }
                    .btn-secondary:hover:not(:disabled) { background: rgba(214,185,106,0.10); }
                }

                .btn-ghost {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.45rem 0.7rem;
                    border: 0;
                    border-radius: 0.6rem;
                    background: transparent;
                    color: #6B1230;
                    font-size: 0.78rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: background .15s;
                    text-decoration: none;
                }
                .btn-ghost:hover { background: rgba(107,18,48,0.08); }
                @media (prefers-color-scheme: dark) {
                    .btn-ghost { color: #D6B96A; }
                    .btn-ghost:hover { background: rgba(214,185,106,0.10); }
                }

                /* ════════════════ SECTION TITLE ════════════════ */
                .section-title {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 1.05rem; font-weight: 900;
                    color: #24151A;
                    letter-spacing: -0.01em;
                }
                @media (prefers-color-scheme: dark) { .section-title { color: #F4EEE9; } }

                /* ════════════════ DOC CARD ════════════════ */
                .doc-card {
                    display: flex; align-items: center; gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-radius: 1rem;
                    background: linear-gradient(135deg, rgba(154,108,24,0.10), transparent 60%);
                    border: 1px solid rgba(154,108,24,0.20);
                }
                @media (prefers-color-scheme: dark) {
                    .doc-card { background: linear-gradient(135deg, rgba(214,185,106,0.10), transparent 60%); border-color: rgba(214,185,106,0.20); }
                }
                .doc-card-icon {
                    flex-shrink: 0;
                    width: 2.6rem; height: 2.6rem;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 0.85rem;
                    background: rgba(154,108,24,0.16);
                    color: #9A6C18;
                }
                @media (prefers-color-scheme: dark) {
                    .doc-card-icon { background: rgba(214,185,106,0.16); color: #D6B96A; }
                }
                .doc-card-body { flex: 1; min-width: 0; }
                .doc-card-body strong { font-size: 0.95rem; font-weight: 900; color: #24151A; display: block; }
                .doc-card-body span   { font-size: 0.78rem; color: #8A8074; display: block; margin-top: 0.15rem; }
                @media (prefers-color-scheme: dark) {
                    .doc-card-body strong { color: #F4EEE9; }
                    .doc-card-body span   { color: #A9978D; }
                }
                @media (max-width: 640px) {
                    .doc-card { flex-direction: column; align-items: stretch; }
                }

                /* ════════════════ ENTREGAS ════════════════ */
                .entrega-card {
                    border-radius: 1rem;
                    border: 1px solid rgba(107,18,48,0.10);
                    background: rgba(255,255,255,0.55);
                    overflow: hidden;
                    transition: border-color .15s;
                }
                .entrega-card:hover { border-color: rgba(107,18,48,0.20); }
                @media (prefers-color-scheme: dark) {
                    .entrega-card { background: rgba(255,255,255,0.035); border-color: rgba(214,185,106,0.14); }
                    .entrega-card:hover { border-color: rgba(214,185,106,0.28); }
                }

                .entrega-head {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 0.75rem;
                    padding: 1rem 1.15rem;
                    cursor: pointer;
                    background: transparent;
                    border: 0;
                    width: 100%;
                    text-align: left;
                    transition: background .15s;
                }
                .entrega-head:hover { background: rgba(107,18,48,0.04); }
                @media (prefers-color-scheme: dark) { .entrega-head:hover { background: rgba(214,185,106,0.05); } }
                .entrega-head-left { flex: 1; min-width: 0; }
                .entrega-version {
                    display: inline-block;
                    padding: 0.15rem 0.5rem;
                    border-radius: 0.45rem;
                    background: rgba(107,18,48,0.12);
                    color: #6B1230;
                    font-size: 0.7rem;
                    font-weight: 900;
                    margin-right: 0.5rem;
                }
                @media (prefers-color-scheme: dark) {
                    .entrega-version { background: rgba(214,185,106,0.16); color: #D6B96A; }
                }
                .entrega-title {
                    font-weight: 800;
                    color: #24151A;
                    font-size: 0.95rem;
                }
                @media (prefers-color-scheme: dark) { .entrega-title { color: #F4EEE9; } }
                .entrega-meta {
                    font-size: 0.74rem;
                    color: #8A8074;
                    margin-top: 0.25rem;
                }
                @media (prefers-color-scheme: dark) { .entrega-meta { color: #A9978D; } }

                .entrega-body {
                    padding: 0 1.15rem 1.15rem;
                    border-top: 1px dashed rgba(107,18,48,0.10);
                    margin-top: 0.25rem;
                }
                @media (prefers-color-scheme: dark) { .entrega-body { border-top-color: rgba(214,185,106,0.14); } }

                .entrega-section {
                    margin-top: 1rem;
                }
                .entrega-section-title {
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #8A8074;
                    margin-bottom: 0.5rem;
                }
                @media (prefers-color-scheme: dark) { .entrega-section-title { color: #A9978D; } }

                .file-row {
                    display: flex; align-items: center; gap: 0.65rem;
                    padding: 0.65rem 0.85rem;
                    border-radius: 0.7rem;
                    background: rgba(255,255,255,0.6);
                    border: 1px solid rgba(107,18,48,0.08);
                    margin-bottom: 0.4rem;
                }
                .file-row.is-review {
                    background: rgba(21,128,61,0.06);
                    border-color: rgba(21,128,61,0.18);
                }
                @media (prefers-color-scheme: dark) {
                    .file-row { background: rgba(255,255,255,0.04); border-color: rgba(214,185,106,0.12); }
                    .file-row.is-review { background: rgba(74,222,128,0.08); border-color: rgba(74,222,128,0.20); }
                }
                .file-row-icon {
                    flex-shrink: 0;
                    width: 2rem; height: 2rem;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 0.5rem;
                    background: rgba(107,18,48,0.08);
                    color: #6B1230;
                }
                .file-row.is-review .file-row-icon {
                    background: rgba(21,128,61,0.12);
                    color: #15803D;
                }
                @media (prefers-color-scheme: dark) {
                    .file-row-icon { background: rgba(214,185,106,0.10); color: #D6B96A; }
                    .file-row.is-review .file-row-icon { background: rgba(74,222,128,0.14); color: #4ADE80; }
                }
                .file-row-body { flex: 1; min-width: 0; }
                .file-row-body strong {
                    display: block;
                    font-size: 0.82rem;
                    font-weight: 800;
                    color: #24151A;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .file-row-body span {
                    font-size: 0.7rem;
                    color: #8A8074;
                }
                @media (prefers-color-scheme: dark) {
                    .file-row-body strong { color: #F4EEE9; }
                    .file-row-body span { color: #A9978D; }
                }

                /* ════════════════ TIMELINE ════════════════ */
                .timeline {
                    position: relative;
                    max-height: 32rem;
                    overflow-y: auto;
                    padding-right: 0.25rem;
                }
                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 0.95rem;
                    top: 0.5rem;
                    bottom: 0.5rem;
                    width: 1px;
                    background: rgba(107,18,48,0.20);
                }
                @media (prefers-color-scheme: dark) { .timeline::before { background: rgba(214,185,106,0.20); } }

                .timeline-node {
                    position: relative;
                    display: flex;
                    gap: 0.85rem;
                    padding: 0.65rem 0;
                }
                .timeline-dot {
                    position: relative;
                    z-index: 1;
                    flex-shrink: 0;
                    width: 1.9rem; height: 1.9rem;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 999px;
                    background: white;
                    border: 1.5px solid rgba(107,18,48,0.30);
                    color: #6B1230;
                }
                @media (prefers-color-scheme: dark) {
                    .timeline-dot { background: #2B1620; border-color: rgba(214,185,106,0.30); color: #D6B96A; }
                }
                .timeline-content {
                    flex: 1; min-width: 0;
                }
                .timeline-content strong {
                    display: block;
                    font-size: 0.82rem;
                    font-weight: 800;
                    color: #24151A;
                    line-height: 1.3;
                }
                .timeline-content p {
                    font-size: 0.76rem;
                    color: #6E6458;
                    margin: 0.2rem 0;
                    line-height: 1.45;
                }
                .timeline-content span {
                    font-size: 0.68rem;
                    color: #8A8074;
                    font-weight: 700;
                }
                @media (prefers-color-scheme: dark) {
                    .timeline-content strong { color: #F4EEE9; }
                    .timeline-content p      { color: #D7C9C0; }
                    .timeline-content span   { color: #A9978D; }
                }

                .empty-block {
                    padding: 2rem 1rem;
                    text-align: center;
                    color: #8A8074;
                }
                .empty-block svg { opacity: 0.4; margin-bottom: 0.5rem; }
                .empty-block p {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #6E6458;
                }
                @media (prefers-color-scheme: dark) {
                    .empty-block { color: #A9978D; }
                    .empty-block p { color: #D7C9C0; }
                }

                /* ════════════════ FORMS ════════════════ */
                .field-group { display: grid; gap: 0.35rem; }
                .field-label {
                    font-size: 0.78rem;
                    font-weight: 900;
                    color: #4B4038;
                    letter-spacing: 0.02em;
                }
                @media (prefers-color-scheme: dark) { .field-label { color: #E8DED4; } }
                .field-help {
                    font-size: 0.72rem;
                    color: #8A8074;
                    line-height: 1.45;
                }
                @media (prefers-color-scheme: dark) { .field-help { color: #A9978D; } }

                .custom-input {
                    width: 100%;
                    min-height: 2.65rem;
                    border-radius: 0.85rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    background: rgba(255,255,255,0.8);
                    padding: 0.65rem 0.85rem;
                    font-size: 0.9rem;
                    color: #24151A;
                    outline: none;
                    transition: border-color .18s, box-shadow .18s;
                    font-family: inherit;
                }
                .custom-input:focus-visible {
                    border-color: #6B1230;
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.10);
                }
                .file-input { padding: 0.45rem; }
                .file-input::file-selector-button {
                    margin-right: 0.65rem;
                    border: 0;
                    border-radius: 0.55rem;
                    background: rgba(107,18,48,0.10);
                    color: #6B1230;
                    padding: 0.5rem 0.75rem;
                    font-weight: 800;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: background .15s;
                }
                .file-input::file-selector-button:hover { background: rgba(107,18,48,0.18); }
                @media (prefers-color-scheme: dark) {
                    .custom-input { border-color: rgba(214,185,106,0.18); background: #2B1620; color: #F4EEE9; }
                    .file-input::file-selector-button { background: rgba(214,185,106,0.12); color: #D6B96A; }
                    .file-input::file-selector-button:hover { background: rgba(214,185,106,0.22); }
                }

                .file-preview {
                    display: flex; align-items: center; gap: 0.6rem;
                    padding: 0.7rem 0.85rem;
                    border-radius: 0.7rem;
                    background: rgba(21,128,61,0.06);
                    border: 1px solid rgba(21,128,61,0.20);
                    color: #15803D;
                    font-size: 0.82rem;
                }
                .file-preview strong { font-weight: 800; color: #24151A; display: block; }
                .file-preview span   { font-size: 0.72rem; color: #6E6458; }
                @media (prefers-color-scheme: dark) {
                    .file-preview { background: rgba(74,222,128,0.08); border-color: rgba(74,222,128,0.22); color: #4ADE80; }
                    .file-preview strong { color: #F4EEE9; }
                    .file-preview span   { color: #A9978D; }
                }

                .error-text {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    margin-top: 0.15rem;
                    font-size: 0.74rem;
                    color: #DC2626;
                    font-weight: 700;
                }
                @media (prefers-color-scheme: dark) { .error-text { color: #FCA5A5; } }

                /* ════════════════ DRAWER (modal grande) ════════════════ */
                .drawer-backdrop {
                    position: fixed; inset: 0;
                    z-index: 99999;
                    display: flex; align-items: flex-end; justify-content: center;
                    padding: 0;
                    background: rgba(18,12,16,0.55);
                    backdrop-filter: blur(4px);
                    animation: fadeIn .15s ease-out;
                }
                @media (min-width: 768px) {
                    .drawer-backdrop { align-items: center; padding: 1rem; }
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .drawer-card {
                    width: 100%;
                    max-width: 560px;
                    max-height: 90vh;
                    border-radius: 1.25rem 1.25rem 0 0;
                    background: #fffaf4;
                    color: #24151A;
                    box-shadow: 0 -24px 70px rgba(0,0,0,0.30);
                    border: 1px solid rgba(107,18,48,0.16);
                    border-bottom: 0;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp .22s ease-out;
                }
                @media (min-width: 768px) {
                    .drawer-card {
                        border-radius: 1.25rem;
                        border-bottom: 1px solid rgba(107,18,48,0.16);
                        box-shadow: 0 24px 70px rgba(0,0,0,0.30);
                    }
                }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @media (prefers-color-scheme: dark) {
                    .drawer-card { background: #2B1620; color: #F4EEE9; border-color: rgba(255,255,255,0.12); }
                }

                .drawer-header {
                    display: flex; align-items: flex-start; gap: 0.85rem;
                    padding: 1.25rem 1.25rem 1rem;
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) { .drawer-header { border-bottom-color: rgba(214,185,106,0.14); } }

                .drawer-icon {
                    flex-shrink: 0;
                    width: 2.5rem; height: 2.5rem;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 0.85rem;
                    background: rgba(154,108,24,0.14);
                    color: #9A6C18;
                }
                @media (prefers-color-scheme: dark) { .drawer-icon { background: rgba(214,185,106,0.14); color: #D6B96A; } }

                .drawer-header h2 { margin: 0; font-size: 1.1rem; font-weight: 900; line-height: 1.3; }
                .drawer-header p  { margin: 0.3rem 0 0; font-size: 0.84rem; color: #6E6458; line-height: 1.5; }
                @media (prefers-color-scheme: dark) { .drawer-header p { color: #CFC4BA; } }

                .drawer-close {
                    flex-shrink: 0;
                    border: 0; background: transparent;
                    color: #6E6458;
                    padding: 0.3rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: background .15s;
                }
                .drawer-close:hover:not(:disabled) { background: rgba(107,18,48,0.08); }
                @media (prefers-color-scheme: dark) { .drawer-close { color: #CFC4BA; } }

                .drawer-body {
                    padding: 1.25rem;
                    overflow-y: auto;
                    flex: 1;
                }

                .drawer-actions {
                    display: flex; justify-content: flex-end; gap: 0.65rem;
                    padding-top: 1.25rem;
                    margin-top: 1rem;
                    border-top: 1px solid rgba(107,18,48,0.10);
                }
                @media (prefers-color-scheme: dark) { .drawer-actions { border-top-color: rgba(214,185,106,0.14); } }

                .space-y-4 > * + * { margin-top: 1rem; }
            `}</style>

            {/* Heurística 1 — barra de progreso */}
            {loading && <div className="progress-bar" aria-hidden="true" />}

            <div className="seguimiento-page">
                <div className="shell">

                    {/* ══════════════ HERO (compacto) ══════════════ */}
                    <section className="glass-card">
                        <div className="p-6">
                            <Link href="/seguimiento" className="back-link" title="Volver al listado de proyectos">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>

                            <div className="eyebrow">
                                <BookOpenCheck className="h-4 w-4" />
                                Seguimiento del proyecto
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 leading-tight">
                                {proyecto.titulo}
                            </h1>

                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold text-[#8A8074] dark:text-[#A9978D]">
                                    {proyecto.codigo}
                                </span>
                                <span
                                    className="chip-pill"
                                    style={{ background: `${estadoColor}1A`, color: estadoColor }}
                                >
                                    <span className="chip-dot" style={{ background: estadoColor }} />
                                    {label(proyecto.estado)}
                                </span>
                            </div>

                            <div className="hero-grid">
                                <div className="stat-card">
                                    <div className="stat-card-label">Estudiante</div>
                                    <div className="stat-card-value flex items-center gap-1.5">
                                        <UserRound className="h-4 w-4 text-[#6B1230] dark:text-[#D4849A] flex-shrink-0" />
                                        {proyecto.estudiante?.name || 'Sin asignar'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Tutor</div>
                                    <div className="stat-card-value flex items-center gap-1.5">
                                        <UserRound className="h-4 w-4 text-[#9A6C18] dark:text-[#D6B96A] flex-shrink-0" />
                                        {proyecto.tutor?.name || 'Sin asignar'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Entregas</div>
                                    <div className="stat-card-value">
                                        {proyecto.entregas.length} · {totalArchivos} archivo{totalArchivos === 1 ? '' : 's'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Última entrega</div>
                                    <div className="stat-card-value">
                                        {ultimaEntrega ? formatRelative(ultimaEntrega.created_at) : 'Sin entregas'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════ NEXT ACTION (1 sola CTA) ══════════════ */}
                    <section className="glass-card next-action">
                        <div className="next-action-icon">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="next-action-body">
                            <div className="eyebrow">{nextAction.eyebrow}</div>
                            <h2>{nextAction.titulo}</h2>
                            <p>{nextAction.texto}</p>
                        </div>
                        {nextAction.cta && (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={nextAction.cta.onClick}
                                title={nextAction.cta.label}
                            >
                                {nextAction.cta.icon}
                                {nextAction.cta.label}
                            </button>
                        )}
                    </section>

                    {/* ══════════════ DOCUMENTO DE TRABAJO ══════════════ */}
                    <section className="glass-card p-6">
                        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <div className="section-title">
                                <Link2 className="h-5 w-5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                Documento de trabajo
                            </div>
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => setShowDoc(true)}
                                title="Editar el enlace del documento principal"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                {proyecto.documento_trabajo?.url ? 'Cambiar enlace' : 'Definir enlace'}
                            </button>
                        </div>

                        <div className="doc-card">
                            <div className="doc-card-icon">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="doc-card-body">
                                <strong>{proyecto.documento_trabajo?.titulo || 'Aún no se ha definido un documento'}</strong>
                                {proyecto.documento_trabajo?.actualizado_at && (
                                    <span>
                                        Actualizado {formatRelative(proyecto.documento_trabajo.actualizado_at)}
                                        {proyecto.documento_trabajo.actualizado_por?.name && ` · por ${proyecto.documento_trabajo.actualizado_por.name}`}
                                    </span>
                                )}
                                {!proyecto.documento_trabajo?.url && (
                                    <span className="italic">Haz clic en "Definir enlace" para añadir el documento principal.</span>
                                )}
                            </div>
                            {proyecto.documento_trabajo?.url && (
                                <a
                                    className="btn-primary"
                                    href={proyecto.documento_trabajo.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Abrir documento en una nueva pestaña"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Abrir
                                </a>
                            )}
                        </div>
                    </section>

                    {/* ══════════════ REUNIONES DE TUTORÍA ══════════════ */}
                    <section className="glass-card p-6">
                        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <div className="section-title">
                                <CalendarClock className="h-5 w-5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                Reuniones de tutoría
                            </div>

                            {permisos.puede_accion_tutor && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => setShowReunion(true)}
                                    title="Registrar una nueva reunión de tutoría"
                                >
                                    <Plus className="h-4 w-4" />
                                    Registrar reunión
                                </button>
                            )}
                        </div>

                        {proyecto.reuniones_tutoria && proyecto.reuniones_tutoria.length > 0 ? (
                            <div className="grid gap-3">
                                {proyecto.reuniones_tutoria.map((reunion) => (
                                    <div key={reunion.id} className="file-row">
                                        <div className="file-row-icon">
                                            <CalendarClock className="h-4 w-4" />
                                        </div>
                                        <div className="file-row-body">
                                            <strong>
                                                {formatDate(reunion.fecha_reunion)} · {label(reunion.modalidad)}
                                            </strong>
                                            <span>
                                                Tutor: {reunion.tutor?.name || 'Sin registro'}
                                            </span>
                                            <div className="mt-2 text-sm text-[#6E6458] dark:text-[#D7C9C0] leading-relaxed">
                                                <p><strong>Temas:</strong> {reunion.temas_tratados}</p>
                                                <p><strong>Acuerdos:</strong> {reunion.acuerdos}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-block">
                                <CalendarClock className="h-8 w-8 mx-auto" />
                                <p>Aún no hay reuniones de tutoría registradas.</p>
                            </div>
                        )}
                    </section>

                    {/* ══════════════ GRID 2 COL: Entregas + Timeline ══════════════ */}
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">

                        {/* Entregas */}
                        <section className="glass-card p-6">
                            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                                <div className="section-title">
                                    <FileText className="h-5 w-5 text-[#6B1230] dark:text-[#D4849A]" />
                                    Entregas
                                    <span className="text-xs font-bold ml-1 px-2 py-0.5 rounded-full bg-[#6B1230]/10 text-[#6B1230] dark:bg-[#D6B96A]/15 dark:text-[#D6B96A]">
                                        {proyecto.entregas.length}
                                    </span>
                                </div>

                                {permisos.puede_subir_entrega && (
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        onClick={() => setShowEntrega(true)}
                                        title="Subir un nuevo avance"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Nueva entrega
                                    </button>
                                )}
                            </div>

                            {proyecto.entregas.length === 0 ? (
                                <div className="empty-block">
                                    <FileText className="h-10 w-10 stroke-[1] mx-auto" />
                                    <p>Aún no hay entregas registradas</p>
                                    {permisos.puede_subir_entrega && (
                                        <button type="button" className="btn-ghost mt-2" onClick={() => setShowEntrega(true)}>
                                            <UploadCloud className="h-3.5 w-3.5" />
                                            Subir la primera
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {proyecto.entregas.map((entrega) => (
                                        <EntregaItem
                                                key={entrega.id}
                                                entrega={entrega}
                                                proyectoId={proyecto.id}
                                                puedeReemplazarArchivo={puedeReemplazarArchivo}
                                                onReplaceArchivo={abrirReemplazoArchivo}
                                            />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Timeline */}
                        <aside className="glass-card p-6">
                            <div className="section-title mb-3">
                                <CalendarClock className="h-5 w-5 text-[#9A6C18] dark:text-[#D6B96A]" />
                                Historial
                            </div>

                            {linea_tiempo.length === 0 ? (
                                <div className="empty-block">
                                    <CalendarClock className="h-10 w-10 stroke-[1] mx-auto" />
                                    <p>Sin eventos registrados</p>
                                </div>
                            ) : (
                                <div className="timeline">
                                    {linea_tiempo.map((evento, idx) => (
                                        <div key={`${evento.tipo}-${idx}`} className="timeline-node">
                                            <div className="timeline-dot">
                                                {timelineIcon(evento.tipo)}
                                            </div>
                                            <div className="timeline-content">
                                                <strong>{evento.titulo}</strong>
                                                <p>{evento.descripcion}</p>
                                                <span>
                                                    {formatRelative(evento.fecha)}
                                                    {evento.actor?.name && ` · ${evento.actor.name}`}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>

                    </div>

                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────
   Componente Entrega (expandible)
   ───────────────────────────────────────────────────────────── */
function EntregaItem({
    entrega,
    proyectoId,
    puedeReemplazarArchivo,
    onReplaceArchivo,
}: {
    entrega: Entrega;
    proyectoId: number;
    puedeReemplazarArchivo: (archivo: Archivo) => boolean;
    onReplaceArchivo: (archivo: Archivo) => void;
}) {
    const [open, setOpen] = useState(false);

    const archivosEstudiante = entrega.archivos.filter((a) => a.tipo_archivo === 'avance_estudiante' && (a.estado || 'activo') === 'activo');
    const archivosRevision   = entrega.archivos.filter((a) => a.tipo_archivo === 'documento_revisado' && (a.estado || 'activo') === 'activo');

    const estadoColor = ESTADO_COLOR[entrega.estado] ?? '#6E6458';

    return (
        <div className="entrega-card">
            <button
                type="button"
                className="entrega-head"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                title={open ? 'Ocultar detalles' : 'Ver detalles'}
            >
                <div className="entrega-head-left">
                    <div>
                        <span className="entrega-version">V{entrega.numero_version}</span>
                        <span className="entrega-title">{entrega.titulo}</span>
                    </div>
                    <div className="entrega-meta">
                        {formatRelative(entrega.created_at)} · {entrega.archivos.length} archivo{entrega.archivos.length === 1 ? '' : 's'}
                        {entrega.revisiones.length > 0 && ` · ${entrega.revisiones.length} revisión${entrega.revisiones.length === 1 ? '' : 'es'}`}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="chip-pill" style={{ background: `${estadoColor}1A`, color: estadoColor }}>
                        <span className="chip-dot" style={{ background: estadoColor }} />
                        {label(entrega.estado)}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#8A8074] transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {open && (
                <div className="entrega-body">
                    {entrega.descripcion && (
                        <div className="entrega-section">
                            <div className="entrega-section-title">Comentario del estudiante</div>
                            <p className="text-sm text-[#6E6458] dark:text-[#D7C9C0] leading-relaxed">
                                {entrega.descripcion}
                            </p>
                        </div>
                    )}

                    {archivosEstudiante.length > 0 && (
                        <div className="entrega-section">
                            <div className="entrega-section-title">Archivo del estudiante</div>
                            {archivosEstudiante.map((archivo) => (
                                <div key={archivo.id} className="file-row">
                                    <div className="file-row-icon">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="file-row-body">
                                        <strong title={archivo.nombre_original}>{archivo.nombre_original}</strong>
                                        <span>{formatBytes(archivo.tamano_bytes)} · {formatRelative(archivo.created_at)}</span>
                                    </div>
                                    <a
                                        href={`/seguimiento/${proyectoId}/archivos/${archivo.id}/descargar`}
                                        className="btn-ghost"
                                        title="Descargar archivo"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Descargar
                                    </a>

                                    {puedeReemplazarArchivo(archivo) && (
                                        <button
                                            type="button"
                                            className="btn-ghost"
                                            title="Reemplazar archivo"
                                            onClick={() => onReplaceArchivo(archivo)}
                                        >
                                            <UploadCloud className="h-3.5 w-3.5" />
                                            Reemplazar
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {archivosRevision.length > 0 && (
                        <div className="entrega-section">
                            <div className="entrega-section-title">Archivo revisado devuelto</div>
                            {archivosRevision.map((archivo) => (
                                <div key={archivo.id} className="file-row is-review">
                                    <div className="file-row-icon">
                                        <FileCheck2 className="h-4 w-4" />
                                    </div>
                                    <div className="file-row-body">
                                        <strong title={archivo.nombre_original}>{archivo.nombre_original}</strong>
                                        <span>
                                            Por {archivo.subido_por?.name || 'usuario'} · {formatBytes(archivo.tamano_bytes)} · {formatRelative(archivo.created_at)}
                                        </span>
                                    </div>
                                    <a
                                        href={`/seguimiento/${proyectoId}/archivos/${archivo.id}/descargar`}
                                        className="btn-ghost"
                                        title="Descargar revisión"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Descargar
                                    </a>

                                    {puedeReemplazarArchivo(archivo) && (
                                        <button
                                            type="button"
                                            className="btn-ghost"
                                            title="Reemplazar revisión"
                                            onClick={() => onReplaceArchivo(archivo)}
                                        >
                                            <UploadCloud className="h-3.5 w-3.5" />
                                            Reemplazar
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {entrega.revisiones.length > 0 && (
                        <div className="entrega-section">
                            <div className="entrega-section-title">Resultados de revisión</div>
                            {entrega.revisiones.map((revision) => {
                                const color = RESULTADO_COLOR[revision.resultado] ?? '#6E6458';
                                return (
                                    <div key={revision.id} className="file-row">
                                        <div className="file-row-icon" style={{ background: `${color}1A`, color }}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div className="file-row-body">
                                            <strong>{resultadoLabels[revision.resultado] ?? label(revision.resultado)}</strong>
                                            <span>
                                                {label(revision.rol_revision)} · {revision.revisor?.name || 'Usuario'} · {formatRelative(revision.created_at)}
                                            </span>
                                            {revision.comentario && (
                                                <p className="text-xs text-[#6E6458] dark:text-[#D7C9C0] mt-1 leading-relaxed">
                                                    {revision.comentario}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {archivosEstudiante.length === 0 && archivosRevision.length === 0 && entrega.revisiones.length === 0 && (
                        <div className="entrega-section">
                            <div className="flex items-center gap-2 text-xs text-[#8A8074] dark:text-[#A9978D] italic">
                                <FileWarning className="h-3.5 w-3.5" />
                                No hay archivos ni revisiones en esta entrega.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

SeguimientoShow.layout = {
    breadcrumbs: [
        { title: 'Seguimiento', href: '/seguimiento' },
    ],
};