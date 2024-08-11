import js from "@eslint/js";
import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.es2021,
        ...globals.node,
        RequestInit: true,
      },
    },
    plugins: {
      ts: tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs["eslint-recommended"].rules,
      "max-depth": ["error", 4],
      "max-lines": [
        "error",
        { max: 2500, skipBlankLines: false, skipComments: false },
      ],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "max-nested-callbacks": ["error", 7],
      "max-params": ["error", 7],
      "no-case-declarations": "off",
      "max-statements-per-line": ["error", { max: 1 }],
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
      curly: ["error", "all"],
      "ts/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "error",
      "ts/no-var-requires": "off",
      "ts/no-explicit-any": "off",
    },
  },
];
