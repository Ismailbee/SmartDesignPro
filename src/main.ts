// Suppress console messages BEFORE any imports
const originalWarn = console.warn
console.warn = (...args: any[]) => {
  const message = args[0]?.toString?.() || ''
  if (message.includes('Datadog') || message.includes('No storage available')) {
    return // Suppress Datadog warnings
  }
  originalWarn.apply(console, args)
}

const originalLog = console.log
console.log = (...args: any[]) => {
  if (args[0]?.includes?.('Datadog Browser SDK')) {
    return // Suppress Datadog logs
  }
  originalLog.apply(console, args)
}

const originalError = console.error
console.error = (...args: any[]) => {
  const errorMsg = args[0]?.toString?.() || ''
  if (errorMsg.includes('service worker') || errorMsg.includes('ServiceWorker')) {
    return // Suppress service worker errors in dev
  }
  originalError.apply(console, args)
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import './styles/theme.css'
import './styles/wedding-fonts.css'
import './styles/calendar-styles.css'
import App from './App.vue'
import { useThemeStore } from './stores/theme'

// Capacitor imports
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

// Ionic Vue imports
import { IonicVue } from '@ionic/vue'
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'



// Font Awesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faImages,
  faUpload,
  faShapes,
  faFont,
  faEyeSlash,
  faFilter,
  faCrop,
  faQrcode,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faPalette,
  faWandMagicSparkles,
  faCloudArrowUp,
  faEdit,
  faLayerGroup,
  faBars,
  faUserCircle,
  faCog,
  faSignOutAlt,
  faUndo,
  faRedo,
  faArrowsAltH,
  faTimes,
  faCheck,
  faTh,
  faMagnet,
  faSearchMinus,
  faSearchPlus,
  faDownload,
  faSave,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(
  faImages,
  faUpload,
  faShapes,
  faFont,
  faEyeSlash,
  faFilter,
  faCrop,
  faQrcode,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faPalette,
  faWandMagicSparkles,
  faCloudArrowUp,
  faEdit,
  faLayerGroup,
  faBars,
  faUserCircle,
  faCog,
  faSignOutAlt,
  faUndo,
  faRedo,
  faArrowsAltH,
  faTimes,
  faCheck,
  faTh,
  faMagnet,
  faSearchMinus,
  faSearchPlus,
  faDownload,
  faSave,
  faFolderOpen
)

const app = createApp(App)
const pinia = createPinia()

// Register Ionic Vue
app.use(IonicVue)

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Use Pinia and Router
app.use(pinia)
app.use(router)

// Initialize theme
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')

// Register SW only for production web builds (Capacitor native uses filesystem cache).
// In dev, avoid SW caching to prevent stale bundles and confusing runtime errors.
if (import.meta.env.PROD && !Capacitor.isNativePlatform()) {
  import('./pwa')
    .then((m) => m.registerPWA())
    .catch(() => {
      // ignore
    })
}
