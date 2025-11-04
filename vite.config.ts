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
    include: ['onnxruntime-web'],
    exclude: ['@imgly/background-removal'],
    // Force optimization to avoid OneDrive sync issues
    force: true
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      external: []
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
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    // Watch options to handle OneDrive
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  // Configure WASM handling
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
