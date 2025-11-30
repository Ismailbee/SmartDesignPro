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
  max-width: 700px;
  margin: 0 auto;
  padding: 1.25rem 1rem;
}

/* Large screen container scaling */
@media (min-width: 768px) {
  .dashboard-container {
    max-width: 800px;
    padding: 1.5rem 1.25rem;
  }
}

@media (min-width: 1024px) {
  .dashboard-container {
    max-width: 900px;
    padding: 2rem 1.5rem;
  }
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

/* Large screen title scaling */
@media (min-width: 768px) {
  .page-title {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .page-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Large screen subtitle scaling */
@media (min-width: 768px) {
  .page-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
}

@media (min-width: 1024px) {
  .page-subtitle {
    font-size: 1.1rem;
    margin-bottom: 2.25rem;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Large screen grid scaling */
@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.75rem;
    margin-bottom: 2.25rem;
  }
}

.selection-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Large screen card scaling */
@media (min-width: 768px) {
  .selection-card {
    padding: 1.75rem;
    min-height: 200px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
}

@media (min-width: 1024px) {
  .selection-card {
    padding: 2rem;
    border-radius: 14px;
    min-height: 220px;
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.09);
  }
}

.selection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary);
}

/* Large screen hover effects */
@media (min-width: 1024px) {
  .selection-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  transition: all 0.3s ease;
}

/* Large screen icon scaling */
@media (min-width: 768px) {
  .card-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.25rem;
  }
}

@media (min-width: 1024px) {
  .card-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 1.5rem;
  }
}

.selection-card:hover .card-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%);
}

.card-icon ion-icon {
  font-size: 1.75rem;
  color: var(--color-primary);
}

/* Large screen icon font scaling */
@media (min-width: 768px) {
  .card-icon ion-icon {
    font-size: 2rem;
  }
}

@media (min-width: 1024px) {
  .card-icon ion-icon {
    font-size: 2.25rem;
  }
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

/* Large screen title scaling */
@media (min-width: 768px) {
  .card-title {
    font-size: 1.2rem;
    margin-bottom: 0.625rem;
  }
}

@media (min-width: 1024px) {
  .card-title {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }
}

.card-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

/* Large screen description scaling */
@media (min-width: 1024px) {
  .card-description {
    font-size: 1rem;
    line-height: 1.5;
  }
}

@media (min-width: 1440px) {
  .card-description {
    font-size: 1.1rem;
    line-height: 1.6;
  }
}

/* Responsive Design */
@media (max-width: 767px) {
  .dashboard-container {
    padding: 1rem 0.75rem;
  }
  
  .page-title {
    font-size: 1.375rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  
  .selection-card {
    padding: 1.25rem;
    min-height: 160px;
  }
  
  .card-icon {
    width: 52px;
    height: 52px;
    margin-bottom: 0.875rem;
  }
  
  .card-icon ion-icon {
    font-size: 1.625rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
}
</style>
