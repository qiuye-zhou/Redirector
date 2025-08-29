// @ts-check

module.exports = [
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'extensions/**',
      '*.min.js',
      'coverage/**'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',

        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        location: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        btoa: 'readonly',
        performance: 'readonly',
        setImmediate: 'readonly',
        MessageChannel: 'readonly',
        self: 'readonly',
        requestAnimationFrame: 'readonly',
        MutationObserver: 'readonly',
        DOMRectReadOnly: 'readonly',
        Element: 'readonly',
        ShadowRoot: 'readonly',
        process: 'readonly',
        HTMLElement: 'readonly',
        SVGElement: 'readonly',
        ResizeObserver: 'readonly',
        CustomEvent: 'readonly',
        MSApp: 'readonly',
        queueMicrotask: 'readonly',
        reportError: 'readonly',
        getComputedStyle: 'readonly',
        __REACT_DEVTOOLS_GLOBAL_HOOK__: 'readonly',

        // WebExtensions globals
        chrome: 'readonly',
        browser: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: require('eslint-plugin-react')
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'no-undef': 'warn',
      'react/react-in-jsx-scope': 'off' // React 17+ 不需要显式导入 React
    }
  }
];