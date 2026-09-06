import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjiGwHq0KhE5hyZKZgYV7Mj8oiY-B51ek",
    authDomain: "urbanthreadzstore-3b439.firebaseapp.com",
    projectId: "urbanthreadzstore-3b439",
    storageBucket: "urbanthreadzstore-3b439.firebasestorage.app",
    messagingSenderId: "969016162766",
    appId: "1:969016162766:web:62f5b26d30532b5235d39f"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };