import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.min.js',
      '.env*',
      'docs/openapi.yaml',
      '.mysql',
    ],
  },
  {
    files: ['**/*.js'],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', 'tests/utils/setup.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
