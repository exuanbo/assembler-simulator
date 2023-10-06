module.exports = {
  extends: ['./node_modules/ts-standardx/.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.eslint.json'
  },
  rules: {
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
