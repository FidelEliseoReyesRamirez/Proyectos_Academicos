import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    BookOpenCheck,
    CalendarClock,
    FileText,
    FolderKanban,
    MessageSquareText,
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

export default function SeguimientoShow({ seguimientoData }: Props) {
    const { proyecto, linea_tiempo, permisos } = seguimientoData;

    return (
        <>
            <Head title={`Seguimiento - ${proyecto.titulo}`} />

            <style>{`
                .seguimiento-page {
                    --surface: rgba(255,255,255,0.86);
                    --surface-strong: #fff;
                    --surface-soft: rgba(255,255,255,0.62);
                    --text: #24151A;
                    --muted: #6E6458;
                    --muted-2: #8A8074;
                    --border: rgba(107,18,48,0.14);
                    --border-strong: rgba(107,18,48,0.28);
                    --guindo: #6B1230;
                    --gold: #9A6C18;
                    --shadow: 0 16px 38px rgba(107,18,48,0.08);

                    min-height: 100vh;
                    color: var(--text);
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.20), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.13), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .seguimiento-page {
                        --surface: rgba(53,27,40,0.92);
                        --surface-strong: #351B28;
                        --surface-soft: rgba(255,255,255,0.055);
                        --text: #F4EEE9;
                        --muted: #D7C9C0;
                        --muted-2: #A9978D;
                        --border: rgba(214,185,106,0.18);
                        --border-strong: rgba(214,185,106,0.32);
                        --guindo: #D4849A;
                        --gold: #D6B96A;
                        --shadow: 0 18px 45px rgba(18,7,12,0.34);

                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .shell {
                    display: grid;
                    gap: 1.25rem;
                    padding: 1rem;
                }

                @media (min-width: 768px) {
                    .shell {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }
                }

                .panel,
                .hero,
                .timeline-card,
                .entrega-card {
                    border: 1px solid var(--border);
                    background: var(--surface);
                    box-shadow: var(--shadow);
                    backdrop-filter: blur(10px);
                }

                .hero {
                    border-radius: 1.5rem;
                    padding: 1.35rem;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: var(--guindo);
                    font-size: 0.82rem;
                    font-weight: 900;
                    text-decoration: none;
                }

                .eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    margin-top: 1rem;
                    color: var(--gold);
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .title {
                    margin-top: 0.65rem;
                    color: var(--text);
                    font-size: clamp(1.8rem, 3vw, 2.6rem);
                    font-weight: 950;
                    line-height: 1.08;
                    letter-spacing: -0.04em;
                }

                .description {
                    margin-top: 0.75rem;
                    max-width: 58rem;
                    color: var(--muted);
                    font-size: 0.95rem;
                    line-height: 1.7;
                }

                .meta-grid {
                    display: grid;
                    gap: 0.85rem;
                    margin-top: 1rem;
                }

                @media (min-width: 760px) {
                    .meta-grid {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }
                }

                .meta-card,
                .panel {
                    border-radius: 1.05rem;
                    padding: 1rem;
                }

                .meta-card {
                    border: 1px solid var(--border);
                    background: var(--surface-soft);
                }

                .meta-card span,
                .panel-subtitle {
                    color: var(--muted-2);
                    font-size: 0.68rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .meta-card strong {
                    display: block;
                    margin-top: 0.3rem;
                    color: var(--text);
                    font-size: 0.9rem;
                    font-weight: 950;
                }

                .content-grid {
                    display: grid;
                    gap: 1.25rem;
                }

                @media (min-width: 1120px) {
                    .content-grid {
                        grid-template-columns: minmax(0, 1fr) minmax(360px, 0.72fr);
                        align-items: start;
                    }
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    color: var(--text);
                    font-size: 1.1rem;
                    font-weight: 950;
                    margin-bottom: 0.85rem;
                }

                .timeline {
                    display: grid;
                    gap: 0.8rem;
                }

                .timeline-card,
                .entrega-card {
                    border-radius: 1rem;
                    padding: 0.9rem;
                }

                .timeline-card strong,
                .entrega-card strong {
                    color: var(--text);
                    font-size: 0.9rem;
                    font-weight: 950;
                }

                .timeline-card p,
                .timeline-card span,
                .entrega-card p,
                .entrega-card span {
                    display: block;
                    margin-top: 0.25rem;
                    color: var(--muted);
                    font-size: 0.78rem;
                    line-height: 1.5;
                }

                .badge-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.45rem;
                    margin-top: 0.65rem;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    border-radius: 999px;
                    background: color-mix(in srgb, var(--guindo) 10%, transparent);
                    color: var(--guindo);
                    padding: 0.32rem 0.55rem;
                    font-size: 0.72rem;
                    font-weight: 850;
                }

                .actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.55rem;
                    margin-top: 1rem;
                }

                .action-btn {
                    border: 1px solid var(--border);
                    border-radius: 0.8rem;
                    background: var(--surface-soft);
                    color: var(--guindo);
                    padding: 0.55rem 0.75rem;
                    font-size: 0.78rem;
                    font-weight: 900;
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
                            Proyecto de grado
                        </div>

                        <h1 className="title">{proyecto.titulo}</h1>

                        <p className="description">
                            {proyecto.descripcion || 'Sin descripción registrada.'}
                        </p>

                        <div className="meta-grid">
                            <div className="meta-card">
                                <span>Código</span>
                                <strong>{proyecto.codigo}</strong>
                            </div>

                            <div className="meta-card">
                                <span>Estado</span>
                                <strong>{label(proyecto.estado)}</strong>
                            </div>

                            <div className="meta-card">
                                <span>Estudiante</span>
                                <strong>{proyecto.estudiante?.name || 'Sin estudiante'}</strong>
                            </div>

                            <div className="meta-card">
                                <span>Tutor</span>
                                <strong>{proyecto.tutor?.name || 'Sin tutor'}</strong>
                            </div>
                        </div>

                        <div className="actions">
                            {permisos.puede_subir_entrega && (
                                <button className="action-btn" type="button">Subir entrega</button>
                            )}

                            {permisos.puede_observar && (
                                <button className="action-btn" type="button">Registrar observación</button>
                            )}

                            {permisos.puede_revisar && (
                                <button className="action-btn" type="button">Registrar revisión</button>
                            )}
                        </div>
                    </section>

                    <section className="content-grid">
                        <div className="panel">
                            <h2 className="section-title">
                                <FileText className="h-5 w-5" />
                                Entregas del estudiante
                            </h2>

                            {proyecto.entregas.length === 0 ? (
                                <p className="description">Todavía no existen entregas registradas.</p>
                            ) : (
                                <div className="timeline">
                                    {proyecto.entregas.map((entrega) => (
                                        <article key={entrega.id} className="entrega-card">
                                            <strong>Versión {entrega.numero_version}: {entrega.titulo}</strong>
                                            <p>{entrega.descripcion || 'Sin descripción.'}</p>
                                            <span>Estado: {label(entrega.estado)} · {formatDate(entrega.created_at)}</span>

                                            <div className="badge-row">
                                                <span className="badge"><FileText className="h-3.5 w-3.5" /> {entrega.archivos.length} archivos</span>
                                                <span className="badge"><MessageSquareText className="h-3.5 w-3.5" /> {entrega.observaciones.length} observaciones</span>
                                                <span className="badge"><Activity className="h-3.5 w-3.5" /> {entrega.revisiones.length} revisiones</span>
                                            </div>
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

                            {linea_tiempo.length === 0 ? (
                                <p className="description">Todavía no existen eventos de seguimiento.</p>
                            ) : (
                                <div className="timeline">
                                    {linea_tiempo.map((evento, index) => (
                                        <article key={`${evento.tipo}-${index}`} className="timeline-card">
                                            <strong>{evento.titulo}</strong>
                                            <p>{evento.descripcion}</p>
                                            <span>{formatDate(evento.fecha)} · {evento.actor?.name || 'Usuario no identificado'}</span>
                                            {evento.comentario && <p>{evento.comentario}</p>}
                                        </article>
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

                        <div className="badge-row">
                            <span className="badge"><UserRound className="h-3.5 w-3.5" /> Estudiante: {proyecto.estudiante?.name || 'Sin estudiante'}</span>
                            <span className="badge"><UserRound className="h-3.5 w-3.5" /> Tutor: {proyecto.tutor?.name || 'Sin tutor'}</span>
                            {proyecto.revisores.map((revisor) => (
                                <span key={revisor?.id} className="badge"><UserRound className="h-3.5 w-3.5" /> Revisor: {revisor?.name}</span>
                            ))}
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
