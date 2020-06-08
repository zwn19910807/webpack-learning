const merge = require('webpack-merge');
const common = require('./webpack.common');
const webpack = require('webpack');

module.exports = merge({
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(css|less)$/,
        use: [
          "style-loader",
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          "less-loader"
        ]
      }
    ]
  },
  devServer: {
    port: 8088,
    historyApiFallback: true,
    contentBase: '../dist',
    openPage: 'about.html',
    open: true,
    hot: true,
    proxy: {
      index: '',
      'api/get': 'xxxx.com/api',
      'api/vue': {
        target: 'xxxx.com/api',
        pathRewrite: {
          'head': 'demo'
        },
        secure: false,
        changeOrigin: true
      }
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
}, common)