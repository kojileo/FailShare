const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react/configs/recommended.js');
const reactSettings = {
  react: {
    version: 'detect'
  }
};
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...react,
    settings: reactSettings
  },
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // React Native固有のルール
      'react/react-in-jsx-scope': 'off', // React 17+では不要
      'react/prop-types': 'off', // TypeScriptを使用しているため
                        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  prettier,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.d.ts',
      '**/jest-coverage/**',
      '**/__tests__/__mocks__/**',
      '.expo/**',
      'assets/**',
      'scripts/**',
      'config/**',
    ],
  },
]; 