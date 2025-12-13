<template>
  <ion-page style="height: 100vh; background-color: #f4f5f8;">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Smart Template Designer</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Input Section -->
      <div class="input-section">
        <ion-item>  
          <ion-label position="stacked">Message</ion-label>
          <ion-textarea
            v-model="message"
            placeholder="Type 'congratulation on your wedding' to see magic..."
            :rows="3"
            @ionInput="handleInput"
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Courtesy (Optional)</ion-label>
          <ion-input
            v-model="courtesy"
            placeholder="e.g. From the Smith Family"
          ></ion-input>
        </ion-item>
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <h3>Live Preview</h3>
        
        <!-- Template Container -->
        <div class="template-card">
          
          <!-- Empty State -->
          <div v-if="!hasContent" class="empty-state">
            <p>Start typing to generate your design...</p>
          </div>

          <!-- Active Design State -->
          <div v-else class="design-layout">
            
            <!-- Main Content Area (SVG or Text) -->
            <div class="main-content-area">
              
              <!-- Case 1: Keyword Match -> Inject SVG -->
              <div 
                v-if="activeKeywordConfig" 
                class="injected-svg-wrapper"
                :style="{ transform: `translateY(${activeKeywordConfig.offsetY}px)` }"
              >
                <!-- Using an img tag for the SVG, but could be inline SVG -->
                <img 
                  :src="activeKeywordConfig.svgUrl" 
                  alt="Special Design" 
                  class="design-svg"
                  @error="handleImageError"
                />
              </div>

              <!-- Case 2: No Match -> Show User Text -->
              <div v-else class="user-text-wrapper">
                <h1 class="template-text">{{ message }}</h1>
              </div>
              
            </div>

            <!-- Courtesy Section (Conditional) -->
            <div v-if="showCourtesy" class="courtesy-section">
              <div class="courtesy-divider"></div>
              <p class="courtesy-text">{{ courtesy }}</p>
            </div>

          </div>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonTextarea, 
  IonInput,
  IonButtons,
  IonBackButton
} from '@ionic/vue';

// --- Configuration Interface ---
interface KeywordConfig {
  phrase: string;      // The exact phrase to match
  svgUrl: string;      // The SVG to inject
  offsetY: number;     // Vertical offset in pixels
}

// --- Extensible Configuration ---
// Add more keywords here to extend functionality
const KEYWORD_CONFIGS: KeywordConfig[] = [
  {
    phrase: 'congratulation on your wedding',
    svgUrl: '/assets/svgs/wedding-congrats.svg', // Ensure this file exists
    offsetY: 20 // Move down 20px
  },
  {
    phrase: 'happy birthday',
    svgUrl: '/assets/svgs/birthday-cake.svg',
    offsetY: 10
  }
];

export default defineComponent({
  name: 'SmartTemplateDesigner',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonTextarea,
    IonInput,
    IonButtons,
    IonBackButton
  },
  setup() {
    console.log('SmartTemplateDesigner mounted');
    // --- State ---
    const message = ref('');
    const courtesy = ref('');

    // --- Computed Logic ---

    // 1. Check if there is any content to display
    const hasContent = computed(() => {
      return message.value.trim().length > 0;
    });

    // 2. Detect if the message matches a special keyword
    const activeKeywordConfig = computed(() => {
      if (!message.value) return null;

      const normalizedInput = message.value.toLowerCase();
      
      // Find a config where the input INCLUDES the phrase
      return KEYWORD_CONFIGS.find(config => 
        normalizedInput.includes(config.phrase.toLowerCase())
      ) || null;
    });

    // 3. Determine if courtesy section should be shown
    const showCourtesy = computed(() => {
      return courtesy.value.trim().length > 0;
    });

    // --- Event Handlers ---
    const handleInput = (ev: CustomEvent) => {
      // Optional: Add debounce logic here if needed
      console.log('Input updated:', message.value);
    };

    const handleImageError = (e: Event) => {
      console.error('Failed to load SVG:', (e.target as HTMLImageElement).src);
      // Fallback logic could go here
    };

    return {
      message,
      courtesy,
      hasContent,
      activeKeywordConfig,
      showCourtesy,
      handleInput,
      handleImageError
    };
  }
});
</script>

<style scoped>
/* --- Layout & Container Styles --- */
.input-section {
  margin-bottom: 30px;
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-card {
  width: 100%;
  max-width: 400px;
  min-height: 300px; /* Fixed height or min-height */
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* --- Empty State --- */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  color: #888;
  font-style: italic;
}

/* --- Design Layout (Flexbox for Auto-Adjustment) --- */
.design-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  /* This ensures content distributes nicely */
  justify-content: space-between; 
}

/* --- Main Content Area --- */
.main-content-area {
  flex: 1; /* Takes up available space */
  display: flex;
  align-items: center;     /* Center vertically */
  justify-content: center; /* Center horizontally */
  position: relative;
}

/* --- SVG Injection Styles --- */
.injected-svg-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Smooth bounce effect */
}

.design-svg {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

/* --- Text Replacement Styles --- */
.user-text-wrapper {
  width: 100%;
  text-align: center;
}

.template-text {
  font-family: 'Playfair Display', serif; /* Elegant font */
  font-size: 24px;
  color: #333;
  line-height: 1.4;
  margin: 0;
  word-wrap: break-word;
}

/* --- Courtesy Section Styles --- */
.courtesy-section {
  margin-top: 20px;
  text-align: center;
  /* If main content is small, this stays at bottom due to flex: 1 on main-content-area */
}

.courtesy-divider {
  width: 40px;
  height: 2px;
  background: gold; /* Or any accent color */
  background: linear-gradient(90deg, transparent, #ccc, transparent);
  margin: 0 auto 8px;
}

.courtesy-text {
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;
}
</style>