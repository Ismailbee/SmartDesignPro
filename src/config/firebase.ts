/**
 * Firebase Configuration
 * Initialize Firebase services using environment variables
 *
 * Environment variables are loaded from .env file
 * Make sure to add .env to .gitignore to keep your keys secure!
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { type Firestore, persistentLocalCache, persistentMultipleTabManager, initializeFirestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

// Validate environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingVars: string[] = []
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    missingVars.push(envVar)
  }
}

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars)
  console.error('📝 Please check your .env file and restart the dev server')
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

try {
  console.log('🔧 Initializing Firebase...')
  app = initializeApp(firebaseConfig)
  console.log('✅ Firebase app initialized')

  auth = getAuth(app)
  console.log('✅ Firebase auth initialized')

  // Initialize Firestore with persistent cache (new API replaces enableMultiTabIndexedDbPersistence)
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    })
    console.log('✅ Firestore initialized with persistent cache')
  } catch (firestoreError) {
    console.warn('⚠️ Firestore persistent cache failed, using in-memory cache:', firestoreError)
    // Fallback to in-memory cache
    db = initializeFirestore(app, {})
    console.log('✅ Firestore initialized with in-memory cache')
  }

  storage = getStorage(app)
  console.log('✅ Firebase storage initialized')

  console.log('✅ Firebase initialized successfully')
  console.log('📊 Project ID:', firebaseConfig.projectId)
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
  console.error('Error details:', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
  throw error
}

// Export Firebase services
export { app, auth, db, storage }

// Export Firebase SDK functions for convenience
export {
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  type User as FirebaseUser
} from 'firebase/auth'

export {
  // Firestore functions
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot
} from 'firebase/firestore'

export {
  // Storage functions
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadTask
} from 'firebase/storage'

