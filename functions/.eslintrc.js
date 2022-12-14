module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {
    'new-cap': 'off',
    'indent': 'off',
    'object-curly-spacing': 'off',
    'max-len': 'off',
  },
};
