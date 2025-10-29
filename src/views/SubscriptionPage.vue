<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Upgrade Plan</ion-title>
        <ion-buttons slot="end">
          <DiamondTierIcon :color="userStore.tierColor" :show-glow="true" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="subscription-page">
      <div class="subscription-container">
        <!-- Header Section -->
        <div class="subscription-header">
          <h1>Choose Your Plan</h1>
          <p class="subtitle">Unlock premium features and get bonus tokens</p>
        </div>

        <!-- Current Plan Badge -->
        <div v-if="userStore.user" class="current-plan-badge">
          <ion-chip :color="getPlanColor(userStore.user.plan)">
            <DiamondTierIcon :color="userStore.tierColor" />
            <ion-label>Current Plan: {{ userStore.user.plan }}</ion-label>
          </ion-chip>
          <p v-if="userStore.user.planExpiryDate && !userStore.planExpired" class="expiry-text">
            Expires in {{ userStore.daysUntilExpiry }} days
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading plans...</p>
        </div>

        <!-- Plans Grid -->
        <div v-else class="plans-grid">
          <ion-card
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
            :class="{ 
              'popular': plan.popular, 
              'recommended': plan.recommended,
              'current': isCurrentPlan(plan.name)
            }"
          >
            <!-- Badge -->
            <div v-if="plan.popular" class="plan-badge popular-badge">Most Popular</div>
            <div v-if="plan.recommended" class="plan-badge recommended-badge">Best Value</div>
            <div v-if="isCurrentPlan(plan.name)" class="plan-badge current-badge">Current Plan</div>

            <ion-card-header>
              <div class="plan-icon">
                <DiamondTierIcon :color="plan.color" :show-glow="plan.popular || plan.recommended" />
              </div>
              <ion-card-title class="plan-name">{{ plan.name }}</ion-card-title>
              <div class="plan-price">
                <span class="currency">₦</span>
                <span class="amount">{{ plan.price.toLocaleString() }}</span>
                <span v-if="plan.price > 0" class="duration">/ {{ plan.duration }}</span>
                <span v-else class="duration">{{ plan.duration }}</span>
              </div>
            </ion-card-header>

            <ion-card-content>
              <!-- Token Bonus -->
              <div v-if="plan.tokenBonus > 0" class="token-bonus">
                <ion-icon :icon="sparklesOutline"></ion-icon>
                <span>{{ plan.tokenBonus.toLocaleString() }} Bonus Tokens</span>
              </div>

              <!-- Features List -->
              <ion-list class="features-list">
                <ion-item v-for="(feature, index) in plan.features" :key="index" lines="none">
                  <ion-icon slot="start" :icon="checkmarkCircleOutline" color="success"></ion-icon>
                  <ion-label class="feature-text">{{ feature }}</ion-label>
                </ion-item>
              </ion-list>

              <!-- Action Button -->
              <ion-button
                expand="block"
                :color="plan.popular ? 'warning' : plan.recommended ? 'secondary' : 'medium'"
                :disabled="isCurrentPlan(plan.name) || plan.price === 0 || processing"
                @click="upgradeToPlan(plan)"
                class="upgrade-button"
              >
                <ion-spinner v-if="processing && selectedPlanId === plan.id" name="crescent"></ion-spinner>
                <span v-else>
                  {{ getButtonText(plan) }}
                </span>
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Features Comparison -->
        <ion-card class="comparison-card">
          <ion-card-header>
            <ion-card-title>Feature Comparison</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="comparison-table">
              <div class="comparison-row header-row">
                <div class="feature-name">Feature</div>
                <div class="plan-column">Free</div>
                <div class="plan-column">Premium</div>
                <div class="plan-column">Pro</div>
              </div>
              <div class="comparison-row">
                <div class="feature-name">Bonus Tokens</div>
                <div class="plan-column">50</div>
                <div class="plan-column">1,000</div>
                <div class="plan-column">1,500</div>
              </div>
              <div class="comparison-row">
                <div class="feature-name">AI Design Tools</div>
                <div class="plan-column">Basic</div>
                <div class="plan-column">Advanced</div>
                <div class="plan-column">All</div>
              </div>
              <div class="comparison-row">
                <div class="feature-name">Export Quality</div>
                <div class="plan-column">Watermarked</div>
                <div class="plan-column">HD</div>
                <div class="plan-column">4K</div>
              </div>
              <div class="comparison-row">
                <div class="feature-name">Support</div>
                <div class="plan-column">Community</div>
                <div class="plan-column">Priority</div>
                <div class="plan-column">Dedicated</div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- FAQ Section -->
        <ion-card class="faq-card">
          <ion-card-header>
            <ion-card-title>Frequently Asked Questions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-accordion-group>
              <ion-accordion value="billing">
                <ion-item slot="header">
                  <ion-label>How does billing work?</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  Plans are billed upfront for the duration specified. Premium and Pro plans last for 2 months.
                </div>
              </ion-accordion>
              <ion-accordion value="tokens">
                <ion-item slot="header">
                  <ion-label>What happens to my tokens after plan expires?</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  Your tokens never expire! You keep all tokens even after your plan expires.
                </div>
              </ion-accordion>
              <ion-accordion value="upgrade">
                <ion-item slot="header">
                  <ion-label>Can I upgrade anytime?</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  Yes! You can upgrade to a higher plan at any time. Your new plan will start immediately.
                </div>
              </ion-accordion>
            </ion-accordion-group>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonAccordionGroup,
  IonAccordion,
  toastController,
  alertController
} from '@ionic/vue'
import {
  sparklesOutline,
  checkmarkCircleOutline
} from 'ionicons/icons'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth'
import { getSubscriptionPlans } from '@/services/subscription.service'
import { initializePayment } from '@/services/payment.service'
import type { SubscriptionPlan } from '@/types/payment.types'
import DiamondTierIcon from '@/components/subscription/DiamondTierIcon.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()

const plans = ref<SubscriptionPlan[]>([])
const loading = ref(false)
const processing = ref(false)
const selectedPlanId = ref<string>('')

onMounted(async () => {
  // Refresh user data to get latest plan status
  if (authStore.user?.uid) {
    await userStore.fetchUser(authStore.user.uid, authStore.user.email, authStore.user.displayName)
  }
  await loadPlans()
})

async function loadPlans() {
  loading.value = true
  try {
    const response = await getSubscriptionPlans()
    plans.value = response.plans
  } catch (error: any) {
    console.error('Load plans error:', error)
    showToast('Failed to load subscription plans', 'danger')
  } finally {
    loading.value = false
  }
}

function isCurrentPlan(planName: string): boolean {
  return userStore.user?.plan === planName && !userStore.planExpired
}

function getPlanColor(planName: string): string {
  switch (planName) {
    case 'Premium': return 'warning'
    case 'Pro': return 'secondary'
    default: return 'medium'
  }
}

function getButtonText(plan: SubscriptionPlan): string {
  if (plan.price === 0) return 'Current Plan'
  if (isCurrentPlan(plan.name)) return 'Active'
  return `Upgrade to ${plan.name}`
}

async function upgradeToPlan(plan: SubscriptionPlan) {
  if (!authStore.user || !userStore.user) {
    showToast('Please log in to upgrade', 'warning')
    return
  }

  // Show confirmation
  const alert = await alertController.create({
    header: `Upgrade to ${plan.name}?`,
    message: `You'll be charged ₦${plan.price.toLocaleString()} and receive ${plan.tokenBonus.toLocaleString()} bonus tokens immediately.`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Continue',
        handler: () => {
          processUpgrade(plan)
        }
      }
    ]
  })

  await alert.present()
}

async function processUpgrade(plan: SubscriptionPlan) {
  processing.value = true
  selectedPlanId.value = plan.id

  try {
    const response = await initializePayment({
      userId: authStore.user!.id,
      email: authStore.user!.email!,
      amount: plan.price,
      type: 'plan_upgrade',
      plan: plan.name as any,
      planId: plan.id,
      name: authStore.user!.name || authStore.user!.username
    })

    // Redirect to Paystack
    window.location.href = response.authorizationUrl
  } catch (error: any) {
    console.error('Upgrade error:', error)
    showToast(error.message || 'Failed to process upgrade', 'danger')
  } finally {
    processing.value = false
    selectedPlanId.value = ''
  }
}

async function showToast(message: string, color: string = 'primary') {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'top'
  })
  await toast.present()
}
</script>

<style scoped>
.subscription-page {
  --background: #f9fafb;
}

.subscription-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.subscription-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px 0;
}

.subscription-header h1 {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.current-plan-badge {
  text-align: center;
  margin-bottom: 24px;
}

.expiry-text {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.plan-card {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: visible;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.plan-card.popular {
  border: 2px solid #fbbf24;
}

.plan-card.recommended {
  border: 2px solid #e5e7eb;
}

.plan-card.current {
  border: 2px solid #10b981;
}

.plan-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  z-index: 10;
}

.popular-badge {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.recommended-badge {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #1f2937;
}

.current-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.plan-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 48px;
}

.plan-name {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}

.plan-price {
  text-align: center;
  margin-bottom: 20px;
}

.currency {
  font-size: 20px;
  color: #6b7280;
  vertical-align: top;
}

.amount {
  font-size: 40px;
  font-weight: bold;
  color: #1f2937;
}

.duration {
  font-size: 16px;
  color: #6b7280;
  margin-left: 4px;
}

.token-bonus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
}

.token-bonus ion-icon {
  font-size: 20px;
}

.features-list {
  background: transparent;
  padding: 0;
  margin-bottom: 20px;
}

.features-list ion-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  font-size: 14px;
}

.feature-text {
  font-size: 14px;
  color: #4b5563;
}

.upgrade-button {
  margin-top: 16px;
  font-weight: 600;
}

/* Comparison Table */
.comparison-card {
  margin-bottom: 24px;
}

.comparison-table {
  overflow-x: auto;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.comparison-row.header-row {
  font-weight: bold;
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.feature-name {
  font-weight: 500;
  color: #1f2937;
}

.plan-column {
  text-align: center;
  color: #6b7280;
}

/* FAQ */
.faq-card {
  margin-bottom: 24px;
}

.accordion-content {
  padding: 16px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .comparison-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    font-size: 12px;
  }

  .feature-name {
    font-size: 12px;
  }
}
</style>

