<template>
  <ion-page class="customer-invoice-templates-page">
    <!-- Custom Header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="handleBack" aria-label="Go back">
        <span class="back-icon" aria-hidden="true">←</span>
      </button>
      <h1 class="header-title">Generate for Customer - Choose Template</h1>
    </div>

    <ion-content class="ion-padding">
      <div class="templates-container">
        <h1 class="page-title">Customer Invoice Templates</h1>
        <p class="page-subtitle">Select a detailed template with customer and item fields</p>

        <!-- Templates Grid -->
        <div class="templates-grid">
          <!-- Template 1 - Detailed Business -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'detailed-business' }"
            @click="selectTemplate('detailed-business')"
          >
            <div class="template-preview">
              <div class="preview-page">
                <div class="preview-header" style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 18px; color: white;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">YOUR COMPANY</div>
                      <div style="font-size: 8px; opacity: 0.9;">Address Line Here</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 26px; font-weight: bold;">INVOICE</div>
                      <div style="font-size: 8px; opacity: 0.9;">#INV-001</div>
                    </div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="padding: 10px; background: #ecfeff; border-radius: 6px; border-left: 3px solid #0891b2;">
                      <div style="font-size: 8px; color: #0891b2; margin-bottom: 4px; font-weight: 700;">BILL TO</div>
                      <div style="height: 7px; background: #cffafe; margin-bottom: 2px; border-radius: 2px;"></div>
                      <div style="height: 7px; width: 80%; background: #cffafe; margin-bottom: 2px; border-radius: 2px;"></div>
                      <div style="height: 7px; width: 60%; background: #cffafe; border-radius: 2px;"></div>
                    </div>
                    <div style="padding: 10px; background: #ecfeff; border-radius: 6px; border-left: 3px solid #0891b2;">
                      <div style="font-size: 8px; color: #0891b2; margin-bottom: 4px; font-weight: 700;">INVOICE DATE</div>
                      <div style="height: 7px; background: #cffafe; width: 70%; margin-bottom: 2px; border-radius: 2px;"></div>
                      <div style="font-size: 8px; color: #0891b2; margin-top: 6px; margin-bottom: 4px; font-weight: 700;">DUE DATE</div>
                      <div style="height: 7px; background: #cffafe; width: 70%; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="border: 2px solid #cffafe; border-radius: 6px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 6px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px; font-size: 8px; color: white; font-weight: bold;">
                      <div>ITEM</div>
                      <div>QTY</div>
                      <div>RATE</div>
                      <div>AMOUNT</div>
                    </div>
                    <div style="padding: 6px; border-top: 1px solid #cffafe; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px;">
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                    </div>
                    <div style="padding: 6px; border-top: 1px solid #cffafe; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px;">
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                      <div style="height: 6px; background: #e0f2fe; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
                    <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 10px 16px; border-radius: 6px; color: white; text-align: right; min-width: 160px;">
                      <div style="font-size: 9px; margin-bottom: 4px;">Subtotal</div>
                      <div style="height: 6px; background: rgba(255,255,255,0.7); margin-bottom: 6px; border-radius: 2px;"></div>
                      <div style="font-size: 9px; margin-bottom: 4px;">Tax (10%)</div>
                      <div style="height: 6px; background: rgba(255,255,255,0.7); margin-bottom: 6px; border-radius: 2px;"></div>
                      <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.3);">TOTAL</div>
                      <div style="height: 9px; background: white; border-radius: 2px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Detailed Business</h3>
              <p class="template-desc">Comprehensive layout with itemized billing</p>
              <div class="template-badge" v-if="selectedTemplate === 'detailed-business'">✓ Selected</div>
            </div>
          </div>

          <!-- Template 2 - Professional Itemized -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'professional-itemized' }"
            @click="selectTemplate('professional-itemized')"
          >
            <div class="template-preview">
              <div class="preview-page">
                <div class="preview-header" style="background: #1e293b; padding: 18px; color: white; border-bottom: 4px solid #f59e0b;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 22px; font-weight: bold; letter-spacing: 1px;">INVOICE</div>
                    <div style="text-align: right; font-size: 8px;">
                      <div style="opacity: 0.8;">Invoice #</div>
                      <div style="height: 6px; width: 50px; background: #f59e0b; margin-top: 2px; border-radius: 2px;"></div>
                    </div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">
                    <div style="flex: 1;">
                      <div style="font-size: 8px; color: #f59e0b; font-weight: 700; margin-bottom: 4px;">FROM</div>
                      <div style="height: 7px; background: #fef3c7; margin-bottom: 2px; border-radius: 2px; width: 90%;"></div>
                      <div style="height: 7px; background: #fef3c7; margin-bottom: 2px; border-radius: 2px; width: 75%;"></div>
                    </div>
                    <div style="flex: 1;">
                      <div style="font-size: 8px; color: #f59e0b; font-weight: 700; margin-bottom: 4px;">TO</div>
                      <div style="height: 7px; background: #fef3c7; margin-bottom: 2px; border-radius: 2px; width: 90%;"></div>
                      <div style="height: 7px; background: #fef3c7; margin-bottom: 2px; border-radius: 2px; width: 80%;"></div>
                    </div>
                    <div style="flex: 1; text-align: right;">
                      <div style="font-size: 8px; color: #f59e0b; font-weight: 700; margin-bottom: 4px;">DATE</div>
                      <div style="height: 7px; background: #fef3c7; margin-left: auto; width: 70%; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background: #1e293b;">
                        <th style="padding: 6px; text-align: left; font-size: 8px; color: #f59e0b; font-weight: bold;">DESCRIPTION</th>
                        <th style="padding: 6px; text-align: center; font-size: 8px; color: #f59e0b; font-weight: bold;">QTY</th>
                        <th style="padding: 6px; text-align: right; font-size: 8px; color: #f59e0b; font-weight: bold;">PRICE</th>
                        <th style="padding: 6px; text-align: right; font-size: 8px; color: #f59e0b; font-weight: bold;">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; width: 90%;"></div></td>
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; margin: 0 auto; width: 50%;"></div></td>
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; margin-left: auto; width: 60%;"></div></td>
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; margin-left: auto; width: 70%;"></div></td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; width: 85%;"></div></td>
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; margin: 0 auto; width: 50%;"></div></td>
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; margin-left: auto; width: 60%;"></div></td>
                        <td style="padding: 6px;"><div style="height: 6px; background: #fef3c7; border-radius: 2px; margin-left: auto; width: 70%;"></div></td>
                      </tr>
                    </tbody>
                  </table>
                  <div style="margin-top: 12px; padding: 10px; background: #1e293b; border-radius: 4px; border-left: 4px solid #f59e0b;">
                    <div style="display: flex; justify-content: space-between; color: white; font-size: 10px; font-weight: bold;">
                      <span>TOTAL DUE</span>
                      <div style="height: 10px; width: 70px; background: #f59e0b; border-radius: 2px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Professional Itemized</h3>
              <p class="template-desc">Dark theme with amber accents and detailed items</p>
              <div class="template-badge" v-if="selectedTemplate === 'professional-itemized'">✓ Selected</div>
            </div>
          </div>

          <!-- Template 3 - Modern Full Detail -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'modern-full-detail' }"
            @click="selectTemplate('modern-full-detail')"
          >
            <div class="template-preview">
              <div class="preview-page">
                <div class="preview-header" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 18px; color: white;">
                  <div style="display: flex; justify-content: space-between;">
                    <div>
                      <div style="font-size: 10px; opacity: 0.9; margin-bottom: 2px;">FROM</div>
                      <div style="font-size: 18px; font-weight: bold;">YOUR BUSINESS</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">INVOICE</div>
                      <div style="font-size: 8px; opacity: 0.9; margin-top: 2px;">#12345</div>
                    </div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div style="border: 2px solid #f3e8ff; border-radius: 6px; padding: 8px;">
                      <div style="font-size: 8px; color: #7c3aed; font-weight: 700; margin-bottom: 4px;">BILL TO</div>
                      <div style="height: 6px; background: #f3e8ff; margin-bottom: 2px; border-radius: 2px;"></div>
                      <div style="height: 6px; background: #f3e8ff; margin-bottom: 2px; border-radius: 2px; width: 85%;"></div>
                      <div style="height: 6px; background: #f3e8ff; border-radius: 2px; width: 70%;"></div>
                    </div>
                    <div style="border: 2px solid #f3e8ff; border-radius: 6px; padding: 8px;">
                      <div style="font-size: 8px; color: #7c3aed; font-weight: 700; margin-bottom: 4px;">DATE</div>
                      <div style="height: 6px; background: #f3e8ff; margin-bottom: 4px; border-radius: 2px; width: 80%;"></div>
                      <div style="font-size: 8px; color: #7c3aed; font-weight: 700; margin-bottom: 4px;">DUE</div>
                      <div style="height: 6px; background: #f3e8ff; border-radius: 2px; width: 80%;"></div>
                    </div>
                  </div>
                  <div style="background: #faf5ff; border: 2px solid #f3e8ff; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                    <div style="display: grid; grid-template-columns: 2fr 0.5fr 1fr 1fr; gap: 6px; padding-bottom: 6px; border-bottom: 2px solid #7c3aed; font-size: 8px; color: #7c3aed; font-weight: bold;">
                      <div>ITEM</div>
                      <div style="text-align: center;">QTY</div>
                      <div style="text-align: right;">PRICE</div>
                      <div style="text-align: right;">AMOUNT</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 2fr 0.5fr 1fr 1fr; gap: 6px; padding-top: 6px;">
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px;"></div>
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin: 0 auto; width: 50%;"></div>
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin-left: auto; width: 70%;"></div>
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin-left: auto; width: 80%;"></div>
                    </div>
                    <div style="display: grid; grid-template-columns: 2fr 0.5fr 1fr 1fr; gap: 6px; padding-top: 6px;">
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px;"></div>
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin: 0 auto; width: 50%;"></div>
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin-left: auto; width: 70%;"></div>
                      <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin-left: auto; width: 80%;"></div>
                    </div>
                  </div>
                  <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 10px; border-radius: 6px; color: white;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 9px;">
                      <span>Subtotal</span>
                      <div style="height: 6px; width: 50px; background: rgba(255,255,255,0.7); border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 9px;">
                      <span>Tax</span>
                      <div style="height: 6px; width: 40px; background: rgba(255,255,255,0.7); border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 11px; font-weight: bold;">
                      <span>TOTAL</span>
                      <div style="height: 9px; width: 70px; background: white; border-radius: 2px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Modern Full Detail</h3>
              <p class="template-desc">Purple gradient with complete customer details</p>
              <div class="template-badge" v-if="selectedTemplate === 'modern-full-detail'">✓ Selected</div>
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
  // Store template and navigate immediately
  localStorage.setItem('invoiceFormMode', 'customer')
  localStorage.setItem('invoiceTemplate', template)
  router.push('/customer-invoice')
}
</script>

<style scoped>
.customer-invoice-templates-page {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 1.25rem 1rem;
}

@media (min-width: 768px) {
  .templates-container {
    max-width: 900px;
    padding: 1.5rem 1.25rem;
  }
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

@media (min-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .page-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 768px) {
  .templates-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    max-width: 800px;
  }
}

.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  border: 2px solid transparent;
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
  padding: 1.25rem;
  text-align: center;
}

.template-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.template-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.template-badge {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
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
