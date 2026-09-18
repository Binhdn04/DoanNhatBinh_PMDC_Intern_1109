module.exports = {
  ...require("./jest.config.cjs"),
  testRegex: process.env.INTEGRATION_COVERAGE
    ? ".*\\.(spec|integration)\\.ts$"
    : ".*\\.integration\\.ts$",
  testTimeout: 60000,
  coverageDirectory: "./coverage-integration",
};
