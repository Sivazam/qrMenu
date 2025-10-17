import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9f76SkbwC6Dgef8WS6bIS_h5gRL9137k",
  authDomain: "restpossys.firebaseapp.com",
  projectId: "restpossys",
  storageBucket: "restpossys.firebasestorage.app",
  messagingSenderId: "626111912551",
  appId: "1:626111912551:web:21b11b07192e09fd2fd2c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);