import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist',
      '**/.output',
      '**/node_modules',
      '**/routeTree.gen.ts',
      'services/**',
      'infra/**',
      '**/playwright-report',
      '**/test-results',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...pluginQuery.configs['flat/recommended'],
  ...pluginRouter.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: { globals: globals.node },
  },
)
