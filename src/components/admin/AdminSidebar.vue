<template>
  <aside class="admin-sidebar" :class="{ collapsed }">
    <!-- Backdrop for mobile -->
    <div v-if="!collapsed" class="sidebar-backdrop" @click="toggleSidebar"></div>
    
    <!-- Logo -->
    <div class="sidebar-logo">
      <router-link to="/" class="logo-link">
        <span class="logo-icon">🎨</span>
        <span v-if="!collapsed" class="logo-text">Design Studio</span>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
        <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>
    </nav>

    <!-- Divider -->
    <div v-if="!collapsed" class="sidebar-divider"></div>

    <!-- Quick Actions -->
    <div v-if="!collapsed" class="sidebar-section">
      <h4 class="section-title">Quick Actions</h4>
      <button @click="handleQuickAction('export')" class="quick-action-btn">
        <span class="action-icon">📊</span>
        <span class="action-label">Export Data</span>
      </button>
      <button @click="handleQuickAction('backup')" class="quick-action-btn">
        <span class="action-icon">💾</span>
        <span class="action-label">Backup System</span>
      </button>
    </div>

    <!-- Toggle Button -->
    <button @click="toggleSidebar" class="sidebar-toggle">
      <span>{{ collapsed ? '→' : '←' }}</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const route = useRoute()
const adminStore = useAdminStore()

// Navigation items
const navItems = computed(() => [
  {
    path: '/admin/dashboard',
    icon: '📊',
    label: 'Dashboard',
    badge: null
  },
  {
    path: '/admin/users',
    icon: '👥',
    label: 'Users',
    badge: null
  },
  {
    path: '/admin/templates',
    icon: '📄',
    label: 'Templates',
    badge: adminStore.pendingTemplates?.length || null
  },
  {
    path: '/admin/payments',
    icon: '💳',
    label: 'Payments',
    badge: null
  },
  {
    path: '/admin/analytics',
    icon: '📈',
    label: 'Analytics',
    badge: null
  },
  {
    path: '/admin/system',
    icon: '⚙️',
    label: 'System',
    badge: adminStore.serverHealth?.status === 'critical' ? '!' : null
  },
  {
    path: '/admin/settings',
    icon: '🔧',
    label: 'Settings',
    badge: null
  }
])

// Check if route is active
function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

// Toggle sidebar
function toggleSidebar() {
  adminStore.toggleSidebar()
}

// Handle quick actions
function handleQuickAction(action: string) {
  console.log('Quick action:', action)
  // Implement quick actions
  switch (action) {
    case 'export':
      // Export data
      break
    case 'backup':
      // Backup system
      break
  }
}
</script>

<style scoped>
/* Backdrop */
.sidebar-backdrop {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
}

.admin-sidebar.collapsed {
  width: 80px;
}

/* Overlay for mobile */
@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
  
  .admin-sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}

/* Logo */
.sidebar-logo {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapsed .sidebar-logo {
  padding: 24px 10px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #111827;
  font-weight: 600;
  font-size: 18px;
}

.logo-icon {
  font-size: 28px;
  min-width: 28px;
}

.logo-text {
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 4px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: #4b5563;
  transition: all 0.2s ease;
  position: relative;
  justify-content: flex-start;
}

.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
  margin: 4px auto;
  width: 56px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #111827;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.2));
  color: #111827;
  border-left: 3px solid #0ea5e9;
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
}

.nav-icon {
  font-size: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.collapsed .nav-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.nav-badge {
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  transition: opacity 0.3s ease;
}

.collapsed .nav-badge {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Divider */
.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 20px;
}

/* Section */
.sidebar-section {
  padding: 12px 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #111827;
}

.action-icon {
  font-size: 16px;
}

/* Toggle Button */
.sidebar-toggle {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

