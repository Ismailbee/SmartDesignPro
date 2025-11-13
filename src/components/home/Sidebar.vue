<template>
  <!-- Mobile Menu Overlay -->
  <div 
    v-if="isOpen"
    class="mobile-menu-overlay"
    :class="{ 'active': isOpen }"
    @click="closeSidebar"
  ></div>

  <!-- Professional Mobile Sidebar -->
  <nav 
    class="mobile-sidebar"
    :class="{ 'active': isOpen }"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="brand-section">
        <div class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="brand-info">
          <h2 class="brand-title">DesignStudio</h2>
          <p class="brand-subtitle">Professional Suite</p>
        </div>
      </div>
      <button 
        class="close-button"
        aria-label="Close menu"
        @click="closeSidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Sidebar Content -->
    <div class="sidebar-content">
      <!-- Primary Actions -->
      <div class="nav-section">
        <h3 class="nav-section-title">Quick Actions</h3>
        
        <!-- Auto Design - Featured Button -->
        <button class="featured-action-button" @click="toggleAutoDesign">
          <div class="action-icon featured">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m8.66-13.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m13.66-4.24l-4.24-4.24m-4.24-4.24L3.34 3.34"></path>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">Auto Design</span>
            <span class="action-subtitle">AI-powered creation</span>
          </div>
          <div class="action-indicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- Navigation Section -->
      <div class="nav-section">
        <h3 class="nav-section-title">Navigation</h3>
        
        <a 
          href="#home"
          class="nav-item"
          @click="handleNavigation('#home')"
        >
          <div class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span class="nav-label">Home</span>
        </a>

        <a 
          href="#template"
          class="nav-item"
          @click="handleNavigation('#template')"
        >
          <div class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <span class="nav-label">Templates</span>
        </a>
      </div>

      <!-- Professional Tools -->
      <div class="nav-section">
        <h3 class="nav-section-title">Professional Tools</h3>
        
        <a 
          href="/scheduling"
          class="nav-item"
          @click="handleNavigation('/scheduling')"
        >
          <div class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <span class="nav-label">Scheduling</span>
        </a>

        <a 
          href="/imposition"
          class="nav-item"
          @click="handleNavigation('/imposition')"
        >
          <div class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <span class="nav-label">Imposition</span>
        </a>

        <a 
          href="/mockup"
          class="nav-item"
          @click="handleNavigation('/mockup')"
        >
          <div class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <span class="nav-label">Mockup Generator</span>
        </a>
      </div>

      <!-- Additional Options -->
      <div class="nav-section">
        <button class="secondary-action-button" @click="handleMore">
          <div class="action-icon secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </div>
          <span class="action-label">More Options</span>
          <div class="action-indicator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- User Profile Section (Mobile Only) - At Bottom -->
    <div v-if="user" class="sidebar-user-profile">
      <!-- User Info Row -->
      <div class="user-info-row">
        <div class="user-avatar-compact">
          <div v-if="!user.avatar" class="avatar-placeholder-compact">
            {{ getUserInitials() }}
          </div>
          <img v-else :src="user.avatar" :alt="user.name || 'User'" class="avatar-image" />
        </div>
        <div class="user-details">
          <h3 class="user-name-compact">{{ user.name || user.username || 'User' }}</h3>
          <p class="user-email-compact">{{ user.email }}</p>
        </div>
      </div>
      
      <!-- Compact User Actions -->
      <div class="user-actions-compact">
        <button class="user-action-button-icon-only settings" title="Settings" @click="handleSettings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="user-action-button-icon-only logout" title="Logout" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { watch } from 'vue'

// User interface
interface User {
  id: string
  email: string
  name?: string
  username?: string
  avatar?: string
}

// Props
const props = defineProps<{
  isOpen: boolean
  user?: User | null
}>()

// Emits
const emit = defineEmits<{
  close: []
  navigate: [section: string]
  autoDesign: []
  toggleAutoDesign: []
  more: []
  settings: []
  logout: []
}>()

// Close sidebar
const closeSidebar = () => {
  emit('close')
}

// Handle navigation
const handleNavigation = (section: string) => {
  emit('navigate', section)
}

// Handle toggle auto design
const toggleAutoDesign = () => {
  emit('toggleAutoDesign')
}

// Handle more button
const handleMore = () => {
  emit('more')
}

// Handle settings
const handleSettings = () => {
  emit('settings')
}

// Handle logout
const handleLogout = () => {
  emit('logout')
}

// Get user initials
const getUserInitials = () => {
  if (!props.user) return 'U'
  
  const name = props.user.name || props.user.username || props.user.email
  const parts = name.split(' ')
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return name.substring(0, 2).toUpperCase()
}

// Prevent scroll function for touch and wheel events (but allow sidebar scrolling)
const preventScroll = (e: Event) => {
  // Allow scrolling inside the sidebar and all its children
  const target = e.target as Element
  if (target && (
    target.closest('.mobile-sidebar') || 
    target.closest('.sidebar-content') ||
    target.closest('.nav-section') ||
    target.classList.contains('mobile-sidebar') ||
    target.classList.contains('sidebar-content') ||
    target.classList.contains('nav-section')
  )) {
    return // Allow scrolling inside sidebar
  }
  
  // Prevent scrolling on the main page
  e.preventDefault()
  e.stopPropagation()
  return false
}

// Lock body scroll when sidebar is open
watch(() => props.isOpen, (isOpen) => {
  const body = document.body
  
  if (isOpen) {
    // Store current scroll position
    const scrollY = window.scrollY
    
    // Add scroll lock class for CSS control
    body.classList.add('sidebar-scroll-lock')
    
    // Simple CSS-based scroll prevention (no position: fixed)
    body.style.setProperty('overflow', 'hidden', 'important')
    body.style.setProperty('overflow-y', 'hidden', 'important')
    
    // Store scroll position for restoration
    body.dataset.scrollY = scrollY.toString()
    
    // Prevent touch scrolling on mobile
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('wheel', preventScroll, { passive: false })
  } else {
    // Restore scroll position
    const scrollY = parseInt(body.dataset.scrollY || '0')
    
    // Remove scroll lock class
    body.classList.remove('sidebar-scroll-lock')
    
    // Remove simple scroll lock styles
    body.style.removeProperty('overflow')
    body.style.removeProperty('overflow-y')
    
    // Remove event listeners
    document.removeEventListener('touchmove', preventScroll)
    document.removeEventListener('wheel', preventScroll)
    
    // Restore scroll position
    window.scrollTo(0, scrollY)
    
    // Clean up data attribute
    delete body.dataset.scrollY
  }
})
</script>

<style scoped>
/* Mobile Menu Overlay */
.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.mobile-menu-overlay.active {
  display: block;
  opacity: 1;
  pointer-events: all;
}

/* Mobile Sidebar */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Hide scrollbar for WebKit browsers */
.mobile-sidebar::-webkit-scrollbar {
  display: none;
}

.mobile-sidebar.active {
  transform: translateX(0);
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.98);
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.brand-logo svg {
  color: white;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.2px;
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 1px 0 0 0;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.close-button {
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.close-button:active {
  transform: scale(0.95) rotate(90deg);
}

/* User Profile Section - Compact Design */
.sidebar-user-profile {
  padding: 10px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.98);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* User Info Row */
.user-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar-compact {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(99, 102, 241, 0.4);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.avatar-placeholder-compact {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name-compact {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.user-email-compact {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(15, 23, 42, 0.96);
  overflow-y: auto;
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Hide scrollbar for WebKit browsers */
.sidebar-content::-webkit-scrollbar {
  display: none;
}

/* Navigation Sections */
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-section-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 0 4px;
}

/* Featured Action Button */
.featured-action-button {
  display: flex;
  align-items: center;
  padding: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.featured-action-button:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.featured-action-button:active {
  transform: translateY(0);
}

.featured-action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.featured-action-button:hover::before {
  left: 100%;
}

/* Action Components */
.action-icon.featured {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
}

.action-icon.featured svg {
  color: white;
  animation: pulse 2s infinite;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.action-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin: 1px 0 0 0;
  font-weight: 500;
}

.action-indicator {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.featured-action-button:hover .action-indicator {
  transform: translateX(3px);
  color: white;
}

/* Navigation Items */
.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.12);
  color: #ffffff;
  transform: translateX(4px);
  border-color: rgba(99, 102, 241, 0.2);
}

.nav-item:active {
  transform: translateX(2px) scale(0.98);
}

.nav-icon {
  width: 28px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin-right: 14px;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-icon {
  background: rgba(255, 255, 255, 0.15);
}

.nav-icon svg {
  opacity: 0.9;
}

.nav-item:hover .nav-icon svg {
  opacity: 1;
}

.nav-label {
  font-size: 13px;
  font-weight: 500;
}

/* Secondary Action Button */
.secondary-action-button {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255, 255, 255, 0.9);
}

.secondary-action-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  color: #ffffff;
}

.secondary-action-button:active {
  transform: translateY(0);
}

.action-icon.secondary {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.action-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
}

.secondary-action-button .action-indicator {
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.secondary-action-button:hover .action-indicator {
  transform: translateX(2px);
  color: rgba(255, 255, 255, 0.9);
}

/* User Profile at Bottom */
.sidebar-user-profile {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(15, 23, 42, 0.98);
  margin-top: auto;
}

.sidebar-user-profile .user-avatar-large {
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

.sidebar-user-profile .user-info {
  text-align: center;
}

/* Compact User Actions */
.user-actions-compact {
  display: flex;
  gap: 8px;
}

.user-action-button-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.user-action-button-compact:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-action-button-compact.logout {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.user-action-button-compact.logout:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fef2f2;
}

/* Icon-only logout button */
.user-action-button-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
}

.user-action-button-icon-only:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-action-button-icon-only.logout {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.user-action-button-icon-only.logout:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fef2f2;
}

.user-action-button-icon-only.settings {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
}

.user-action-button-icon-only.settings:hover {
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.5);
  color: #f8fafc;
}

/* Hide action labels on small screens for even more compactness */
@media (max-width: 480px) {
  .user-action-button-compact .action-label {
    display: none;
  }
  
  .user-action-button-compact {
    padding: 8px;
    min-width: 40px;
  }
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-section {
  animation: fadeInUp 0.4s ease-out;
}

.nav-section:nth-child(2) {
  animation-delay: 0.1s;
}

.nav-section:nth-child(3) {
  animation-delay: 0.2s;
}

.nav-section:nth-child(4) {
  animation-delay: 0.3s;
}

/* Responsive Design */
@media (max-width: 480px) {
  .mobile-sidebar {
    width: 260px;
  }

  .sidebar-header {
    padding: 20px 16px;
  }

  .brand-logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .brand-title {
    font-size: 16px;
  }

  .brand-subtitle {
    font-size: 11px;
  }

  .sidebar-content {
    padding: 16px;
    gap: 24px;
  }

  .nav-section-title {
    font-size: 12px;
  }

  .featured-action-button {
    padding: 14px;
    border-radius: 14px;
  }

  .action-icon.featured {
    width: 36px;
    height: 36px;
    margin-right: 12px;
  }

  .action-title {
    font-size: 15px;
  }

  .action-subtitle {
    font-size: 12px;
  }

  .nav-item {
    padding: 10px 12px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }

  .nav-label {
    font-size: 14px;
  }

  .secondary-action-button {
    padding: 12px 14px;
  }

  .action-icon.secondary {
    width: 28px;
    height: 28px;
    margin-right: 10px;
  }

  .action-label {
    font-size: 14px;
  }

  .sidebar-user-profile {
    padding: 12px;
    gap: 10px;
  }

  .user-avatar-compact {
    width: 40px;
    height: 40px;
  }

  .avatar-placeholder-compact {
    font-size: 14px;
  }

  .user-name-compact {
    font-size: 14px;
  }

  .user-email-compact {
    font-size: 11px;
  }

  .user-action-button-compact {
    padding: 6px 8px;
    font-size: 12px;
    gap: 4px;
  }
}

@media (max-width: 320px) {
  .mobile-sidebar {
    width: 240px;
  }

  .brand-section {
    gap: 10px;
  }

  .brand-logo {
    width: 32px;
    height: 32px;
  }

  .brand-title {
    font-size: 15px;
  }

  .sidebar-content {
    padding: 14px;
    gap: 20px;
  }
}
</style>
