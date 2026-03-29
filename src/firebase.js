import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

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
