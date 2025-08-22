module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@domain/shared-kernel$': '<rootDir>/../../domain/shared-kernel/src',
    '^@domain/catalog$': '<rootDir>/../../domain/catalog/src'
  }
};