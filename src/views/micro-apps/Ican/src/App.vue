<template>
  <div id="app" class="min-h-screen">
    <MainLayout>
      <router-view />
    </MainLayout>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import MainLayout from './layouts/MainLayout.vue';
import { SplashScreen } from '@capacitor/splash-screen';

export default defineComponent({
  name: 'App',
  components: {
    MainLayout,
  },
  setup() {
    onMounted(async () => {
      console.log('🚀 App component mounted');
      
      // Ensure splash screen is hidden
      setTimeout(async () => {
        try {
          await SplashScreen.hide();
          console.log('✅ Splash screen hidden from App component');
        } catch (err) {
          console.log('ℹ️ Splash screen already hidden or not available');
        }
      }, 200);
    });

    return {};
  },
});
</script>

<style>
/* Global styles can be added here */
</style>