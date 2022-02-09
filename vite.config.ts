import { join } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import windicss from 'vite-plugin-windicss'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import { name, description } from './package.json'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    windicss(),
    pwa({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Assembler Simulator',
        short_name: 'AssemblerSimulator',
        description,
        id: `/${name}/`,
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 10
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src')
    }
  },
  server: {
    watch: {
      ignored: /coverage/
    }
  }
})
