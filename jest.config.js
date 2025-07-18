module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/fixtures/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 10000
};