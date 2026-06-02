import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyATqXKz26pbAEEn6XvzIBopSkeFbnHq-Mc",
    authDomain: "travelapp-48b36.firebaseapp.com",
    databaseURL: "https://travelapp-48b36-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "travelapp-48b36",
    storageBucket: "travelapp-48b36.firebasestorage.app",
    messagingSenderId: "143827355724",
    appId: "1:143827355724:web:604bd426e9e5f2cba18ce9",
    measurementId: "G-YY9EHLS12V",
};

const app = initializeApp(firebaseConfig);

export const realtimeDb = getDatabase(app);
