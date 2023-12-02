import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { join } from 'path'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import windicss from 'vite-plugin-windicss'

import { description, name, version } from './package.json'

const getCommitHash = (): string => execSync('git rev-parse --short HEAD').toString().trimEnd()

const getCommitDate = (): string => {
  const commitDate = execSync('git log -1 --format=%cd').toString()
  return new Date(commitDate).toISOString()
}

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __VERSION__: JSON.stringify(version),
    __COMMIT_HASH__: JSON.stringify(getCommitHash()),
    __COMMIT_DATE__: JSON.stringify(getCommitDate()),
  },
  plugins: [
    react(),
    windicss(),
    pwa({
      manifestFilename: 'app.webmanifest',
      registerType: 'prompt',
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
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 10,
              },
            },
          },
        ],
      },
    }),
    splitVendorChunkPlugin(),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
  server: {
    watch: {
      ignored: [/coverage/, /dist/],
    },
  },
})
