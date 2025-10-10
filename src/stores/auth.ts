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

  // Success Notification State
  const showSuccessNotification = ref(false)
  const successNotificationData = ref({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  })

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
    console.log('🔧 Initializing auth...')

    // Set up Firebase auth state listener
    firebaseAuth.onAuthChange((firebaseUser) => {
      console.log('🔔 Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')

      if (firebaseUser) {
        user.value = firebaseUser
        localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))
        console.log('✅ User authenticated:', firebaseUser.email)
      } else {
        user.value = null
        localStorage.removeItem(USER_KEY)
        console.log('🔓 User logged out')
      }
    })

    // IMPORTANT: Don't restore from localStorage - wait for Firebase auth state
    // This prevents false authentication from stale data
    console.log('⏳ Waiting for Firebase auth state...')
  }

  /**
   * Clear auth data
   */
  function clearAuth() {
    console.log('🧹 Clearing auth data...')
    user.value = null
    localStorage.removeItem(USER_KEY)
    console.log('✅ Auth data cleared')
  }

  /**
   * Force logout and clear all auth data
   */
  function forceLogout() {
    console.log('🚪 Force logout - clearing all data...')
    user.value = null
    localStorage.removeItem(USER_KEY)
    sessionStorage.clear()
    console.log('✅ All auth data cleared')
  }

  /**
   * Register new user with Firebase
   */
  async function registerUser(data: RegisterData): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      console.log('📝 Auth store: Starting registration...')
      const firebaseUser = await firebaseAuth.registerWithEmail(data)
      console.log('✅ Auth store: Registration successful')

      user.value = firebaseUser
      localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))

      // Close modal first
      closeAuthModal()

      // Show success notification
      const userName = firebaseUser.name || firebaseUser.username || firebaseUser.email.split('@')[0]
      showNotification({
        title: 'Account created!',
        message: `Welcome ${userName}! Your account has been created successfully.`,
        type: 'success'
      })

      console.log('✅ Auth store: Registration complete')

      // Redirect to home page after successful registration
      console.log('🔄 Redirecting to home page...')
      setTimeout(() => {
        window.location.href = '/home'
      }, 500)
    } catch (err: any) {
      console.error('❌ Auth store: Registration failed:', err)
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
      console.log('🔐 Auth store: Starting login...')
      const firebaseUser = await firebaseAuth.loginWithEmail(data)
      console.log('✅ Auth store: Login successful')

      user.value = firebaseUser
      localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))

      // Close modal first
      closeAuthModal()

      // Show success notification
      const userName = firebaseUser.name || firebaseUser.username || firebaseUser.email.split('@')[0]
      showNotification({
        title: 'Welcome back!',
        message: `You have successfully logged in as ${userName}`,
        type: 'success'
      })

      console.log('✅ Auth store: Login complete')

      // Check if there's an intended route to redirect to
      const intendedRoute = sessionStorage.getItem('intendedRoute')
      if (intendedRoute) {
        console.log('🔄 Redirecting to intended route:', intendedRoute)
        sessionStorage.removeItem('intendedRoute')
        setTimeout(() => {
          window.location.href = intendedRoute
        }, 500)
      } else {
        // Redirect to home page after successful login
        console.log('🔄 Redirecting to home page...')
        setTimeout(() => {
          window.location.href = '/home'
        }, 500)
      }
    } catch (err: any) {
      console.error('❌ Auth store: Login failed:', err)
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

      // Show success notification
      const userName = firebaseUser.name || firebaseUser.username || firebaseUser.email.split('@')[0]
      showNotification({
        title: 'Welcome!',
        message: `You have successfully logged in as ${userName}`,
        type: 'success'
      })

      // Redirect to home page
      console.log('🔄 Redirecting to home page...')
      setTimeout(() => {
        window.location.href = '/home'
      }, 500)
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

  /**
   * Show success notification
   */
  function showNotification(data: { title: string; message: string; type: 'success' | 'error' | 'info' }) {
    successNotificationData.value = data
    showSuccessNotification.value = true
  }

  /**
   * Close success notification
   */
  function closeNotification() {
    showSuccessNotification.value = false
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
    showSuccessNotification,
    successNotificationData,

    // Computed
    isAuthenticated,
    userDisplayName,

    // Actions
    initAuth,
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    forceLogout,
    requestPasswordReset,
    openAuthModal,
    closeAuthModal,
    setAuthModalView,
    clearError,
    showNotification,
    closeNotification
  }
})

