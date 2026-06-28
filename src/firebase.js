import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC4nr2ABymvXRiDmAVaOQf9SNSFGzMxp54",
  authDomain: "trading-checklist-9c553.firebaseapp.com",
  projectId: "trading-checklist-9c553",
  storageBucket: "trading-checklist-9c553.firebasestorage.app",
  messagingSenderId: "740192906786",
  appId: "1:740192906786:web:b257b5deb3cd59e474247b",
  measurementId: "G-XYMEBNTTCM"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);