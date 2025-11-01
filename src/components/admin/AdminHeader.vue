<template>
  <div class="admin-header">
    <div class="header-left">
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>

    <div class="header-right">
      <ion-button fill="outline" @click="handleRefresh">
        <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
        Refresh
      </ion-button>

      <div class="user-menu">
        <ion-avatar>
          <img :src="userAvatar" alt="User" />
        </ion-avatar>
        <span class="user-name">{{ userName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonButton, IonIcon, IonAvatar } from '@ionic/vue'
import { refreshOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'

interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.displayName || authStore.user?.name || 'Admin')
const userAvatar = computed(() => authStore.user?.photoURL || authStore.user?.avatar || 'https://ui-avatars.com/api/?name=' + userName.value)

function handleRefresh() {
  emit('refresh')
}
</script>

<style scoped>
.admin-header {
  background: white;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-menu:hover {
  background: #f3f4f6;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

ion-avatar {
  width: 36px;
  height: 36px;
}
</style>

