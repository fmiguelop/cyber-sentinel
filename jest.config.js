const nextJest = require("next/jest");
const createJestConfig = nextJest({
    dir: "./",
});
const customJestConfig = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testEnvironment: "jest-environment-jsdom",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    collectCoverageFrom: [
        "lib/**/*.{ts,tsx}",
        "stores/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "!**/*.d.ts",
        "!**/node_modules/**",
    ],
};
module.exports = createJestConfig(customJestConfig);
