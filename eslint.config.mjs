// @ts-check

import eslint from '@eslint/js'
import configPrettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    name: 'exuanbo/languages',
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
  },
  {
    name: 'exuanbo/ignores',
    ignores: ['.yarn', 'coverage', 'dist'],
  },
  {
    name: 'eslint/recommended',
    ...eslint.configs.recommended,
  },
  {
    name: 'exuanbo/typescript',
    files: ['**/*.?(c|m)ts?(x)'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
    },
  },
  {
    name: 'exuanbo/react',
    files: ['**/*.{j,t}sx'],
    extends: [
      {
        name: 'react/recommended',
        ...pluginReact.configs.flat.recommended,
      },
      {
        name: 'react/jsx-runtime',
        ...pluginReact.configs.flat['jsx-runtime'],
      },
      {
        name: 'react-hooks',
        plugins: {
          'react-hooks': pluginReactHooks,
        },
        rules: pluginReactHooks.configs.recommended.rules,
      },
    ],
    rules: {
      'react/prop-types': 'off',
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          reservedFirst: true,
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    name: 'simple-import-sort',
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    name: 'config-prettier',
    ...configPrettier,
  },
)
