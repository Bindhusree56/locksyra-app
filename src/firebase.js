// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQsIf7fKzWOffNi2fvkBS0NB35ya1zTZQ",
  authDomain: "locksyra-bfb12.firebaseapp.com",
  projectId: "locksyra-bfb12",
  storageBucket: "locksyra-bfb12.firebasestorage.app",
  messagingSenderId: "931572563610",
  appId: "1:931572563610:web:b307bc7619ae843f376923",
  measurementId: "G-MKBQL7JK24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app (important)
export { app };
