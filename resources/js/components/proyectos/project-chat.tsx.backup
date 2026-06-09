import { useEffect, useMemo, useRef, useState } from 'react';
import {
    addDoc,
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { Send } from 'lucide-react';
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
};

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
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const messagesRef = useMemo(
        () => collection(firestoreDb, 'project_threads', threadId, 'messages'),
        [threadId],
    );

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        let active = true;

        ensureFirebaseSession()
            .then(() => {
                if (!active) return;

                const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

                unsubscribe = onSnapshot(
                    q,
                    (snapshot) => {
                        const rows = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...(doc.data() as Omit<Message, 'id'>),
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

            await addDoc(messagesRef, {
                text: clean,
                senderUid: uid,
                senderName: authUser.name,
                senderRole: authUser.rol,
                createdAt: serverTimestamp(),
            });

            setText('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.');
        } finally {
            setSending(false);
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
                        const mine = message.senderUid === String(authUser.id);

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
                                    }`}
                                >
                                    <div className="mb-1 text-xs opacity-75">
                                        {message.senderName} · {message.senderRole}
                                    </div>

                                    <div className="whitespace-pre-wrap break-words">
                                        {message.text}
                                    </div>
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
