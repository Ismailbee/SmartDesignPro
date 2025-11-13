<template>
  <ion-page class="invoice-templates-page">
    <!-- Custom Header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="handleBack" aria-label="Go back">
        <span class="back-icon" aria-hidden="true">←</span>
      </button>
      <h1 class="header-title">Generate Invoice - Choose Template</h1>
    </div>

    <ion-content class="ion-padding">
      <div class="templates-container">
        <h1 class="page-title">Invoice Templates</h1>
        <p class="page-subtitle">Select a professional template for your invoice</p>

        <!-- Templates Grid -->
        <div class="templates-grid">
          <!-- Template 1 - Classic Professional -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'classic-professional' }"
            @click="selectTemplate('classic-professional')"
          >
            <div class="template-preview">
              <div class="preview-page">
                <div class="preview-header" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 20px; color: white;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="preview-logo" style="font-size: 18px; font-weight: bold;">COMPANY</div>
                    <div class="preview-title" style="font-size: 24px; font-weight: bold;">INVOICE</div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div style="flex: 1;">
                      <div style="font-size: 9px; color: #1e40af; margin-bottom: 3px; font-weight: 600;">Bill To</div>
                      <div style="height: 8px; background: #dbeafe; margin-bottom: 3px; border-radius: 2px;"></div>
                      <div style="height: 8px; width: 70%; background: #dbeafe; border-radius: 2px;"></div>
                    </div>
                    <div style="flex: 1; text-align: right;">
                      <div style="font-size: 9px; color: #1e40af; margin-bottom: 3px; font-weight: 600;">Invoice Info</div>
                      <div style="height: 8px; background: #dbeafe; margin-left: auto; width: 60%; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="border: 1px solid #dbeafe; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                    <div style="background: #eff6ff; padding: 8px; display: flex; gap: 10px;">
                      <div style="flex: 2; height: 8px; background: #1e40af; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 8px; background: #1e40af; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 8px; background: #1e40af; border-radius: 2px;"></div>
                    </div>
                    <div style="padding: 8px; border-top: 1px solid #dbeafe; display: flex; gap: 10px;">
                      <div style="flex: 2; height: 6px; background: #dbeafe; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 6px; background: #dbeafe; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 6px; background: #dbeafe; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: flex-end; margin-top: 15px; padding: 10px; background: #eff6ff; border-radius: 4px;">
                    <div style="text-align: right;">
                      <div style="font-size: 10px; font-weight: bold; color: #1e40af;">TOTAL</div>
                      <div style="height: 10px; width: 60px; background: #1e40af; margin-top: 3px; border-radius: 2px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Classic Professional</h3>
              <p class="template-desc">Clean blue design for business invoices</p>
              <div class="template-badge" v-if="selectedTemplate === 'classic-professional'">✓ Selected</div>
            </div>
          </div>

          <!-- Template 2 - Modern Minimal -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'modern-minimal' }"
            @click="selectTemplate('modern-minimal')"
          >
            <div class="template-preview">
              <div class="preview-page">
                <div class="preview-header" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 20px; color: white;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="preview-logo" style="font-size: 18px; font-weight: bold;">LOGO</div>
                    <div class="preview-title" style="font-size: 24px; font-weight: bold;">INVOICE</div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div style="flex: 1;">
                      <div style="font-size: 9px; color: #10b981; margin-bottom: 3px; font-weight: 600;">Client</div>
                      <div style="height: 8px; background: #d1fae5; margin-bottom: 3px; border-radius: 2px;"></div>
                    </div>
                    <div style="flex: 1; text-align: right;">
                      <div style="font-size: 9px; color: #10b981; margin-bottom: 3px; font-weight: 600;">Date</div>
                      <div style="height: 8px; background: #d1fae5; margin-left: auto; width: 60%; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="border: 1px solid #d1fae5; border-radius: 4px; overflow: hidden;">
                    <div style="background: #ecfdf5; padding: 8px; display: flex; gap: 10px;">
                      <div style="flex: 2; height: 8px; background: #10b981; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 8px; background: #10b981; border-radius: 2px;"></div>
                    </div>
                    <div style="padding: 8px; border-top: 1px solid #d1fae5; display: flex; gap: 10px;">
                      <div style="flex: 2; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="margin-top: 15px; padding: 10px; background: #ecfdf5; border-radius: 4px; border-left: 3px solid #10b981;">
                    <div style="font-size: 10px; font-weight: bold; color: #10b981;">TOTAL</div>
                    <div style="height: 10px; width: 60px; background: #10b981; margin-top: 3px; border-radius: 2px;"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Modern Minimal</h3>
              <p class="template-desc">Green accent with minimalist design</p>
              <div class="template-badge" v-if="selectedTemplate === 'modern-minimal'">✓ Selected</div>
            </div>
          </div>

          <!-- Template 3 - Corporate Elegant -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'corporate-elegant' }"
            @click="selectTemplate('corporate-elegant')"
          >
            <div class="template-preview">
              <div class="preview-page">
                <div class="preview-header" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px; color: white;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="preview-logo" style="font-size: 18px; font-weight: bold;">CORP</div>
                    <div class="preview-title" style="font-size: 24px; font-weight: bold;">INVOICE</div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f5f3ff; border-left: 3px solid #6366f1; border-radius: 4px;">
                    <div style="flex: 1;">
                      <div style="font-size: 9px; color: #6366f1; margin-bottom: 3px; font-weight: 700;">Billed To</div>
                      <div style="height: 8px; background: #ddd6fe; margin-bottom: 3px; border-radius: 2px;"></div>
                    </div>
                    <div style="flex: 1; text-align: right;">
                      <div style="font-size: 9px; color: #6366f1; margin-bottom: 3px; font-weight: 700;">Details</div>
                      <div style="height: 8px; background: #ddd6fe; margin-left: auto; width: 60%; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="border: 2px solid #e0e7ff; border-radius: 6px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 8px; display: flex; gap: 10px;">
                      <div style="flex: 2; height: 8px; background: white; opacity: 0.9; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 8px; background: white; opacity: 0.9; border-radius: 2px;"></div>
                    </div>
                    <div style="padding: 8px; background: #faf5ff; display: flex; gap: 10px;">
                      <div style="flex: 2; height: 6px; background: #ddd6fe; border-radius: 2px;"></div>
                      <div style="flex: 1; height: 6px; background: #ddd6fe; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 6px;">
                    <div style="font-size: 10px; font-weight: bold; color: white;">TOTAL</div>
                    <div style="height: 12px; width: 70px; background: white; opacity: 0.9; margin-top: 3px; border-radius: 3px;"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Corporate Elegant</h3>
              <p class="template-desc">Purple gradient with sophisticated style</p>
              <div class="template-badge" v-if="selectedTemplate === 'corporate-elegant'">✓ Selected</div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedTemplate = ref<string | null>(null)

const handleBack = () => {
  router.push('/invoice-dashboard')
}

const selectTemplate = (template: string) => {
  // Navigate to template preview/editor page
  const templateRoutes: Record<string, string> = {
    'classic-professional': '/invoice-template/classic-professional',
    'modern-minimal': '/invoice-template/modern-minimal',
    'corporate-elegant': '/invoice-template/corporate-elegant'
  }
  
  const route = templateRoutes[template]
  if (route) {
    localStorage.setItem('invoiceFormMode', 'generate')
    localStorage.setItem('invoiceTemplate', template)
    router.push(route)
  }
}
</script>

<style scoped>
.invoice-templates-page {
  --background: linear-gradient(135deg, #f8fafc 0%, #e7f0f7 100%);
}

.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--bg-hover);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.templates-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2.5rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.template-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.template-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.2);
}

.template-preview {
  width: 100%;
  aspect-ratio: 8.5 / 11;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
  padding: 1rem;
}

.preview-page {
  width: 100%;
  height: 100%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.template-info {
  padding: 1.5rem;
  text-align: center;
}

.template-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.template-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.template-badge {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.75rem;
}

.action-buttons {
  margin-top: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.6rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .header-title {
    font-size: 1.1rem;
  }
}
</style>
