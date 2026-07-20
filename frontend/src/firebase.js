import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB1Kfuz2ZQUNHagdoyew55lfhKBThtqAvE",
  authDomain: "power-chess-47e62.firebaseapp.com",
  projectId: "power-chess-47e62",
  storageBucket: "power-chess-47e62.firebasestorage.app",
  messagingSenderId: "746429165069",
  appId: "1:746429165069:web:3148f20f674dffd945af44",
  measurementId: "G-5VT5S6CBT7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
