// eslint.config.js
import react from 'eslint-plugin-react';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      react: react,
      prettier: prettier,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      semi: ['error', 'never'], // 不要求分号
      curly: 'warn',
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];