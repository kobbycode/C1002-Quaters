import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
export default app;
