module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@domain/shared-kernel$': '<rootDir>/../shared-kernel/src'
  }
};