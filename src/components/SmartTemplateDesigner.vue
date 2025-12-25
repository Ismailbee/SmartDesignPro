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
        <ion-item lines="none">  
          <ion-label position="stacked">Message</ion-label>
          <ion-textarea
            v-model="message"
            placeholder="Type your message here..."
            :rows="3"
            @ionInput="handleInput"
          ></ion-textarea>
        </ion-item>

        <ion-item lines="none">
          <ion-label position="stacked">Courtesy (Optional)</ion-label>
          <ion-input
            v-model="courtesy"
            placeholder="e.g. From the Smith Family"
          ></ion-input>
        </ion-item>

        <!-- Image Upload -->
        <div class="image-upload-container">
          <input 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            id="file-upload" 
            style="display: none"
          />
          <label for="file-upload" class="upload-btn">
            <ion-icon :icon="imageOutline"></ion-icon>
            {{ userImage ? 'Change Photo' : 'Upload Photo' }}
          </label>
        </div>
      </div>

      <!-- AI Feedback Section -->
      <div v-if="aiResponse" class="ai-feedback-section">
          <div class="ai-text">
              <ion-icon :icon="sparkles" color="primary"></ion-icon>
              <span>{{ aiResponse }}</span>
          </div>
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

          <!-- Placeholder Design State -->
          <div v-else class="design-layout">
            
            <!-- Placeholder Template -->
            <div class="placeholder-template">
              
              <!-- Title Area - SVG from Library or Fallback Text -->
              <div class="title-placeholder" :class="{ 'has-svg': matchedTitle && !titleSvgError }">
                <!-- SVG Title from Library -->
                <img 
                  v-if="matchedTitle && !titleSvgError"
                  :src="matchedTitle.svgPath"
                  :alt="matchedTitle.fallbackText"
                  class="title-svg"
                  @load="handleTitleSvgLoad"
                  @error="handleTitleSvgError"
                />
                <!-- Fallback Text Title -->
                <span v-else class="title-text">{{ displayTitle }}</span>
              </div>

              <!-- User Image Area -->
              <div v-if="userImage" class="image-placeholder">
                <img :src="userImage" alt="User Photo" class="user-photo" />
              </div>
              <div v-else class="image-placeholder empty">
                <ion-icon :icon="imageOutline" size="large"></ion-icon>
                <span>Photo will appear here</span>
              </div>

              <!-- Names Section -->
              <div v-if="parsedData.names" class="names-section">
                <span class="names-text">{{ parsedData.names }}</span>
              </div>

              <!-- Date Section -->
              <div v-if="parsedData.date" class="date-section">
                <span class="date-text">{{ parsedData.date }}</span>
              </div>

              <!-- Message Section (if no parsed data) -->
              <div v-if="!parsedData.names && !parsedData.date && message && !matchedTitle" class="message-section">
                <span class="message-text">{{ message }}</span>
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
import { defineComponent, ref, computed, reactive } from 'vue';
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
  IonBackButton,
  IonIcon
} from '@ionic/vue';
import { sparkles, imageOutline } from 'ionicons/icons';

// --- Keyword Detection for AI Response ---
const DETECTED_THEMES = ['wedding', 'birthday', 'naming', 'graduation', 'anniversary'];

// --- Title Library ---
// Maps phrases to pre-designed SVG title files
interface TitleEntry {
  keywords: string[];  // Keywords to match (all must be present)
  svgPath: string;     // Path to the SVG file
  fallbackText: string; // Text to show if SVG fails
}

const TITLE_LIBRARY: TitleEntry[] = [
  {
    keywords: ['alhamdulillah', 'wedding'],
    svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
    fallbackText: 'Alhamdulillahi on Your Wedding Ceremony'
  },
  // Add more titles here as you create them:
  // {
  //   keywords: ['congratulations', 'wedding'],
  //   svgPath: '/assets/title/CongratulationsWedding/title.svg',
  //   fallbackText: 'Congratulations on Your Wedding'
  // },
];

/**
 * Find matching title SVG based on user input
 */
function findMatchingTitle(input: string): TitleEntry | null {
  const normalizedInput = input.toLowerCase();
  
  for (const entry of TITLE_LIBRARY) {
    // Check if ALL keywords are present in the input
    const allKeywordsMatch = entry.keywords.every(keyword => 
      normalizedInput.includes(keyword.toLowerCase())
    );
    
    if (allKeywordsMatch) {
      return entry;
    }
  }
  
  return null;
}

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
    IonBackButton,
    IonIcon
  },
  setup() {
    console.log('SmartTemplateDesigner mounted');
    
    // --- State ---
    const message = ref('');
    const courtesy = ref('');
    const aiResponse = ref('');
    const userImage = ref<string | null>(null);
    const detectedTheme = ref<string | null>(null);
    const matchedTitle = ref<TitleEntry | null>(null);
    const titleSvgLoaded = ref(false);
    const titleSvgError = ref(false);
    
    const parsedData = reactive({
      names: '',
      date: ''
    });

    // --- Computed Logic ---

    // 1. Check if there is any content to display
    const hasContent = computed(() => {
      return message.value.trim().length > 0 || userImage.value !== null;
    });

    // 2. Determine if courtesy section should be shown
    const showCourtesy = computed(() => {
      return courtesy.value.trim().length > 0;
    });

    // 3. Display title based on matched title library or theme
    const displayTitle = computed(() => {
      // If we have a matched SVG title, don't show text
      if (matchedTitle.value && !titleSvgError.value) {
        return ''; // SVG will be shown instead
      }
      
      // Fallback to theme-based text
      if (detectedTheme.value === 'wedding') {
        return 'Congratulations on Your Wedding';
      } else if (detectedTheme.value === 'birthday') {
        return 'Happy Birthday';
      } else if (detectedTheme.value === 'naming') {
        return 'Naming Ceremony';
      } else if (detectedTheme.value === 'graduation') {
        return 'Congratulations Graduate';
      } else if (detectedTheme.value === 'anniversary') {
        return 'Happy Anniversary';
      }
      // Default: use the message itself as title
      return message.value.trim() || 'Your Title Here';
    });

    // --- Helper Functions ---
    
    /**
     * Enhanced Date Extraction
     * Supports: "25th December 2025", "December 25, 2025", "25/12/2025", "2025-12-25", 
     * "25-12-2025", "Dec 25 2025", "on 25th Dec", "dated 25/12/25"
     */
    const extractDate = (text: string): string => {
      const datePatterns = [
        // "25th December 2025" or "25 December, 2025"
        /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*,?\s*(\d{4})/i,
        // "December 25, 2025" or "Dec 25 2025"
        /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})/i,
        // "25/12/2025" or "25-12-2025" or "25.12.2025"
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
        // "2025-12-25" (ISO format)
        /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
        // "25/12/25" (short year)
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})(?!\d)/,
        // Just month and year: "December 2025"
        /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i,
        // Just day and month: "25th December" or "December 25th"
        /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/i,
        /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?/i
      ];
      
      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          return match[0];
        }
      }
      return '';
    };

    /**
     * Enhanced Name Extraction
     * Supports: "John & Jane", "AHMAD and FATIMA", "Mr. John Smith", 
     * "John, Jane, and Bob", "the Smiths", "Baby Muhammad", "MUHAMMAD AL-AMIN"
     */
    const extractNames = (text: string): string => {
      const namePatterns = [
        // "John & Jane" or "John and Jane" (couple names)
        /([A-Z][a-zA-Z''-]+)\s+(?:&|and|\+)\s+([A-Z][a-zA-Z''-]+)/i,
        // "AHMAD & FATIMA" (all caps couple)
        /([A-Z]{2,}(?:\s+[A-Z]{2,})?)\s+(?:&|and|\+)\s+([A-Z]{2,}(?:\s+[A-Z]{2,})?)/,
        // "Mr. John Smith & Mrs. Jane Smith" (formal)
        /(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)\s+([A-Z][a-zA-Z''-]+(?:\s+[A-Z][a-zA-Z''-]+)?)\s+(?:&|and)\s+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)?\s*([A-Z][a-zA-Z''-]+(?:\s+[A-Z][a-zA-Z''-]+)?)/i,
        // "Baby Muhammad" or "Baby AHMAD" (for naming ceremony)
        /(?:Baby|Child|Son|Daughter)\s+([A-Z][a-zA-Z''-]+(?:\s+[A-Z][a-zA-Z''-]+)*)/i,
        // "MUHAMMAD AL-AMIN AHMAD" (full caps name with hyphens)
        /\b([A-Z]{2,}(?:[\s\-][A-Z]{2,}){1,3})\b/,
        // "the Smith Family" or "the Johnsons"
        /the\s+([A-Z][a-zA-Z''-]+)(?:\s+[Ff]amily)?/i,
        // Just two capitalized words together (likely a name)
        /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/,
        // Single prominent name (Title case, 3+ chars)
        /\b([A-Z][a-z]{2,})\b/
      ];
      
      // Try couple patterns first (higher priority)
      for (let i = 0; i < 3; i++) {
        const match = text.match(namePatterns[i]);
        if (match) {
          // Format as "Name & Name"
          const name1 = formatName(match[1]);
          const name2 = formatName(match[2]);
          return `${name1} & ${name2}`;
        }
      }
      
      // Try other patterns
      for (let i = 3; i < namePatterns.length; i++) {
        const match = text.match(namePatterns[i]);
        if (match) {
          // Skip common words that aren't names
          const skipWords = ['wedding', 'birthday', 'ceremony', 'naming', 'congratulations', 'happy', 'dear', 'love', 'best', 'wishes', 'from', 'the', 'and', 'for'];
          const extracted = match[1] || match[0];
          if (!skipWords.includes(extracted.toLowerCase())) {
            return formatName(extracted);
          }
        }
      }
      
      return '';
    };
    
    /**
     * Format name to Title Case
     */
    const formatName = (name: string): string => {
      if (!name) return '';
      // If all caps, convert to title case
      if (name === name.toUpperCase() && name.length > 2) {
        return name.split(/[\s\-]+/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      return name.trim();
    };

    /**
     * Main parser function
     */
    const parseInput = (text: string) => {
      // Reset
      parsedData.names = '';
      parsedData.date = '';

      // Extract date
      parsedData.date = extractDate(text);
      
      // Extract names
      parsedData.names = extractNames(text);
    };
    
    /**
     * Detect theme from input text
     */
    const detectTheme = (text: string): string | null => {
      const normalizedInput = text.toLowerCase();
      for (const theme of DETECTED_THEMES) {
        if (normalizedInput.includes(theme)) {
          return theme;
        }
      }
      return null;
    };

    // --- Event Handlers ---
    const handleInput = () => {
      // Parse input for entities
      parseInput(message.value);
      
      // Detect theme
      const theme = detectTheme(message.value);
      detectedTheme.value = theme;
      
      // Try to find matching title from library
      const titleMatch = findMatchingTitle(message.value);
      matchedTitle.value = titleMatch;
      titleSvgLoaded.value = false;
      titleSvgError.value = false;

      // Generate AI response
      if (titleMatch) {
        aiResponse.value = `✨ Found matching title style! ${parsedData.names ? `Ready for ${parsedData.names}` : 'Add names to personalize.'}`;
      } else if (theme) {
        if (parsedData.names) {
          aiResponse.value = `${theme.charAt(0).toUpperCase() + theme.slice(1)} design ready for ${parsedData.names}${parsedData.date ? ' on ' + parsedData.date : ''}.`;
        } else {
          aiResponse.value = `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme detected! Add names and a date to personalize.`;
        }
      } else if (message.value.trim()) {
        aiResponse.value = 'Type a theme (wedding, birthday, naming, etc.) for best results.';
      } else {
        aiResponse.value = '';
      }
    };

    const handleImageUpload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          userImage.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleTitleSvgLoad = () => {
      titleSvgLoaded.value = true;
      titleSvgError.value = false;
      console.log('Title SVG loaded successfully');
    };
    
    const handleTitleSvgError = () => {
      titleSvgError.value = true;
      titleSvgLoaded.value = false;
      console.error('Failed to load title SVG:', matchedTitle.value?.svgPath);
    };

    return {
      message,
      courtesy,
      hasContent,
      showCourtesy,
      aiResponse,
      userImage,
      parsedData,
      displayTitle,
      matchedTitle,
      titleSvgLoaded,
      titleSvgError,
      handleInput,
      handleImageUpload,
      handleTitleSvgLoad,
      handleTitleSvgError,
      sparkles,
      imageOutline
    };
  }
});
</script>

<style scoped>
/* --- Layout & Container Styles --- */
.input-section {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.image-upload-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f0f0;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #e0e0e0;
}

.ai-feedback-section {
    margin-bottom: 20px;
    padding: 15px;
    background: #e3f2fd;
    border-radius: 12px;
    border-left: 4px solid #2196f3;
    animation: fadeIn 0.5s ease-out;
}

.ai-text {
    color: #1565c0;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-card {
  width: 100%;
  max-width: 400px;
  min-height: 400px;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
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
  padding: 40px;
  text-align: center;
}

/* --- Design Layout --- */
.design-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  justify-content: space-between;
  align-items: center;
}

/* --- Placeholder Template --- */
.placeholder-template {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* --- Title Placeholder --- */
.title-placeholder {
  width: 100%;
  min-height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* When SVG title is loaded, remove background */
.title-placeholder.has-svg {
  background: transparent;
  box-shadow: none;
  padding: 0;
  min-height: auto;
}

.title-svg {
  width: 100%;
  max-width: 350px;
  height: auto;
  object-fit: contain;
}

.title-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.3;
}

/* --- Image Placeholder --- */
.image-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  background: #ffffff;
}

.image-placeholder.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #aaa;
  gap: 8px;
}

.image-placeholder.empty ion-icon {
  font-size: 32px;
}

.image-placeholder.empty span {
  font-size: 11px;
  text-align: center;
  padding: 0 10px;
}

.user-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- Names Section --- */
.names-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 12px 24px;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.names-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

/* --- Date Section --- */
.date-section {
  padding: 8px 16px;
}

.date-text {
  font-family: 'Lato', Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* --- Message Section (fallback) --- */
.message-section {
  padding: 16px;
  text-align: center;
}

.message-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px;
  color: #444;
  line-height: 1.5;
}

/* --- Courtesy Section Styles --- */
.courtesy-section {
  margin-top: 20px;
  text-align: center;
  width: 100%;
}

.courtesy-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ccc, transparent);
  margin: 0 auto 12px;
}

.courtesy-text {
  font-family: 'Lato', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;
}
</style>