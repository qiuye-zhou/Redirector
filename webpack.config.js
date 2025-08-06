const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const UnoCSS = require('unocss/webpack').default;

module.exports = {
  mode: 'production',
  entry: {
    content: './src/content.js',
    background: './src/background.js',
    popup: './src/App.jsx' 
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
                  modules: false // 启用tree shaking
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
    sideEffects: false, // 启用tree shaking
    splitChunks: {
      chunks: (chunk) => {
        // 对content script禁用代码分割，对popup和background启用
        return chunk.name !== 'content';
      },
      cacheGroups: {
        // React相关库打包到vendor chunk (仅用于popup)
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'vendor',
          chunks: (chunk) => chunk.name === 'popup',
          priority: 10,
        },
        // Antd库单独打包 (仅用于popup)
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'antd',
          chunks: (chunk) => chunk.name === 'popup',
          priority: 20,
        },
        // 其他第三方库
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
  // 外部依赖优化 - 对于Chrome插件，我们不能使用CDN，所以注释掉
  // externals: {
  //   'react': 'React',
  //   'react-dom': 'ReactDOM'
  // },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public", to: "." },
      ],
    }),
    UnoCSS(),
  ],
  // 性能优化配置
  performance: {
    maxAssetSize: 500000, // 500KB
    maxEntrypointSize: 500000, // 500KB
    hints: 'warning'
  }
};
