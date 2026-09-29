import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCHtFEUC58LTEVOaiaC7wj7-FQkFm84c14',
  authDomain: 'proyecto-dm-56ed0.firebaseapp.com',
  projectId: 'proyecto-dm-56ed0',
  storageBucket: 'proyecto-dm-56ed0.firebasestorage.app',
  messagingSenderId: '61821510287',
  appId: '1:61821510287:web:7741acfe495935b3c006fa',
  measurementId: 'G-HJP59DHFSB',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const realtimeDb = getDatabase(app);
export const analytics = isSupported().then((supported) => (supported ? getAnalytics(app) : null));
