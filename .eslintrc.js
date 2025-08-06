module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true  // 添加这一行来支持 chrome 扩展 API
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-undef': 'warn'
  }
}; 