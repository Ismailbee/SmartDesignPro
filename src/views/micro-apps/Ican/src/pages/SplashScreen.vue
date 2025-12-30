<template>
  <div class="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 flex items-center justify-center z-50">
    <!-- Subtle Background Pattern -->
    <div class="fixed inset-0 opacity-10 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.3),_transparent_70%)]"></div>
    </div>

    <!-- Main Content -->
    <div class="relative text-center px-6 animate-fade-in">
      <!-- Logo Container -->
      <div class="mb-6">
        <div class="inline-block p-4 bg-white rounded-2xl shadow-xl">
          <img
            src="/images/ican-web-logo.png"
            alt="ICAN Logo"
            class="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain"
          />
        </div>
      </div>

      <!-- Brand Name -->
      <div class="mb-4">
        <h1 class="text-2xl md:text-4xl font-bold text-white mb-1">
          Institute of Chartered Accountants of Nigeria
        </h1>
        
        <!-- Abbreviation -->
        <div class="inline-flex items-center gap-2 px-5 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full mt-3">
          <span class="text-xl md:text-2xl font-bold text-emerald-300 tracking-wide">ICAN</span>
        </div>
      </div>

      <!-- Tagline -->
      <p class="text-emerald-100 text-sm md:text-base mb-8 font-light">
        Professional Excellence in Accounting
      </p>

      <!-- Loading Indicator -->
      <div class="max-w-xs mx-auto">
        <div class="relative h-1 bg-white/10 rounded-full overflow-hidden">
          <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-loading-bar"></div>
        </div>
        
        <div class="mt-3 text-emerald-200 text-xs font-medium">Loading...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { SessionManager } from '../utils/secure-storage.js';

export default defineComponent({
  name: 'SplashScreen',
  setup() {
    const router = useRouter();

    const navigateToHome = async () => {
      try {
        console.log('🚀 Splash screen navigating to home...');
        
        // Wait for router to be ready
        await router.isReady();
        console.log('✅ Router is ready');
        
        // Use path-based navigation (most reliable in micro-app context)
        await router.replace('/home');
        console.log('✅ Navigation successful');
        
      } catch (error) {
        console.error('❌ Navigation failed:', error);
        
        // Try push as fallback
        try {
          await router.push('/home');
          console.log('✅ Push navigation successful');
        } catch (pushError) {
          console.error('❌ Push failed, using window redirect');
          window.location.href = '/home';
        }
      }
    };

    onMounted(async () => {
      // Always show splash screen for 2.5 seconds
      console.log('🎬 Showing splash screen for 2.5 seconds...');
      setTimeout(navigateToHome, 2500);
    });

    return {};
  }
});
</script>

<style scoped>
/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Loading Bar Animation */
@keyframes loadingBar {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

.animate-loading-bar {
  animation: loadingBar 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; /* Faster animation */
}
</style>