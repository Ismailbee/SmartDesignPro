<template>
  <section id="home" class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="title-white">We craft</span>
        <span class="title-accent">digital experiences</span>
        <span class="title-white">that captivate</span>
      </h1>
      
      <p class="hero-description">
        Award-winning design agency specializing in brand identity, web design, 
        and digital strategy. We transform ideas into compelling visual narratives.
      </p>
      
      <div class="hero-actions">
        <button class="btn-primary" @click="$emit('startProject')">
          Start Your Project
        </button>
        <button class="btn-marketplace" @click="$emit('openMarketplace')">
          🎨 Browse Templates
        </button>
        <button class="btn-secondary" @click="scrollToSection('template')">
          View Templates
        </button>
      </div>
    </div>
    
    <!-- Background decoration -->
    <div class="hero-background"></div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  startProject: []
  openMarketplace: []
}>()

const scrollToSection = (sectionId: string) => {
  console.log('🔍 Hero: Scrolling to section:', sectionId)
  const element = document.getElementById(sectionId)

  if (element) {
    console.log('✅ Hero: Element found:', element)
    const headerOffset = 80
    const elementPosition = element.getBoundingClientRect().top
    const currentScrollY = window.scrollY || window.pageYOffset
    const offsetPosition = elementPosition + currentScrollY - headerOffset

    console.log('📊 Hero: Scroll calculation:', {
      elementPosition,
      currentScrollY,
      offsetPosition,
      headerOffset
    })

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  } else {
    console.error('❌ Hero: Element not found with ID:', sectionId)
  }
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  min-height: 750px;
  justify-content: left;
  padding: 150px 80px 80px;
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}


.hero-content {
  max-width: 800px;
  z-index: 2;
  position: relative;
}

.hero-title {
  font-size: 64px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-white {
  color: white;
}

.title-accent {
  color: #06b6d4;
  background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-marketplace,
.btn-secondary {
  padding: 16px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
}

.btn-marketplace {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn-marketplace:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-background {
  
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  z-index: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 120px 20px 60px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-marketplace,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>

