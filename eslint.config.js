// @ts-check

import eslint from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    name: 'exuanbo/languages',
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
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
      '@typescript-eslint/no-unsafe-return': 'off',
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
    name: 'exuanbo/stylistic',
    plugins: {
      '@stylistic': pluginStylistic,
    },
    rules: extendRules(pluginStylistic.configs['recommended-flat'].rules, {
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
      '@stylistic/max-statements-per-line': ['error', {
        max: 2,
      }],
      '@stylistic/no-multi-spaces': ['error', {
        exceptions: {
          ObjectExpression: true,
          TSEnumMember: true,
          TSTypeAnnotation: true,
          VariableDeclarator: true,
        },
      }],
      '@stylistic/quotes': ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: true,
      }],
      '@stylistic/yield-star-spacing': ['error', 'after'],
    }),
  },
)

function extendRules(rules, record) {
  return Object.entries(record).reduce(
    (extendedRules, [name, entry]) =>
      Object.assign(extendedRules, extendRule(name, entry)),
    rules,
  )

  function extendRule(name, entry) {
    if (!Array.isArray(entry)) {
      return { [name]: entry }
    }
    const defaultEntry = rules[name]
    if (!Array.isArray(defaultEntry)) {
      return { [name]: entry }
    }
    const [, ...defaultOptions] = defaultEntry
    const [level, ...options] = entry
    const extendedOptions = options.map((option, i) => {
      if (typeof option !== 'object') {
        return option
      }
      const defaultOption = defaultOptions[i]
      if (typeof defaultOption !== 'object') {
        return option
      }
      return {
        ...defaultOption,
        ...option,
      }
    })
    const extendedEntry = [level, ...extendedOptions]
    return { [name]: extendedEntry }
  }
}
