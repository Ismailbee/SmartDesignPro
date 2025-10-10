<template>
  <div class="home-page">
    <!-- Professional Header -->
    <HomeHeader @get-quote="handleGetQuote" />

    <!-- Hero Section -->
    <HeroSection 
      @start-project="handleStartProject" 
      @open-marketplace="handleOpenMarketplace" 
    />

    <!-- Portfolio Section -->
    <PortfolioSection />

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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMarketplaceStore } from '@/stores/marketplace'

// Import all home page components
import HomeHeader from '@/components/home/HomeHeader.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import PortfolioSection from '@/components/home/PortfolioSection.vue'
import ServicesSection from '@/components/home/ServicesSection.vue'
import ProcessSection from '@/components/home/ProcessSection.vue'
import TeamSection from '@/components/home/TeamSection.vue'
import TestimonialsSection from '@/components/home/TestimonialsSection.vue'
import ContactSection from '@/components/home/ContactSection.vue'
import HomeFooter from '@/components/home/HomeFooter.vue'

const router = useRouter()
const authStore = useAuthStore()
const marketplaceStore = useMarketplaceStore()

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

const handleOpenMarketplace = () => {
  marketplaceStore.openMarketplace()
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
html {
  scroll-behavior: smooth;
}

.home-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
</style>
