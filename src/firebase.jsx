import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

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
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, firestore, googleProvider };