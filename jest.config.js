const { join } = require('path')

const FEATURES_DIR = 'src/features'

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/common/utils/*.ts',
    ...['assembler/core/*.ts', 'cpu/core/*.ts', 'memory/core.ts'].map(pattern =>
      join(FEATURES_DIR, pattern)
    )
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)']
}
