const FEATURES_DIR = 'src/features/'

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/common/*.ts',
    ...['assembler/core/*.ts', 'cpu/core/*.ts', 'memory/core.ts'].map(path => FEATURES_DIR + path)
  ],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)']
}
