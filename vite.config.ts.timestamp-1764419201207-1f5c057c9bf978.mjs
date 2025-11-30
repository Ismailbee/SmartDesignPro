// vite.config.ts
import { defineConfig } from "file:///D:/GOLDEN-PRINTER/Programing-practical/SmartDesignPro/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/GOLDEN-PRINTER/Programing-practical/SmartDesignPro/node_modules/@vitejs/plugin-vue/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  optimizeDeps: {
    include: ["onnxruntime-web", "@capacitor/app", "@capacitor/core"],
    exclude: ["@imgly/background-removal"],
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
    assetsDir: "assets",
    copyPublicDir: true
  },
  server: {
    fs: {
      strict: false,
      // Allow serving files from outside the root
      allow: [".."]
    },
    // Serve WASM files with correct MIME type
    middlewareMode: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store, no-cache, must-revalidate"
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
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHT0xERU4tUFJJTlRFUlxcXFxQcm9ncmFtaW5nLXByYWN0aWNhbFxcXFxTbWFydERlc2lnblByb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR09MREVOLVBSSU5URVJcXFxcUHJvZ3JhbWluZy1wcmFjdGljYWxcXFxcU21hcnREZXNpZ25Qcm9cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dPTERFTi1QUklOVEVSL1Byb2dyYW1pbmctcHJhY3RpY2FsL1NtYXJ0RGVzaWduUHJvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3Z1ZSgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6ICcvc3JjJ1xuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydvbm54cnVudGltZS13ZWInLCAnQGNhcGFjaXRvci9hcHAnLCAnQGNhcGFjaXRvci9jb3JlJ10sXG4gICAgZXhjbHVkZTogWydAaW1nbHkvYmFja2dyb3VuZC1yZW1vdmFsJ10sXG4gICAgLy8gRm9yY2Ugb3B0aW1pemF0aW9uIHRvIGF2b2lkIE9uZURyaXZlIHN5bmMgaXNzdWVzXG4gICAgZm9yY2U6IHRydWVcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgIGluY2x1ZGU6IFsvbm9kZV9tb2R1bGVzL11cbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXVxuICAgIH0sXG4gICAgLy8gRW5zdXJlIFdBU00gZmlsZXMgYXJlIGNvcGllZCB0byBkaXN0XG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICBjb3B5UHVibGljRGlyOiB0cnVlXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgLy8gQWxsb3cgc2VydmluZyBmaWxlcyBmcm9tIG91dHNpZGUgdGhlIHJvb3RcbiAgICAgIGFsbG93OiBbJy4uJ11cbiAgICB9LFxuICAgIC8vIFNlcnZlIFdBU00gZmlsZXMgd2l0aCBjb3JyZWN0IE1JTUUgdHlwZVxuICAgIG1pZGRsZXdhcmVNb2RlOiBmYWxzZSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgT1BUSU9OUycsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxuICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tc3RvcmUsIG5vLWNhY2hlLCBtdXN0LXJldmFsaWRhdGUnXG4gICAgfSxcbiAgICAvLyBXYXRjaCBvcHRpb25zIHRvIGhhbmRsZSBPbmVEcml2ZVxuICAgIHdhdGNoOiB7XG4gICAgICB1c2VQb2xsaW5nOiB0cnVlLFxuICAgICAgaW50ZXJ2YWw6IDEwMFxuICAgIH0sXG4gICAgLy8gRm9yY2UgSE1SIHRvIGFsd2F5cyByZWZyZXNoXG4gICAgaG1yOiB7XG4gICAgICBvdmVybGF5OiB0cnVlXG4gICAgfVxuICB9LFxuICAvLyBDb25maWd1cmUgV0FTTSBoYW5kbGluZ1xuICBkZWZpbmU6IHtcbiAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnKVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VixTQUFTLG9CQUFvQjtBQUN0WCxPQUFPLFNBQVM7QUFHaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQ2YsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsbUJBQW1CLGtCQUFrQixpQkFBaUI7QUFBQSxJQUNoRSxTQUFTLENBQUMsMkJBQTJCO0FBQUE7QUFBQSxJQUVyQyxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsaUJBQWlCO0FBQUEsTUFDZixTQUFTLENBQUMsY0FBYztBQUFBLElBQzFCO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUM7QUFBQSxJQUNiO0FBQUE7QUFBQSxJQUVBLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxFQUNqQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBO0FBQUEsTUFFUixPQUFPLENBQUMsSUFBSTtBQUFBLElBQ2Q7QUFBQTtBQUFBLElBRUEsZ0JBQWdCO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1AsK0JBQStCO0FBQUEsTUFDL0IsZ0NBQWdDO0FBQUEsTUFDaEMsZ0NBQWdDO0FBQUEsTUFDaEMsaUJBQWlCO0FBQUEsSUFDbkI7QUFBQTtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLE1BQ1osVUFBVTtBQUFBLElBQ1o7QUFBQTtBQUFBLElBRUEsS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLHdCQUF3QixLQUFLLFVBQVUsUUFBUSxJQUFJLFlBQVksYUFBYTtBQUFBLEVBQzlFO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
