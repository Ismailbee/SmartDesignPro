<template>
  <div class="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-5">
    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ title }}</p>
    <p class="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{{ primary }}</p>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ secondary }}</p>
    <span class="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-xs text-emerald-600 dark:text-emerald-300">{{ trend }}</span>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TrendCard',
  props: {
    title: String,
    primary: String,
    secondary: String,
    trend: String
  }
});
</script>
