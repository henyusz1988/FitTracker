import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence to local (default, but explicit for clarity)
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Failed to set persistence", err);
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Helper to convert username to a format Firebase Auth accepts
export const getEmailFromUsername = (username: string) => `${username.toLowerCase()}@gymbro-app.com`;

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
};
