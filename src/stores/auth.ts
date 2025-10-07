/**
 * Authentication Store
 * Now using Firebase Authentication
 */

import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import type {
  User,
  RegisterData,
  LoginData,
  PasswordResetRequest,
  AuthModalView
} from '@/types/auth'
import * as firebaseAuth from '@/services/firebase-auth'

const USER_KEY = 'user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Auth Modal State
  const isAuthModalOpen = ref(false)
  const authModalView = ref<AuthModalView>('login')

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const accessToken = computed(() => user.value?.id || null) // Firebase uses UID as token
  const userDisplayName = computed(() => {
    if (!user.value) return ''
    if (user.value.name) return user.value.name
    if (user.value.firstName && user.value.lastName) {
      return `${user.value.firstName} ${user.value.lastName}`
    }
    return user.value.username || user.value.email
  })

  // Actions

  /**
   * Initialize auth - Listen to Firebase auth state changes
   */
  function initAuth() {
    // Set up Firebase auth state listener
    firebaseAuth.onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        user.value = firebaseUser
        localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))
      } else {
        user.value = null
        localStorage.removeItem(USER_KEY)
      }
    })

    // Try to restore user from localStorage (for immediate UI update)
    try {
      const storedUser = localStorage.getItem(USER_KEY)
      if (storedUser) {
        user.value = JSON.parse(storedUser)
      }
    } catch (err) {
      console.error('Failed to restore user from localStorage:', err)
    }
  }

  /**
   * Clear auth data
   */
  function clearAuth() {
    user.value = null
    localStorage.removeItem(USER_KEY)
  }

  /**
   * Register new user with Firebase
   */
  async function registerUser(data: RegisterData): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const firebaseUser = await firebaseAuth.registerWithEmail(data)
      user.value = firebaseUser
      localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))
      closeAuthModal()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login user with Firebase
   */
  async function loginUser(data: LoginData): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const firebaseUser = await firebaseAuth.loginWithEmail(data)
      user.value = firebaseUser
      localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))
      closeAuthModal()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with Google
   */
  async function loginWithGoogle() {
    isLoading.value = true
    error.value = null

    try {
      const firebaseUser = await firebaseAuth.loginWithGoogle()
      user.value = firebaseUser
      localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))
      closeAuthModal()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logoutUser(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await firebaseAuth.logout()
    } catch (err: any) {
      console.error('Logout error:', err)
      error.value = err.message
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  /**
   * Request password reset
   */
  async function requestPasswordReset(data: PasswordResetRequest): Promise<string | undefined> {
    isLoading.value = true
    error.value = null

    try {
      await firebaseAuth.resetPassword(data.email)
      // Firebase sends email automatically
      return undefined
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Open auth modal
   */
  function openAuthModal(view: AuthModalView = 'login') {
    authModalView.value = view
    isAuthModalOpen.value = true
    error.value = null
  }

  /**
   * Close auth modal
   */
  function closeAuthModal() {
    isAuthModalOpen.value = false
    error.value = null
  }

  /**
   * Set auth modal view
   */
  function setAuthModalView(view: AuthModalView) {
    authModalView.value = view
    error.value = null
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null
  }

  // Initialize on store creation
  initAuth()

  return {
    // State
    user,
    accessToken,
    isLoading,
    error,
    isAuthModalOpen,
    authModalView,

    // Computed
    isAuthenticated,
    userDisplayName,

    // Actions
    initAuth,
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    requestPasswordReset,
    openAuthModal,
    closeAuthModal,
    setAuthModalView,
    clearError
  }
})

