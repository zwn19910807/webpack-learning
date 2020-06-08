# webpack 使用步骤

### 1：初始化

```javascript
// 初始化项目，生成 package.json 文件
npm init -y	
```



### 2：本地安装（推荐）

```javascript
// -D 表示开发依赖
npm i webpack webpack-cli -D
```

>不推荐全局安装：`npm i webpack webpack-cli -g`
>
>如果支持ES6+，还需要安装babel相关依赖：
>
>`npm install -D babel-loader @babel/core @babel/preset-env`

### 3：配置文件目录

```javascript
├── build			  	// 专门存放 webpack 构建的脚本
│ └── webpack.common.js // 通用配置文件
│ └── webpack.dev.js  	// 开发环境配置文件
│ └── webpack.prod.js 	// 生产环境配置文件
├── dist			  	// 输出目录
├── src				  	// 源码目录
│ └── main.js		  	// 入口文件
├── public	
│ └── index.html
└── package.json 		// 项目信息，依赖包，scripts命令
```



```javascript
// webpack.common.js 配置：
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: path.resolve(__dirname, '../src/index.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist')
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
      }
    ]
  }
}
```





### 4：html-webpack-plugin

>将打包后的文件植入到 html 模版中并导出到dist目录下

```javascript
// -D 表示开发依赖
npm install html-webpack-plugin -D

// webpack.common.js 添加配置：
const template = path.resolve(__dirname, '../public/index.html');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
// ...省略...
  plugins: [
    new HtmlWebpackPlugin({
      template: template,
      filename: 'index.html'
    })
  ]
}
```



### 5：webpack-merge

>开发需要使用 webpack-merge 将 webpack.common.js 合并入 webpack.dev.js，
>
>生产需要使用 webpack-merge 将 webpack.common.js 合并入 webpack.prod.js

```javascript
npm install webpack-merge -D

// webpack.prod.js 中配置：
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge({
  mode: 'production',
  output: {
    filename: 'js/[name]_[contenthash].js',
    chunkFilename: 'js/[name]_[contenthash].chunk.js'
  }
}, common)
```



### 6：package.json 配置

>webpack 默认会找名为 webpack.config.js 的文件，由于我们将其拆解为 prod 和 dev，
>
>所以我们要手动指定 webpack 执行的文件，添加 --config，即可手动指定目录。

```javascript
"scripts": {
	"build": "webpack --config ./build/webpack.prod.js"
},
```



### 7：clean-webpack-plugin

>清除dist目录下，上次打包的内容

```javascript
npm i clean-webpack-plugin -D

// webpack.prod.js 添加配置：
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge({
  // ...省略...

  plugins: [
    new CleanWebpackPlugin()
  ]

}, common)
```



### 8：CSS 支持

>webpack 不解析 css，less，sass 文件；可通过安装对应的 loader 去解析。

```javascript
npm install css-loader style-loader -D

// webpack.common.js 添加配置：
  module: {
    rules: [
      // ...省略...
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
```



### 9：mini-css-extract-plugin

>现在 css 虽然生效了，但是是以 style 标签的形式，写在 html 的 header 中的；
>
>如果想以 css 文件方式引入，需要 mini-css-extract-plugin 这个插件。

```javascript
npm install mini-css-extract-plugin -D

// webpack.prod.js 添加配置：
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge({
	//	...省略...
  module: {
    rules: [
      {
        test: /\.css$/,
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
              importLoaders: 2  // 该方式可以让@import引入的css文件再次执行一遍css打包loader
            }
          }
        ]
      }
    ]
  },
  plugins: [
    //	...省略...
    new MiniCSSExtractPlugin({
      filename: 'css/[name_[hash].css',
      chunkFilename: 'css/[name]_[hash].chunk.css'
    })
  ]

}, common)

// 此时就可以将 webpack.common.js 中的css配置，移到 webpack.dev.js 里面：
// webpack.dev.js 配置：
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge({
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
}, common)
```



### 10：@babel/polyfill core-js

>为了支持更高的ES6+语法，我们在根目录配置 .babelrc 文件，以及安装相应的 npm 包。

```javascript
npm install @babel/polyfill core-js -D

// .babelrc 文件如下：
{
  "presets": [
    [
      "@babel/preset-env",   // 将ES6语法转换为ES5
      {
        "useBuiltIns": "usage",    // 只编译需要编译的代码
        "corejs": "3.0.1"
      }
    ]
  ]
}

// 还要在 webpack.common.js 配置文件中开启：
optimization: {
    usedExports: true
}
// 还要在 package.json 中添加如下配置：
"sideEffects": [
    "*.css",
    "*.less"
],
```



### 11：运行测试

```javascript
// 安装jQuery：
npm install jquery -S

// index.js中引入jQuery：
import './styles/app.css';
import $ from 'jquery';
$('#root').text('hello, webpack');

// 可以看到，css和jQuery都生效了

# 但是查看dist目录下的js文件，引入的jQuery和我们的业务代码，都打包进一个页面了。
# 所以我们进一步做优化，即js代码分割。
```



### 12：js代码分割

```javascript
// webpack.common.js 添加配置：
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
# 此时js已被分割
```



### 13：less、图片，字体图标

```javascript
// 安装相关loader
npm install url-loader file-loader less less-loader

// webpack.common.js 更改配置：
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
  }

// webpack.prod.js 更改配置：
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
  }

// webpack.dev.js 更改配置：
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
  }
```



### 14：webpack-dev-server

```javascript
npm install webpack-dev-server -D

// 因为这是开发时的需求，所以在 webpack.dev.js 里配置：
const webpack = require('webpack');

module.exports = merge({
  // ...省略...
  devServer: {
    port: 8088,
    historyApiFallback: true,
    contentBase: '../dist',
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

// scripts 配置命令：
  "scripts": {
	// ...省略...
    "start": "webpack-dev-server --config ./build/webpack.dev.js"
  },

# 执行"npm start" 会自动打开浏览器，运行我们的项目
```



### 15：多页面应用（共用一个html）

>开发多页面应用，还是需要用到之前使用的 html-webpack-plugin 插件，并且需要定义多个入口。

```javascript
// webpack.common.js 更改配置：
  entry: {
    main: path.resolve(__dirname, '../src/index.js'),
    about: path.resolve(__dirname, '../src/about.js')	// 多个入口
  },
  plugins: [	// 共用一个html模板，往里面引入不同的js，设置不同的title
    new HtmlWebpackPlugin({
      template: template,
      title: 'webpack-index',
      chunks: ['vender', 'main'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: template,
      title: 'webpack--about',
      chunks: ['vender', 'about'],
      filename: 'about.html'
    })
  ]

// index.html 更改title写法：
<title><%= htmlWebpackPlugin.options.title %></title>

# npm run build 后，dist目录下会有about和index两个html文件
```



### 16：多页面应用（使用不同html）

>上面的多页面打包，共用了一个html模板；下面来实现不同的页面，使用各自的html模板。

```javascript
// webpack.common.js 更改配置：
const template1 = path.resolve(__dirname, '../public/index.html');
const template2 = path.resolve(__dirname, '../public/about.html');	// 这里引入不同的html模板
  entry: {
    main: path.resolve(__dirname, '../src/index.js'),
    about: path.resolve(__dirname, '../src/about.js')	// 多个入口
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: template1,		// 这里指定html模板为：template1
      title: 'webpack-index',
      chunks: ['vender', 'main'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: template2,		// 这里指定html模板为：template2
      title: 'webpack--about',
      chunks: ['vender', 'about'],
      filename: 'about.html'
    })
  ]
# 此时 npm run build 会报一个错：Conflict: Multiple chunks emit assets to the same filename css/[name_bf4c9da5c5f9d86b5679.css (chunks 1 and 2)
# 意思是多个资源打包成chunks，都放到css目录下，使用了相同的文件名
# 就是说：名字叫[name_bf4c9da5c5f9d86b5679.css的文件，有chunks 1 and 2两个。

// webpack.prod.js	更改配置：
new MiniCSSExtractPlugin({
    filename: 'css/[id].[name_[hash].css',
    chunkFilename: 'css/[id].[name]_[hash].chunk.css'
})
# 在filename，chunkFilename配置项里，加了[id],这样它们在打包时就不会重名了
# 此时 npm run build，完美！
```



### 17：默认打开页面

>多页面开发时，启动 webpack，如何控制默认打开的页面？

```javascript
// 在 webpack.dev.js 里增加配置：
  devServer: {
	// ...省略...
    openPage: 'about.html',
    // ...省略...
  }
# devServer 的 openPage，用来控制默认打开哪个html页面。
```

