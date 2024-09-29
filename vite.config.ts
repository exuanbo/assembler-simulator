import * as child_process from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import react from '@vitejs/plugin-react'
import unocss from 'unocss/vite'
import { defineConfig, mergeConfig, type UserConfig } from 'vite'
import { VitePWA as pwa } from 'vite-plugin-pwa'

import { description, name, version } from './package.json'
import split from './scripts/splitVendorChunk'

export const baseConfig = defineConfig({
  base: './',
  plugins: [
    unocss(),
    react(),
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
    }),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
})

export default defineConfig(async (env) => {
  const config = env.command === 'serve'
    ? await getServeConfig()
    : await getBuildConfig()
  return mergeConfig(baseConfig, config)
})

async function getServeConfig(): Promise<UserConfig> {
  return {
    define: await getGlobalReplacements(),
    server: {
      watch: {
        ignored: [/coverage/],
      },
    },
  }
}

async function getBuildConfig(): Promise<UserConfig> {
  return {
    define: await getGlobalReplacements(),
    plugins: [split()],
  }
}

async function getGlobalReplacements() {
  const exec = promisify(child_process.exec)

  async function getCommitHash() {
    const { stdout } = await exec('git rev-parse --short HEAD')
    return stdout.trimEnd()
  }

  async function getCommitDate() {
    const { stdout } = await exec('git log -1 --format=%cd')
    return new Date(stdout).toISOString()
  }

  return forkJoin({
    __VERSION__: JSON.stringify(version),
    __COMMIT_HASH__: getCommitHash().then(JSON.stringify),
    __COMMIT_DATE__: getCommitDate().then(JSON.stringify),
  })
}

type Joined<T> = {
  [K in keyof T]: Awaited<T[K]>
}

async function forkJoin<T extends Record<string, unknown>>(promises: T) {
  const keys = Object.keys(promises)
  const values = await Promise.all(Object.values(promises))
  return <Joined<T>>Object.fromEntries(keys.map((key, index) => [key, values[index]]))
}
