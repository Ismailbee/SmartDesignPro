<template>
  <ion-page class="receipt-templates-page">
    <!-- Custom Header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="handleBack" aria-label="Go back">
        <span class="back-icon" aria-hidden="true">←</span>
      </button>
      <h1 class="header-title">Generate Receipt - Choose Template</h1>
    </div>

    <ion-content class="ion-padding">
      <div class="templates-container">
        <h1 class="page-title">Receipt Templates</h1>
        <p class="page-subtitle">Select a professional template for your receipt</p>

        <!-- Templates Grid -->
        <div class="templates-grid">
          <!-- Template 1 - Standard Receipt -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'standard-receipt' }"
            @click="selectTemplate('standard-receipt')"
          >
            <div class="template-preview">
              <div class="preview-page" style="padding: 0;">
                <div class="preview-header" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 15px; color: white; text-align: center;">
                  <div class="preview-logo" style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">STORE NAME</div>
                  <div class="preview-title" style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">RECEIPT</div>
                  <div style="font-size: 8px; margin-top: 5px; opacity: 0.9;">123 Main Street, City, State</div>
                </div>
                <div class="preview-content" style="padding: 12px;">
                  <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #cbd5e1;">
                    <div style="font-size: 8px; color: #64748b; margin-bottom: 2px;">Receipt #</div>
                    <div style="height: 6px; width: 50%; background: #e2e8f0; margin: 0 auto; border-radius: 2px;"></div>
                  </div>
                  <div class="preview-items" style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                      <div style="height: 6px; width: 60%; background: #e2e8f0; border-radius: 2px;"></div>
                      <div style="height: 6px; width: 20%; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                      <div style="height: 6px; width: 55%; background: #e2e8f0; border-radius: 2px;"></div>
                      <div style="height: 6px; width: 20%; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="border-top: 2px solid #1e40af; padding-top: 8px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 10px; font-weight: bold; color: #1e40af;">TOTAL</div>
                    <div style="height: 10px; width: 40px; background: #3b82f6; border-radius: 3px;"></div>
                  </div>
                  <div style="text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
                    <div style="font-size: 7px; color: #94a3b8;">Thank you for your purchase!</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Standard Receipt</h3>
              <p class="template-desc">Classic blue design for everyday use</p>
              <div class="template-badge" v-if="selectedTemplate === 'standard-receipt'">✓ Selected</div>
            </div>
          </div>

          <!-- Template 2 - Compact Receipt -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'compact-receipt' }"
            @click="selectTemplate('compact-receipt')"
          >
            <div class="template-preview">
              <div class="preview-page" style="padding: 0;">
                <div class="preview-header" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 12px; color: white; text-align: center;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="preview-logo" style="font-size: 14px; font-weight: bold;">SHOP</div>
                    <div class="preview-title" style="font-size: 16px; font-weight: bold;">RECEIPT</div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 10px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #fef3c7;">
                    <div style="font-size: 7px; color: #92400e;">
                      <div style="height: 5px; width: 40px; background: #fef3c7; margin-bottom: 2px; border-radius: 1px;"></div>
                      <div style="height: 5px; width: 35px; background: #fef3c7; border-radius: 1px;"></div>
                    </div>
                    <div style="font-size: 7px; color: #92400e; text-align: right;">
                      <div style="height: 5px; width: 35px; background: #fef3c7; margin-bottom: 2px; margin-left: auto; border-radius: 1px;"></div>
                      <div style="height: 5px; width: 30px; background: #fef3c7; margin-left: auto; border-radius: 1px;"></div>
                    </div>
                  </div>
                  <div class="preview-items" style="margin: 8px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 8px;">
                      <div style="height: 5px; width: 50%; background: #fde68a; border-radius: 1px;"></div>
                      <div style="height: 5px; width: 25%; background: #fde68a; border-radius: 1px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 8px;">
                      <div style="height: 5px; width: 55%; background: #fde68a; border-radius: 1px;"></div>
                      <div style="height: 5px; width: 25%; background: #fde68a; border-radius: 1px;"></div>
                    </div>
                  </div>
                  <div style="background: #fffbeb; padding: 8px; border-radius: 4px; margin-top: 8px; border: 1px solid #fef3c7;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="font-size: 9px; font-weight: bold; color: #f59e0b;">TOTAL</div>
                      <div style="height: 9px; width: 35px; background: #f59e0b; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="text-align: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #fde68a;">
                    <div style="height: 4px; width: 60%; background: #fef3c7; margin: 0 auto; border-radius: 1px;"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Compact Receipt</h3>
              <p class="template-desc">Amber theme with space-efficient layout</p>
              <div class="template-badge" v-if="selectedTemplate === 'compact-receipt'">✓ Selected</div>
            </div>
          </div>

          <!-- Template 3 - Elegant Receipt -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'elegant-receipt' }"
            @click="selectTemplate('elegant-receipt')"
          >
            <div class="template-preview">
              <div class="preview-page" style="padding: 0;">
                <div class="preview-header" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 15px; color: white; text-align: center;">
                  <div class="preview-logo" style="font-size: 16px; font-weight: bold; margin-bottom: 3px;">BUSINESS</div>
                  <div style="font-size: 7px; opacity: 0.9; margin-bottom: 6px;">Premium Quality Service</div>
                  <div class="preview-title" style="font-size: 18px; font-weight: bold; letter-spacing: 2px; padding: 5px 0; border-top: 1px solid rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.3);">RECEIPT</div>
                </div>
                <div class="preview-content" style="padding: 12px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; padding: 8px; background: #ecfdf5; border-radius: 4px; border-left: 3px solid #10b981;">
                    <div style="font-size: 7px;">
                      <div style="color: #10b981; font-weight: bold; margin-bottom: 2px; font-size: 6px;">RECEIPT NO.</div>
                      <div style="height: 5px; width: 90%; background: #d1fae5; border-radius: 1px;"></div>
                    </div>
                    <div style="font-size: 7px;">
                      <div style="color: #10b981; font-weight: bold; margin-bottom: 2px; font-size: 6px;">DATE</div>
                      <div style="height: 5px; width: 90%; background: #d1fae5; border-radius: 1px;"></div>
                    </div>
                  </div>
                  <div class="preview-items" style="margin: 10px 0; border: 1px solid #d1fae5; border-radius: 4px; padding: 6px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid #d1fae5;">
                      <div style="height: 5px; width: 40%; background: #d1fae5; border-radius: 1px;"></div>
                      <div style="height: 5px; width: 20%; background: #d1fae5; border-radius: 1px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <div style="height: 5px; width: 45%; background: #ecfdf5; border-radius: 1px;"></div>
                      <div style="height: 5px; width: 20%; background: #ecfdf5; border-radius: 1px;"></div>
                    </div>
                  </div>
                  <div style="background: linear-gradient(135deg, #10b981, #34d399); padding: 10px; border-radius: 4px; margin-top: 10px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.3);">
                      <div style="font-size: 10px; font-weight: bold;">TOTAL</div>
                      <div style="height: 9px; width: 40px; background: white; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="text-align: center; margin-top: 8px; padding: 6px; background: #ecfdf5; border-radius: 4px;">
                    <div style="height: 4px; width: 70%; background: #d1fae5; margin: 0 auto 3px; border-radius: 1px;"></div>
                    <div style="height: 4px; width: 50%; background: #d1fae5; margin: 0 auto; border-radius: 1px;"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Elegant Receipt</h3>
              <p class="template-desc">Green gradient with refined details</p>
              <div class="template-badge" v-if="selectedTemplate === 'elegant-receipt'">✓ Selected</div>
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
  router.push('/receipt-dashboard')
}

const selectTemplate = (template: string) => {
  // Store template and navigate immediately
  localStorage.setItem('receiptFormMode', 'generate')
  localStorage.setItem('receiptTemplate', template)
  router.push('/generate-receipt')
}
</script>

<style scoped>
.receipt-templates-page {
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
  border-color: #f59e0b;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
}

.template-preview {
  width: 100%;
  aspect-ratio: 5.827 / 8.268;
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
  background: #f59e0b;
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
