module.exports = {
  extends: ['./node_modules/ts-standardx/.eslintrc.js'],
  rules: {
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
