import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/agentswill/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      selfDestroying: true,
      includeAssets: ['assets/*.svg'],
      manifest: {
        name: 'GoPay - Pagamentos via PIX',
        short_name: 'GoPay',
        description: 'Receba pagamentos via PIX com links inteligentes',
        theme_color: '#0066FF',
        background_color: '#F5F7FA',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/agentswill/',
        scope: '/agentswill/',
        lang: 'pt-BR',
        icons: [
          { src: 'assets/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'assets/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}']
      }
    })
  ],
  server: {
    port: 5173
  }
})
