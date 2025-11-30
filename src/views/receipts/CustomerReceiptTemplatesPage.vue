<template>
  <ion-page class="customer-receipt-templates-page">
    <!-- Custom Header -->
    <div class="app-header">
      <button class="back-btn" type="button" aria-label="Go back" @click="handleBack">
        <span class="back-icon" aria-hidden="true">←</span>
      </button>
      <h1 class="header-title">Generate for Customer - Choose Template</h1>
    </div>

    <ion-content class="ion-padding">
      <div class="templates-container">
        <h1 class="page-title">Customer Receipt Templates</h1>
        <p class="page-subtitle">Select a detailed template with customer payment information</p>

        <!-- Templates Grid -->
        <div class="templates-grid">
          <!-- Template 1 - Detailed Payment Receipt -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'detailed-payment' }"
            @click="selectTemplate('detailed-payment')"
          >
            <div class="template-preview">
              <div class="preview-page" style="padding: 0;">
                <div class="preview-header" style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 18px; color: white;">
                  <div style="text-align: center;">
                    <div class="preview-logo" style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">YOUR COMPANY</div>
                    <div style="font-size: 8px; opacity: 0.9; margin-bottom: 8px;">123 Business Street, City, State ZIP</div>
                    <div class="preview-title" style="font-size: 22px; font-weight: bold; letter-spacing: 2px; padding: 6px 0; border-top: 1px solid rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.3);">RECEIPT</div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                    <div style="padding: 8px; background: #ecfeff; border-radius: 6px; border-left: 3px solid #0891b2;">
                      <div style="font-size: 7px; color: #0891b2; font-weight: 700; margin-bottom: 3px;">RECEIPT NO.</div>
                      <div style="height: 6px; background: #cffafe; border-radius: 2px; width: 80%;"></div>
                    </div>
                    <div style="padding: 8px; background: #ecfeff; border-radius: 6px; border-left: 3px solid #0891b2;">
                      <div style="font-size: 7px; color: #0891b2; font-weight: 700; margin-bottom: 3px;">DATE</div>
                      <div style="height: 6px; background: #cffafe; border-radius: 2px; width: 70%;"></div>
                    </div>
                  </div>
                  <div style="padding: 10px; background: #f0fdfa; border: 2px solid #5eead4; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-size: 8px; color: #0891b2; font-weight: 700; margin-bottom: 6px;">RECEIVED FROM</div>
                    <div style="height: 7px; background: #cffafe; border-radius: 2px; margin-bottom: 3px;"></div>
                    <div style="height: 7px; background: #cffafe; border-radius: 2px; width: 85%;"></div>
                  </div>
                  <div style="padding: 10px; background: #ecfeff; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-size: 8px; color: #0891b2; font-weight: 700; margin-bottom: 6px;">AMOUNT</div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <div style="flex: 1;">
                        <div style="font-size: 7px; color: #0e7490; margin-bottom: 2px;">Naira</div>
                        <div style="height: 9px; background: #cffafe; border-radius: 3px;"></div>
                      </div>
                      <div style="flex: 1;">
                        <div style="font-size: 7px; color: #0e7490; margin-bottom: 2px;">Kobo</div>
                        <div style="height: 9px; background: #cffafe; border-radius: 3px;"></div>
                      </div>
                    </div>
                  </div>
                  <div style="padding: 10px; background: #f0fdfa; border: 2px solid #5eead4; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-size: 8px; color: #0891b2; font-weight: 700; margin-bottom: 6px;">SUM OF</div>
                    <div style="height: 6px; background: #cffafe; border-radius: 2px; margin-bottom: 3px;"></div>
                    <div style="height: 6px; background: #cffafe; border-radius: 2px; width: 90%;"></div>
                  </div>
                  <div style="padding: 10px; background: #ecfeff; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 8px; color: #0891b2; font-weight: 700; margin-bottom: 6px;">PAYMENT FOR</div>
                    <div style="height: 6px; background: #cffafe; border-radius: 2px; margin-bottom: 3px;"></div>
                    <div style="height: 6px; background: #cffafe; border-radius: 2px; width: 85%;"></div>
                  </div>
                  <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 12px; border-radius: 6px; color: white; text-align: center;">
                    <div style="font-size: 10px; font-weight: bold; margin-bottom: 4px;">TOTAL AMOUNT</div>
                    <div style="height: 12px; background: white; border-radius: 3px; width: 80%; margin: 0 auto;"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Detailed Payment Receipt</h3>
              <p class="template-desc">Comprehensive receipt with full customer payment details</p>
              <div v-if="selectedTemplate === 'detailed-payment'" class="template-badge">✓ Selected</div>
            </div>
          </div>

          <!-- Template 2 - Professional Customer Receipt -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'professional-customer' }"
            @click="selectTemplate('professional-customer')"
          >
            <div class="template-preview">
              <div class="preview-page" style="padding: 0;">
                <div class="preview-header" style="background: #1e293b; padding: 18px; color: white; border-bottom: 4px solid #f59e0b;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 20px; font-weight: bold; letter-spacing: 1px;">RECEIPT</div>
                      <div style="font-size: 8px; opacity: 0.8; margin-top: 2px;">Payment Confirmation</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 7px; opacity: 0.8;">Receipt #</div>
                      <div style="height: 7px; width: 50px; background: #f59e0b; margin-top: 2px; border-radius: 2px;"></div>
                    </div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="padding: 10px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 12px;">
                    <div style="font-size: 8px; color: #f59e0b; font-weight: 700; margin-bottom: 4px;">CUSTOMER INFORMATION</div>
                    <div style="font-size: 7px; color: #92400e; margin-bottom: 4px; font-weight: 600;">Received From:</div>
                    <div style="height: 6px; background: #fef3c7; border-radius: 2px; margin-bottom: 3px;"></div>
                    <div style="height: 6px; background: #fef3c7; border-radius: 2px; width: 80%;"></div>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                    <div style="padding: 8px; background: #fef3c7; border-radius: 4px;">
                      <div style="font-size: 7px; color: #92400e; font-weight: 700; margin-bottom: 3px;">Date</div>
                      <div style="height: 6px; background: #fde68a; border-radius: 2px;"></div>
                    </div>
                    <div style="padding: 8px; background: #fef3c7; border-radius: 4px;">
                      <div style="font-size: 7px; color: #92400e; font-weight: 700; margin-bottom: 3px;">Receipt No.</div>
                      <div style="height: 6px; background: #fde68a; border-radius: 2px;"></div>
                    </div>
                  </div>
                  <div style="border: 2px solid #fef3c7; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
                    <div style="font-size: 8px; color: #f59e0b; font-weight: 700; margin-bottom: 6px;">PAYMENT AMOUNT</div>
                    <div style="background: #fffbeb; padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                      <div style="display: flex; gap: 8px;">
                        <div style="flex: 1;">
                          <div style="font-size: 6px; color: #92400e; margin-bottom: 2px;">₦ (Naira)</div>
                          <div style="height: 8px; background: #fde68a; border-radius: 2px;"></div>
                        </div>
                        <div style="flex: 1;">
                          <div style="font-size: 6px; color: #92400e; margin-bottom: 2px;">Kobo</div>
                          <div style="height: 8px; background: #fde68a; border-radius: 2px;"></div>
                        </div>
                      </div>
                    </div>
                    <div style="font-size: 7px; color: #92400e; font-weight: 600; margin-bottom: 3px;">Amount in Words:</div>
                    <div style="height: 5px; background: #fef3c7; border-radius: 2px; margin-bottom: 2px;"></div>
                    <div style="height: 5px; background: #fef3c7; border-radius: 2px; width: 85%;"></div>
                  </div>
                  <div style="padding: 10px; background: #fef3c7; border-radius: 4px; margin-bottom: 10px;">
                    <div style="font-size: 8px; color: #f59e0b; font-weight: 700; margin-bottom: 4px;">PURPOSE OF PAYMENT</div>
                    <div style="height: 5px; background: #fde68a; border-radius: 2px; margin-bottom: 2px;"></div>
                    <div style="height: 5px; background: #fde68a; border-radius: 2px; width: 90%;"></div>
                  </div>
                  <div style="background: #1e293b; padding: 10px; border-radius: 4px; border-left: 4px solid #f59e0b;">
                    <div style="display: flex; justify-content: space-between; color: white; font-size: 10px; font-weight: bold;">
                      <span>TOTAL PAID</span>
                      <div style="height: 10px; width: 70px; background: #f59e0b; border-radius: 2px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Professional Customer Receipt</h3>
              <p class="template-desc">Dark theme with complete customer details and payment info</p>
              <div v-if="selectedTemplate === 'professional-customer'" class="template-badge">✓ Selected</div>
            </div>
          </div>

          <!-- Template 3 - Modern Customer Receipt -->
          <div 
            class="template-card"
            :class="{ selected: selectedTemplate === 'modern-customer' }"
            @click="selectTemplate('modern-customer')"
          >
            <div class="template-preview">
              <div class="preview-page" style="padding: 0;">
                <div class="preview-header" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 18px; color: white;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <div style="font-size: 10px; opacity: 0.9; margin-bottom: 2px;">OFFICIAL RECEIPT</div>
                      <div style="font-size: 20px; font-weight: bold;">YOUR BUSINESS</div>
                      <div style="font-size: 7px; opacity: 0.9; margin-top: 2px;">Business Address Here</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 8px; opacity: 0.9;">No.</div>
                      <div style="height: 7px; width: 45px; background: white; opacity: 0.9; border-radius: 2px; margin-top: 2px;"></div>
                    </div>
                  </div>
                </div>
                <div class="preview-content" style="padding: 15px;">
                  <div style="border: 2px solid #f3e8ff; border-radius: 8px; padding: 10px; margin-bottom: 12px; background: #faf5ff;">
                    <div style="font-size: 8px; color: #7c3aed; font-weight: 700; margin-bottom: 6px;">RECEIVED FROM</div>
                    <div style="height: 7px; background: #e9d5ff; border-radius: 2px; margin-bottom: 3px;"></div>
                    <div style="height: 7px; background: #e9d5ff; border-radius: 2px; width: 85%; margin-bottom: 6px;"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                      <div>
                        <div style="font-size: 7px; color: #7c3aed; font-weight: 600; margin-bottom: 2px;">Date</div>
                        <div style="height: 6px; background: #e9d5ff; border-radius: 2px;"></div>
                      </div>
                      <div>
                        <div style="font-size: 7px; color: #7c3aed; font-weight: 600; margin-bottom: 2px;">Receipt No.</div>
                        <div style="height: 6px; background: #e9d5ff; border-radius: 2px;"></div>
                      </div>
                    </div>
                  </div>
                  <div style="background: #f3e8ff; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
                    <div style="font-size: 8px; color: #7c3aed; font-weight: 700; margin-bottom: 6px;">PAYMENT DETAILS</div>
                    <div style="background: white; padding: 8px; border-radius: 6px; border: 1px solid #e9d5ff; margin-bottom: 6px;">
                      <div style="font-size: 7px; color: #6d28d9; font-weight: 600; margin-bottom: 4px;">Amount (₦)</div>
                      <div style="display: flex; gap: 6px;">
                        <div style="flex: 2;">
                          <div style="font-size: 6px; color: #7c3aed; margin-bottom: 2px;">Naira</div>
                          <div style="height: 8px; background: #f3e8ff; border-radius: 2px;"></div>
                        </div>
                        <div style="flex: 1;">
                          <div style="font-size: 6px; color: #7c3aed; margin-bottom: 2px;">Kobo</div>
                          <div style="height: 8px; background: #f3e8ff; border-radius: 2px;"></div>
                        </div>
                      </div>
                    </div>
                    <div style="font-size: 7px; color: #6d28d9; font-weight: 600; margin-bottom: 3px;">Amount in Words:</div>
                    <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin-bottom: 2px;"></div>
                    <div style="height: 5px; background: #e9d5ff; border-radius: 2px; width: 90%;"></div>
                  </div>
                  <div style="background: #faf5ff; border: 2px solid #e9d5ff; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <div style="font-size: 8px; color: #7c3aed; font-weight: 700; margin-bottom: 4px;">PAYMENT FOR</div>
                    <div style="height: 5px; background: #e9d5ff; border-radius: 2px; margin-bottom: 2px;"></div>
                    <div style="height: 5px; background: #e9d5ff; border-radius: 2px; width: 85%;"></div>
                  </div>
                  <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 12px; border-radius: 8px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="font-size: 11px; font-weight: bold;">TOTAL PAID</div>
                      <div style="height: 12px; width: 80px; background: white; border-radius: 3px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="template-info">
              <h3 class="template-name">Modern Customer Receipt</h3>
              <p class="template-desc">Purple gradient with elegant customer payment layout</p>
              <div v-if="selectedTemplate === 'modern-customer'" class="template-badge">✓ Selected</div>
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
  localStorage.setItem('receiptFormMode', 'customer')
  localStorage.setItem('receiptTemplate', template)
  router.push('/customer-receipt')
}
</script>

<style scoped>
.customer-receipt-templates-page {
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
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
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
  background: #f59e0b;
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
