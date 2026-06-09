import { useEffect, useMemo, useRef, useState } from 'react';
import {
    addDoc,
    collection,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
} from 'firebase/firestore';
import { Check, Edit3, Send, Trash2, X } from 'lucide-react';
import { ensureFirebaseSession, firestoreDb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

type AuthUser = {
    id: number;
    name: string;
    email: string;
    rol: string;
};

type Message = {
    id: string;
    text: string;
    senderUid: string;
    senderName: string;
    senderRole: string;
    createdAt: Timestamp | null;
    updatedAt?: Timestamp | null;
    editedAt?: Timestamp | null;
    deletedAt?: Timestamp | null;
    deletedByUid?: string | null;
    deletedByName?: string | null;
};


function withFirestoreTimeout<T>(promise: Promise<T>, action = 'operación') {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            setTimeout(() => {
                reject(
                    new Error(
                        `La ${action} en Firestore tardó demasiado. Desactiva bloqueadores para localhost y firestore.googleapis.com.`,
                    ),
                );
            }, 10000);
        }),
    ]);
}

export default function ProjectChat({
    threadId,
    authUser,
}: {
    threadId: string;
    authUser: AuthUser;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentUid, setCurrentUid] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    const messagesRef = useMemo(
        () => collection(firestoreDb, 'project_threads', threadId, 'messages'),
        [threadId],
    );

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        let active = true;

        ensureFirebaseSession()
            .then((uid) => {
                if (!active) return;

                setCurrentUid(uid);

                const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

                unsubscribe = onSnapshot(
                    q,
                    (snapshot) => {
                        const rows = snapshot.docs.map((snapshotDoc) => ({
                            id: snapshotDoc.id,
                            ...(snapshotDoc.data() as Omit<Message, 'id'>),
                        }));

                        setMessages(rows);
                        setLoading(false);
                        setError(null);

                        setTimeout(() => {
                            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                    },
                    (err) => {
                        setError(err.message || 'No se pudo cargar el chat.');
                        setLoading(false);
                    },
                );
            })
            .catch((err) => {
                setError(err.message || 'No se pudo iniciar la sesion de chat.');
                setLoading(false);
            });

        return () => {
            active = false;
            if (unsubscribe) unsubscribe();
        };
    }, [messagesRef]);

    const isMyMessage = (message: Message) => {
        return message.senderUid === currentUid || message.senderUid === String(authUser.id);
    };

    const isDeleted = (message: Message) => {
        return Boolean(message.deletedAt);
    };

    const sendMessage = async () => {
        const clean = text.trim();

        if (!clean || sending) return;

        if (clean.length > 2000) {
            setError('El mensaje no puede superar los 2000 caracteres.');
            return;
        }

        setSending(true);
        setError(null);

        try {
            const uid = await ensureFirebaseSession();
            setCurrentUid(uid);

            await addDoc(messagesRef, {
                text: clean,
                senderUid: uid,
                senderName: authUser.name,
                senderRole: authUser.rol,
                createdAt: serverTimestamp(),
                updatedAt: null,
                editedAt: null,
                deletedAt: null,
                deletedByUid: null,
                deletedByName: null,
            });

            setText('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.');
        } finally {
            setSending(false);
        }
    };

    const startEdit = (message: Message) => {
        if (!isMyMessage(message) || isDeleted(message)) return;

        setError(null);
        setEditingId(message.id);
        setEditingText(message.text);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingText('');
        setSavingEdit(false);
    };

    const saveEdit = async (message: Message) => {
        const clean = editingText.trim();

        if (!clean || savingEdit) return;

        if (clean.length > 2000) {
            setError('El mensaje editado no puede superar los 2000 caracteres.');
            return;
        }

        if (!isMyMessage(message) || isDeleted(message)) {
            setError('No puedes editar este mensaje.');
            return;
        }

        setSavingEdit(true);
        setError(null);

        try {
            const uid = await ensureFirebaseSession();
            setCurrentUid(uid);

            if (message.senderUid !== uid && message.senderUid !== String(authUser.id)) {
                setError('No puedes editar un mensaje de otro usuario.');
                return;
            }

            await withFirestoreTimeout(
                updateDoc(doc(messagesRef, message.id), {
                    text: clean,
                    editedAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                }),
                'edición del mensaje',
            );

            cancelEdit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo editar el mensaje.');
        } finally {
            setSavingEdit(false);
        }
    };

    const deleteMessage = async (message: Message) => {
        if (deletingId || !isMyMessage(message) || isDeleted(message)) return;

        setDeletingId(message.id);
        setError(null);

        try {
            const uid = await ensureFirebaseSession();
            setCurrentUid(uid);

            if (message.senderUid !== uid && message.senderUid !== String(authUser.id)) {
                setError('No puedes eliminar un mensaje de otro usuario.');
                return;
            }

            await withFirestoreTimeout(
                updateDoc(doc(messagesRef, message.id), {
                    text: '',
                    deletedAt: serverTimestamp(),
                    deletedByUid: uid,
                    deletedByName: authUser.name,
                    updatedAt: serverTimestamp(),
                }),
                'eliminación del mensaje',
            );

            if (editingId === message.id) {
                cancelEdit();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar el mensaje.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatTime = (timestamp: Timestamp | null | undefined) => {
        if (!timestamp) return '';

        try {
            return timestamp.toDate().toLocaleString('es-BO', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    return (
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="shrink-0 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <h2 className="text-base font-bold">Mensajería del proyecto</h2>
                <p className="text-xs text-neutral-500">
                    Canal interno para estudiante, tutor, revisores y coordinación.
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {loading && (
                    <div className="text-sm text-neutral-500">Cargando mensajes...</div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                        Todavía no hay mensajes en este proyecto.
                    </div>
                )}

                <div className="space-y-3">
                    {messages.map((message) => {
                        const mine = isMyMessage(message);
                        const deleted = isDeleted(message);
                        const editing = editingId === message.id;
                        const edited = Boolean(message.editedAt) && !deleted;

                        return (
                            <div
                                key={message.id}
                                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                                        mine
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                                    } ${deleted ? 'opacity-75' : ''}`}
                                >
                                    <div className="mb-1 flex items-center justify-between gap-3 text-xs opacity-75">
                                        <span>
                                            {message.senderName} · {message.senderRole}
                                            {formatTime(message.createdAt) && (
                                                <> · {formatTime(message.createdAt)}</>
                                            )}
                                            {edited && <> · editado</>}
                                        </span>

                                        {mine && !deleted && !editing && (
                                            <span className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    className="rounded-md p-1 opacity-80 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
                                                    onClick={() => startEdit(message)}
                                                    title="Editar mensaje"
                                                    aria-label="Editar mensaje"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="rounded-md p-1 opacity-80 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
                                                    onClick={() => deleteMessage(message)}
                                                    disabled={deletingId === message.id}
                                                    title="Eliminar mensaje"
                                                    aria-label="Eliminar mensaje"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        )}
                                    </div>

                                    {deleted ? (
                                        <div className="whitespace-pre-wrap break-words italic opacity-80">
                                            Se eliminó este mensaje
                                        </div>
                                    ) : editing ? (
                                        <div className="space-y-2">
                                            <textarea
                                                className="min-h-20 w-full resize-y rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
                                                value={editingText}
                                                maxLength={2000}
                                                autoFocus
                                                onChange={(event) => setEditingText(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' && !event.shiftKey) {
                                                        event.preventDefault();
                                                        saveEdit(message);
                                                    }

                                                    if (event.key === 'Escape') {
                                                        event.preventDefault();
                                                        cancelEdit();
                                                    }
                                                }}
                                            />

                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded-lg bg-black/10 px-2 py-1 text-xs font-bold hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15"
                                                    onClick={cancelEdit}
                                                    disabled={savingEdit}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded-lg bg-black/15 px-2 py-1 text-xs font-bold hover:bg-black/20 dark:bg-white/15 dark:hover:bg-white/20"
                                                    onClick={() => saveEdit(message)}
                                                    disabled={savingEdit}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Guardar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap break-words">
                                            {message.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div ref={bottomRef} />
            </div>

            {error && (
                <div className="mx-4 mb-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                    {error}
                </div>
            )}

            <div className="flex shrink-0 gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800">
                <textarea
                    className="min-h-10 flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-neutral-700 dark:bg-neutral-900"
                    placeholder="Escribe un mensaje..."
                    value={text}
                    maxLength={2000}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            sendMessage();
                        }
                    }}
                />

                <Button type="button" onClick={sendMessage} disabled={sending || !text.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar
                </Button>
            </div>
        </section>
    );
}
