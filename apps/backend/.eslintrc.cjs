const baseConfig = require("../../codestyle/config-eslint");

module.exports = {
  ...baseConfig,
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    ...baseConfig.rules,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
  },
};
