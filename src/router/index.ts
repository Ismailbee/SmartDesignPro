/**
 * Vue Router Configuration
 * Main routing setup for the application
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy load components for better performance
const HomePage = () => import('@/components/HomePage.vue')
const DesignEditor = () => import('@/components/DesignEditor.vue')
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const UserManagement = () => import('@/views/admin/UserManagement.vue')
const UserDetail = () => import('@/views/admin/UserDetail.vue')
const TemplateManagement = () => import('@/views/admin/TemplateManagement.vue')
const PendingApprovals = () => import('@/views/admin/PendingApprovals.vue')
const PaymentManagement = () => import('@/views/admin/PaymentManagement.vue')
const PaymentDetail = () => import('@/views/admin/PaymentDetail.vue')
const Analytics = () => import('@/views/admin/Analytics.vue')
const SystemMonitoring = () => import('@/views/admin/SystemMonitoring.vue')
const AdminSettings = () => import('@/views/admin/AdminSettings.vue')

/**
 * Route definitions
 */
const routes: RouteRecordRaw[] = [
  // ============================================================
  // Public Routes
  // ============================================================
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Home - Design Studio',
      requiresAuth: false
    }
  },

  // ============================================================
  // Editor Route (Requires Authentication)
  // ============================================================
  {
    path: '/editor',
    name: 'editor',
    component: DesignEditor,
    meta: {
      title: 'Editor - Design Studio',
      requiresAuth: true
    }
  },

  // ============================================================
  // Admin Routes (Requires Admin Role)
  // ============================================================
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/dashboard',
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      // Dashboard Home
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: {
          title: 'Admin Dashboard',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // User Management
      {
        path: 'users',
        name: 'admin-users',
        component: UserManagement,
        meta: {
          title: 'User Management - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'users/:id',
        name: 'admin-user-detail',
        component: UserDetail,
        meta: {
          title: 'User Details - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Template Management
      {
        path: 'templates',
        name: 'admin-templates',
        component: TemplateManagement,
        meta: {
          title: 'Template Management - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'templates/pending',
        name: 'admin-templates-pending',
        component: PendingApprovals,
        meta: {
          title: 'Pending Approvals - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'templates/:id',
        name: 'admin-template-detail',
        component: TemplateManagement, // Reuse with edit mode
        meta: {
          title: 'Template Details - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Payment Management
      {
        path: 'payments',
        name: 'admin-payments',
        component: PaymentManagement,
        meta: {
          title: 'Payment Management - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'payments/:id',
        name: 'admin-payment-detail',
        component: PaymentDetail,
        meta: {
          title: 'Payment Details - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Analytics
      {
        path: 'analytics',
        name: 'admin-analytics',
        component: Analytics,
        meta: {
          title: 'Analytics - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // System Monitoring
      {
        path: 'system',
        name: 'admin-system',
        component: SystemMonitoring,
        meta: {
          title: 'System Monitoring - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Settings
      {
        path: 'settings',
        name: 'admin-settings',
        component: AdminSettings,
        meta: {
          title: 'Admin Settings',
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  },

  // ============================================================
  // 404 Not Found
  // ============================================================
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404 - Page Not Found'
    }
  }
]

/**
 * Create router instance
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * Navigation Guards
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Update document title
  document.title = (to.meta.title as string) || 'Design Studio'

  // TEMPORARY: Grant admin role to authenticated users (REMOVE IN PRODUCTION)
  if (authStore.isAuthenticated && authStore.user) {
    authStore.user.role = 'admin'
    console.log('🔧 DEV MODE: Admin role granted to user:', authStore.user)
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Store intended route for redirect after login
      sessionStorage.setItem('intendedRoute', to.fullPath)
      
      // Open login modal and stay on current page
      authStore.openAuthModal('login')
      next(false) // Cancel navigation
      return
    }
  }

  // Check if route requires admin role
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      sessionStorage.setItem('intendedRoute', to.fullPath)
      authStore.openAuthModal('login')
      next(false)
      return
    }

    // Check if user has admin or moderator role
    const userRole = authStore.user?.role || 'user'
    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Redirect to home page with error message
      console.error('Access denied: Admin privileges required')
      next({ name: 'home' })
      return
    }
  }

  // Allow navigation
  next()
})

/**
 * After navigation hook
 */
router.afterEach((to, from) => {
  // Log navigation for analytics
  console.log(`Navigated from ${from.path} to ${to.path}`)
})

export default router

