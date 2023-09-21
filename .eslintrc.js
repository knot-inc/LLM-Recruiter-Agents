module.exorts = {
  root: true,
  env: {
    node: true,
    jest: true,
    browser: true,
  },
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "import",
    "typescript-sort-keys",
    "unused-imports",
  ],
  rules: {
    "unused-imports/no-unused-imports": "warn",
    "import/no-cycle": ["warn"],

    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling"]],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "./**.scss",
            group: "sibling",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "no-multiple-empty-lines": "warn",
    semi: 0,
    "@typescript-eslint/no-explicit-any": 0,
  },
};
