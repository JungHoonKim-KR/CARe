import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['care_logo.png', 'favicon.ico'],
      manifest: {
        name: 'CARe',
        short_name: 'CARe',
        description: '당신의 No.1 해외 렌터카 중개 플랫폼',
        theme_color: '#F7A633',
        background_color: '#F7A633',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'care_logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'care_logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': { 
        target: 'http://localhost:8080', 
        changeOrigin: true }
    }
  }
})
