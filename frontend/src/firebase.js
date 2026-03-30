import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyBj6suHRsNd7-qnGPRZRQXu8b64bW0VNU4",
  authDomain: "netflix-2-0-3eade.firebaseapp.com",
  projectId: "netflix-2-0-3eade",
  storageBucket: "netflix-2-0-3eade.firebasestorage.app",
  messagingSenderId: "1060696814989",
  appId: "1:1060696814989:web:93bba04cf198e4ccd439c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
