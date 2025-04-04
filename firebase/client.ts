// Import the functions you need from the SDKs you need
import {initializeApp, getApp, getApps} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAXGypet-d5ZUPvjKSCPslnkCeWJ4Di2M8",
    authDomain: "prepmate-b908c.firebaseapp.com",
    projectId: "prepmate-b908c",
    storageBucket: "prepmate-b908c.firebasestorage.app",
    messagingSenderId: "856299656027",
    appId: "1:856299656027:web:427939433ef3c2d303007e",
    measurementId: "G-B88EHTHYXB"
};

const app = !getApps.length? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);