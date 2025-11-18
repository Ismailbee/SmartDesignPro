<template>
  <ion-page class="invoice-receipt-page">
    <div class="app-header">
      <button class="back-btn" type="button" @click="handleBack" aria-label="Go back">
        <span class="back-icon" aria-hidden="true">←</span>
      </button>
      <h1 class="header-title">Invoice & Receipt Generator</h1>
    </div>

    <ion-content class="ion-padding">
      <div class="dashboard-container">
        <h1 class="page-title">What would you like to create?</h1>
        <p class="page-subtitle">Select a document type to get started</p>

        <div class="cards-grid">
          <div 
            class="selection-card"
            @click="navigateTo('invoice')"
          >
            <div class="card-icon">
              <ion-icon :icon="documentTextOutline"></ion-icon>
            </div>
            <h2 class="card-title">Invoice</h2>
            <p class="card-description">Create professional invoices for your business</p>
          </div>

          <div 
            class="selection-card"
            @click="navigateTo('receipt')"
          >
            <div class="card-icon">
              <ion-icon :icon="receiptOutline"></ion-icon>
            </div>
            <h2 class="card-title">Receipt</h2>
            <p class="card-description">Generate receipts for customer transactions</p>
          </div>

          <div 
            class="selection-card"
            @click="navigateTo('signature')"
          >
            <div class="card-icon signature">
              <ion-icon :icon="createOutline"></ion-icon>
            </div>
            <h2 class="card-title">Signature</h2>
            <p class="card-description">Create and manage your digital signatures</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/vue'
import {
  documentTextOutline,
  receiptOutline,
  createOutline,
} from 'ionicons/icons'

const router = useRouter()

function handleBack() {
  try {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
  } catch (e) {
    // ignore and fallback
  }
  router.push('/home')
}

function navigateTo(type: 'invoice' | 'receipt' | 'signature') {
  if (type === 'signature') {
    router.push('/signature')
  } else if (type === 'invoice') {
    router.push('/invoice-dashboard')
  } else if (type === 'receipt') {
    router.push('/receipt-dashboard')
  }
}
</script>

<style scoped>
.invoice-receipt-page {
  --background: linear-gradient(135deg, #f8fafc 0%, #e7f0f7 100%);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border-bottom: 1px solid #e2e8f0;
}

.back-btn {
  appearance: none;
  border: none;
  background: linear-gradient(135deg,#f1f5f9,#e2e8f0);
  color: #0f172a;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all .25s ease;
}

.back-btn:hover {
  background: linear-gradient(135deg,#e2e8f0,#cbd5e1);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.back-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
}

.back-icon { 
  line-height: 1; 
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: .5px;
  background: linear-gradient(90deg,#0f172a,#334155);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

@media (min-width: 640px) {
  .header-title { 
    font-size: 1.125rem; 
  }
}

.dashboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 0.75rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 1.25rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.selection-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.selection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #06b6d4;
}

.selection-card.active {
  border-color: #06b6d4;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0.02) 100%);
}

.card-icon {
  width: 45px;
  height: 45px;
  margin: 0 auto 0.75rem;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(6, 182, 212, 0.25);
}

.card-icon ion-icon {
  font-size: 1.5rem;
  color: white;
}

.card-icon.signature {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.25);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.375rem;
}

.card-description {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

.card-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #06b6d4;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-buttons {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.125rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .selection-card {
    padding: 0.875rem;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
  }
  
  .card-icon ion-icon {
    font-size: 1.25rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-description {
    font-size: 0.6875rem;
  }
}
</style>
