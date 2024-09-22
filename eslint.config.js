// @ts-check

import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    name: 'exuanbo/languages-node',
    files: ['**/*.?(c|m)js', '*.?(c|m)ts'],
    languageOptions: {
      // https://vitejs.dev/blog/announcing-vite5.html#node-js-support
      // https://node.green/#ES2022
      ecmaVersion: 2022,
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
    },
  },
  {
    name: 'exuanbo/languages-browser',
    files: ['src/**/*.?(c|m){j,t}s?(x)'],
    languageOptions: {
      // https://vitejs.dev/guide/build.html#browser-compatibility
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },
  {
    name: 'exuanbo/ignores',
    ignores: ['.yarn', 'coverage', 'dist'],
  },
  {
    name: 'exuanbo/files',
    files: ['**/*.?(c|m){j,t}s?(x)'],
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
      '@typescript-eslint/consistent-type-imports': ['error', {
        fixStyle: 'inline-type-imports',
      }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowShortCircuit: true,
      }],
    },
  },
  {
    name: 'exuanbo/react',
    files: ['**/*.{j,t}s?(x)'],
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
        rules: {
          'react-hooks/exhaustive-deps': 'error',
        },
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
    name: 'stylistic',
    ...stylistic.configs['recommended-flat'],
    rules: {
      ...stylistic.configs['recommended-flat'].rules,
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 0,
      }],
      '@stylistic/jsx-closing-bracket-location': ['error', {
        nonEmpty: 'after-props',
        selfClosing: 'tag-aligned',
      }],
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/key-spacing': ['error', {
        mode: 'minimum',
      }],
      '@stylistic/no-multi-spaces': ['error', {
        exceptions: {
          ObjectExpression: true,
          TSEnumMember: true,
        },
      }],
      '@stylistic/quote-props': ['error', 'consistent-as-needed'],
      '@stylistic/quotes': ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: true,
      }],
      '@stylistic/yield-star-spacing': ['error', 'after'],
    },
  },
)
