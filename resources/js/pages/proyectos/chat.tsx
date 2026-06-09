import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, MessageSquareText, ShieldCheck } from 'lucide-react';
import ProjectChat from '@/components/proyectos/project-chat';

type Proyecto = {
    id: number;
    codigo: string;
    titulo: string;
    estado: string;
};

type AuthUser = {
    id: number;
    name: string;
    email: string;
    rol: string;
};

type Props = {
    proyecto: Proyecto;
    threadId: string;
    participantIds: string[];
};

const ESTADO_LABEL: Record<string, string> = {
    en_revision: 'En revisión',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    en_desarrollo: 'En desarrollo',
    observado: 'Observado',
    concluido: 'Concluido',
};

export default function ChatProyecto({ proyecto, threadId, participantIds }: Props) {
    const page = usePage<{ auth: { user: AuthUser } }>();
    const authUser = page.props.auth.user;

    return (
        <>
            <Head title={`Chat - ${proyecto.codigo}`} />

            <style>{`
                .chat-page {
                    min-height: 100vh;
                    color: #24151A;
                    background:
                        radial-gradient(circle at 92% 8%, rgba(201,168,76,0.20), transparent 30%),
                        radial-gradient(circle at 0% 92%, rgba(107,18,48,0.14), transparent 36%),
                        linear-gradient(135deg, #FAF8F5 0%, #F5F0EA 42%, #F6EEDC 100%);
                }

                @media (prefers-color-scheme: dark) {
                    .chat-page {
                        color: #F4EEE9;
                        background:
                            radial-gradient(circle at 95% 6%, rgba(214,185,106,0.16), transparent 28%),
                            radial-gradient(circle at 2% 98%, rgba(184,80,112,0.16), transparent 34%),
                            linear-gradient(135deg, #2B1620 0%, #24121A 46%, #351B28 100%);
                    }
                }

                .chat-shell {
                    width: min(1180px, 100%);
                    height: 100vh;
                    margin: 0 auto;
                    padding: 1rem;
                    display: grid;
                    grid-template-rows: auto minmax(0, 1fr);
                    gap: 1rem;
                }

                @media (min-width: 768px) {
                    .chat-shell {
                        padding: 1.25rem;
                    }
                }

                .chat-header {
                    border-radius: 1.35rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.72);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                    padding: 1rem;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                }

                @media (prefers-color-scheme: dark) {
                    .chat-header {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }
                }

                .chat-eyebrow {
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
                    .chat-eyebrow {
                        color: #D6B96A;
                    }
                }

                .chat-title {
                    margin-top: 0.35rem;
                    font-size: clamp(1.4rem, 2vw, 2rem);
                    font-weight: 950;
                    line-height: 1.05;
                    letter-spacing: -0.04em;
                }

                .chat-subtitle {
                    margin-top: 0.45rem;
                    max-width: 760px;
                    color: #6E6458;
                    font-size: 0.9rem;
                    line-height: 1.45;
                }

                @media (prefers-color-scheme: dark) {
                    .chat-subtitle {
                        color: #A9978D;
                    }
                }

                .chat-meta {
                    margin-top: 0.75rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .chat-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    border-radius: 999px;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.62);
                    padding: 0.35rem 0.7rem;
                    color: #4B4038;
                    font-size: 0.72rem;
                    font-weight: 800;
                }

                @media (prefers-color-scheme: dark) {
                    .chat-chip {
                        border-color: rgba(214,185,106,0.16);
                        background: rgba(255,255,255,0.06);
                        color: #F4EEE9;
                    }
                }

                .chat-back {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.45rem;
                    min-height: 2.5rem;
                    border-radius: 0.85rem;
                    border: 1px solid rgba(107,18,48,0.16);
                    background: #6B1230;
                    padding: 0.65rem 0.9rem;
                    color: white;
                    font-size: 0.82rem;
                    font-weight: 900;
                    white-space: nowrap;
                    transition: transform .14s, background .14s, box-shadow .14s;
                }

                .chat-back:hover {
                    background: #4A0D21;
                    box-shadow: 0 10px 24px rgba(107,18,48,0.18);
                    transform: translateY(-1px);
                }

                @media (prefers-color-scheme: dark) {
                    .chat-back {
                        background: #D4849A;
                        color: #2B1620;
                        border-color: rgba(214,185,106,0.18);
                    }

                    .chat-back:hover {
                        background: #E6A6B8;
                    }
                }

                .chat-main {
                    min-height: 0;
                    display: grid;
                }

                .chat-card {
                    min-height: 0;
                    display: grid;
                    grid-template-rows: auto minmax(0, 1fr) auto auto;
                    overflow: hidden;
                    border-radius: 1.35rem;
                    border: 1px solid rgba(107,18,48,0.12);
                    background: rgba(255,255,255,0.76);
                    box-shadow: 0 14px 34px rgba(107,18,48,0.08);
                    backdrop-filter: blur(10px);
                }

                @media (prefers-color-scheme: dark) {
                    .chat-card {
                        border-color: rgba(214,185,106,0.14);
                        background: rgba(255,255,255,0.045);
                        box-shadow: 0 14px 34px rgba(18,7,12,0.22);
                    }
                }

                .chat-card-header {
                    border-bottom: 1px solid rgba(107,18,48,0.10);
                    padding: 0.9rem 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }

                @media (prefers-color-scheme: dark) {
                    .chat-card-header {
                        border-bottom-color: rgba(214,185,106,0.12);
                    }
                }

                .chat-card-title {
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    font-size: 0.95rem;
                    font-weight: 950;
                }

                .chat-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    border-radius: 999px;
                    padding: 0.3rem 0.65rem;
                    font-size: 0.7rem;
                    font-weight: 900;
                    background: rgba(63,157,88,0.12);
                    color: #2F7A43;
                }

                .chat-status.is-loading {
                    background: rgba(201,168,76,0.16);
                    color: #9A6C18;
                }

                .chat-status.is-error {
                    background: rgba(185,28,28,0.12);
                    color: #B91C1C;
                }

                @media (prefers-color-scheme: dark) {
                    .chat-status {
                        color: #9FE0B0;
                    }

                    .chat-status.is-loading {
                        color: #D6B96A;
                    }

                    .chat-status.is-error {
                        color: #FFB4B4;
                    }
                }

                .messages-area {
                    min-height: 0;
                    overflow-y: auto;
                    padding: 1rem;
                    scroll-behavior: smooth;
                }

                .empty-state {
                    height: 100%;
                    min-height: 260px;
                    display: grid;
                    place-items: center;
                    border: 1px dashed rgba(107,18,48,0.18);
                    border-radius: 1rem;
                    color: #6E6458;
                    text-align: center;
                    padding: 1.5rem;
                }

                @media (prefers-color-scheme: dark) {
                    .empty-state {
                        border-color: rgba(214,185,106,0.18);
                        color: #A9978D;
                    }
                }

                .message-stack {
                    display: grid;
                    gap: 0.7rem;
                }

                .message-row {
                    display: flex;
                }

                .message-row.is-mine {
                    justify-content: flex-end;
                }

                .message-bubble {
                    max-width: min(720px, 78%);
                    border-radius: 1rem;
                    padding: 0.75rem 0.9rem;
                    background: rgba(255,255,255,0.72);
                    border: 1px solid rgba(107,18,48,0.10);
                    color: #24151A;
                    box-shadow: 0 8px 18px rgba(40,15,25,0.06);
                }

                .message-row.is-mine .message-bubble {
                    background: #6B1230;
                    color: white;
                    border-color: transparent;
                }

                @media (prefers-color-scheme: dark) {
                    .message-bubble {
                        background: rgba(255,255,255,0.07);
                        border-color: rgba(214,185,106,0.12);
                        color: #F4EEE9;
                    }

                    .message-row.is-mine .message-bubble {
                        background: #D4849A;
                        color: #2B1620;
                    }
                }

                .message-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.75rem;
                    margin-bottom: 0.3rem;
                    font-size: 0.68rem;
                    font-weight: 900;
                    opacity: 0.78;
                }

                .message-text {
                    white-space: pre-wrap;
                    word-break: break-word;
                    font-size: 0.9rem;
                    line-height: 1.45;
                }

                .chat-error {
                    margin: 0 1rem 0.75rem;
                    border-radius: 0.85rem;
                    border: 1px solid rgba(185,28,28,0.18);
                    background: rgba(185,28,28,0.08);
                    color: #B91C1C;
                    padding: 0.7rem 0.85rem;
                    font-size: 0.82rem;
                    font-weight: 700;
                }

                @media (prefers-color-scheme: dark) {
                    .chat-error {
                        color: #FFB4B4;
                    }
                }

                .composer {
                    border-top: 1px solid rgba(107,18,48,0.10);
                    padding: 0.8rem;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 0.7rem;
                    align-items: end;
                }

                @media (prefers-color-scheme: dark) {
                    .composer {
                        border-top-color: rgba(214,185,106,0.12);
                    }
                }

                .composer-field {
                    min-height: 2.8rem;
                    max-height: 8rem;
                    resize: vertical;
                    border-radius: 0.95rem;
                    border: 1px solid rgba(107,18,48,0.14);
                    background: rgba(255,255,255,0.74);
                    padding: 0.75rem 0.85rem;
                    color: #24151A;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    outline: none;
                }

                .composer-field:focus {
                    border-color: #6B1230;
                    box-shadow: 0 0 0 3px rgba(107,18,48,0.10);
                }

                @media (prefers-color-scheme: dark) {
                    .composer-field {
                        border-color: rgba(214,185,106,0.16);
                        background: rgba(255,255,255,0.06);
                        color: #F4EEE9;
                    }

                    .composer-field:focus {
                        border-color: #D6B96A;
                        box-shadow: 0 0 0 3px rgba(214,185,106,0.10);
                    }
                }

                .send-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.45rem;
                    min-height: 2.8rem;
                    border-radius: 0.95rem;
                    border: 0;
                    background: #6B1230;
                    padding: 0 1rem;
                    color: white;
                    font-size: 0.84rem;
                    font-weight: 950;
                    cursor: pointer;
                    transition: transform .14s, opacity .14s, background .14s;
                }

                .send-btn:hover:not(:disabled) {
                    background: #4A0D21;
                    transform: translateY(-1px);
                }

                .send-btn:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                @media (prefers-color-scheme: dark) {
                    .send-btn {
                        background: #D4849A;
                        color: #2B1620;
                    }

                    .send-btn:hover:not(:disabled) {
                        background: #E6A6B8;
                    }
                }

                .composer-footer {
                    grid-column: 1 / -1;
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    color: #6E6458;
                    font-size: 0.72rem;
                    font-weight: 700;
                }

                @media (prefers-color-scheme: dark) {
                    .composer-footer {
                        color: #A9978D;
                    }
                }

                @media (max-width: 640px) {
                    .chat-shell {
                        height: 100dvh;
                        padding: 0.75rem;
                    }

                    .chat-header {
                        flex-direction: column;
                    }

                    .chat-back {
                        width: 100%;
                    }

                    .message-bubble {
                        max-width: 92%;
                    }

                    .composer {
                        grid-template-columns: 1fr;
                    }

                    .send-btn {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="chat-page">
                <div className="chat-shell">
                    <section className="chat-header">
                        <div>
                            <div className="chat-eyebrow">
                                <MessageSquareText className="h-4 w-4" />
                                Mensajería académica
                            </div>

                            <h1 className="chat-title">Chat del proyecto</h1>

                            <p className="chat-subtitle">
                                {proyecto.titulo}
                            </p>

                            <div className="chat-meta">
                                <span className="chat-chip">{proyecto.codigo}</span>
                                <span className="chat-chip">
                                    {ESTADO_LABEL[proyecto.estado] ?? proyecto.estado}
                                </span>
                                <span className="chat-chip">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {authUser.rol}
                                </span>
                                <span className="chat-chip">
                                    {participantIds.length} participante{participantIds.length === 1 ? '' : 's'}
                                </span>
                            </div>
                        </div>

                        <Link href="/proyectos" className="chat-back">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </section>

                    <main className="chat-main">
                        <ProjectChat threadId={threadId} authUser={authUser} />
                    </main>
                </div>
            </div>
        </>
    );
}