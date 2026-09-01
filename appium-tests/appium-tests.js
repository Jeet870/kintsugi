/**
 * Entry point for Appium Tests
 */
const { runAppiumTestSuite } = require('./tests/app-e2e-tests');

if (require.main === module) {
  runAppiumTestSuite();
}

module.exports = require('./tests/app-e2e-tests');
