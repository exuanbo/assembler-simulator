// @ts-check
/** @typedef {import('ts-jest').JestConfigWithTsJest} JestConfig */

/** @type {JestConfig} */
const config = {
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/src/features/editor/examples/'],
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
    '\\.tsx?$': 'ts-jest',
    '\\.asm$': '<rootDir>/__tests__/rawTransformer.js',
  },
}

export default config
