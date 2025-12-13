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
const InvoiceReceiptPage = () => import('@/views/invoices/InvoiceReceiptPage.vue')
const SignaturePage = () => import('@/views/SignaturePage.vue')
const InvoiceDashboard = () => import('@/views/invoices/InvoiceDashboard.vue')
const InvoiceTemplatesPage = () => import('@/views/invoices/InvoiceTemplatesPage.vue')
const CustomerInvoiceTemplatesPage = () => import('@/views/invoices/CustomerInvoiceTemplatesPage.vue')
const InvoicePage = () => import('@/views/invoices/InvoicePage.vue')
const GenerateInvoicePage = () => import('@/views/invoices/GenerateInvoicePage.vue')
const CustomerInvoicePage = () => import('@/views/invoices/CustomerInvoicePage.vue')
const InvoicePreviewPage = () => import('@/views/invoices/InvoicePreviewPage.vue')
const ReceiptDashboard = () => import('@/views/receipts/ReceiptDashboard.vue')
const ReceiptTemplatesPage = () => import('@/views/receipts/ReceiptTemplatesPage.vue')
const GenerateReceiptPage = () => import('@/views/receipts/GenerateReceiptPage.vue')
const CustomerReceiptPage = () => import('@/views/receipts/CustomerReceiptPage.vue')
const CustomerReceiptTemplatesPage = () => import('@/views/receipts/CustomerReceiptTemplatesPage.vue')
const ReceiptPage = () => import('@/views/receipts/ReceiptPage.vue')
const ReceiptPreviewPage = () => import('@/views/receipts/ReceiptPreviewPage.vue')

// Invoice Template Pages
const ClassicProfessionalTemplate = () => import('@/views/invoices/templates/ClassicProfessionalTemplate.vue')
const PreviewClassicProfessionalTemplate = () => import('@/views/invoices/templates/PreviewClassicProfessionalTemplate.vue')
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

// Micro-Apps
const ICANWrapper = () => import('@/views/ICANWrapper.vue')

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

  // ============================================================
  // Direct ICAN App Routes (bypasses wrapper)
  // ============================================================
  {
    path: '/ican-app',
    name: 'ican-app',
    meta: {
      title: 'ICAN Application - SmartDesignPro',
      requiresAuth: true,
      requiresSpecialAccess: true
    },
    children: [
      {
        path: '',
        name: 'ican-app-splash',
        component: () => import('@/views/micro-apps/Ican/src/pages/SplashScreen.vue')
      },
      {
        path: 'home',
        name: 'ican-app-home',
        component: () => import('@/views/micro-apps/Ican/src/pages/HomePage.vue')
      },
      {
        path: 'dashboard',
        name: 'ican-app-dashboard',
        component: () => import('@/views/micro-apps/Ican/src/pages/DashboardPage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'invoice',
        name: 'ican-app-invoice',
        component: () => import('@/views/micro-apps/Ican/src/pages/InvoicePage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'receipt',
        name: 'ican-app-receipt',
        component: () => import('@/views/micro-apps/Ican/src/pages/ReceiptIcan/IcanReceipt.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'member-login',
        name: 'ican-app-member-login',
        component: () => import('@/views/micro-apps/Ican/src/pages/MemberLoginPage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'member-management',
        name: 'ican-app-member-management',
        component: () => import('@/views/micro-apps/Ican/src/pages/MemberManagementPage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'settings',
        name: 'ican-app-settings',
        component: () => import('@/views/micro-apps/Ican/src/pages/SettingsPage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'reports',
        name: 'ican-app-reports',
        component: () => import('@/views/micro-apps/Ican/src/pages/ReportsAnalyticsPage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'signature',
        name: 'ican-app-signature',
        component: () => import('@/views/micro-apps/Ican/src/pages/SignaturePage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'stats',
        name: 'ican-app-stats',
        component: () => import('@/views/micro-apps/Ican/src/pages/StatsPage.vue')
      },
      {
        path: 'signup',
        name: 'ican-app-signup',
        component: () => import('@/views/micro-apps/Ican/src/pages/SignUp.vue')
      },
      {
        path: 'invoice-quickfill',
        name: 'ican-app-invoice-quickfill',
        component: () => import('@/views/micro-apps/Ican/src/pages/InvoiceIcan/IcanInvoice.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'invoice-preview',
        name: 'ican-app-invoice-preview',
        component: () => import('@/views/micro-apps/Ican/src/pages/InvoiceIcan/PreviewIcanInvoice.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'saved-invoices',
        name: 'ican-app-saved-invoices',
        component: () => import('@/views/micro-apps/Ican/src/pages/SavedIcanInvoicesPage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'saved-receipts',
        name: 'ican-app-saved-receipts',
        component: () => import('@/views/micro-apps/Ican/src/pages/ReceiptIcan/SavedIcanReceiptsPage.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      },
      {
        path: 'receipt-preview',
        name: 'ican-app-receipt-preview',
        component: () => import('@/views/micro-apps/Ican/src/pages/ReceiptIcan/PreviewIcanReceipt.vue'),
        props: (route) => ({ branch: route.query.branch || '' })
      }
    ]
  },

  // ============================================================
  // Micro-Apps Routes (Wrapper-based)
  // ============================================================
  {
    path: '/ican',
    name: 'ican-portal',
    component: ICANWrapper,
    meta: {
      title: 'ICAN Portal - SmartDesignPro',
      requiresAuth: true,
      requiresSpecialAccess: true // Custom meta for special permission check
    },
    children: [
      {
        path: '',
        name: 'ican-redirect',
        redirect: '/ican/home'
      },
      {
        path: 'home',
        name: 'ican-home',
        component: () => import('@/views/micro-apps/ican/components/ICANHome.vue')
      },
      {
        path: 'dashboard',
        name: 'ican-dashboard',
        component: () => import('@/views/micro-apps/ican/components/ICANDashboard.vue')
      },
      {
        path: 'invoice',
        name: 'ican-invoice',
        component: () => import('@/views/micro-apps/ican/components/ICANInvoice.vue')
      },
      {
        path: 'receipt',
        name: 'ican-receipt',
        component: () => import('@/views/micro-apps/ican/components/ICANReceipt.vue')
      },
      {
        path: 'member-login',
        name: 'ican-member-login',
        component: () => import('@/views/micro-apps/ican/components/ICANMemberLogin.vue')
      },
      {
        path: 'settings',
        name: 'ican-settings',
        component: () => import('@/views/micro-apps/ican/components/ICANSettings.vue')
      }
    ]
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
    path: '/invoice-dashboard',
    name: 'invoice-dashboard',
    component: InvoiceDashboard,
    meta: {
      title: 'Invoice Dashboard - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice-templates',
    name: 'invoice-templates',
    component: InvoiceTemplatesPage,
    meta: {
      title: 'Invoice Templates - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/customer-invoice-templates',
    name: 'customer-invoice-templates',
    component: CustomerInvoiceTemplatesPage,
    meta: {
      title: 'Customer Invoice Templates - SmartDesignPro',
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
    path: '/generate-invoice',
    name: 'generate-invoice',
    component: GenerateInvoicePage,
    meta: {
      title: 'Generate Invoice - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice-template/classic-professional',
    name: 'invoice-template-classic-professional',
    component: ClassicProfessionalTemplate,
    meta: {
      title: 'Classic Professional Template - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice-template/classic-professional/preview',
    name: 'preview-classic-professional',
    component: PreviewClassicProfessionalTemplate,
    meta: {
      title: 'Preview: Classic Professional - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoices/saved',
    name: 'saved-invoices',
    component: () => import('@/views/invoices/SavedInvoicesPage.vue'),
    meta: {
      title: 'Saved Invoices - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/customer-invoice',
    name: 'customer-invoice',
    component: CustomerInvoicePage,
    meta: {
      title: 'Generate for Customer - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice-preview',
    name: 'InvoicePreview',
    component: InvoicePreviewPage,
    meta: {
      title: 'Invoice Preview - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/receipt-dashboard',
    name: 'receipt-dashboard',
    component: ReceiptDashboard,
    meta: {
      title: 'Receipt Dashboard - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/receipt-templates',
    name: 'receipt-templates',
    component: ReceiptTemplatesPage,
    meta: {
      title: 'Receipt Templates - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/customer-receipt-templates',
    name: 'customer-receipt-templates',
    component: CustomerReceiptTemplatesPage,
    meta: {
      title: 'Customer Receipt Templates - SmartDesignPro',
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
    path: '/generate-receipt',
    name: 'generate-receipt',
    component: GenerateReceiptPage,
    meta: {
      title: 'Generate Receipt - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/customer-receipt',
    name: 'customer-receipt',
    component: CustomerReceiptPage,
    meta: {
      title: 'Customer Receipt - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/receipt-preview',
    name: 'receipt-preview',
    component: ReceiptPreviewPage,
    meta: {
      title: 'Receipt Preview - SmartDesignPro',
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
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Update document title
  document.title = (to.meta.title as string) || 'SmartDesignPro'

  // Wait for auth initialization before making routing decisions
  if (!authStore.authInitialized) {
    // Wait for Firebase auth to initialize
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait
    while (!authStore.authInitialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

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

  // Check if route requires special access (for micro-apps like ICAN)
  if (to.meta.requiresSpecialAccess) {
    if (!authStore.isAuthenticated) {
      // Special access requires authentication
      sessionStorage.setItem('intendedRoute', to.fullPath)
      next({ name: 'welcome' })
      return
    }

    // Check if user has special access permission
    const userRole = authStore.user?.role || 'user'
    const hasSpecialAccess = userRole === 'admin' || 
                            userRole === 'moderator' || 
                            userRole === 'special' ||
                            (authStore.user as any)?.hasICANAccess === true

    const isDevelopment = import.meta.env.DEV
    const allowDevBypass = isDevelopment && import.meta.env.VITE_ALLOW_MICROAPP_BYPASS === 'true'

    if (allowDevBypass) {
      // DEV MODE: Micro-app access bypass enabled
      next()
      return
    }

    if (!hasSpecialAccess) {
      // Redirect to home with access denied message
      // Could show a modal here explaining how to get access
      next({ name: 'home', query: { error: 'special_access_required' } })
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

