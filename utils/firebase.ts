import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    projectId: "c1002-quarters-app",
    appId: "1:1014019726788:web:34166fbcdb8bbec3345891",
    storageBucket: "c1002-quarters-app.firebasestorage.app",
    apiKey: "AIzaSyBtRnDmkzOhqE-rVVjR2x-BDuCkSQ8dz4M",
    authDomain: "c1002-quarters-app.firebaseapp.com",
    messagingSenderId: "1014019726788",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
