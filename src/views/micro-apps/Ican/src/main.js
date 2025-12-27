import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

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
    // CRITICAL: Initialize Firebase FIRST (now that Capacitor is ready)
    // Firebase will auto-initialize from the main config module
    console.log('🔥 Firebase initialization handled by config module');
    
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

// CRITICAL FIX for APK: Wait for Capacitor platform to be ready
if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
  console.log('📱 Running on native platform:', Capacitor.getPlatform());
  console.log('⏳ Waiting for deviceready event...');
  
  // Wait for Capacitor to be fully ready before initializing app
  document.addEventListener('deviceready', () => {
    console.log('✅ Capacitor device ready!');
    initApp();
  }, false);
  
  // Fallback timeout - if deviceready doesn't fire in 3 seconds, try anyway
  setTimeout(() => {
    const appElement = document.querySelector('#app');
    if (appElement && !appElement.__vue_app__) {
      console.warn('⚠️ deviceready timeout - initializing anyway');
      initApp();
    }
  }, 3000);
} else {
  console.log('🌐 Running on web platform');
  // On web, initialize immediately
  initApp();
}
