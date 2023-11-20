/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/common/utils/*.ts',
    'src/features/assembler/core/*.ts',
    'src/features/memory/core.ts',
    'src/features/cpu/core/*.ts'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // jest does not support loading a module with query parameters
    // https://github.com/facebook/jest/issues/4181
    // solution is found here:
    // https://github.com/vitejs/vite/issues/4067#issuecomment-892631379
    '^(.*)\\?raw$': '$1'
  },
  preset: 'ts-jest',
  snapshotFormat: {
    escapeString: true,
    // TODO: remove in future realeases of jest
    printBasicPrototype: false
  },
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  transform: {
    '\\.asm$': '<rootDir>/__tests__/rawTransformer.js'
  }
}
