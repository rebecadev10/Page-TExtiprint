import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('react')) {
            return 'vendor-react';
          }
        }
      }
    }
  }
})
