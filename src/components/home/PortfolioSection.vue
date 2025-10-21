<template>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Portfolio filter state
const activeFilter = ref('All')
const filters = ['All', 'Web Design', 'Branding', 'UI/UX', 'Templates']

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
  {
    title: 'Freedom Ceremony',
    category: 'Templates',
    image: '/templates/freedom-ceremony-preview.svg',
    description: 'Beautiful Freedom Ceremony template with customizable text and images'
  },
])

// Computed filtered projects
const filteredProjects = computed(() => {
  if (activeFilter.value === 'All') {
    return projects.value
  }
  return projects.value.filter(project => project.category === activeFilter.value)
})
</script>

<style scoped>
/* Portfolio Section */
.portfolio-section {
  padding: 100px 80px;
  background: white;
}

.portfolio-content {
  max-width: 1400px;
  margin: 0 auto;
}

.portfolio-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #1e293b;
}

.portfolio-subtitle {
  font-size: 18px;
  text-align: center;
  color: #64748b;
  margin-bottom: 50px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #06b6d4;
  color: #06b6d4;
}

.filter-btn.active {
  background: #06b6d4;
  border-color: #06b6d4;
  color: white;
}

/* Portfolio Grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.portfolio-item {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
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

.project-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.project-image:hover .project-overlay {
  opacity: 1;
}

.project-image:hover img {
  transform: scale(1.1);
}

.project-info {
  color: white;
}

.project-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.project-category {
  font-size: 14px;
  color: #06b6d4;
}

/* Responsive */
@media (max-width: 768px) {
  .portfolio-section {
    padding: 60px 20px;
  }

  .portfolio-title {
    font-size: 32px;
  }

  .portfolio-subtitle {
    font-size: 16px;
  }

  .portfolio-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>

