const esmParsers='(htmlparser2|domhandler|domutils|dom-serializer|domelementtype|entities)';
module.exports = {
  transform: {
    [String.raw`node_modules[\\/]${esmParsers}[\\/].+\.js$`]: '<rootDir>/scripts/jest-esm-transform.cjs',
    '^.+\\.jsx?$':'babel-jest'
  },
  transformIgnorePatterns:[String.raw`node_modules[\\/](?!${esmParsers}[\\/])`],
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
    '!src/scripts/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true
};
