import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App securely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Access Firestore database with correct databaseId
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
