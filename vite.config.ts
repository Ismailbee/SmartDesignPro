import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import os from 'os'

// Use temp directory for cache to avoid OneDrive sync issues
const tempDir = path.join(os.tmpdir(), 'vite-cache-design-editor')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Use temp directory for cache to avoid OneDrive conflicts
  cacheDir: tempDir,
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['onnxruntime-web', '@capacitor/app', '@capacitor/core'],
    exclude: ['@imgly/background-removal'],
    // Force optimization to avoid OneDrive sync issues
    force: true
  },
  build: {
    // Increase chunk size warning limit (some libs are large)
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      external: [],
      output: {
        // Optimized manual chunks for better code splitting and caching
        // IMPORTANT: vue-konva must be in same chunk as Vue to avoid initialization errors
        manualChunks(id) {
          // AI/ML - Heavy libs (load only when needed)
          if (id.includes('onnxruntime-web')) return 'onnxruntime'
          if (id.includes('tesseract.js')) return 'tesseract'

          // PDF/Export - Heavy libs (load on export)
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf') || id.includes('pdf-lib')) return 'pdf'

          // Charts - Visualization
          if (id.includes('chart.js')) return 'charts'

          // Firebase - Auth and backend
          if (id.includes('firebase')) return 'firebase-vendor'

          // Ionic - UI framework (separate from Vue core)
          if (id.includes('@ionic') || id.includes('ionicons') || id.includes('@stencil')) return 'ionic'
          
          // Konva standalone (without vue-konva)
          if (id.includes('node_modules/konva/') && !id.includes('vue-konva')) return 'konva'

          // Vue ecosystem - Core framework INCLUDING vue-konva to avoid initialization issues
          if (id.includes('node_modules/vue/') || 
              id.includes('node_modules/@vue/') || 
              id.includes('vue-router') ||
              id.includes('pinia') || 
              id.includes('@vueuse') ||
              id.includes('vue-konva') ||
              id.includes('vue3-lottie')) return 'vue-vendor'
        }
      }
    },
    // Ensure WASM files are copied to dist
    assetsDir: 'assets',
    copyPublicDir: true
  },
  server: {
    fs: {
      strict: false,
      // Allow serving files from outside the root
      allow: ['..']
    },
    // Serve WASM files with correct MIME type
    middlewareMode: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    },
    // Watch options to handle OneDrive
    watch: {
      usePolling: true,
      interval: 100
    },
    // Force HMR to always refresh
    hmr: {
      overlay: true
    }
  },
  // Configure WASM handling
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
