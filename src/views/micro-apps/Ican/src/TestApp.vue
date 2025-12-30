<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
    <div class="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">ICAN App Test</h1>
      <p class="text-gray-600 mb-4">If you can see this, the app is working!</p>
      <button 
        @click="testFunction" 
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Test Button
      </button>
      <div v-if="testMessage" class="mt-4 p-2 bg-green-100 text-green-800 rounded">
        {{ testMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { SplashScreen } from '@capacitor/splash-screen';

export default defineComponent({
  name: 'TestApp',
  setup() {
    const testMessage = ref('');

    const testFunction = () => {
      testMessage.value = 'Button works! App is functional.';
    };

    onMounted(async () => {
      console.log('🚀 Test App mounted');
      
      // Multiple attempts to hide splash screen
      for (let i = 0; i < 5; i++) {
        setTimeout(async () => {
          try {
            await SplashScreen.hide();
            console.log(`✅ Splash hidden attempt ${i + 1}`);
          } catch (err) {
            console.log(`⚠️ Splash hide attempt ${i + 1} failed:`, err);
          }
        }, i * 500);
      }
    });

    return {
      testMessage,
      testFunction
    };
  },
});
</script>

<style scoped>
/* Test styles */
</style>