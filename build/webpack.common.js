const path = require('path');
const webpack = require('webpack');
const template1 = path.resolve(__dirname, '../public/index.html');
const template2 = path.resolve(__dirname, '../public/about.html');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
    main: path.resolve(__dirname, '../src/index.js'),
    about: path.resolve(__dirname, '../src/about.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, '../src'),
        use: [
          "babel-loader"
        ]
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[ext]?[hash]',
            outputPath: 'images/',
            limit: 4096
          }
        }
      },
      {
        test: /\.(eot|ttf|svg)$/,
        use: {
          loader: 'file-loader'
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      // chunks: 'async', // async表示只对异步代码进行分割
      minSize: 30000,  // 当超过指定大小时做代码分割
      // maxSize: 200000,  // 当大于最大尺寸时对代码进行二次分割
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '_',
      name: true,
      cacheGroups: {  // 缓存组：如果满足vendor的条件，就按vender打包，否则按default打包
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10, // 权重越大，打包优先级越高
          // filename: 'js/vender.js'  //将代码打包成名为vender.js的文件
          name: 'vender'
        },
        default: {
          minChunks: 2,
          priority: -20,
          name: 'common',
          // filename: 'js/common.js',
          reuseExistingChunk: true // 是否复用已经打包过的代码
        }
      }
    },
    usedExports: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: template1,
      title: 'webpack-index',
      chunks: ['vender', 'main'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: template2,
      title: 'webpack--about',
      chunks: ['vender', 'about'],
      filename: 'about.html'
    })
  ]
}