module.exports = {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/pages/*.test.js",
    "<rootDir>/client/src/pages/*/*.test.js",
    "<rootDir>/client/src/components/*.test.js",
    "<rootDir>/client/src/components/*/*.test.js",
    "<rootDir>/client/src/context/*.test.js",
    "<rootDir>/client/src/hooks/*.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/*",
    "client/src/pages/*/**",
    "client/src/components/*",
    "client/src/components/*/**",
    "client/src/context/*",
    "client/src/hooks/*",
  ],
  coveragePathIgnorePatterns: [
    "client/src/components/Routes/AdminRoute.js",
    "/client/src/pages/user/Orders.integration.test.js",
    "/client/src/pages/CartPage.integration.test.js",
  ],
  testPathIgnorePatterns: [
    "/client/src/pages/user/Orders.integration.test.js",
    "/client/src/pages/CartPage.integration.test.js",
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
