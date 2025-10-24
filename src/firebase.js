// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHMPT7nGXG4Y62kxwiYDhyz5vf4m8rDNk",
  authDomain: "community-care-platform.firebaseapp.com",
  projectId: "community-care-platform",
  storageBucket: "community-care-platform.firebasestorage.app",
  messagingSenderId: "357891491779",
  appId: "1:357891491779:web:ec780c87fd0a87b0669f76",
  measurementId: "G-9KC585MP04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
auth.useDeviceLanguage(); // Use the default browser language

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Remove performance monitoring for compatibility

// Enable offline persistence for Firestore (browser only)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.log('The current browser does not support persistence.');
      }
    });
}

export { app, auth, db };