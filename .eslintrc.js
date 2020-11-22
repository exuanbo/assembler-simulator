const { mergeObj } = require('standard-engine-ts')

module.exports = mergeObj(require('ts-standardx/.eslintrc.js'), {
  settings: {
    react: {
      pragma: 'h',
      version: 'detect'
    }
  },
  rules: {
    'react/jsx-pascal-case': ['error', { ignore: ['CPU', 'RAM', 'VDU'] }],
    'react/jsx-sort-props': [
      'error',
      { callbacksLast: true, shorthandFirst: true, reservedFirst: true }
    ],
    'react/no-unknown-property': ['error', { ignore: ['spellcheck'] }]
  }
})
