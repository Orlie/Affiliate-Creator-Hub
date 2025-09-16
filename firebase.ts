// Import the functions you need from the SDKs you need
// FIX: Changed firebase import path to use the @firebase scope to resolve module export error.
import { initializeApp } from "@firebase/app";
// FIX: Changed import path from 'firebase/auth' to '@firebase/auth' to resolve missing export members.
import { getAuth } from "@firebase/auth";
// FIX: Changed firebase import path to use the @firebase scope for consistency.
import { getFirestore } from "@firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: "affiliate-creator-hub.firebaseapp.com",
    projectId: "affiliate-creator-hub",
    storageBucket: "affiliate-creator-hub.firebasestorage.app",
    messagingSenderId: "250849880950",
    appId: "1:250849880950:web:4c746b6096b34c68bba857",
    measurementId: "G-YWH0N9RCB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// FIX: Removed Firebase Analytics initialization. The getAnalytics function was causing an import error,
// and the 'analytics' feature was not being used within the application.
export const auth = getAuth(app);
export const db = getFirestore(app);