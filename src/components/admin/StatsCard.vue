<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {{ value }}
        </p>
      </div>
      <div v-if="icon" class="text-4xl">
        {{ icon }}
      </div>
    </div>
    <div v-if="change" class="mt-4">
      <span
        :class="[
          'text-sm font-medium',
          change > 0 ? 'text-green-600' : 'text-red-600'
        ]"
      >
        {{ change > 0 ? '+' : '' }}{{ change }}%
      </span>
      <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">
        vs last period
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon?: string
  change?: number
}>()
</script>

