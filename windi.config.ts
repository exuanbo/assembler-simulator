import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: ['index.html', 'src/**/*.tsx']
  },
  theme: {
    extend: {
      cursor: {
        'col-resize': 'col-resize'
      },
      fontFamily: {
        mono: ['Jetbrains Mono', 'monospace']
      }
    }
  }
})
