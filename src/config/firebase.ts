import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração fornecida pelo Firebase Console
export const firebaseConfig = {
  apiKey: "AIzaSyB0G-7EZjbgaCjcKmRvJrA28jmImTUhLGg",
  authDomain: "app-teste-7f0eb.firebaseapp.com",
  projectId: "app-teste-7f0eb",
  storageBucket: "app-teste-7f0eb.firebasestorage.app",
  messagingSenderId: "972617937734",
  appId: "1:972617937734:web:267b7b107305c847c0ab47",
  measurementId: "G-NRE05CFTYN",
};

// Evita reinicialização em recarregamentos do Metro / Fast Refresh
export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
