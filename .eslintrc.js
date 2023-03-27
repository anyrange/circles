module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:prettier/recommended"],
  rules: {
    camelcase: "off",
  },
  overrides: [
    {
      files: ["packages/utils/src/index.ts"],
      rules: {
        "no-console": "off",
      },
    },
  ],
}
