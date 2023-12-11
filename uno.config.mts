import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind from '@unocss/preset-wind'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import { defineConfig } from 'unocss'

export default defineConfig({
  blocklist: ['?', 'px', 'static'],
  presets: [
    presetWind(),
    presetWebFonts({
      fonts: {
        mono: {
          name: 'JetBrains Mono',
          weights: [400, 700],
        },
      },
    }),
  ],
  rules: [
    [
      'font-ligatures-none',
      {
        'font-variant-ligatures': 'none',
        'font-feature-settings': "'liga' 0",
      },
    ],
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
})
