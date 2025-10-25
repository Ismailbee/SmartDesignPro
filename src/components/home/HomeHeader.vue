<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-text">Design</span>
        <span class="logo-text-accent">Studio</span>
      </div>

      <nav class="nav-menu">
        <a href="#home" class="nav-link" @click.prevent="scrollToSection('home')">Home</a>
        <a href="#portfolio" class="nav-link" @click.prevent="scrollToSection('portfolio')">Portfolio</a>
        <a href="#services" class="nav-link" @click.prevent="scrollToSection('services')">Services</a>
        <a href="#team" class="nav-link" @click.prevent="scrollToSection('team')">Team</a>
        <a href="#contact" class="nav-link" @click.prevent="scrollToSection('contact')">Contact</a>

        <!-- Auto Design Dropdown -->
        <AutoDesignDropdown />

        <!-- More Menu Button -->
        <button class="more-button" @click="toggleMoreMenu">
          More
          <svg class="more-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </nav>

      <!-- User Profile (Authenticated) or Get Started Button (Not Authenticated) -->
      <div class="header-actions">
        <ThemeToggle />

        <!-- Token Display (Authenticated Users Only) -->
        <HeaderTokenDisplay v-if="authStore.isAuthenticated" />

        <div v-if="authStore.isAuthenticated" class="user-profile-header">
          <div class="user-avatar" @click="handleUserProfileClick" :title="authStore.userDisplayName">
            <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.userDisplayName" />
            <div v-else class="avatar-placeholder">
              {{ getInitials(authStore.userDisplayName) }}
            </div>
          </div>

          <!-- Action Buttons (No Divider Needed) -->
          <div class="action-buttons">
            <button class="settings-button" @click="goToSettings" title="Settings">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button class="logout-button" @click="handleLogout" title="Logout">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        <button v-else class="cta-button" @click="handleGetQuote">
          Get Started
        </button>
      </div>
    </div>

    <!-- More Menu Modal -->
    <MoreMenuModal
      :is-open="isMoreMenuOpen"
      @close="closeMoreMenu"
      @navigate="handleMoreMenuNavigate"
    />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import HeaderTokenDisplay from '@/components/HeaderTokenDisplay.vue'
import AutoDesignDropdown from './AutoDesignDropdown.vue'
import MoreMenuModal from './MoreMenuModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// State for More Menu Modal
const isMoreMenuOpen = ref(false)

// Emit events for parent component
const emit = defineEmits<{
  getQuote: []
}>()

// Toggle More Menu
const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value
}

// Close More Menu
const closeMoreMenu = () => {
  isMoreMenuOpen.value = false
}

// Handle More Menu navigation
const handleMoreMenuNavigate = (action: string) => {
  console.log('More menu navigation:', action)
  // Handle different actions
  switch (action) {
    case 'terms':
      router.push('/legal/terms')
      break
    case 'privacy':
      router.push('/legal/privacy')
      break
    case 'privacy-settings':
      router.push('/settings?tab=privacy')
      break
    case 'cookies':
      router.push('/legal/cookies')
      break
    case 'about':
      router.push('/about')
      break
    case 'suggest':
      router.push('/feedback/suggest')
      break
    case 'help':
      router.push('/help')
      break
    case 'rate':
      // Open rating modal or external link
      console.log('Open rating modal')
      break
    case 'schedule':
      router.push('/schedule')
      break
    case 'support':
      router.push('/support')
      break
    case 'faq':
      router.push('/faq')
      break
    default:
      console.log('Unknown action:', action)
  }
}

// Smooth scroll to section
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const headerOffset = 80 // Height of fixed header
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

const handleGetQuote = () => {
  emit('getQuote')
}

const handleUserProfileClick = () => {
  console.log('👤 User profile clicked')
  router.push('/editor')
}

const goToSettings = () => {
  console.log('⚙️ Opening settings...')
  router.push('/settings')
}

const goToAdmin = () => {
  console.log('🔧 Opening admin dashboard...')
  router.push('/admin/dashboard')
}

const handleLogout = async () => {
  console.log('🚪 Logging out...')
  try {
    await authStore.logoutUser()
    authStore.showNotification({
      title: 'Logged out',
      message: 'You have been successfully logged out',
      type: 'info'
    })
    // Redirect to welcome page
    router.push('/')
  } catch (err) {
    console.error('❌ Logout error:', err)
  }
}

const getInitials = (name: string): string => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}
</script>

<style scoped>
/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
}

.logo-text {
  color: white;
}

.logo-text-accent {
  color: #06b6d4;
}

/* Navigation */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #06b6d4;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #06b6d4;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* More Button */
.more-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.more-button:hover {
  color: #06b6d4;
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
}

.more-icon {
  width: 16px;
  height: 16px;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* User Profile Header */
.user-profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  background: rgba(6, 182, 212, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(6, 182, 212, 0.1);
}

.user-profile-header:hover {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.2);
}

/* Action Buttons Container */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #06b6d4;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.user-avatar:hover {
  transform: scale(1.05);
  border-color: #22d3ee;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.settings-button,
.logout-button {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.settings-button:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.3);
  color: #22d3ee;
  transform: translateY(-2px);
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
  transform: translateY(-2px);
}

.admin-button svg,
.settings-button svg,
.logout-button svg {
  width: 18px;
  height: 18px;
}

/* CTA Button */
.cta-button {
  padding: 12px 28px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    padding: 16px 40px;
  }

  .nav-menu {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 20px;
  }

  .nav-menu {
    display: none;
  }

  .header-actions {
    gap: 12px;
  }

  .user-profile-header {
    padding: 6px 12px;
    gap: 10px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
  }

  .avatar-placeholder {
    font-size: 14px;
  }

  .action-buttons {
    gap: 8px;
  }

  .settings-button,
  .logout-button {
    width: 36px;
    height: 36px;
  }

  .settings-button svg,
  .logout-button svg {
    width: 16px;
    height: 16px;
  }
}
</style>

