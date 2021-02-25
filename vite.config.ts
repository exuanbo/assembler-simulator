import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import WindiCSS from 'vite-plugin-windicss'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [reactRefresh(), WindiCSS(), legacy()]
})
