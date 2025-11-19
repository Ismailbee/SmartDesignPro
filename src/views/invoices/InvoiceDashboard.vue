<template>
  <ion-page class="invoice-dashboard-page">
    <!-- Custom Header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="handleBack" aria-label="Go back">
        <span class="back-icon" aria-hidden="true">←</span>
      </button>
      <h1 class="header-title">Invoice Generator</h1>
    </div>

    <ion-content class="ion-padding">
      <div class="dashboard-container">
        <h1 class="page-title">Invoice Options</h1>
        <p class="page-subtitle">Choose how you want to create your invoice</p>

        <!-- Selection Cards -->
        <div class="cards-grid">
          <!-- Generate Invoice Card -->
          <div 
            class="selection-card"
            @click="navigateToInvoice('invoice')"
          >
            <div class="card-icon">
              <ion-icon :icon="documentTextOutline"></ion-icon>
            </div>
            <h2 class="card-title">Generate Invoice</h2>
            <p class="card-description">Create a standard invoice with your organization details</p>
          </div>

          <!-- Generate for Customer Card -->
          <div 
            class="selection-card"
            @click="navigateToInvoice('customer')"
          >
            <div class="card-icon">
              <ion-icon :icon="peopleOutline"></ion-icon>
            </div>
            <h2 class="card-title">Generate for Customer</h2>
            <p class="card-description">Create a complete invoice with customer and item details</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { documentTextOutline, peopleOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleBack = () => {
  router.push('/invoice-receipt')
}

const navigateToInvoice = (mode: 'invoice' | 'customer') => {
  // Navigate to respective template page
  if (mode === 'invoice') {
    router.push('/invoice-templates')
  } else {
    router.push('/customer-invoice-templates')
  }
}
</script>

<style scoped>
.invoice-dashboard-page {
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

.dashboard-container {
  max-width: 1000px;
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.selection-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.selection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary);
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  transition: all 0.3s ease;
}

.selection-card:hover .card-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%);
}

.card-icon ion-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.6rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .selection-card {
    padding: 1.5rem;
    min-height: 200px;
  }
  
  .card-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
  }
  
  .card-icon ion-icon {
    font-size: 2rem;
  }
}
</style>
