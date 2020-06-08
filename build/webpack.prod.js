const merge = require('webpack-merge');
const common = require('./webpack.common');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge({
  mode: 'production',
  output: {
    filename: 'js/[name]_[contenthash].js',
    chunkFilename: 'js/[name]_[contenthash].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.(css|less)$/,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader,
            options: {
              filename: '[name].css',
              chunkFilename: "[name].css",
              publicPath: '../'   // ****最后打包的时候替换引入文件路径
            }
          },
          // 'style-loader',  使用MiniCssExtractPlugin时就不能使用style-loader了
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2  //该方式可以让@import引入的css文件再次执行一边css打包loader
            }
          },
          "less-loader"
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCSSExtractPlugin({
      filename: 'css/[id].[name_[hash].css',
      chunkFilename: 'css/[id].[name]_[hash].chunk.css'
    })
  ]

}, common)