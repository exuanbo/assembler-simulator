import { mergeConfig } from 'vitest/config'

import { baseConfig } from './vite.config'

export default mergeConfig(baseConfig, {
  test: {
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      all: false,
    },
  },
})
