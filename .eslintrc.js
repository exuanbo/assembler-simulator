module.exports = {
  extends: ['./node_modules/ts-standardx/.eslintrc.js'],
  rules: {
    'node/no-callback-literal': 'off',
    'react/jsx-handler-names': 'off',
    'react/jsx-sort-props': [
      'error',
      {
        callbacksLast: true,
        shorthandFirst: true,
        reservedFirst: true
      }
    ]
  }
}
