import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Trading Checklist',
        short_name: 'Checklist',
        description: 'Trading Checklist App',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/logo-new.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.new.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})