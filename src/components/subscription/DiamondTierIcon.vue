<template>
  <div class="diamond-tier-icon" :class="[`tier-${color}`, { glow: showGlow }]">
    <ion-icon :icon="diamondIcon" :class="`diamond-${color}`"></ion-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { diamond, diamondOutline } from 'ionicons/icons'
import type { TierColor } from '@/types/payment.types'

interface Props {
  color?: TierColor
  showGlow?: boolean
  outline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray',
  showGlow: false,
  outline: false
})

const diamondIcon = computed(() => {
  return props.outline ? diamondOutline : diamond
})
</script>

<style scoped>
.diamond-tier-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.diamond-tier-icon ion-icon {
  font-size: 24px;
  transition: all 0.3s ease;
}

/* Gray Tier (Free/Basic) */
.diamond-gray {
  color: #9ca3af;
}

.tier-gray.glow .diamond-gray {
  filter: drop-shadow(0 0 8px rgba(156, 163, 175, 0.5));
}

/* Gold Tier (Premium) */
.diamond-gold {
  color: #fbbf24;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tier-gold.glow .diamond-gold {
  filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
  animation: pulse-gold 2s ease-in-out infinite;
}

/* Silver Tier (Pro) */
.diamond-silver {
  color: #e5e7eb;
  background: linear-gradient(135deg, #f3f4f6 0%, #d1d5db 50%, #f9fafb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tier-silver.glow .diamond-silver {
  filter: drop-shadow(0 0 12px rgba(229, 231, 235, 0.8));
  animation: pulse-silver 2s ease-in-out infinite;
}

/* Hover Effects */
.diamond-tier-icon:hover ion-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Pulse Animations */
@keyframes pulse-gold {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.9));
  }
}

@keyframes pulse-silver {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(229, 231, 235, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(229, 231, 235, 1));
  }
}

/* Size Variants */
.diamond-tier-icon.small ion-icon {
  font-size: 18px;
}

.diamond-tier-icon.large ion-icon {
  font-size: 32px;
}

.diamond-tier-icon.xlarge ion-icon {
  font-size: 48px;
}
</style>

