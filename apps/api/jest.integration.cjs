module.exports = {
  ...require("./jest.config.cjs"),
  testRegex: ".*\\.integration\\.ts$",
  testTimeout: 60000,
  coverageDirectory: "./coverage-integration",
};
