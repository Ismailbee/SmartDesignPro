<template>
  
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Tokens & Plans</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading your account...</p>
      </div>

      <!-- Main Content -->
      <div v-else-if="userStore.user" class="tokens-plans-container">
        <!-- Section 1: Current Plan Display -->
        <ion-card class="plan-status-card">
          <ion-card-header>
            <div class="plan-header">
              <div class="plan-badge" :class="`plan-${userStore.user.plan.toLowerCase()}`">
                <span class="plan-icon">{{ getPlanIcon(userStore.user.plan) }}</span>
                <span class="plan-name">{{ userStore.user.plan }} Plan</span>
              </div>
              <ion-button
                v-if="userStore.user.plan === 'Basic'"
                color="primary"
                @click="scrollToPlans"
              >
                Upgrade Plan
              </ion-button>
              <ion-button
                v-else-if="userStore.user.plan === 'Premium'"
                color="secondary"
                @click="scrollToPlans"
              >
                Upgrade to Pro
              </ion-button>
              <ion-button
                v-else
                color="medium"
                disabled
              >
                Current Plan
              </ion-button>
            </div>
          </ion-card-header>
          <ion-card-content v-if="userStore.user.plan !== 'Basic'">
            <div class="plan-details">
              <p class="expiry-date">
                Expires on {{ formatDate(userStore.user.planExpiryDate!) }}
              </p>
              <p class="days-remaining" :class="{ 'expiring-soon': (userStore.daysUntilExpiry || 0) < 7 }">
                {{ userStore.daysUntilExpiry }} days left
              </p>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Section 2: Token Balance Dashboard -->
        <ion-card class="token-balance-card">
          <ion-card-header>
            <ion-card-title>Token Balance</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="token-display">
              <div class="token-count">
                <span class="token-icon">💎</span>
                <span class="token-number">{{ userStore.user.tokens.toLocaleString() }}</span>
              </div>
              <p class="token-label">Available Tokens</p>
            </div>

            <div class="usage-stats">
              <div class="stat-item">
                <span class="stat-label">Total Designs</span>
                <span class="stat-value">{{ userStore.user.totalDesignsGenerated }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Average per Design</span>
                <span class="stat-value">
                  {{ userStore.user.totalDesignsGenerated > 0 
                    ? Math.round(userStore.user.tokens / userStore.user.totalDesignsGenerated) 
                    : 0 
                  }}
                </span>
              </div>
            </div>

            <ion-button
              expand="block"
              color="primary"
              size="large"
              class="buy-tokens-btn"
              @click="scrollToTokens"
            >
              Buy More Tokens
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Section 3: Token Purchase Options -->
        <div ref="tokensSection" class="section-header">
          <h2>Buy Tokens</h2>
          <p>Choose a token package to get started</p>
        </div>

        <ion-grid class="token-packages-grid">
          <ion-row>
            <ion-col
              v-for="pkg in tokenPackages"
              :key="pkg.amount"
              size="12"
              size-md="6"
              size-lg="4"
            >
              <ion-card
                class="token-package-card"
                :class="{ 'best-value': pkg.isBestValue }"
                button
                @click="handleTokenPurchase(pkg)"
              >
                <ion-badge v-if="pkg.isBestValue" color="warning" class="best-value-badge">
                  ⭐ Best Value
                </ion-badge>
                <ion-card-content>
                  <div class="package-amount">₦{{ pkg.amount.toLocaleString() }}</div>
                  <div class="package-tokens">
                    <span class="token-icon">💎</span>
                    {{ pkg.tokens.toLocaleString() }} tokens
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Section 4: Plan Upgrade Cards -->
        <div ref="plansSection" class="section-header">
          <h2>Subscription Plans</h2>
          <p>Upgrade your plan for more benefits</p>
        </div>

        <ion-grid class="plans-grid">
          <ion-row>
            <ion-col
              v-for="plan in planConfigs"
              :key="plan.name"
              size="12"
              size-md="6"
              size-lg="4"
            >
              <ion-card
                class="plan-card"
                :class="{
                  'current-plan': userStore.user.plan === plan.name,
                  'has-badge': plan.badge
                }"
              >
                <ion-badge v-if="plan.badge" color="warning" class="plan-badge-label">
                  {{ plan.badge }}
                </ion-badge>
                <ion-card-header>
                  <div class="plan-icon-large">{{ plan.icon }}</div>
                  <ion-card-title>{{ plan.name }} Plan</ion-card-title>
                  <ion-card-subtitle>
                    {{ plan.price === 0 ? 'Free Forever' : `₦${plan.price.toLocaleString()} / ${plan.duration}` }}
                  </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ul class="features-list">
                    <li v-for="(feature, index) in plan.features" :key="index">
                      {{ feature }}
                    </li>
                  </ul>
                  <ion-button
                    expand="block"
                    :color="getPlanButtonColor(plan.name)"
                    :disabled="userStore.user.plan === plan.name || isDowngrade(plan.name)"
                    @click="handlePlanUpgrade(plan)"
                  >
                    {{ getPlanButtonText(plan.name) }}
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
        <p>{{ error }}</p>
        <ion-button @click="loadUserData">Retry</ion-button>
      </div>
    </ion-content>
  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonIcon,
  toastController,
  alertController
} from '@ionic/vue'
import { alertCircleOutline, arrowBackOutline } from 'ionicons/icons'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth'
import { TOKEN_PACKAGES, PLAN_CONFIGS, type TokenPackage, type PlanConfig, type PlanType } from '@/types/payment.types'
import { purchaseTokens, upgradePlan, verifyPayment } from '@/services/payment.service'

// Router
const router = useRouter()

// Store
const userStore = useUserStore()
const authStore = useAuthStore()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const tokensSection = ref<HTMLElement>()
const plansSection = ref<HTMLElement>()

// Data
const tokenPackages = TOKEN_PACKAGES
const planConfigs = PLAN_CONFIGS

// Lifecycle
onMounted(async () => {
  await loadUserData()
})

// Methods
function goBack() {
  router.push('/home')
}

async function loadUserData() {
  loading.value = true
  error.value = null

  try {
    // Get user ID from auth store
    const userId = authStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }
    // Pass email and name to create user if they don't exist
    const email = authStore.user?.email
    const name = authStore.user?.name || authStore.user?.firstName
    await userStore.fetchUser(userId, email, name)
  } catch (err: any) {
    error.value = err.message || 'Failed to load user data'
  } finally {
    loading.value = false
  }
}

function getPlanIcon(plan: PlanType): string {
  const config = planConfigs.find(p => p.name === plan)
  return config?.icon || '🆓'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function scrollToTokens() {
  tokensSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToPlans() {
  plansSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function getPlanButtonColor(planName: PlanType): string {
  if (userStore.user?.plan === planName) return 'medium'
  if (planName === 'Pro') return 'tertiary'
  if (planName === 'Premium') return 'secondary'
  return 'light'
}

function getPlanButtonText(planName: PlanType): string {
  if (userStore.user?.plan === planName) return 'Current Plan'
  if (isDowngrade(planName)) return 'Downgrade'
  if (planName === 'Basic') return 'Switch to Basic'
  return `Upgrade to ${planName}`
}

function isDowngrade(planName: PlanType): boolean {
  const planOrder = { 'Basic': 0, 'Premium': 1, 'Pro': 2 }
  const currentPlanLevel = planOrder[userStore.user?.plan || 'Basic']
  const targetPlanLevel = planOrder[planName]
  return targetPlanLevel < currentPlanLevel
}

async function handleTokenPurchase(pkg: TokenPackage) {
  if (!userStore.user) return

  try {
    const toast = await toastController.create({
      message: 'Opening payment gateway...',
      duration: 2000,
      position: 'top'
    })
    await toast.present()

    await purchaseTokens(
      userStore.user.id,
      userStore.user.email,
      userStore.user.name,
      pkg.amount,
      pkg.tokens,
      async (response) => {
        // Payment successful
        const successToast = await toastController.create({
          message: 'Payment successful! Verifying...',
          duration: 2000,
          position: 'top',
          color: 'success'
        })
        await successToast.present()

        // Verify payment
        try {
          await verifyPayment(response.reference)

          // Update local state
          userStore.updateTokens(pkg.tokens)

          const finalToast = await toastController.create({
            message: `✅ ${pkg.tokens} tokens added to your account!`,
            duration: 3000,
            position: 'top',
            color: 'success'
          })
          await finalToast.present()

          // Refresh user data
          await loadUserData()
        } catch (err) {
          console.error('Verification error:', err)
        }
      },
      async () => {
        // Payment cancelled
        const cancelToast = await toastController.create({
          message: 'Payment cancelled. No charges were made.',
          duration: 2000,
          position: 'top',
          color: 'warning'
        })
        await cancelToast.present()
      }
    )
  } catch (err: any) {
    const errorToast = await toastController.create({
      message: err.message || 'Failed to process payment',
      duration: 3000,
      position: 'top',
      color: 'danger'
    })
    await errorToast.present()
  }
}

async function handlePlanUpgrade(plan: PlanConfig) {
  if (!userStore.user || plan.name === 'Basic' || userStore.user.plan === plan.name) return

  // Show confirmation modal
  const alert = await alertController.create({
    header: `Upgrade to ${plan.name}?`,
    message: `
      <div class="upgrade-confirmation">
        <p><strong>You'll get:</strong></p>
        <ul>
          <li>${plan.freeTokens.toLocaleString()} free tokens immediately</li>
          <li>All ${plan.name} plan benefits</li>
        </ul>
        <p><strong>Billing:</strong> ₦${plan.price.toLocaleString()} every ${plan.duration}</p>
      </div>
    `,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Confirm Upgrade',
        handler: async () => {
          try {
            await upgradePlan(
              userStore.user!.id,
              userStore.user!.email,
              userStore.user!.name,
              plan.name as 'Premium' | 'Pro',
              plan.planId,
              plan.price,
              async (response) => {
                // Payment successful
                const successToast = await toastController.create({
                  message: 'Payment successful! Verifying...',
                  duration: 2000,
                  position: 'top',
                  color: 'success'
                })
                await successToast.present()

                // Verify payment
                try {
                  await verifyPayment(response.reference)

                  // Update local state
                  const expiryDate = new Date()
                  expiryDate.setMonth(expiryDate.getMonth() + 2)
                  userStore.upgradePlan(plan.name as PlanType, expiryDate.toISOString(), plan.freeTokens)

                  const finalToast = await toastController.create({
                    message: `🎉 Welcome to ${plan.name}! ${plan.freeTokens} tokens added.`,
                    duration: 3000,
                    position: 'top',
                    color: 'success'
                  })
                  await finalToast.present()

                  // Refresh user data
                  await loadUserData()
                } catch (err) {
                  console.error('Verification error:', err)
                }
              },
              async () => {
                // Payment cancelled
                const cancelToast = await toastController.create({
                  message: 'Upgrade cancelled. No charges were made.',
                  duration: 2000,
                  position: 'top',
                  color: 'warning'
                })
                await cancelToast.present()
              }
            )
          } catch (err: any) {
            const errorToast = await toastController.create({
              message: err.message || 'Failed to process upgrade',
              duration: 3000,
              position: 'top',
              color: 'danger'
            })
            await errorToast.present()
          }
        }
      }
    ]
  })

  await alert.present()
}
</script>

<style scoped>
.tokens-plans-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

/* Plan Status Card */
.plan-status-card {
  margin-bottom: 1.5rem;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.plan-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.plan-badge.plan-basic {
  background: var(--ion-color-medium-tint);
  color: var(--ion-color-medium-contrast);
}

.plan-badge.plan-premium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.plan-badge.plan-pro {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.plan-icon {
  font-size: 1.5rem;
}

.plan-name {
  font-size: 1.1rem;
}

.plan-details {
  margin-top: 1rem;
}

.expiry-date {
  font-size: 0.95rem;
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

.days-remaining {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-success);
}

.days-remaining.expiring-soon {
  color: var(--ion-color-warning);
}

/* Token Balance Card */
.token-balance-card {
  margin-bottom: 2rem;
}

.token-display {
  text-align: center;
  margin-bottom: 2rem;
}

.token-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.token-icon {
  font-size: 3rem;
}

.token-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.token-label {
  font-size: 1.1rem;
  color: var(--ion-color-medium);
}

.usage-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.buy-tokens-btn {
  margin-top: 1rem;
}

/* Section Headers */
.section-header {
  margin: 2rem 0 1.5rem;
  text-align: center;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--ion-color-medium);
}

/* Token Packages */
.token-packages-grid {
  margin-bottom: 3rem;
}

.token-package-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.token-package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.token-package-card.best-value {
  border: 2px solid var(--ion-color-warning);
}

.best-value-badge {
  position: absolute;
  top: -10px;
  right: 10px;
  z-index: 1;
}

.package-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.package-tokens {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Plan Cards */
.plans-grid {
  margin-bottom: 2rem;
}

.plan-card {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plan-card.current-plan {
  border: 2px solid var(--ion-color-primary);
}

.plan-badge-label {
  position: absolute;
  top: -10px;
  right: 10px;
  z-index: 1;
}

.plan-icon-large {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  flex-grow: 1;
}

.features-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--ion-color-light);
}

.features-list li:last-child {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .plan-header {
    flex-direction: column;
    align-items: stretch;
  }

  .token-number {
    font-size: 2.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }
}
</style>

