// @ts-check

import eslint from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

import { extendRules } from './scripts/eslint.js'

export default defineConfig(
  {
    name: 'eslint/ignores',
    ignores: ['.yarn/', 'coverage/', 'dist/'],
  },
  {
    name: 'eslint/recommended',
    ...eslint.configs.recommended,
  },
  ...tseslint.configs.recommendedTypeChecked,
  {
    name: 'exuanbo/typescript-eslint',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        fixStyle: 'inline-type-imports',
      }],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-namespace': ['error', {
        allowDeclarations: true,
      }],
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowShortCircuit: true,
      }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    name: 'exuanbo/react',
    basePath: 'src',
    extends: [
      {
        name: 'react/jsx',
        files: ['**/*.tsx'],
        languageOptions: {
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
            jsxPragma: null,
          },
        },
        plugins: {
          react: pluginReact,
        },
        rules: {
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
        name: 'react-hooks/recommended',
        files: ['**/*.ts', '**/*.tsx'],
        ...pluginReactHooks.configs.flat.recommended,
      },
    ],
  },
  {
    name: 'exuanbo/stylistic',
    plugins: {
      '@stylistic': pluginStylistic,
    },
    rules: extendRules(pluginStylistic.configs.recommended.rules, {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 0,
        flatTernaryExpressions: true,
      }],
      '@stylistic/jsx-closing-bracket-location': ['error', {
        nonEmpty: 'after-props',
      }],
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/key-spacing': ['error', {
        mode: 'minimum',
      }],
      '@stylistic/no-multi-spaces': ['error', {
        exceptions: {
          ObjectExpression: true,
          TSEnumMember: true,
          TSTypeAnnotation: true,
          VariableDeclarator: true,
        },
      }],
      '@stylistic/operator-linebreak': ['error', 'before', {
        overrides: {
          '=': 'after',
        },
      }],
      '@stylistic/quotes': ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals:  'always',
      }],
    }),
  },
  {
    name: 'simple-import-sort/all',
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
)
