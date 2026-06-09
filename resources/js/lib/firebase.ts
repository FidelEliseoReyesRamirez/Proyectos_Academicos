import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDjHI9t1hxyvJl_eLNfZI93z3234-PGWdI',
    authDomain: 'prueba-27914.firebaseapp.com',
    projectId: 'prueba-27914',
    storageBucket: 'prueba-27914.firebasestorage.app',
    messagingSenderId: '904870039085',
    appId: '1:904870039085:web:ec8b007f7a22fc5a6732a4',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
});

let firebaseSessionPromise: Promise<string> | null = null;

export async function ensureFirebaseSession(): Promise<string> {
    if (firebaseAuth.currentUser) {
        return firebaseAuth.currentUser.uid;
    }

    if (!firebaseSessionPromise) {
        firebaseSessionPromise = fetch('/firebase/token', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'No se pudo obtener el token de Firebase.');
                }

                return response.json();
            })
            .then(async (data: { token: string }) => {
                const credential = await signInWithCustomToken(firebaseAuth, data.token);
                return credential.user.uid;
            })
            .finally(() => {
                firebaseSessionPromise = null;
            });
    }

    return firebaseSessionPromise;
}
