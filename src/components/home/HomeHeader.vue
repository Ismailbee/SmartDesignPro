<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-text">Design</span>
        <span class="logo-text-accent">Studio</span>
      </div>

      <nav class="nav-menu">
        <a href="#home" class="nav-link" @click.prevent="scrollToSection('home')">Home</a>
        <a href="#template" class="nav-link" @click.prevent="scrollToSection('template')">Template</a>
        
        <!-- New Service Pages -->
        <router-link to="/scheduling" class="nav-link">Scheduling</router-link>
        <router-link to="/imposition" class="nav-link">Imposition</router-link>
        <router-link to="/mockup" class="nav-link">Mockup</router-link>
        <router-link to="/videos" class="nav-link">Videos</router-link>
       
        <!-- Legal Dropdown -->
        <div class="dropdown" @mouseover="showLegalDropdown" @mouseleave="hideLegalDropdown">
          <button class="dropdown-toggle">
            Legal
            <svg class="dropdown-icon" :class="{ 'rotate-180': isLegalDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div class="dropdown-menu" :class="{ 'show': isLegalDropdownOpen }">
            <!-- Services Section -->
            <div class="dropdown-section">
              <h4 class="dropdown-section-title">Services</h4>
              <a href="#services" class="dropdown-link" @click.prevent="scrollToSection('services')">
                <span class="dropdown-icon">🎨</span>
                Our Services
              </a>
            </div>

            <!-- Team Section -->
            <div class="dropdown-section">
              <h4 class="dropdown-section-title">Team</h4>
              <a href="#team" class="dropdown-link" @click.prevent="scrollToSection('team')">
                <span class="dropdown-icon">👥</span>
                Meet Our Team
              </a>
            </div>

            <!-- Contact Section -->
            <div class="dropdown-section">
              <h4 class="dropdown-section-title">Contact</h4>
              <a href="#contact" class="dropdown-link" @click.prevent="scrollToSection('contact')">
                <span class="dropdown-icon">📧</span>
                Contact Us
              </a>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Legal Documents -->
            <div class="dropdown-section">
              <h4 class="dropdown-section-title">Legal</h4>
              <router-link to="/legal/privacy-policy" class="dropdown-link">
                <span class="dropdown-icon">🛡️</span>
                Privacy Policy
              </router-link>
              <router-link to="/legal/terms-of-service" class="dropdown-link">
                <span class="dropdown-icon">📄</span>
                Terms of Service
              </router-link>
              <router-link to="/privacy-settings" class="dropdown-link">
                <span class="dropdown-icon">⚙️</span>
                Privacy Settings
              </router-link>
            </div>
          </div>
        </div>

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

// State for Legal Dropdown
const isLegalDropdownOpen = ref(false)
let legalDropdownTimer: number | null = null

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

// Legal Dropdown functions
const showLegalDropdown = () => {
  if (legalDropdownTimer) {
    window.clearTimeout(legalDropdownTimer)
    legalDropdownTimer = null
  }
  isLegalDropdownOpen.value = true
}

const hideLegalDropdown = () => {
  legalDropdownTimer = window.setTimeout(() => {
    isLegalDropdownOpen.value = false
  }, 300) // 300ms delay before hiding
}

// Handle More Menu navigation
const handleMoreMenuNavigate = (action: string) => {
  console.log('More menu navigation:', action)
  // Handle different actions
  switch (action) {
    case 'referral':
      router.push('/referral')
      break
    case 'subscription':
      router.push('/subscription')
      break
    case 'tokens-and-plans':
      router.push('/tokens-and-plans')
      break
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
const scrollToSection = async (sectionId: string) => {
  // console.log('🔍 Scrolling to section:', sectionId)
  
  const currentPath = router.currentRoute.value.path
  // console.log('📍 Current path:', currentPath)

  // Check if we're on a home page (either / or /home)
  const isHomePage = currentPath === '/' || currentPath === '/home'
  
  if (!isHomePage) {
    // console.log('📍 Not on home page, navigating first...')
    // Navigate to home page first, then scroll
    await router.push('/home')
    // Wait longer for DOM to fully render and Vue components to mount
    await new Promise(resolve => setTimeout(resolve, 300))
  } else {
    // Still wait a bit for any pending renders
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // Try multiple times to find the element (in case it's still loading)
  let element: HTMLElement | null = null
  let attempts = 0
  const maxAttempts = 10

  while (!element && attempts < maxAttempts) {
    element = document.getElementById(sectionId)
    if (!element) {
      // console.log(`⏳ Attempt ${attempts + 1}: Element not found, waiting...`)
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  if (element) {
    // console.log('✅ Element found:', element)
    const headerOffset = 80 // Height of fixed header
    const elementPosition = element.getBoundingClientRect().top
    const currentScrollY = window.scrollY || window.pageYOffset
    const offsetPosition = elementPosition + currentScrollY - headerOffset

    // console.log('📊 Scroll calculation:', { elementPosition, currentScrollY, offsetPosition, headerOffset })

    // Ensure we don't scroll to negative positions
    const finalPosition = Math.max(0, offsetPosition)

    window.scrollTo({
      top: finalPosition,
      behavior: 'smooth'
    })
    
    // console.log('🎯 Scrolled to position:', finalPosition)
  } else {
    console.error('❌ Element not found with ID after all attempts:', sectionId)
    console.error('📍 Current route:', router.currentRoute.value.path)
    console.error('📋 Available elements with IDs:',
      Array.from(document.querySelectorAll('[id]')).map(el => el.id)
    )
    
    // Try fallback - scroll to top if element not found
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const handleGetQuote = () => {
  emit('getQuote')
}

const handleUserProfileClick = () => {
  // console.log('👤 User profile clicked')
  router.push('/editor')
}

const goToSettings = () => {
  // console.log('⚙️ Opening settings...')
  router.push('/settings')
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
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header:hover {
  border-bottom-color: rgba(6, 182, 212, 0.2);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 26px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: -0.5px;
}

.logo:hover {
  transform: scale(1.02);
}

.logo-text {
  color: white;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

.logo-text-accent {
  background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.logo-text-accent::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo:hover .logo-text-accent::after {
  opacity: 1;
}

/* Navigation */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 10px 20px;
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.nav-link:hover {
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.08);
  transform: translateY(-1px);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.nav-link:hover::after {
  width: 60%;
}

/* Legal Dropdown */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.dropdown-toggle:hover {
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.08);
  transform: translateY(-1px);
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotate-180 {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 280px;
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  padding: 16px;
  margin-top: 8px;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-section {
  margin-bottom: 12px;
}

.dropdown-section:last-child {
  margin-bottom: 0;
}

.dropdown-section-title {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding: 0 12px;
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s ease;
  margin-bottom: 2px;
}

.dropdown-link:hover {
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.12);
  transform: translateX(4px);
}

.dropdown-link .dropdown-icon {
  font-size: 16px;
  width: auto;
  height: auto;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 12px 0;
}

/* More Button */
.more-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.more-button:hover {
  color: #22d3ee;
  border-color: rgba(6, 182, 212, 0.4);
  background: rgba(6, 182, 212, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
}

.more-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.more-button:hover .more-icon {
  transform: rotate(90deg);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* User Profile Header */
.user-profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 6px;
  background: rgba(6, 182, 212, 0.06);
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(6, 182, 212, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-profile-header:hover {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
  transform: translateY(-1px);
}

/* Action Buttons Container */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #06b6d4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
  position: relative;
}

.user-avatar::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #06b6d4, #22d3ee, #06b6d4);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.08);
  border-color: #22d3ee;
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.5);
}

.user-avatar:hover::before {
  opacity: 1;
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
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.settings-button,
.logout-button {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.settings-button::before,
.logout-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, currentColor 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.settings-button:hover {
  background: rgba(6, 182, 212, 0.18);
  border-color: rgba(6, 182, 212, 0.4);
  color: #22d3ee;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
}

.settings-button:hover::before {
  opacity: 0.1;
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.logout-button:hover::before {
  opacity: 0.1;
}

.admin-button svg,
.settings-button svg,
.logout-button svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.settings-button:hover svg {
  transform: rotate(90deg);
}

.logout-button:hover svg {
  transform: translateX(2px);
}

/* CTA Button */
.cta-button {
  padding: 12px 32px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.cta-button:hover::before {
  transform: translateX(100%);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);
}

.cta-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

/* Responsive */
@media (max-width: 1200px) {
  .header-content {
    padding: 16px 40px;
  }

  .nav-menu {
    gap: 4px;
  }

  .nav-link {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 1024px) {
  .header-content {
    padding: 14px 32px;
  }

  .nav-menu {
    gap: 2px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 13px;
  }

  .logo {
    font-size: 22px;
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
    padding: 4px 10px 4px 4px;
    gap: 8px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
  }

  .avatar-placeholder {
    font-size: 14px;
  }

  .action-buttons {
    gap: 6px;
  }

  .settings-button,
  .logout-button {
    width: 34px;
    height: 34px;
  }

  .settings-button svg,
  .logout-button svg {
    width: 16px;
    height: 16px;
  }

  .cta-button {
    padding: 10px 24px;
    font-size: 13px;
  }

  .logo {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 10px 16px;
  }

  .logo {
    font-size: 18px;
  }

  .header-actions {
    gap: 8px;
  }

  .user-profile-header {
    padding: 4px 8px 4px 4px;
    gap: 6px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
  }

  .settings-button,
  .logout-button {
    width: 32px;
    height: 32px;
  }

  .cta-button {
    padding: 8px 20px;
    font-size: 12px;
  }
}
</style>

