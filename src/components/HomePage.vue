<template>
  <div class="home-page">
    <!-- Professional Header -->
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
        </nav>
        
        <button class="cta-button" @click="handleGetQuote">
          Get Started 
        </button>
      </div>
    </header>

    <!-- Hero Section -->
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
          <button class="btn-primary" @click="handleStartProject">
            Start Your Project
          </button>
          <button class="btn-marketplace" @click="handleOpenMarketplace">
            🎨 Browse Templates
          </button>
          <button class="btn-secondary" @click="scrollToSection('portfolio')">
            View Our Work
          </button>
        </div>
      </div>
      
      <!-- Background decoration -->
      <div class="hero-background"></div>
    </section>

    <!-- Portfolio Section -->
    <section id="portfolio" class="portfolio-section">
      <div class="portfolio-content">
        <h2 class="portfolio-title">Our Portfolio</h2>
        <p class="portfolio-subtitle">
          Explore our latest projects and see how we bring creative visions to life
        </p>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter"
            :class="['filter-btn', { active: activeFilter === filter }]"
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <!-- Portfolio Grid -->
        <div class="portfolio-grid">
          <div
            v-for="(project, index) in filteredProjects"
            :key="index"
            class="portfolio-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="project-image">
              <img :src="project.image" :alt="project.title" />
              <div class="project-overlay">
                <div class="project-info">
                  <h3 class="project-title">{{ project.title }}</h3>
                  <p class="project-category">{{ project.category }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services-section">
      <div class="services-content">
        <h2 class="services-title">Our Services</h2>
        <p class="services-subtitle">
          We offer comprehensive design solutions to help your brand stand out<br>
          in the digital landscape
        </p>

        <!-- Services Grid -->
        <div class="services-grid">
          <!-- Brand Identity -->
          <div class="service-card">
            <div class="service-icon">🎨</div>
            <h3 class="service-title">Brand Identity</h3>
            <p class="service-description">
              Complete brand development from concept to execution, including logo design, brand 
              guidelines, and visual identity systems.
            </p>
            <ul class="service-features">
              <li>Logo Design</li>
              <li>Brand Guidelines</li>
              <li>Color Palettes</li>
              <li>Typography</li>
            </ul>
            <button class="service-btn" @click="handleLearnMore('brand-identity')">
              Learn More
            </button>
          </div>

          <!-- Web Design -->
          <div class="service-card">
            <div class="service-icon">💻</div>
            <h3 class="service-title">Web Design</h3>
            <p class="service-description">
              Custom website design and development that combines stunning visuals with seamless 
              user experience and performance.
            </p>
            <ul class="service-features">
              <li>Responsive Design</li>
              <li>User Experience</li>
              <li>Development</li>
              <li>SEO Optimization</li>
            </ul>
            <button class="service-btn" @click="handleLearnMore('web-design')">
              Learn More
            </button>
          </div>

          <!-- UI/UX Design -->
          <div class="service-card">
            <div class="service-icon">📱</div>
            <h3 class="service-title">UI/UX Design</h3>
            <p class="service-description">
              User-centered design approach for digital products, focusing on intuitive interfaces 
              and exceptional user experiences.
            </p>
            <ul class="service-features">
              <li>User Research</li>
              <li>Wireframing</li>
              <li>Prototyping</li>
              <li>User Testing</li>
            </ul>
            <button class="service-btn" @click="handleLearnMore('ui-ux-design')">
              Learn More
            </button>
          </div>

          <!-- Digital Strategy -->
          <div class="service-card">
            <div class="service-icon">📊</div>
            <h3 class="service-title">Digital Strategy</h3>
            <p class="service-description">
              Comprehensive digital marketing strategies that align with your business goals and 
              drive meaningful results.
            </p>
            <ul class="service-features">
              <li>Market Analysis</li>
              <li>Content Strategy</li>
              <li>Social Media</li>
              <li>Analytics</li>
            </ul>
            <button class="service-btn" @click="handleLearnMore('digital-strategy')">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Process Section -->
    <section class="process-section">
      <div class="process-content">
        <h2 class="process-title">Our Process</h2>
        <p class="process-subtitle">
          A proven methodology that ensures exceptional results for every project
        </p>

        <!-- Process Steps -->
        <div class="process-grid">
          <!-- Step 1: Discovery -->
          <div class="process-card">
            <div class="process-icon">🔍</div>
            <div class="process-number">01</div>
            <h3 class="process-step-title">Discovery</h3>
            <p class="process-description">
              We dive deep into understanding your brand, goals, and target audience through 
              comprehensive research and strategy sessions.
            </p>
            <div class="process-arrow">→</div>
          </div>

          <!-- Step 2: Design -->
          <div class="process-card">
            <div class="process-icon">✨</div>
            <div class="process-number">02</div>
            <h3 class="process-step-title">Design</h3>
            <p class="process-description">
              Our creative team develops innovative concepts and visual solutions that align with your 
              brand identity and objectives.
            </p>
            <div class="process-arrow">→</div>
          </div>

          <!-- Step 3: Development -->
          <div class="process-card">
            <div class="process-icon">⚡</div>
            <div class="process-number">03</div>
            <h3 class="process-step-title">Development</h3>
            <p class="process-description">
              We bring designs to life with clean, efficient code and seamless functionality across all 
              devices and platforms.
            </p>
            <div class="process-arrow">→</div>
          </div>

          <!-- Step 4: Launch -->
          <div class="process-card">
            <div class="process-icon">🚀</div>
            <div class="process-number">04</div>
            <h3 class="process-step-title">Launch</h3>
            <p class="process-description">
              We ensure a smooth launch with thorough testing, optimization, and ongoing support to 
              maximize your success.
            </p>
          </div>
        </div>

        <!-- CTA Button -->
        <div class="process-cta">
          <button class="process-btn" @click="handleStartProject">
            Start Your Project
          </button>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section id="team" class="team-section">
      <div class="team-content">
        <h2 class="team-title">Meet Our Team</h2>
        <p class="team-subtitle">
          Talented designers and developers passionate about creating<br>
          exceptional digital experiences
        </p>

        <!-- Team Grid -->
        <div class="team-grid">
          <!-- Team Member 1 -->
          <div class="team-card">
            <div class="team-avatar">
              <img src="https://i.pravatar.cc/150?img=1" alt="Sarah Chen" />
            </div>
            <h3 class="team-name">Sarah Chen</h3>
            <p class="team-role">Creative Director</p>
            <p class="team-bio">
              Leading creative vision with 10+ years in brand design
            </p>
            <div class="team-skills">
              <span class="skill-tag">Brand Strategy</span>
              <span class="skill-tag">Art Direction</span>
              <span class="skill-tag">Team Leadership</span>
            </div>
          </div>

          <!-- Team Member 2 -->
          <div class="team-card">
            <div class="team-avatar">
              <img src="https://i.pravatar.cc/150?img=13" alt="Marcus Rodriguez" />
            </div>
            <h3 class="team-name">Marcus Rodriguez</h3>
            <p class="team-role">Senior UI/UX Designer</p>
            <p class="team-bio">
              Crafting intuitive digital experiences for global brands
            </p>
            <div class="team-skills">
              <span class="skill-tag">User Research</span>
              <span class="skill-tag">Prototyping</span>
              <span class="skill-tag">Design Systems</span>
            </div>
          </div>

          <!-- Team Member 3 -->
          <div class="team-card">
            <div class="team-avatar">
              <img src="https://i.pravatar.cc/150?img=5" alt="Emily Watson" />
            </div>
            <h3 class="team-name">Emily Watson</h3>
            <p class="team-role">Brand Designer</p>
            <p class="team-bio">
              Specializing in visual identity and brand storytelling
            </p>
            <div class="team-skills">
              <span class="skill-tag">Logo Design</span>
              <span class="skill-tag">Brand Guidelines</span>
              <span class="skill-tag">Print Design</span>
            </div>
          </div>

          <!-- Team Member 4 -->
          <div class="team-card">
            <div class="team-avatar">
              <img src="https://i.pravatar.cc/150?img=12" alt="David Kim" />
            </div>
            <h3 class="team-name">David Kim</h3>
            <p class="team-role">Web Developer</p>
            <p class="team-bio">
              Full-stack developer bringing designs to life
            </p>
            <div class="team-skills">
              <span class="skill-tag">React</span>
              <span class="skill-tag">Node.js</span>
              <span class="skill-tag">Performance Optimization</span>
            </div>
          </div>

          <!-- Team Member 5 -->
          <div class="team-card">
            <div class="team-avatar">
              <img src="https://i.pravatar.cc/150?img=9" alt="Lisa Thompson" />
            </div>
            <h3 class="team-name">Lisa Thompson</h3>
            <p class="team-role">Digital Strategist</p>
            <p class="team-bio">
              Data-driven marketing strategies that deliver results
            </p>
            <div class="team-skills">
              <span class="skill-tag">SEO</span>
              <span class="skill-tag">Analytics</span>
              <span class="skill-tag">Content Strategy</span>
            </div>
          </div>

          <!-- Team Member 6 -->
          <div class="team-card">
            <div class="team-avatar">
              <img src="https://i.pravatar.cc/150?img=14" alt="Alex Johnson" />
            </div>
            <h3 class="team-name">Alex Johnson</h3>
            <p class="team-role">Motion Designer</p>
            <p class="team-bio">
              Creating engaging animations and interactive experiences
            </p>
            <div class="team-skills">
              <span class="skill-tag">After Effects</span>
              <span class="skill-tag">Cinema 4D</span>
              <span class="skill-tag">Interactive Design</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="testimonials-content">
        <h2 class="testimonials-title">Client Testimonials</h2>
        <p class="testimonials-subtitle">
          Don't just take our word for it - hear what our clients have to say about<br>
          working with us
        </p>

        <!-- Testimonials Grid -->
        <div class="testimonials-grid">
          <!-- Testimonial 1 -->
          <div class="testimonial-card">
            <div class="stars">
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
            </div>
            <p class="testimonial-text">
              "The team delivered an exceptional brand identity that perfectly captures our vision. 
              Our brand recognition has increased by 300% since launch."
            </p>
            <div class="testimonial-author">
              <div class="author-avatar" style="background: #06b6d4;">
                <span>J</span>
              </div>
              <div class="author-info">
                <h4 class="author-name">Jennifer Walsh</h4>
                <p class="author-title">CEO at TechFlow Solutions</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="testimonial-card">
            <div class="stars">
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
            </div>
            <p class="testimonial-text">
              "Outstanding web design and development. The new site has improved our conversion rate 
              by 150% and user engagement is through the roof."
            </p>
            <div class="testimonial-author">
              <div class="author-avatar" style="background: #06b6d4;">
                <span>M</span>
              </div>
              <div class="author-info">
                <h4 class="author-name">Michael Chen</h4>
                <p class="author-title">Marketing Director at GreenLeaf Ventures</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="testimonial-card">
            <div class="stars">
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
            </div>
            <p class="testimonial-text">
              "Their UI/UX expertise transformed our app completely. User satisfaction scores have 
              never been higher, and retention has doubled."
            </p>
            <div class="testimonial-author">
              <div class="author-avatar" style="background: #06b6d4;">
                <span>S</span>
              </div>
              <div class="author-info">
                <h4 class="author-name">Sarah Martinez</h4>
                <p class="author-title">Product Manager at Innovate Labs</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 4 -->
          <div class="testimonial-card">
            <div class="stars">
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
              <span class="star">⭐</span>
            </div>
            <p class="testimonial-text">
              "Professional, creative, and results-driven. They understood our needs perfectly and 
              delivered beyond our expectations."
            </p>
            <div class="testimonial-author">
              <div class="author-avatar" style="background: #06b6d4;">
                <span>D</span>
              </div>
              <div class="author-info">
                <h4 class="author-name">David Thompson</h4>
                <p class="author-title">Founder at Apex Digital</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Badge -->
        <div class="trust-badge">
          <p>Trusted by 100+ companies</p>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section">
      <div class="contact-content">
        <div class="contact-grid">
          <!-- Left Side - Info -->
          <div class="contact-info">
            <h2 class="contact-title">Let's Create Something Amazing Together</h2>
            <p class="contact-description">
              Ready to transform your brand? Get in touch and let's discuss how we can help 
              bring your vision to life.
            </p>

            <div class="contact-methods">
              <!-- Visit Studio -->
              <div class="contact-method">
                <div class="method-icon" style="background: #06b6d4;">
                  <span>📍</span>
                </div>
                <div class="method-details">
                  <h4 class="method-title">Visit Our Studio</h4>
                  <p class="method-text">123 Design Street, Creative District, NY 10001</p>
                </div>
              </div>

              <!-- Email -->
              <div class="contact-method">
                <div class="method-icon" style="background: #06b6d4;">
                  <span>✉️</span>
                </div>
                <div class="method-details">
                  <h4 class="method-title">Email Us</h4>
                  <p class="method-text">hello@designstudio.com</p>
                </div>
              </div>

              <!-- Call -->
              <div class="contact-method">
                <div class="method-icon" style="background: #06b6d4;">
                  <span>📞</span>
                </div>
                <div class="method-details">
                  <h4 class="method-title">Call Us</h4>
                  <p class="method-text">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Form -->
          <div class="contact-form-wrapper">
            <h3 class="form-title">Start Your Project</h3>
            <form class="contact-form" @submit.prevent="handleSubmitContact">
              <div class="form-row">
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="Your Name"
                  v-model="contactForm.name"
                  required
                />
                <input 
                  type="email" 
                  class="form-input" 
                  placeholder="Email Address"
                  v-model="contactForm.email"
                  required
                />
              </div>
              
              <input 
                type="text" 
                class="form-input full-width" 
                placeholder="Company Name"
                v-model="contactForm.company"
              />
              
              <select 
                class="form-select" 
                v-model="contactForm.budget"
                required
              >
                <option value="" disabled selected>Select Budget Range</option>
                <option value="5k-10k">$5,000 - $10,000</option>
                <option value="10k-25k">$10,000 - $25,000</option>
                <option value="25k-50k">$25,000 - $50,000</option>
                <option value="50k+">$50,000+</option>
              </select>
              
              <textarea 
                class="form-textarea" 
                placeholder="Tell us about your project..."
                v-model="contactForm.message"
                rows="5"
                required
              ></textarea>
              
              <button type="submit" class="form-submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-grid">
          <!-- Left Column - Brand -->
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="logo-text">Design</span>
              <span class="logo-text-accent">Studio</span>
            </div>
            <p class="footer-description">
              We're a creative design agency passionate about crafting exceptional digital 
              experiences that help brands connect with their audiences and achieve their goals.
            </p>
            <div class="social-links">
              <a href="#" class="social-icon" aria-label="Twitter">
                <span>🐦</span>
              </a>
              <a href="#" class="social-icon" aria-label="LinkedIn">
                <span>💼</span>
              </a>
              <a href="#" class="social-icon" aria-label="Facebook">
                <span>📘</span>
              </a>
              <a href="#" class="social-icon" aria-label="Pinterest">
                <span>📌</span>
              </a>
            </div>
          </div>

          <!-- Services Column -->
          <div class="footer-links">
            <h4 class="footer-heading">Services</h4>
            <ul class="footer-list">
              <li><a href="#" class="footer-link">Brand Identity</a></li>
              <li><a href="#" class="footer-link">Web Design</a></li>
              <li><a href="#" class="footer-link">UI/UX Design</a></li>
              <li><a href="#" class="footer-link">Digital Strategy</a></li>
              <li><a href="#" class="footer-link">Motion Graphics</a></li>
            </ul>
          </div>

          <!-- Company Column -->
          <div class="footer-links">
            <h4 class="footer-heading">Company</h4>
            <ul class="footer-list">
              <li><a href="#" class="footer-link">About Us</a></li>
              <li><a href="#" class="footer-link">Our Team</a></li>
              <li><a href="#" class="footer-link">Careers</a></li>
              <li><a href="#" class="footer-link">Blog</a></li>
              <li><a href="#" class="footer-link">Contact</a></li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <p class="footer-copyright">
            © 2024 DesignStudio. All rights reserved.
          </p>
          <div class="footer-legal">
            <a href="#" class="legal-link">Privacy Policy</a>
            <a href="#" class="legal-link">Terms of Service</a>
            <a href="#" class="legal-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMarketplaceStore } from '@/stores/marketplace'

const router = useRouter()
const authStore = useAuthStore()
const marketplaceStore = useMarketplaceStore()

// Portfolio filter state
const activeFilter = ref('All')
const filters = ['All', 'Web Design', 'Branding', 'UI/UX']

// Contact form state
const contactForm = ref({
  name: '',
  email: '',
  company: '',
  budget: '',
  message: ''
})

// Portfolio projects
const projects = ref([
  { title: 'E-commerce Platform', category: 'Web Design', image: 'https://picsum.photos/400/300?random=1' },
  { title: 'Brand Identity', category: 'Branding', image: 'https://picsum.photos/400/300?random=2' },
  { title: 'Mobile App Design', category: 'UI/UX', image: 'https://picsum.photos/400/300?random=3' },
  { title: 'Corporate Website', category: 'Web Design', image: 'https://picsum.photos/400/300?random=4' },
  { title: 'Logo Design', category: 'Branding', image: 'https://picsum.photos/400/300?random=5' },
  { title: 'Dashboard Interface', category: 'UI/UX', image: 'https://picsum.photos/400/300?random=6' },
  { title: 'Restaurant Website', category: 'Web Design', image: 'https://picsum.photos/400/300?random=7' },
  { title: 'Corporate Identity', category: 'Branding', image: 'https://picsum.photos/400/300?random=8' },
  { title: 'SaaS Platform', category: 'UI/UX', image: 'https://picsum.photos/400/300?random=9' },
])

// Computed filtered projects
const filteredProjects = computed(() => {
  if (activeFilter.value === 'All') {
    return projects.value
  }
  return projects.value.filter(project => project.category === activeFilter.value)
})

const handleGetQuote = () => {
  console.log('Get Quote clicked')
  // Could open a quote/contact form modal
}

const handleStartProject = () => {
  console.log('🚀 Start Your Project clicked')
  console.log('📊 Auth Store:', authStore)
  console.log('🔐 Is Authenticated:', authStore.isAuthenticated)
  console.log('👤 Current User:', authStore.user)

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    console.log('🔓 User not authenticated, opening login modal...')

    // Show login modal
    authStore.openAuthModal('login')

    console.log('📱 Modal state after opening:', authStore.isAuthModalOpen)

    // Watch for authentication success
    const unwatch = authStore.$subscribe((_mutation, state) => {
      console.log('🔔 Auth state changed:', state)
      if (state.user && state.accessToken) {
        console.log('✅ User authenticated, redirecting to editor...')
        router.push('/editor')
        unwatch() // Stop watching
      }
    })
  } else {
    // User is already authenticated, go to editor
    console.log('✅ User already authenticated, redirecting to editor...')
    router.push('/editor')
  }
}

const handleViewWork = () => {
  console.log('View Our Work clicked')
  // Could navigate to portfolio view
}

const handleOpenMarketplace = () => {
  console.log('Open Marketplace clicked')
  marketplaceStore.openMarketplace()
}

const handleLearnMore = (service: string) => {
  console.log('Learn more about:', service)
  // Could open service details or navigate to services page
}

const handleSubmitContact = () => {
  console.log('Contact form submitted:', contactForm.value)
  // Here you would typically send the form data to a backend API
  alert('Thank you for your message! We will get back to you soon.')
  // Reset form
  contactForm.value = {
    name: '',
    email: '',
    company: '',
    budget: '',
    message: ''
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
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

.home-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* Header Styles */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-text {
  color: #1e293b;
}

.logo-text-accent {
  color: #06b6d4;
  margin-left: -2px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  color: #1e293b;
  text-decoration: none;
  font-size: 16px;
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

.cta-button {
  background: #06b6d4;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(6, 182, 212, 0.2);
}

.cta-button:hover {
  background: #0891b2;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(6, 182, 212, 0.3);
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: left;
  padding: 150px 80px 80px;
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.hero-content {
  max-width: 1200px;
  position: relative;
  z-index: 10;
}

.hero-title {
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  letter-spacing: -2px;
}

.title-white {
  color: #ffffff;
}

.title-accent {
  color: #06b6d4;
  text-shadow: 0 0 40px rgba(6, 182, 212, 0.2dd);
}

.hero-description {
  color: #cbd5e1;
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.7;
  max-width: 800px;
  margin-bottom: 48px;
  font-weight: 400; 
}

.hero-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-marketplace {
  padding: 18px 36px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: #06b6d4;
  color: white;
  border-color: #06b6d4;
  box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
}

.btn-primary:hover {
  background: #0891b2;
  border-color: #0891b2;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(6, 182, 212, 0.4);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.btn-marketplace {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.btn-marketplace:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
}

/* Background decoration */
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.hero-background::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 80px,
    rgba(6, 182, 212, 0.03) 80px,
    rgba(6, 182, 212, 0.03) 82px
  );
  animation: moveGrid 20s linear infinite;
}

@keyframes moveGrid {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Portfolio Section */
.portfolio-section {
  min-height: 100vh;
  background: #f8fafc;
  padding: 100px 40px;
}

.portfolio-content {
  max-width: 1400px;
  margin: 0 auto;
}

.portfolio-title {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.portfolio-subtitle {
  font-size: 18px;
  color: #64748b;
  text-align: center;
  margin-bottom: 48px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 12px 28px;
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #06b6d4;
  color: #06b6d4;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: #06b6d4;
  color: white;
  border-color: #06b6d4;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

/* Portfolio Grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.portfolio-item {
  animation: fadeInItem 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInItem {
  to {
    opacity: 1;
  }
}

.project-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.4s ease;
  cursor: pointer;
  aspect-ratio: 4 / 3;
}

.project-image:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.project-image:hover img {
  transform: scale(1.1);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.project-image:hover .project-overlay {
  opacity: 1;
}

.project-info {
  transform: translateY(20px);
  transition: transform 0.4s ease;
}

.project-image:hover .project-info {
  transform: translateY(0);
}

.project-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
}

.project-category {
  font-size: 14px;
  color: #06b6d4;
  font-weight: 600;
}

/* Services Section */
.services-section {
  min-height: 100vh;
  background: #ffffff;
  padding: 100px 40px;
}

.services-content {
  max-width: 1400px;
  margin: 0 auto;
}

.services-title {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.services-subtitle {
  font-size: 18px;
  color: #64748b;
  text-align: center;
  margin-bottom: 64px;
  line-height: 1.6;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-top: 48px;
}

.service-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 40px 32px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #06b6d4, #0891b2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #06b6d4;
}

.service-card:hover::before {
  transform: scaleX(1);
}

.service-icon {
  font-size: 48px;
  margin-bottom: 24px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1) rotate(5deg);
}

.service-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.service-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 24px;
}

.service-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
}

.service-features li {
  font-size: 14px;
  color: #475569;
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
}

.service-features li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #06b6d4;
  font-weight: bold;
  font-size: 18px;
}

.service-btn {
  width: 100%;
  padding: 14px 24px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-btn:hover {
  background: #06b6d4;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
}

/* Process Section */
.process-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  padding: 100px 40px;
  position: relative;
  overflow: hidden;
}

.process-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.process-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.process-title {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.process-subtitle {
  font-size: 18px;
  color: #cbd5e1;
  text-align: center;
  margin-bottom: 64px;
  line-height: 1.6;
}

/* Process Grid */
.process-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-bottom: 64px;
}

.process-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px 32px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.process-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border-radius: 16px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
}

.process-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(6, 182, 212, 0.5);
}

.process-card:hover::before {
  opacity: 0.15;
}

.process-icon {
  font-size: 48px;
  margin-bottom: 20px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.process-card:hover .process-icon {
  transform: scale(1.2) rotate(-5deg);
}

.process-number {
  font-size: 14px;
  font-weight: 700;
  color: #06b6d4;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.process-step-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.process-description {
  font-size: 15px;
  color: #cbd5e1;
  line-height: 1.7;
  margin-bottom: 0;
}

.process-arrow {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: #06b6d4;
  font-weight: bold;
  opacity: 0.5;
  display: none;
}

@media (min-width: 1024px) {
  .process-card:not(:last-child) .process-arrow {
    display: block;
  }
}

.process-cta {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.process-btn {
  padding: 18px 48px;
  background: #06b6d4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
}

.process-btn:hover {
  background: #0891b2;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(6, 182, 212, 0.4);
}

/* Team Section */
.team-section {
  min-height: 100vh;
  background: #f8fafc;
  padding: 100px 40px;
}

.team-content {
  max-width: 1400px;
  margin: 0 auto;
}

.team-title {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.team-subtitle {
  font-size: 18px;
  color: #64748b;
  text-align: center;
  margin-bottom: 64px;
  line-height: 1.6;
}

/* Team Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.team-card {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  transition: all 0.4s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.team-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #06b6d4, #0891b2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #06b6d4;
}

.team-card:hover::before {
  transform: scaleX(1);
}

.team-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e2e8f0;
  transition: all 0.4s ease;
  position: relative;
}

.team-card:hover .team-avatar {
  border-color: #06b6d4;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3);
}

.team-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.team-card:hover .team-avatar img {
  transform: scale(1.1);
}

.team-name {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.team-role {
  font-size: 16px;
  color: #06b6d4;
  font-weight: 600;
  margin-bottom: 16px;
}

.team-bio {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  min-height: 40px;
}

.team-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.skill-tag {
  display: inline-block;
  padding: 6px 14px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.team-card:hover .skill-tag {
  background: #e0f2fe;
  color: #0891b2;
}

/* Testimonials Section */
.testimonials-section {
  min-height: 100vh;
  background: #ffffff;
  padding: 100px 40px;
}

.testimonials-content {
  max-width: 1400px;
  margin: 0 auto;
}

.testimonials-title {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.testimonials-subtitle {
  font-size: 18px;
  color: #64748b;
  text-align: center;
  margin-bottom: 64px;
  line-height: 1.6;
}

/* Testimonials Grid */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 32px;
  margin-bottom: 64px;
}

.testimonial-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.4s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.testimonial-card::before {
  content: '"';
  position: absolute;
  top: 20px;
  right: 24px;
  font-size: 80px;
  color: #e2e8f0;
  font-family: Georgia, serif;
  line-height: 1;
  opacity: 0.3;
}

.testimonial-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #06b6d4;
}

.stars {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
}

.star {
  font-size: 18px;
}

.testimonial-text {
  font-size: 15px;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.testimonial-card:hover .author-avatar {
  transform: scale(1.1);
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.author-title {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.trust-badge {
  text-align: center;
  margin-top: 48px;
}

.trust-badge p {
  font-size: 16px;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Contact Section */
.contact-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  padding: 100px 40px;
  position: relative;
  overflow: hidden;
}

.contact-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.contact-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}

/* Contact Info */
.contact-info {
  padding-right: 40px;
}

.contact-title {
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 24px;
  line-height: 1.2;
  letter-spacing: -1px;
}

.contact-description {
  font-size: 18px;
  color: #cbd5e1;
  line-height: 1.7;
  margin-bottom: 48px;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-method {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.method-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.contact-method:hover .method-icon {
  transform: scale(1.1);
}

.method-details {
  flex: 1;
}

.method-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.method-text {
  font-size: 15px;
  color: #cbd5e1;
  margin: 0;
}

/* Contact Form */
.contact-form-wrapper {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 32px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 15px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #06b6d4;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2306b6d4' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.form-select option {
  background: #1e293b;
  color: #ffffff;
}

.full-width {
  grid-column: 1 / -1;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-submit-btn {
  width: 100%;
  padding: 16px 32px;
  background: #06b6d4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
}

.form-submit-btn:hover {
  background: #0891b2;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(6, 182, 212, 0.4);
}

/* Footer */
.footer {
  background: #0f172a;
  padding: 80px 40px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 64px;
  margin-bottom: 48px;
}

/* Footer Brand */
.footer-brand {
  max-width: 400px;
}

.footer-logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 20px;
}

.footer-logo .logo-text {
  color: #ffffff;
}

.footer-logo .logo-text-accent {
  color: #06b6d4;
  margin-left: -2px;
}

.footer-description {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 28px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-icon:hover {
  background: #06b6d4;
  border-color: #06b6d4;
  transform: translateY(-2px);
}

/* Footer Links */
.footer-links {
  display: flex;
  flex-direction: column;
}

.footer-heading {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: #94a3b8;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-block;
}

.footer-link:hover {
  color: #06b6d4;
  transform: translateX(4px);
}

/* Footer Bottom */
.footer-bottom {
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-copyright {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.footer-legal {
  display: flex;
  gap: 24px;
}

.legal-link {
  color: #64748b;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: #06b6d4;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    padding: 16px 24px;
  }
  
  .nav-menu {
    gap: 24px;
  }
  
  .nav-link {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .nav-menu {
    display: none; /* Show mobile menu on smaller screens */
  }
  
  .hero-section {
    padding: 100px 24px 60px;
  }
  
  .hero-title {
    font-size: 40px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }

  /* Portfolio responsive */
  .portfolio-section {
    padding: 60px 24px;
  }

  .portfolio-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  /* Services responsive */
  .services-section {
    padding: 60px 24px;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .service-card {
    padding: 32px 24px;
  }

  /* Process responsive */
  .process-section {
    padding: 60px 24px;
  }

  .process-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .process-card {
    padding: 32px 24px;
  }

  .process-arrow {
    display: none !important;
  }

  /* Team responsive */
  .team-section {
    padding: 60px 24px;
  }

  .team-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }

  .team-card {
    padding: 32px 24px;
  }

  /* Testimonials responsive */
  .testimonials-section {
    padding: 60px 24px;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .testimonial-card {
    padding: 28px 24px;
  }

  /* Contact responsive */
  .contact-section {
    padding: 60px 24px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .contact-info {
    padding-right: 0;
  }

  .contact-form-wrapper {
    padding: 32px 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .footer {
    padding: 60px 24px 24px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-brand {
    max-width: 100%;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .footer-legal {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 24px;
  }
  
  .cta-button {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .hero-title {
    font-size: 32px;
  }

  .portfolio-title {
    font-size: 32px;
  }

  .portfolio-subtitle {
    font-size: 16px;
  }

  .portfolio-grid {
    grid-template-columns: 1fr;
  }

  .services-title {
    font-size: 32px;
  }

  .services-subtitle {
    font-size: 16px;
  }

  .process-title {
    font-size: 32px;
  }

  .process-subtitle {
    font-size: 16px;
  }

  .process-btn {
    width: 100%;
    max-width: 300px;
  }

  .team-title {
    font-size: 32px;
  }

  .team-subtitle {
    font-size: 16px;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }

  .testimonials-title {
    font-size: 32px;
  }

  .testimonials-subtitle {
    font-size: 16px;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .testimonial-card::before {
    font-size: 60px;
    top: 16px;
    right: 16px;
  }

  .contact-title {
    font-size: 28px;
  }

  .contact-description {
    font-size: 16px;
  }

  .form-title {
    font-size: 20px;
  }

  .method-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}
</style>
