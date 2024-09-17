import * as child_process from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import react from '@vitejs/plugin-react'
import unocss from 'unocss/vite'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { VitePWA as pwa } from 'vite-plugin-pwa'

import { description, name, version } from './package.json'

interface ImportMetaEnvDefinition {
  [key: `import.meta.env.${string}`]: string | boolean
}

const importMetaEnv: ImportMetaEnvDefinition = {
  'import.meta.env.NEVER': false,
}

export default defineConfig(async () => {
  const exec = promisify(child_process.exec)

  async function getCommitHash() {
    const { stdout } = await exec('git rev-parse --short HEAD')
    return stdout.trimEnd()
  }

  async function getCommitDate() {
    const { stdout } = await exec('git log -1 --format=%cd')
    return new Date(stdout).toISOString()
  }

  const globalConstants = await forkJoin({
    __VERSION__: JSON.stringify(version),
    __COMMIT_HASH__: getCommitHash().then(JSON.stringify),
    __COMMIT_DATE__: getCommitDate().then(JSON.stringify),
  })

  return {
    base: './',
    build: {
      // TODO: use `rollupOptions.output.manualChunks`
      chunkSizeWarningLimit: 1000,
    },
    define: {
      ...importMetaEnv,
      ...globalConstants,
    },
    plugins: [
      unocss(),
      react(),
      splitVendorChunkPlugin(),
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
  }
})

type Joined<T extends Record<string, unknown>> = {
  [K in keyof T]: Awaited<T[K]>
}

async function forkJoin<T extends Record<string, unknown>>(promises: T) {
  const keys = Object.keys(promises)
  const values = await Promise.all(Object.values(promises))
  return <Joined<T>>Object.fromEntries(keys.map((key, index) => [key, values[index]]))
}
