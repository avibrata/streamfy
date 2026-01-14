// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG FROM CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyAQPGi6y3S-6tEgXhVVVmOIuAqHwhget8E",
    authDomain: "streamfy-5aa89.firebaseapp.com",
    projectId: "streamfy-5aa89",
    storageBucket: "streamfy-5aa89.firebasestorage.app",
    messagingSenderId: "47275254507",
    appId: "1:47275254507:web:8e49c229c611079ea354ae",
    measurementId: "G-WF5ZGBP3VR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
