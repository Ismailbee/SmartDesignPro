<template>
  <div class="panel-header">
    <div class="header-left">
      <!-- Home Button -->
      <button @click="$emit('home')" class="back-btn home-btn" title="Go to Home">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
      
      <!-- Sidebar Toggle (hamburger menu) -->
      <button @click="$emit('toggle-sidebar')" class="back-btn sidebar-toggle" title="Projects">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    
    <h2 class="panel-title">{{ title }}</h2>
    
    <div class="header-actions">
      <!-- Help Button -->
      <button @click="$emit('help')" class="menu-btn" title="Help & Guide">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      <!-- Voice Toggle -->
      <button 
        @click="$emit('toggle-voice')" 
        class="menu-btn" 
        :class="{ 'active': isVoiceEnabled }" 
        :title="isVoiceEnabled ? 'Turn off voice' : 'Turn on voice'"
      >
        <svg v-if="isVoiceEnabled" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  title: string
  isVoiceEnabled: boolean
}>()

// Emits
defineEmits<{
  (e: 'back'): void
  (e: 'home'): void
  (e: 'help'): void
  (e: 'toggle-voice'): void
  (e: 'toggle-sidebar'): void
}>()
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e8e8e8;
}

.home-btn {
  background: linear-gradient(135deg, #10b98120 0%, #059e6d20 100%);
}

.home-btn:hover {
  background: linear-gradient(135deg, #10b98140 0%, #059e6d40 100%);
}

.sidebar-toggle {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, #667eea40 0%, #764ba240 100%);
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.menu-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Icon sizes */
.w-6 { width: 1.5rem; }
.h-6 { height: 1.5rem; }

/* Mobile adjustments */
@media (max-width: 380px) {
  .panel-header {
    padding: 8px 12px;
  }
  
  .back-btn, .menu-btn {
    width: 32px;
    height: 32px;
  }
  
  .panel-title {
    font-size: 0.9rem;
  }
  
  .header-actions {
    gap: 2px;
  }
}
</style>
