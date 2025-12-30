<template>
  <div class="bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl shadow-xl p-6">
    <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ title }}</p>
    <p class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{{ value }}</p>
    <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r" :class="gradient">
      {{ trend }}
    </div>
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ trendLabel }}</p>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'KpiCard',
  props: {
    title: String,
    value: [String, Number],
    trend: String,
    trendLabel: String,
    gradient: {
      type: String,
      default: 'from-sky-500 to-blue-600'
    }
  }
});
</script>
