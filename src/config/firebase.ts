
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0U12GccUnITqhZjP2pSOGU7ZD5l6qIWU",
  authDomain: "bank-guard---sbg.firebaseapp.com",
  projectId: "bank-guard---sbg",
  storageBucket: "bank-guard---sbg.firebasestorage.app",
  messagingSenderId: "421507292818",
  appId: "1:421507292818:web:e36903cff3160fe932104b",
  measurementId: "G-0SQCEPTH3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
