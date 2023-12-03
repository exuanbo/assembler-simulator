// @ts-check
/** @typedef {import('ts-jest').JestConfigWithTsJest} JestConfig */

/** @type {JestConfig} */
const config = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/common/utils/*.ts',
    'src/features/assembler/core/*.ts',
    'src/features/memory/core.ts',
    'src/features/cpu/core/*.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
    '(.+)\\?raw$': '$1',
  },
  snapshotFormat: {
    escapeString: true,
  },
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
    '^.+\\.asm$': '<rootDir>/__tests__/rawTransformer.js',
  },
}

module.exports = config
