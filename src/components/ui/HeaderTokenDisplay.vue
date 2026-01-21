<template>
  <div class="header-token-display" @click="navigateToTokensPage">
    <ion-skeleton-text v-if="loading" animated style="width: 80px; height: 32px;"></ion-skeleton-text>

    <ion-chip v-else-if="userStore.user" class="token-chip">
      <span class="token-icon">💎</span>
      <ion-label class="token-count">
        {{ userStore.user?.tokens ? userStore.user.tokens.toLocaleString() : '0' }}
      </ion-label>
    </ion-chip>

    <!-- Fallback: Show even if not authenticated for testing -->
    <ion-chip v-else class="token-chip">
      <span class="token-icon">💎</span>
      <ion-label class="token-count">0</ion-label>
    </ion-chip>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { IonChip, IonLabel, IonSkeletonText } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  console.log('💎 HeaderTokenDisplay mounted')
  console.log('💎 User Store:', userStore.user)

  // Load user data if not already loaded
  if (!userStore.user) {
    try {
      // Get user ID from auth store
      const userId = authStore.user?.id
      if (!userId) {
        console.warn('💎 User not authenticated')
        loading.value = false
        return
      }
      console.log('💎 Fetching user data for:', userId)
      // Pass email and name to create user if they don't exist
      const email = authStore.user?.email
      const name = authStore.user?.name || authStore.user?.firstName
      await userStore.fetchUser(userId, email, name)
      console.log('💎 User data loaded:', userStore.user)
    } catch (error) {
      console.error('💎 Failed to load user data:', error)
    }
  }
  loading.value = false
  console.log('💎 Loading complete, user:', userStore.user)
})

// Watch for token changes
watch(() => userStore.user?.tokens, (newTokens, oldTokens) => {
  if (newTokens !== oldTokens && newTokens !== undefined) {
    // Optional: Add animation or notification when tokens change
    console.log('Tokens updated:', newTokens)
  }
})

function navigateToTokensPage() {
  router.push('/tokens-and-plans')
}
</script>

<style scoped>
.header-token-display {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.token-chip {
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-weight: 700;
  transition: all 0.2s ease;
  --background: #3b82f6 !important;
  --color: white !important;
  background: #3b82f6 !important;
  min-height: 40px;
  max-height: 40px;
  height: 40px;
  display: flex;
  align-items: center;
}

:deep(ion-chip.token-chip) {
  --background: #3b82f6 !important;
  --color: white !important;
  background: #3b82f6 !important;
}

.token-chip:hover {
  transform: scale(1.05);
  --background: #2563eb !important;
  background: #2563eb !important;
}

.token-icon {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.token-count {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

/* Mobile responsiveness - Progressive breakpoints */
@media (max-width: 768px) {
  .token-chip {
    padding: 0.55rem 0.9rem;
    min-width: auto;
    white-space: nowrap;
    min-height: 34px;
  }

  .token-icon {
    font-size: 1.15rem;
    margin-right: 0.4rem;
  }

  .token-count {
    font-size: 1rem;
    font-weight: 700;
  }
}

@media (max-width: 480px) {
  .token-chip {
    padding: 0.5rem 0.75rem;
    transform: scale(0.95);
    transform-origin: center;
    min-height: 32px;
  }

  .token-icon {
    font-size: 1rem;
    margin-right: 0.35rem;
  }

  .token-count {
    font-size: 0.9rem;
    font-weight: 700;
  }
}

@media (max-width: 400px) {
  .token-chip {
    padding: 0.35rem 0.55rem;
    transform: scale(0.9);
    max-width: fit-content;
  }

  .token-icon {
    font-size: 0.85rem;
    margin-right: 0.25rem;
  }

  .token-count {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
}

@media (max-width: 360px) {
  .token-chip {
    padding: 0.3rem 0.5rem;
    transform: scale(0.85);
    border-radius: 12px;
  }

  .token-icon {
    font-size: 0.8rem;
    margin-right: 0.2rem;
  }

  .token-count {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: -0.03em;
  }
}
</style>
