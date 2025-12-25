import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import SignUp from '../pages/SignUp.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import IcanInvoice from '../pages/InvoiceIcan/IcanInvoice.vue';
import StatsPage from '../pages/StatsPage.vue';

import SplashScreen from '../pages/SplashScreen.vue';
import MemberManagementPage from '../pages/MemberManagementPage.vue';
import ReportsAnalyticsPage from '../pages/ReportsAnalyticsPage.vue';
import SignaturePage from '../pages/SignaturePage.vue';
import { SessionManager } from '../utils/secure-storage.js';

// Import saved pages with correct paths - updated paths for InvoiceIcan and ReceiptIcan subdirectories
// Use lazy loading for saved pages to avoid module resolution issues
// import SavedIcanInvoicesPage from '../pages/InvoiceIcan/SavedIcanInvoicesPage.vue';
// import SavedIcanReceiptsPage from '../pages/ReceiptIcan/SavedIcanReceiptsPage.vue';
import IcanReceipt from '../pages/ReceiptIcan/IcanReceipt.vue';
import PreviewIcanInvoice from '../pages/InvoiceIcan/PreviewIcanInvoice.vue';
import PreviewIcanReceipt from '../pages/ReceiptIcan/PreviewIcanReceipt.vue';

const routes = [
  {
    path: '/',
    redirect: '/splash'
  },
  {
    path: '/splash',
    name: 'Splash', 
    component: SplashScreen,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/ican-app',
    name: 'IcanApp',
    component: HomePage,
  },
  {
    path: '/ican-app/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/invoice',
    name: 'Invoice',
    component: IcanInvoice,
    meta: { requiresMemberAuth: true }
  },
  {
    path: '/ican-app/invoice-quickfill',
    name: 'ican-app-invoice-quickfill',
    component: IcanInvoice,
    meta: { requiresMemberAuth: true },
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/ican-app/invoice-preview',
    name: 'ican-app-invoice-preview',
    component: PreviewIcanInvoice,
    meta: { requiresMemberAuth: true },
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/receipt',
    name: 'Receipt',
    component: IcanReceipt,
    meta: { requiresMemberAuth: true }
  },
  {
    path: '/ican-app/receipt-quickfill',
    name: 'ican-app-receipt-quickfill',
    component: IcanReceipt,
    meta: { requiresMemberAuth: true },
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/ican-app/receipt-preview',
    name: 'ican-app-receipt-preview',
    component: PreviewIcanReceipt,
    meta: { requiresMemberAuth: true },
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/stats',
    name: 'Stats',
    component: StatsPage,
  },
  {
    path: '/ican-app/saved-invoices',
    name: 'SavedInvoices',
    component: () => import(/* webpackChunkName: "saved-invoices" */ '../pages/InvoiceIcan/SavedIcanInvoicesPage.vue'),
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/ican-app/saved-receipts',
    name: 'SavedReceipts', 
    component: () => import(/* webpackChunkName: "saved-receipts" */ '../pages/ReceiptIcan/SavedIcanReceiptsPage.vue'),
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/member-management',
    name: 'MemberManagement',
    component: MemberManagementPage,
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsAnalyticsPage,
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/signature',
    name: 'Signature',
    component: SignaturePage,
    meta: { requiresMemberAuth: true },
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  {
    path: '/ican-app/signature',
    name: 'ican-app-signature',
    component: SignaturePage,
    meta: { requiresMemberAuth: true },
    props: (route) => ({ branch: route.query.branch || '' }),
  },
  // Catch-all route for handling 404s and unknown routes
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: { name: 'Home' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const protectedRoutes = ['Dashboard', 'Invoice', 'Receipt', 'Stats', 'MemberManagement', 'Reports', 'Signature', 'SavedInvoices', 'SavedReceipts', 'ican-app-invoice-preview', 'ican-app-receipt-preview', 'ican-app-signature'];

router.beforeEach(async (to, from, next) => {
  // Check if route requires basic branch access
  if (protectedRoutes.includes(to.name)) {
    // Check for session in SecureStorage (Capacitor Preferences on native, localStorage on web)
    const isValid = await SessionManager.isSessionValid();
    // Also check localStorage for backward compatibility with existing users
    const user = localStorage.getItem('user');
    
    if (!isValid && !user) {
      console.warn('⚠️ No active session found, redirecting to Home');
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
