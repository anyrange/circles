const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
    extends: ["eslint:recommended", "prettier", "turbo"],
    env: {
        node: true,
        es6: true,
    },
    settings: {
        "import/resolver": {
            typescript: {
                project,
            },
        },
    },
    ignorePatterns: [
        ".*.js",
        "node_modules/",
        "dist/",
    ],
    overrides: [
        {
            files: ["*.js?(x)", "*.ts?(x)"],
        },
    ],
    rules: {
        "max-depth": ["error", 4],
        "max-lines": [
            "error",
            { max: 2500, skipBlankLines: false, skipComments: false },
        ],
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
        "max-nested-callbacks": ["error", 7],
        "max-params": ["error", 7],
        "max-statements-per-line": ["error", { max: 1 }],
        "no-case-declarations": "off",
        "curly": ["error", "all"],
        "sort-imports": ["error", { ignoreDeclarationSort: true }],
        "no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-var-requires": "off",
        "turbo/no-undeclared-env-vars": "off"
    },
};