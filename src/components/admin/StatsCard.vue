<template>
  <div class="stats-card" :class="`stats-card-${color}`">
    <div class="stats-icon">{{ icon }}</div>
    <div class="stats-content">
      <h3 class="stats-title">{{ title }}</h3>
      <p class="stats-value">{{ displayValue }}</p>
      <div class="stats-change" :class="changeClass">
        <span class="change-indicator">{{ changeIndicator }}</span>
        <span class="change-text">{{ changeText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  icon: string
  change?: number
  changeLabel?: string
  color?: 'blue' | 'green' | 'purple' | 'pink' | 'orange'
  isPercentage?: boolean
  isCurrency?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  change: 0,
  changeLabel: '',
  color: 'blue',
  isPercentage: false,
  isCurrency: false
})

const displayValue = computed(() => {
  if (typeof props.value === 'string') {
    return props.value
  }
  
  if (props.isPercentage) {
    return `${props.value}%`
  }
  
  if (props.isCurrency) {
    return props.value
  }
  
  return props.value.toLocaleString()
})

const changeClass = computed(() => {
  if (props.change > 0) return 'positive'
  if (props.change < 0) return 'negative'
  return 'neutral'
})

const changeIndicator = computed(() => {
  if (props.change > 0) return '↑'
  if (props.change < 0) return '↓'
  return '→'
})

const changeText = computed(() => {
  const value = Math.abs(props.change)
  const formatted = props.isCurrency ? `$${value}` : value
  return `${formatted} ${props.changeLabel}`
})
</script>

<style scoped>
.stats-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

/* Color Variants */
.stats-card-blue {
  --card-color-1: #0ea5e9;
  --card-color-2: #06b6d4;
}

.stats-card-green {
  --card-color-1: #22c55e;
  --card-color-2: #16a34a;
}

.stats-card-purple {
  --card-color-1: #a855f7;
  --card-color-2: #9333ea;
}

.stats-card-pink {
  --card-color-1: #ec4899;
  --card-color-2: #db2777;
}

.stats-card-orange {
  --card-color-1: #f97316;
  --card-color-2: #ea580c;
}

.stats-icon {
  font-size: 48px;
  line-height: 1;
}

.stats-content {
  flex: 1;
}

.stats-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-value {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stats-change {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.change-indicator {
  font-size: 16px;
}

.stats-change.positive {
  color: #22c55e;
}

.stats-change.negative {
  color: #ef4444;
}

.stats-change.neutral {
  color: rgba(255, 255, 255, 0.5);
}
</style>

