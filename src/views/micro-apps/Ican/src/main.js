import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './assets/styles/variables.css';

/* Tailwind CSS */
import './assets/styles/tailwind.css';

const app = createApp(App);
const pinia = createPinia();

app.use(IonicVue);
app.use(router);
app.use(pinia);

// Simple and direct app initialization
console.log('🚀 Starting ICAN app...');

const initApp = async () => {
  try {
    // Don't show Capacitor splash - let Vue handle it
    try {
      await SplashScreen.hide();
      console.log('✅ Capacitor splash hidden - Vue splash will show');
    } catch (error) {
      console.log('ℹ️ Capacitor splash not available');
    }
    
    app.mount('#app');
    console.log('✅ App mounted successfully');
    
  } catch (error) {
    console.error('❌ App failed to mount:', error);
    try {
      await SplashScreen.hide();
    } catch (e) {}
  }
};

initApp();
