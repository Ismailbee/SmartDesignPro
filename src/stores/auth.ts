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

// 🔧 DEV MODE: Set to true to bypass authentication (auto-login)
// ⚠️ IMPORTANT: Set to false before deploying to production!
const DEV_BYPASS_AUTH = false

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authInitialized = ref(false) // Track if Firebase auth has initialized

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
   * Demo/Testing bypass function for network issues
   */
  const bypassAuthForTesting = () => {
    console.log('🔓 Bypassing authentication for testing...')
    
    const demoUser: User = {
      id: 'demo-user-123',
      username: 'demo_user',
      email: 'demo@example.com',
      name: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      isVerified: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    user.value = demoUser
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
    
    // Set authenticated member data for invoices
    const memberData = {
      name: 'Demo User',
      branch: 'Main Branch',
      role: 'Member'
    };
    localStorage.setItem('authenticatedMember', JSON.stringify(memberData));
    
    closeAuthModal()
    
    console.log('✅ Demo user logged in successfully for testing')
    return demoUser
  }

  /**
   * Initialize auth - Listen to Firebase auth state changes
   */
  function initAuth() {
    console.log('🔧 Initializing auth...')

    // 🔧 DEV MODE: Auto-login bypass
    if (DEV_BYPASS_AUTH) {
      console.log('🚀 DEV MODE: Authentication bypassed - auto-login enabled')
      console.log('⚠️ Remember to set DEV_BYPASS_AUTH = false before production!')
      
      const devUser: User = {
        id: 'dev-user-123',
        email: 'developer@test.com',
        username: 'developer',
        name: 'Dev User',
        firstName: 'Dev',
        lastName: 'User',
        role: 'admin', // Admin role for full access
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      user.value = devUser
      localStorage.setItem(USER_KEY, JSON.stringify(devUser))
      
      // Set authenticated member
      const memberData = {
        name: 'Dev User',
        branch: 'Main Branch',
        role: 'Admin'
      }
      localStorage.setItem('authenticatedMember', JSON.stringify(memberData))
      
      console.log('✅ Auto-logged in as:', devUser.email)
      return
    }

    // Try to restore from localStorage first (for immediate UI update)
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        user.value = parsedUser
        
        // Also restore authenticated member data
        const savedMember = localStorage.getItem('authenticatedMember')
        if (!savedMember && parsedUser) {
          // Create member data if missing
          const userName = parsedUser.displayName || 
                          parsedUser.email?.split('@')[0] || 
                          'User'
          const memberData = {
            name: userName.charAt(0).toUpperCase() + userName.slice(1),
            branch: 'Main Branch',
            role: 'Member'
          }
          localStorage.setItem('authenticatedMember', JSON.stringify(memberData))
        }
        
        console.log('🔄 Restored user from localStorage:', user.value?.email)
        // Mark as initialized since we have valid user data
        authInitialized.value = true
      } catch (error) {
        console.error('❌ Failed to parse saved user:', error)
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem('authenticatedMember')
      }
    }

    // Set up Firebase auth state listener for real-time updates
    firebaseAuth.onAuthChange((firebaseUser) => {
      console.log('🔔 Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')

      if (firebaseUser) {
        user.value = firebaseUser
        localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))
        console.log('✅ User authenticated:', firebaseUser.email)
        
        // Set authenticated member for Invoice/Receipt/Signature pages
        // Extract name from email or display name
        const userName = firebaseUser.displayName || 
                        firebaseUser.email?.split('@')[0] || 
                        'User';
        
        // TODO: In future, fetch branch and role from user profile database
        const memberData = {
          name: userName.charAt(0).toUpperCase() + userName.slice(1), // Capitalize first letter
          branch: 'Main Branch', // Default branch - should be fetched from database
          role: 'Member' // Default role - should be fetched from database
        };
        
        localStorage.setItem('authenticatedMember', JSON.stringify(memberData));
        console.log('✅ Authenticated member set:', memberData);
        
      } else {
        // Only clear if we don't have a valid saved user (to prevent logout on page refresh)
        const savedUser = localStorage.getItem(USER_KEY)
        if (!savedUser) {
          user.value = null
          localStorage.removeItem(USER_KEY)
          localStorage.removeItem('authenticatedMember')
          console.log('🔓 User logged out')
        }
      }

      // Mark auth as initialized after first state change
      if (!authInitialized.value) {
        authInitialized.value = true
        console.log('✅ Auth initialization complete')
      }
    })

    console.log('⏳ Waiting for Firebase auth state...')
  }

  /**
   * Clear auth data
   */
  function clearAuth() {
    console.log('🧹 Clearing auth data...')
    user.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('authenticatedMember')
    console.log('✅ Auth data cleared')
  }

  /**
   * Force logout and clear all auth data
   */
  function forceLogout() {
    console.log('🚪 Force logout - clearing all data...')
    user.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('authenticatedMember')
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
   * Login with Google
   */
  async function loginWithGoogle(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const userData = await firebaseAuth.loginWithGoogle()
      user.value = userData
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      // Set authenticated member
      const memberData = {
        name: userData.name || userData.email?.split('@')[0] || 'User',
        branch: 'Main Branch',
        role: userData.role || 'Member'
      }
      localStorage.setItem('authenticatedMember', JSON.stringify(memberData))

      showNotification({
        title: 'Welcome!',
        message: `Signed in successfully with Google`,
        type: 'success'
      })

      closeAuthModal()
    } catch (err: any) {
      console.error('Google login error:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user's avatar (profile picture)
   * Accepts data URL or remote URL and updates both Firebase Auth and Firestore
   */
  async function updateAvatar(photoDataUrl: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updatedUser = await firebaseAuth.updateUserAvatar(photoDataUrl)
      user.value = updatedUser
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      showNotification({ title: 'Profile updated', message: 'Profile picture updated', type: 'success' })
    } catch (err: any) {
      console.error('updateAvatar error:', err)
      error.value = err.message || 'Failed to update avatar'
      throw err
    } finally {
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
    authInitialized,
    isAuthModalOpen,
    authModalView,
    showSuccessNotification,
    successNotificationData,

    // Computed
    isAuthenticated,
    userDisplayName,

    // Actions
    initAuth,
    bypassAuthForTesting, // For testing when network issues occur
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
    closeNotification,
    updateAvatar
  }
})
