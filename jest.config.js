module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/DylanUtil.js',
    'index.js',
  ],
  coverageDirectory: 'coverage/backend',
  coverageReporters: ['text', 'html'],
  coverageThreshold: {
    global: {
      branches: 95, // minimum 80% of conditional branches covered
      functions: 95, // minimum 80% of functions covered
      lines: 95, // minimum 80% of lines covered
      statements: 95, // minimum 80% of statements covered
    },
  },
};
