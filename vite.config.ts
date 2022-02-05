import { join } from 'path'
import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [WindiCSS(), react()],
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
