/**
 * Vue Router Configuration
 * Main routing setup for the application
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy load components for better performance
const WelcomePage = () => import('@/components/WelcomePage.vue')
const HomePage = () => import('@/components/HomePage.vue')
const DesignEditor = () => import('@/components/DesignEditor.vue')
const UserSettings = () => import('@/views/UserSettings.vue')
const AutoDesignPage = () => import('@/views/AutoDesignPage.vue')
const InvoiceReceiptPage = () => import('@/views/InvoiceReceiptPage.vue')
const SignaturePage = () => import('@/views/SignaturePage.vue')
const InvoicePage = () => import('@/views/InvoicePage.vue')
const ReceiptPage = () => import('@/views/ReceiptPage.vue')
const LetterHeadPage = () => import('@/views/LetterHeadPage.vue')
const LetterHeadDashboard = () => import('@/views/LetterHeadDashboard.vue')
const TokensAndPlans = () => import('@/views/TokensAndPlans.vue')
const ReferralPage = () => import('@/views/ReferralPage.vue')
const SubscriptionPage = () => import('@/views/SubscriptionPage.vue')

// New Pages
const SchedulingPage = () => import('@/views/SchedulingPage.vue')
const ImpositionPage = () => import('@/views/ImpositionPage.vue')
const MockupPage = () => import('@/views/MockupPage.vue')
const VideosPage = () => import('@/views/VideosPage.vue')
const PrivacySettings = () => import('@/views/PrivacySettings.vue')

// Help & Support Pages
const HelpCenterPage = () => import('@/views/HelpCenterPage.vue')
const SupportPage = () => import('@/views/SupportPage.vue')
const FAQPage = () => import('@/views/FAQPage.vue')
const AboutPage = () => import('@/views/AboutPage.vue')
const CookiesPage = () => import('@/views/CookiesPage.vue')
const NotificationsPage = () => import('@/views/NotificationsPage.vue')
const SuggestFeaturePage = () => import('@/views/SuggestFeaturePage.vue')

// Legal Pages
const PrivacyPolicy = () => import('@/views/legal/PrivacyPolicy.vue')
const TermsOfService = () => import('@/views/legal/TermsOfService.vue')

// Admin Components
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
    name: 'welcome',
    component: WelcomePage,
    meta: {
      title: 'Welcome - SmartDesignPro',
      requiresAuth: false
    }
  },

  // ============================================================
  // Authenticated Routes
  // ============================================================
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Home - SmartDesignPro',
      requiresAuth: false  // Changed to false to make home page public
    }
  },

  {
    path: '/editor',
    name: 'editor',
    component: DesignEditor,
    meta: {
      title: 'Editor - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/settings',
    name: 'settings',
    component: UserSettings,
    meta: {
      title: 'Settings - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/auto-design',
    name: 'auto-design',
    component: AutoDesignPage,
    meta: {
      title: 'Auto Design - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice-receipt',
    name: 'invoice-receipt',
    component: InvoiceReceiptPage,
    meta: {
      title: 'Invoice & Receipt Generator - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/signature',
    name: 'signature',
    component: SignaturePage,
    meta: {
      title: 'Signature Generator - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice',
    name: 'invoice',
    component: InvoicePage,
    meta: {
      title: 'Create Invoice - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/receipt',
    name: 'receipt',
    component: ReceiptPage,
    meta: {
      title: 'Create Receipt - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/letterhead',
    name: 'letterhead',
    component: LetterHeadPage,
    meta: {
      title: 'Letter Head Designer - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/letterhead-templates',
    name: 'letterhead-templates',
    component: LetterHeadDashboard,
    meta: {
      title: 'Letter Head Templates - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/tokens-and-plans',
    name: 'tokens-and-plans',
    component: TokensAndPlans,
    meta: {
      title: 'Tokens & Plans - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/referral',
    name: 'referral',
    component: ReferralPage,
    meta: {
      title: 'Refer & Earn - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/subscription',
    name: 'subscription',
    component: SubscriptionPage,
    meta: {
      title: 'Upgrade Plan - SmartDesignPro',
      requiresAuth: true
    }
  },

  // ============================================================
  // User Pages
  // ============================================================
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsPage,
    meta: {
      title: 'Notifications - SmartDesignPro',
      requiresAuth: true
    }
  },

  // ============================================================
  // Service Routes
  // ============================================================
  {
    path: '/scheduling',
    name: 'scheduling',
    component: SchedulingPage,
    meta: {
      title: 'Scheduling - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/imposition',
    name: 'imposition',
    component: ImpositionPage,
    meta: {
      title: 'Imposition - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/mockup',
    name: 'mockup',
    component: MockupPage,
    meta: {
      title: 'Mockup - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/videos',
    name: 'videos',
    component: VideosPage,
    meta: {
      title: 'Videos - SmartDesignPro',
      requiresAuth: false
    }
  },

  // ============================================================
  // Legal Routes
  // ============================================================
  {
    path: '/legal/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicy,
    meta: {
      title: 'Privacy Policy - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/legal/terms-of-service',
    name: 'terms-of-service',
    component: TermsOfService,
    meta: {
      title: 'Terms of Service - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/privacy-settings',
    name: 'privacy-settings',
    component: PrivacySettings,
    meta: {
      title: 'Privacy Settings - SmartDesignPro',
      requiresAuth: false
    }
  },

    // ============================================================
    // Help & Support Routes
    // ============================================================
    {
      path: '/help-center',
      name: 'help-center',
      component: HelpCenterPage,
      meta: {
        title: 'Help Center - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/support',
      name: 'support',
      component: SupportPage,
      meta: {
        title: 'Contact Support - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/faq',
      name: 'faq',
      component: FAQPage,
      meta: {
        title: 'FAQ - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/about',
      name: 'about',
      component: AboutPage,
      meta: {
        title: 'About Us - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/cookies',
      name: 'cookies',
      component: CookiesPage,
      meta: {
        title: 'Cookie Policy - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/feedback/suggest',
      name: 'suggest-feature',
      component: SuggestFeaturePage,
      meta: {
        title: 'Suggest a Feature - SmartDesignPro',
        requiresAuth: false
      }
    },

    // Aliases for compatibility
    { path: '/legal/cookies', name: 'legal-cookies', component: CookiesPage, meta: { title: 'Cookie Policy - SmartDesignPro', requiresAuth: false } },
    { path: '/help', name: 'help', component: HelpCenterPage, meta: { title: 'Help Center - SmartDesignPro', requiresAuth: false } },
    { path: '/schedule', name: 'schedule', component: SchedulingPage, meta: { title: 'Scheduling - SmartDesignPro', requiresAuth: false } },
    { path: '/legal/terms', name: 'terms', component: TermsOfService, meta: { title: 'Terms of Service - SmartDesignPro', requiresAuth: false } },
    { path: '/legal/privacy', name: 'privacy', component: PrivacyPolicy, meta: { title: 'Privacy Policy - SmartDesignPro', requiresAuth: false } },

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
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Update document title
  document.title = (to.meta.title as string) || 'SmartDesignPro'

  // Debug logs removed to satisfy lint rules

  // If user is authenticated and trying to access welcome page, redirect to home
  if (to.name === 'welcome' && authStore.isAuthenticated) {
  // User authenticated, redirect to home
    next({ name: 'home' })
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
  // Route requires auth, redirect to welcome page
      // Store intended route for redirect after login
      sessionStorage.setItem('intendedRoute', to.fullPath)

      // Redirect to welcome page
      next({ name: 'welcome' })
      return
    }
  }

  // Check if route requires admin role
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
  // Admin route requires auth
      sessionStorage.setItem('intendedRoute', to.fullPath)
      next({ name: 'welcome' })
      return
    }

    // Check if user has admin or moderator role
    const userRole = authStore.user?.role || 'user'
    const isDevelopment = import.meta.env.DEV

    // In development, allow bypass with environment variable
    const allowDevBypass = isDevelopment && import.meta.env.VITE_ALLOW_ADMIN_BYPASS === 'true'

    if (allowDevBypass) {
  // DEV MODE: Admin bypass enabled (set VITE_ALLOW_ADMIN_BYPASS=false to disable)
      next()
      return
    }

    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Redirect to home page with error message
  // Access denied: Admin privileges required
  // User role: ' + userRole
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
router.afterEach((_to, _from) => {
  // Log navigation for analytics
  // Navigation complete
})

export default router

