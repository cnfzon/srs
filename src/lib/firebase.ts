import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // 1. 導入 Realtime Database

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://srs-project-ed932-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// 確保 SSR 環境下不會重複初始化
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 原有的 Firestore 與 Auth 功能
export const auth = getAuth(app);
export const db = getFirestore(app); 

export const rtdb = getDatabase(app); 

// Google Auth Provider 設定
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");