import { initializeApp, getApps, getApp } from 'firebase/app';
// Import auth and native persistence directly from the standard firebase/auth package
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Securely load environment variables from the root .env file
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Prevent duplicate app initialization during development hot-reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Conditionally set auth persistence based on platform (Mobile vs Web)
let auth;
if (Platform.OS === 'web') {
  // Web uses standard browser local storage behavior via getAuth
  auth = getAuth(app);
} else {
  // Mobile (iOS/Android) explicitly binds AsyncStorage to keep users logged in
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore database and Storage buckets
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };  