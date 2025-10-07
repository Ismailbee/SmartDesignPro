<template>
  <header class="admin-header">
    <!-- Left Section -->
    <div class="header-left">
      <!-- Hamburger Menu -->
      <button @click="toggleSidebar" class="hamburger-btn" title="Toggle Sidebar">
        <span class="hamburger-icon">☰</span>
      </button>
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>

    <!-- Right Section -->
    <div class="header-right">
      <!-- Dark Mode Toggle -->
      <button @click="toggleDarkMode" class="icon-btn" title="Toggle Dark Mode">
        <span>{{ adminStore.darkMode ? '☀️' : '🌙' }}</span>
      </button>

      <!-- Notifications -->
      <button @click="toggleNotifications" class="icon-btn notifications-btn" title="Notifications">
        <span>🔔</span>
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>

      <!-- Notifications Dropdown -->
      <div v-if="showNotifications" class="notifications-dropdown">
        <div class="dropdown-header">
          <h4>Notifications</h4>
          <button @click="markAllAsRead" class="mark-read-btn">Mark all as read</button>
        </div>
        <div class="notifications-list">
          <div v-if="notifications.length === 0" class="empty-notifications">
            <p>No new notifications</p>
          </div>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
          >
            <div class="notification-icon">{{ notification.icon }}</div>
            <div class="notification-content">
              <p class="notification-text">{{ notification.message }}</p>
              <p class="notification-time">{{ formatTime(notification.timestamp) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- User Menu -->
      <div class="user-menu">
        <button @click="toggleUserMenu" class="user-btn">
          <img
            v-if="authStore.user?.avatar"
            :src="authStore.user.avatar"
            alt="User avatar"
            class="user-avatar"
          />
          <div v-else class="user-avatar-placeholder">
            {{ getUserInitials() }}
          </div>
          <span class="user-name">{{ authStore.user?.name || 'Admin' }}</span>
          <span class="dropdown-arrow">▼</span>
        </button>

        <!-- User Dropdown -->
        <div v-if="showUserMenu" class="user-dropdown">
          <div class="dropdown-header">
            <p class="user-email">{{ authStore.user?.email }}</p>
            <span class="user-role-badge">{{ authStore.user?.role || 'admin' }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <router-link to="/" class="dropdown-item">
            <span class="item-icon">🏠</span>
            <span>Go to Home</span>
          </router-link>
          <router-link to="/editor" class="dropdown-item">
            <span class="item-icon">🎨</span>
            <span>Go to Editor</span>
          </router-link>
          <router-link to="/admin/settings" class="dropdown-item">
            <span class="item-icon">⚙️</span>
            <span>Settings</span>
          </router-link>
          <div class="dropdown-divider"></div>
          <button @click="handleLogout" class="dropdown-item logout-btn">
            <span class="item-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminStore()

// State
const showNotifications = ref(false)
const showUserMenu = ref(false)

// Mock notifications
const notifications = ref([
  {
    id: '1',
    icon: '⚠️',
    message: 'Server CPU usage is high (85%)',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    icon: '📄',
    message: '5 new templates pending approval',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: '3',
    icon: '💳',
    message: 'New payment received: $99.00',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true
  }
])

// Computed
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'User Management',
    '/admin/templates': 'Template Management',
    '/admin/templates/pending': 'Pending Approvals',
    '/admin/payments': 'Payment Management',
    '/admin/analytics': 'Analytics',
    '/admin/system': 'System Monitoring',
    '/admin/settings': 'Settings'
  }
  return titles[route.path] || 'Admin'
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// Methods
function toggleDarkMode() {
  adminStore.toggleDarkMode()
}

function toggleSidebar() {
  adminStore.toggleSidebar()
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

function markAllAsRead() {
  notifications.value.forEach(n => n.read = true)
}

function getUserInitials(): string {
  const name = authStore.user?.name || 'Admin'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

async function handleLogout() {
  await authStore.logoutUser()
  router.push('/')
}

// Close dropdowns when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.notifications-btn') && !target.closest('.notifications-dropdown')) {
    showNotifications.value = false
  }
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.admin-header {
  height: 70px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Hamburger Menu */
.hamburger-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  color: #111827;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.hamburger-icon {
  display: block;
  line-height: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Icon Buttons */
.icon-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  color: #111827;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

/* Notifications Dropdown */
.notifications-dropdown {
  position: absolute;
  top: 60px;
  right: 80px;
  width: 360px;
  max-height: 480px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dropdown-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #0ea5e9;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
}

.mark-read-btn:hover {
  text-decoration: underline;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-notifications {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
  background: rgba(14, 165, 233, 0.1);
}

.notification-icon {
  font-size: 24px;
}

.notification-content {
  flex: 1;
}

.notification-text {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #111827;
}

.notification-time {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.user-avatar,
.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  opacity: 0.7;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: 56px;
  right: 0;
  width: 240px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1000;
}

.user-email {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.user-role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #111827;
}

.item-icon {
  font-size: 16px;
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>

