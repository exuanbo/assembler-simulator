module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/common/utils/*.ts',
    'src/features/assembler/core/*.ts',
    'src/features/memory/core.ts',
    'src/features/cpu/core/*.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
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
