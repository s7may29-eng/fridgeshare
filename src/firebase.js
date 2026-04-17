import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCm0WAwIjRNoCnQ_aKn2Wn7WJn-BpnAnYM',
  authDomain: 'homestock-d190e.firebaseapp.com',
  databaseURL: 'https://homestock-d190e-default-rtdb.firebaseio.com',
  projectId: 'homestock-d190e',
  storageBucket: 'homestock-d190e.firebasestorage.app',
  messagingSenderId: '297885982766',
  appId: '1:297885982766:web:eeac086cbb7d2103647fbf',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Promise that resolves once Firebase anonymous auth is ready. The app's own
// email/password login is independent of this — anon auth is only a gate so
// that the security rule `auth != null` can block external direct DB access.
export const authReady = new Promise((resolve) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) { unsub(); resolve(user); }
  });
  signInAnonymously(auth).catch((err) => {
    console.error('anonymous sign-in failed:', err);
    unsub();
    resolve(null);
  });
});
