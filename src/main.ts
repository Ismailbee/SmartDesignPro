import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import './styles/theme.css'
import './styles/wedding-fonts.css'
import App from './App.vue'
import { useThemeStore } from './stores/theme'

// Suppress Datadog Browser SDK warning
const originalWarn = console.warn
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('Datadog Browser SDK')) {
    return // Suppress Datadog warnings
  }
  originalWarn.apply(console, args)
}

// Vue Konva imports
import VueKonva from 'vue-konva'

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

// Register Vue Konva
app.use(VueKonva)

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Use Pinia and Router
app.use(pinia)
app.use(router)

// Initialize theme
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
