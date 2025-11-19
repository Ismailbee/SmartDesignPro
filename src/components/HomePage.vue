<template>
  <div class="home-page">
    <!-- Mobile Hamburger Button (Fixed Position) -->
    <button 
      class="mobile-hamburger-button"
      :class="{ 'sidebar-open': isSidebarOpen }"
      aria-label="Open menu"
      @click="toggleSidebar"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- Sidebar Component -->
    <Sidebar
      :is-open="isSidebarOpen"
      :user="authStore.user"
      @close="closeSidebar"
      @navigate="handleSidebarNavigation"
      @auto-design="handleSidebarAutoDesign"
      @toggle-auto-design="handleSidebarToggleAutoDesign"
      @more="handleSidebarMore"
      @settings="handleSidebarSettings"
      @logout="handleSidebarLogout"
    />

    <!-- Professional Header -->
    <HomeHeader ref="homeHeaderRef" @get-quote="handleGetQuote" />

    <!-- Hero Section -->
    <HeroSection
      @start-project="handleStartProject"
    />

    <!-- Template Section -->
    <TemplateSection />

    <!-- Services Section -->
    <ServicesSection @learn-more="handleLearnMore" />

    <!-- Process Section -->
    <ProcessSection @start-project="handleStartProject" />

    <!-- Team Section -->
    <TeamSection />

    <!-- Testimonials Section -->
    <TestimonialsSection />

    <!-- Contact Section -->
    <ContactSection @submit-contact="handleSubmitContact" />

    <!-- Footer -->
    <HomeFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'

// Import all home page components
import Sidebar from '@/components/home/Sidebar.vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import TemplateSection from '@/components/home/TemplateSection.vue'
import ServicesSection from '@/components/home/ServicesSection.vue'
import ProcessSection from '@/components/home/ProcessSection.vue'
import TeamSection from '@/components/home/TeamSection.vue'
import TestimonialsSection from '@/components/home/TestimonialsSection.vue'
import ContactSection from '@/components/home/ContactSection.vue'
import HomeFooter from '@/components/home/HomeFooter.vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// Component refs
const homeHeaderRef = ref<InstanceType<typeof HomeHeader> | null>(null)

// Sidebar state
const isSidebarOpen = ref(false)

// Sidebar functions
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleSidebarNavigation = (section: string) => {
  closeSidebar()
  // Wait for sidebar to close, then navigate
  setTimeout(() => {
    const element = document.querySelector(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 300)
}

const handleSidebarAutoDesign = () => {
  closeSidebar()
  // Wait for sidebar to close, then navigate to editor
  setTimeout(() => {
    if (!authStore.isAuthenticated) {
      authStore.openAuthModal('login')
    } else {
      router.push('/editor')
    }
  }, 300)
}

const handleSidebarToggleAutoDesign = () => {
  closeSidebar()
  // Wait for sidebar to close, then trigger AutoDesign modal via HomeHeader
  setTimeout(() => {
    homeHeaderRef.value?.toggleAutoDesign()
  }, 300)
}

const handleSidebarMore = () => {
  closeSidebar()
  // Use the HomeHeader ref to toggle the More menu
  setTimeout(() => {
    homeHeaderRef.value?.toggleMoreMenu()
  }, 300)
}

const handleSidebarSettings = () => {
  closeSidebar()
  setTimeout(() => {
    router.push('/settings')
  }, 300)
}

const handleSidebarLogout = async () => {
  closeSidebar()
  setTimeout(async () => {
    try {
      await authStore.logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, 300)
}

// Refresh user data when page loads (to get latest plan/tokens)
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user?.uid) {
    try {
      await userStore.fetchUser(
        authStore.user.uid,
        authStore.user.email,
        authStore.user.displayName || authStore.user.name
      )
      console.log('✅ User data refreshed on HomePage')
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  // Debug: Check if page is scrollable
  setTimeout(() => {
    const docHeight = document.documentElement.scrollHeight
    const winHeight = window.innerHeight
    const canScroll = docHeight > winHeight
    
    console.log('🔍 HomePage Scrollability Check:', {
      documentHeight: docHeight,
      windowHeight: winHeight,
      canScroll,
      difference: docHeight - winHeight,
      templateSection: document.getElementById('template'),
      allSectionIds: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
    })
  }, 1000)
})

const handleGetQuote = () => {
  console.log('Get Quote clicked')
}

const handleStartProject = () => {
  console.log('🚀 Start Your Project clicked')
  if (!authStore.isAuthenticated) {
    authStore.openAuthModal('login')
    const unwatch = authStore.$subscribe((_mutation: any, state: any) => {
      if (state.user) {
        router.push('/editor')
        unwatch()
      }
    })
  } else {
    router.push('/editor')
  }
}

const handleLearnMore = (service: string) => {
  console.log('Learn more about:', service)
}

const handleSubmitContact = (formData: any) => {
  console.log('Contact form submitted:', formData)
  alert('Thank you for your message! We will get back to you soon.')
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  /* Removed position: relative to allow fixed mobile menu to display above */
}

/* Mobile Hamburger Button */
.mobile-hamburger-button {
  display: none;
  position: fixed;
  top: 12px;
  left: 20px;
  z-index: 10001;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: none;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transition: all 0.3s ease;
  color: white;
}

.mobile-hamburger-button:hover {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.mobile-hamburger-button:active {
  transform: scale(0.95);
}

.mobile-hamburger-button svg {
  display: block;
}

/* Reduce z-index when sidebar is open so sidebar covers hamburger */
.mobile-hamburger-button.sidebar-open {
  z-index: 9999;
}

/* Show hamburger on mobile */
@media (max-width: 768px) {
  .mobile-hamburger-button {
    display: block;
  }
}

/* Smaller button on tiny screens */
@media (max-width: 480px) {
  .mobile-hamburger-button {
    top: 10px;
    left: 12px;
    padding: 8px;
    border-radius: 10px;
  }

  .mobile-hamburger-button svg {
    width: 20px;
    height: 20px;
  }
}
</style>
