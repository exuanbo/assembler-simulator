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
  // TODO: remove once Jest supports Prettier version 3
  prettierPath: null,
  snapshotFormat: {
    escapeString: true,
  },
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  transform: {
    '\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
      },
    ],
    '\\.asm$': '<rootDir>/__tests__/rawTransformer.js',
  },
}

module.exports = config
