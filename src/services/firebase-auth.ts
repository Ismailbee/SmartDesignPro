/**
 * Firebase Authentication Service
 * Handles all Firebase authentication operations
 */

import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type FirebaseUser,
  db,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '@/config/firebase'

import type { User, RegisterData, LoginData } from '@/types/auth'

/**
 * Convert Firebase User to our User type
 */
function convertFirebaseUser(firebaseUser: FirebaseUser, additionalData?: any): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || additionalData?.name || '',
    username: additionalData?.username || firebaseUser.email?.split('@')[0] || '',
    firstName: additionalData?.firstName || '',
    lastName: additionalData?.lastName || '',
    avatar: firebaseUser.photoURL || additionalData?.avatar || '',
    role: additionalData?.role || 'user',
    status: additionalData?.status || 'active',
    emailVerified: firebaseUser.emailVerified,
    createdAt: additionalData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
}

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(data: RegisterData): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    )

    const firebaseUser = userCredential.user

    // Update profile with display name
    const displayName = data.username || data.firstName || data.email.split('@')[0]
    await updateProfile(firebaseUser, {
      displayName
    })

    // Create user document in Firestore
    const userData = {
      email: data.email,
      username: data.username || '',
      name: displayName,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: 'user',
      status: 'active',
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), userData)

    // Convert to our User type
    return convertFirebaseUser(firebaseUser, userData)
  } catch (error: any) {
    console.error('Registration error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(data: LoginData): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    )

    const firebaseUser = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    const userData = userDoc.exists() ? userDoc.data() : {}

    // Update last login
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    )

    return convertFirebaseUser(firebaseUser, userData)
  } catch (error: any) {
    console.error('Login error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Login with Google
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const firebaseUser = userCredential.user

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    
    let userData
    if (!userDoc.exists()) {
      // Create new user document
      userData = {
        email: firebaseUser.email || '',
        username: firebaseUser.email?.split('@')[0] || '',
        name: firebaseUser.displayName || '',
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        avatar: firebaseUser.photoURL || '',
        role: 'user',
        status: 'active',
        emailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)
    } else {
      userData = userDoc.data()
      // Update last login
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      )
    }

    return convertFirebaseUser(firebaseUser, userData)
  } catch (error: any) {
    console.error('Google login error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error: any) {
    console.error('Logout error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error('Password reset error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      const userData = userDoc.exists() ? userDoc.data() : {}
      callback(convertFirebaseUser(firebaseUser, userData))
    } else {
      callback(null)
    }
  })
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}

/**
 * Get Firebase error message
 */
function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak (minimum 6 characters)',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Sign-in was cancelled'
  }

  return errorMessages[errorCode] || 'An error occurred. Please try again'
}

/**
 * Get user data from Firestore
 */
export async function getUserData(userId: string): Promise<any> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    return userDoc.exists() ? userDoc.data() : null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

/**
 * Update user data in Firestore
 */
export async function updateUserData(userId: string, data: any): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...data,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error updating user data:', error)
    throw error
  }
}

