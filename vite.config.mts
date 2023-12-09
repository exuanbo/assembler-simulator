import * as child_process from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import react from '@vitejs/plugin-react'
import unocss from 'unocss/vite'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { VitePWA as pwa } from 'vite-plugin-pwa'

import { description, name, version } from './package.json'

const exec = promisify(child_process.exec)

const getCommitHash = async () => {
  const { stdout } = await exec('git rev-parse --short HEAD')
  return stdout.trim()
}

const getCommitDate = async () => {
  const { stdout } = await exec('git log -1 --format=%cd')
  return new Date(stdout).toISOString()
}

export default defineConfig(async () => ({
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __VERSION__: JSON.stringify(version),
    __COMMIT_HASH__: JSON.stringify(await getCommitHash()),
    __COMMIT_DATE__: JSON.stringify(await getCommitDate()),
  },
  plugins: [
    react(),
    unocss(),
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
}))
