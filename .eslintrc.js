module.exports = {
  extends: ['./node_modules/ts-standardx/.eslintrc.js'],
  settings: {
    react: {
      pragma: 'h'
    }
  },
  rules: {
    'react/jsx-pascal-case': ['error', { ignore: ['CPU', 'RAM', 'VDU'] }],
    'react/jsx-sort-props': [
      'error',
      { callbacksLast: true, shorthandFirst: true, reservedFirst: true }
    ]
  }
}
