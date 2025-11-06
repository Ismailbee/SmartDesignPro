<template>
  <ion-page class="invoice-receipt-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Invoice & Receipt Generator</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Dashboard Cards -->
      <div class="dashboard-container">
        <h1 class="page-title">What would you like to create?</h1>
        <p class="page-subtitle">Select a document type to get started</p>

        <!-- Selection Cards -->
        <div class="cards-grid">
          <!-- Invoice Card -->
          <div 
            class="selection-card"
            :class="{ active: selectedType === 'invoice' }"
            @click="selectType('invoice')"
          >
            <div class="card-icon">
              <ion-icon :icon="documentTextOutline"></ion-icon>
            </div>
            <h2 class="card-title">Invoice</h2>
            <p class="card-description">Create professional invoices for your business</p>
            <div class="card-badge" v-if="selectedType === 'invoice'">Selected</div>
          </div>

          <!-- Receipt Card -->
          <div 
            class="selection-card"
            :class="{ active: selectedType === 'receipt' }"
            @click="selectType('receipt')"
          >
            <div class="card-icon">
              <ion-icon :icon="receiptOutline"></ion-icon>
            </div>
            <h2 class="card-title">Receipt</h2>
            <p class="card-description">Generate receipts for customer transactions</p>
            <div class="card-badge" v-if="selectedType === 'receipt'">Selected</div>
          </div>

          <!-- Signature Card -->
          <div 
            class="selection-card"
            :class="{ active: selectedType === 'signature' }"
            @click="selectType('signature')"
          >
            <div class="card-icon signature">
              <ion-icon :icon="createOutline"></ion-icon>
            </div>
            <h2 class="card-title">Signature</h2>
            <p class="card-description">Create and manage your digital signatures</p>
            <div class="card-badge" v-if="selectedType === 'signature'">Selected</div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="action-buttons" v-if="selectedType">
          <ion-button 
            expand="block" 
            size="default" 
            color="primary"
            @click="proceedToPage"
          >
            <ion-icon slot="start" :icon="arrowForwardOutline"></ion-icon>
            Continue to {{ selectedType === 'invoice' ? 'Invoice' : selectedType === 'receipt' ? 'Receipt' : 'Signature' }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/vue'
import {
  documentTextOutline,
  receiptOutline,
  createOutline,
  arrowForwardOutline,
} from 'ionicons/icons'

const router = useRouter()

// State
const selectedType = ref<'invoice' | 'receipt' | 'signature' | null>(null)

// Select document type
function selectType(type: 'invoice' | 'receipt' | 'signature') {
  selectedType.value = type
}

// Navigate to selected page
function proceedToPage() {
  if (!selectedType.value) return
  
  if (selectedType.value === 'signature') {
    // Go directly to signature page
    router.push('/signature')
  } else if (selectedType.value === 'invoice') {
    // Go directly to invoice page
    router.push('/invoice')
  } else if (selectedType.value === 'receipt') {
    // Go directly to receipt page
    router.push('/receipt')
  }
}
</script>

<style scoped>
.invoice-receipt-page {
  --background: linear-gradient(135deg, #f8fafc 0%, #e7f0f7 100%);
}

.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 0.375rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;
}

/* Selection Cards */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.selection-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.selection-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.11);
  border-color: #06b6d4;
}

.selection-card.active {
  border-color: #06b6d4;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0.02) 100%);
}

.card-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(6, 182, 212, 0.25);
}

.card-icon ion-icon {
  font-size: 1.875rem;
  color: white;
}

.card-icon.signature {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 6px 12px rgba(139, 92, 246, 0.25);
}

.card-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
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

/* Action Buttons */
.action-buttons {
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .selection-card {
    padding: 1.25rem;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
  }
  
  .card-icon ion-icon {
    font-size: 1.5rem;
  }
  
  .card-title {
    font-size: 1.125rem;
  }
}
</style>
