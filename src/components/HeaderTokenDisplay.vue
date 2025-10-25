<template>
  <div class="header-token-display" @click="navigateToTokensPage">
    <ion-skeleton-text v-if="loading" animated style="width: 80px; height: 32px;"></ion-skeleton-text>

    <ion-chip v-else-if="userStore.user" color="primary" class="token-chip">
      <span class="token-icon">💎</span>
      <ion-label class="token-count">
        {{ userStore.user.tokens.toLocaleString() }}
      </ion-label>
    </ion-chip>

    <!-- Fallback: Show even if not authenticated for testing -->
    <ion-chip v-else color="primary" class="token-chip">
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
  padding: 0.6rem 1rem;
  font-weight: 700;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.token-chip:hover {
  transform: scale(1.08) translateY(-2px);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.token-icon {
  font-size: 1.3rem;
  margin-right: 0.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.token-count {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
}

@media (max-width: 768px) {
  .token-chip {
    padding: 0.5rem 0.8rem;
  }

  .token-icon {
    font-size: 1.1rem;
    margin-right: 0.4rem;
  }

  .token-count {
    font-size: 0.95rem;
  }
}
</style>

