// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA-pnrL3UbNaAs48sgXhcO0tyIrcUmwMxI",
  authDomain: "cachoeira-reservas.firebaseapp.com",
  projectId: "cachoeira-reservas",
  storageBucket: "cachoeira-reservas.firebasestorage.app",
  messagingSenderId: "487018223797",
  appId: "1:487018223797:web:2fe1a7e31319c58adac6fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for global use
window.auth = auth;
window.db = db;
window.firebaseApp = app;

console.log('🔥 Firebase initialized successfully');

