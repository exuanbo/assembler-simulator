import { join } from 'path'
import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: './',
  plugins: [WindiCSS(), react(), legacy()],
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
