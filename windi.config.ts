import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: ['index.html', 'src/**/*.tsx']
  },
  preflight: {
    blocklist: ['input']
  },
  blocklist: ['container', 'static'],
  theme: {
    extend: {
      cursor: {
        'col-resize': 'col-resize'
      },
      fontFamily: {
        sans: ['sans-serif'],
        mono: ['Jetbrains Mono', 'monospace']
      }
    }
  }
})
