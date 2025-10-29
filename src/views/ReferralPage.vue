<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Refer & Earn</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="referral-page">
      <div class="referral-container">
        <!-- Header Section -->
        <div class="referral-header">
          <ion-icon :icon="giftOutline" class="gift-icon"></ion-icon>
          <h1>Invite Friends, Earn Tokens!</h1>
          <p class="subtitle">Share your unique referral code and both you and your friend get rewarded</p>
        </div>

        <!-- Rewards Card -->
        <ion-card class="rewards-card">
          <ion-card-content>
            <div class="rewards-grid">
              <div class="reward-item">
                <div class="reward-icon">🎁</div>
                <div class="reward-amount">+750</div>
                <div class="reward-label">Tokens for your friend</div>
              </div>
              <div class="reward-divider"></div>
              <div class="reward-item">
                <div class="reward-icon">💰</div>
                <div class="reward-amount">+500</div>
                <div class="reward-label">Tokens for you</div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Referral Code Card -->
        <ion-card class="referral-code-card">
          <ion-card-header>
            <ion-card-title>Your Referral Code</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="loading" class="loading-state">
              <ion-spinner name="crescent"></ion-spinner>
            </div>
            <div v-else-if="referralCode" class="code-container">
              <div class="code-display">
                <span class="code-text">{{ referralCode }}</span>
              </div>
              <div class="action-buttons">
                <ion-button expand="block" @click="copyCode" :disabled="copying">
                  <ion-icon slot="start" :icon="copying ? checkmarkOutline : copyOutline"></ion-icon>
                  {{ copying ? 'Copied!' : 'Copy Code' }}
                </ion-button>
                <ion-button expand="block" fill="outline" @click="shareCode">
                  <ion-icon slot="start" :icon="shareOutline"></ion-icon>
                  Share Link
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Statistics Card -->
        <ion-card class="stats-card">
          <ion-card-header>
            <ion-card-title>Your Referral Stats</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="loadingStats" class="loading-state">
              <ion-spinner name="crescent"></ion-spinner>
            </div>
            <div v-else-if="stats" class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.referralCount }}</div>
                <div class="stat-label">Friends Referred</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalTokensEarned }}</div>
                <div class="stat-label">Tokens Earned</div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Recent Referrals -->
        <ion-card v-if="stats && stats.referrals.length > 0" class="referrals-list-card">
          <ion-card-header>
            <ion-card-title>Recent Referrals</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="referral in stats.referrals.slice(0, 5)" :key="referral.id">
                <ion-icon slot="start" :icon="personCircleOutline" class="referral-avatar"></ion-icon>
                <ion-label>
                  <h3>{{ referral.referredName }}</h3>
                  <p>{{ formatDate(referral.createdAt) }}</p>
                </ion-label>
                <div slot="end" class="tokens-earned">
                  +{{ referral.tokensAwarded }} tokens
                </div>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- How It Works -->
        <ion-card class="how-it-works-card">
          <ion-card-header>
            <ion-card-title>How It Works</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Share Your Code</h4>
                  <p>Send your unique referral code to friends</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Friend Signs Up</h4>
                  <p>They use your code during registration</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Both Get Rewarded</h4>
                  <p>You get 500 tokens, they get 750 tokens!</p>
                </div>
              </div>
            </div>
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
  IonList,
  IonItem,
  IonLabel,
  toastController
} from '@ionic/vue'
import {
  giftOutline,
  copyOutline,
  shareOutline,
  checkmarkOutline,
  personCircleOutline
} from 'ionicons/icons'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth'
import { Share } from '@capacitor/share'

const userStore = useUserStore()
const authStore = useAuthStore()

const referralCode = ref<string>('')
const loading = ref(false)
const loadingStats = ref(false)
const copying = ref(false)
const stats = ref<any>(null)

onMounted(async () => {
  await loadReferralData()
})

async function loadReferralData() {
  if (!authStore.user?.id) return

  loading.value = true
  loadingStats.value = true

  try {
    // Fetch user data to get referral code
    await userStore.fetchUser(authStore.user.id)
    referralCode.value = userStore.user?.referralCode || ''

    // Fetch referral stats
    await userStore.fetchReferralStats(authStore.user.id)
    stats.value = userStore.referralStats
  } catch (error: any) {
    console.error('Load referral data error:', error)
    showToast('Failed to load referral data', 'danger')
  } finally {
    loading.value = false
    loadingStats.value = false
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(referralCode.value)
    copying.value = true
    showToast('Referral code copied!', 'success')
    
    setTimeout(() => {
      copying.value = false
    }, 2000)
  } catch (error) {
    showToast('Failed to copy code', 'danger')
  }
}

async function shareCode() {
  const shareUrl = `${window.location.origin}/signup?ref=${referralCode.value}`
  const shareText = `Join SmartDesignPro and get 750 FREE tokens! Use my referral code: ${referralCode.value}`

  try {
    // Try native share first (mobile)
    const canShare = await Share.canShare()
    if (canShare.value) {
      await Share.share({
        title: 'Join SmartDesignPro',
        text: shareText,
        url: shareUrl,
        dialogTitle: 'Share Referral Code'
      })
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      showToast('Share link copied to clipboard!', 'success')
    }
  } catch (error) {
    console.error('Share error:', error)
    showToast('Failed to share', 'danger')
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

async function showToast(message: string, color: string = 'primary') {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top'
  })
  await toast.present()
}
</script>

<style scoped>
.referral-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.referral-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.referral-header {
  text-align: center;
  color: white;
  margin-bottom: 24px;
  padding: 20px 0;
}

.gift-icon {
  font-size: 64px;
  color: #fbbf24;
  margin-bottom: 16px;
}

.referral-header h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* Rewards Card */
.rewards-card {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  margin-bottom: 16px;
}

.rewards-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
}

.reward-item {
  text-align: center;
}

.reward-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.reward-amount {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 4px;
}

.reward-label {
  font-size: 14px;
  opacity: 0.9;
}

.reward-divider {
  width: 2px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
}

/* Referral Code Card */
.code-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-display {
  background: #f3f4f6;
  border: 2px dashed #667eea;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.code-text {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Stats Card */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* Referrals List */
.referral-avatar {
  font-size: 32px;
  color: #667eea;
}

.tokens-earned {
  color: #10b981;
  font-weight: 600;
  font-size: 14px;
}

/* How It Works */
.steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 20px;
}

ion-card {
  margin-bottom: 16px;
}
</style>

