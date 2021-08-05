module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/core/**/*.ts'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)']
}
