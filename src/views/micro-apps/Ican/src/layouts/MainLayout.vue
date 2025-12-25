<template>
  <div class="flex flex-col min-h-screen ">
    <header class="bg-transparent backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm p-4">
      <div class="flex items-center justify-between">
        <!-- Back Button (Mobile Only) -->
        <button 
          @click="goBack"
          class="md:hidden flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="text-sm font-medium">Back</span>
        </button>

        <!-- Spacer for desktop (keeps nav centered when back button is hidden) -->
        <div class="hidden md:block"></div>

       
      </div>
    </header>
    
    <main class="flex-grow ">
      <slot />
    </main>
    
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  methods: {
    goBack() {
      // Simply go back in browser history
      // This allows continuous backward navigation through all previous pages
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        // Only if there's no history (app just opened), go to home
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
</style>