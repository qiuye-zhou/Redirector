const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const UnoCSS = require('unocss/webpack').default;
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
  mode: 'production',
  entry: {
    content: './src/content.js',
    background: './src/background.js',
    popup: './src/popup.jsx'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'extensions'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { 
                targets: { chrome: "58" },
                modules: false
              }],
              '@babel/preset-react'
            ],
            plugins: []
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: (chunk) => {
        return chunk.name !== 'content';
      },
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'vendor',
          chunks: (chunk) => chunk.name === 'popup',
          priority: 10,
        },
        common: {
          test: /[\\/]node_modules[\\/]/,
          name: 'common',
          chunks: (chunk) => chunk.name === 'popup',
          priority: 5,
          minChunks: 2,
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(packageJson.version),
      'process.env.PACKAGE_NAME': JSON.stringify(packageJson.name),
      'process.env.DESCRIPTION': JSON.stringify(packageJson.description),
      'process.env.BUILD_TIME': JSON.stringify(new Date().toLocaleString())
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/popup.html", to: "popup.html" },
        { from: "public", to: "."},
      ],
    }),
    UnoCSS(),
  ],
  performance: {
    maxAssetSize: 500000,
    maxEntrypointSize: 500000,
    hints: 'warning'
  }
};
