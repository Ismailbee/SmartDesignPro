import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: [
      'onnxruntime-web', 
      '@capacitor/app', 
      '@capacitor/core',
      'vue-konva',
      'konva',
      'ionicons/icons'
    ],
    exclude: [
      '@imgly/background-removal'
    ],
    // Force optimization to avoid OneDrive sync issues
    force: true
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'onnxruntime': ['onnxruntime-web']
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
