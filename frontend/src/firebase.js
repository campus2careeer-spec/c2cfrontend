// Import the required functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
// Importing Firebase Authentication tools specifically for Google Login
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your exact web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhJ__s_EuiBgXwFxxNqu5NevUDETlTBjY",
  authDomain: "student-industry-portal.firebaseapp.com",
  projectId: "student-industry-portal",
  storageBucket: "student-industry-portal.firebasestorage.app",
  messagingSenderId: "69686626174",
  appId: "1:69686626174:web:f4a90ba352c2be6243d52f",
  measurementId: "G-XJR0BNMYGD"
};

// Initialize the Firebase Application
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it so login.jsx can use it
export const auth = getAuth(app);

// Initialize the Google Authentication Provider and export it
export const provider = new GoogleAuthProvider();