/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@circles/eslint-config/base.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  globals: {
    "RequestInit": true
  }
};