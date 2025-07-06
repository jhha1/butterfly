const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptEslintParser = require('@typescript-eslint/parser');
const globals = require('globals');
const { resolve } = require('path');

const tsconfigPath = resolve(__dirname, './tsconfig.base.json');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      '**/dist',
      '**/eslint.config.cjs',
      'node_modules/**',
      '**/*.config.js',
      '.github/**',
    ],
  },
  ...compat.extends('plugin:@typescript-eslint/recommended', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      'unused-imports': require('eslint-plugin-unused-imports'),
      prettier: eslintPluginPrettier,
    },
  },
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: tsconfigPath,
      },
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.cjs'],
    // Override or add rules here
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            accessors: 'explicit',
            constructors: 'no-public',
            methods: 'explicit',
            properties: 'off',
            parameterProperties: 'explicit',
          },
        },
      ],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          printWidth: 120,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
        },
      ],
      '@typescript-eslint/no-unused-vars': [2, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false,
        },
      ],
      camelcase: [
        'error',
        {
          properties: 'never',
          ignoreDestructuring: true,
          ignoreImports: true,
          allow: ['redirect_uris', 'Response_'],
        },
      ],
    },
  },
  {
    files: ['**/*.mjs'],
    // Override or add rules here
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          printWidth: 120,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
        },
      ],
      '@typescript-eslint/no-unused-vars': [2, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false,
        },
      ],
      camelcase: [
        'error',
        {
          properties: 'never',
          ignoreDestructuring: true,
          ignoreImports: true,
          allow: ['redirect_uris', 'Response_'],
        },
      ],
    },
  },
  ...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
    ...config,
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      ...config.rules,
    },
  })),
  ...compat.config({ env: { jest: true } }).map((config) => ({
    ...config,
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    rules: {
      ...config.rules,
    },
  })),
  { ignores: ['**/*/next.config.js', './lint-staged.config.js'] },
];