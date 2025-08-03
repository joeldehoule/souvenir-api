// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCFFxaHoK4kePQdE9SigKN0N7zQ6ZKUUXQ",
  authDomain: "memento-64af5.firebaseapp.com",
  projectId: "memento-64af5",
  storageBucket: "memento-64af5.firebasestorage.app",
  messagingSenderId: "594439850594",
  appId: "1:594439850594:web:f287920611507bb1891f3b",
  measurementId: "G-N95EEDQ2TC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };