// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg5izkS2umevYpp-s5tSG1loV3tAxMcNM",
  authDomain: "whisp-7e436.firebaseapp.com",
  projectId: "whisp-7e436",
  storageBucket: "whisp-7e436.firebasestorage.app",
  messagingSenderId: "889917678099",
  appId: "1:889917678099:web:a660549708840cfdd355e6",
  measurementId: "G-85PLJQGE0V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const firestore = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();