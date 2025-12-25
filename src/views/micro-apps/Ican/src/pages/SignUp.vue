<template>
  <div class="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900">
    <!-- Background Pattern -->
    <div class="fixed inset-0 opacity-5 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.3),_transparent_50%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,182,212,0.2),_transparent_50%)]"></div>
    </div>

    <!-- Main Content -->
    <div class="relative flex items-center justify-center min-h-full px-4 py-8">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-2 text-amber-700 dark:text-amber-300 text-sm font-semibold uppercase tracking-wide mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Registration Closed
          </div>
          <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Sign Up Currently Unavailable
          </h1>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            New account registration is temporarily disabled
          </p>
        </div>

        <!-- Locked Notice -->
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 p-8">
          <!-- Lock Icon -->
          <div class="flex justify-center mb-6">
            <div class="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg class="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <!-- Notice Message -->
          <div class="space-y-6 text-center">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Registration is Currently Closed
              </h2>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                New account registration is temporarily disabled at this time. 
                We apologize for any inconvenience this may cause.
              </p>
            </div>

            <!-- Contact Admin Box -->
            <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-left">
                  <h3 class="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                    Need Access?
                  </h3>
                  <p class="text-sm text-emerald-800 dark:text-emerald-400 mb-3">
                    If you need to create an account or have questions about registration, 
                    please contact your branch administrator.
                  </p>
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium text-emerald-900 dark:text-emerald-300">
                      Contact your administrator for assistance
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
              <p class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Already have an account? You can still
                <router-link 
                  :to="{ path: '/home', query: { branch: selectedBranch } }" 
                  class="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  sign in
                </router-link>
              </p>
            </div>

            <!-- Back Button -->
            <div class="pt-2">
              <BaseButton
                variant="outline"
                type="button"
                class="w-full py-3 text-base"
                @click="goBack"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseButton from '@/components/BaseButton.vue';

export default defineComponent({
  name: 'SignUp',
  components: {
    BaseButton,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const selectedBranch = ref(route.query.branch || '');

    const goBack = () => {
      router.push({ path: '/home' });
    };

    return {
      selectedBranch,
      goBack,
    };
  },
});
</script>

<style scoped>
/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.8);
}
</style>