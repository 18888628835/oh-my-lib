---
order: 2
---

# Webpack 性能调优

HTTP 优化有两个大方向：

- 减少请求次数
- 减少单次请求花费的时间

一个网站可能有非常多的静态资源、JS 文件，如果能够减少静态资源的体积，合并某些静态资源（比如很多个 css 样式表），那么就能够对 HTTP 进行优化。

对**资源的压缩和合并**，我们可以利用打包工具来完成。目前打包工具主流还是使用 webpack，通过合理优化 webpack 的配置，能够让资源的压缩与合并达到理想的效果。

优化 webpack 的思路也是两个方向：

- 更快（提高构建速度，减少花费时间）
- 更小（减少打包体积）

## 如何更快——优化打包速度

打包速度影响到的是开发过程中的热更新速度以及上线前的构建速度。

通过以下方式我们可以优化打包速度：

### mode 属性

webpack 内部对`production`或者`development`有做优化，所以针对开发和生产环境我们需要配置不同的`mode`。

### resolve 配置

通过`resolve`解析规则，我们可以手动控制`webpack`的查找规则，除了对开发友好外，相当于显式告诉`webpack`利用`resolve`中的配置规则查找文件，合理的配置会提高`webpack`查找文件的效率。

### alias 设置别名

通过`alisa`设置别名可以让`webpack`通过规则项从上到下查找文件，而不是递归查找。

```javascript
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
```

通过上面的别名设置，除了让我们开发时可以通过`import xx from '@/xxx'` 引用`src`目录下的内容以外，还对`webpack`的查找规则非常友好——`webpack`知道可以`src`目录从上到下查找文件，而不是通过相对路径递归向上查找文件。

### extensions 高频扩展名前置

通过设置`extensions`可以在引入时不写扩展名。

```javascript
  resolve: {
    extensions: ['.js', '.jsx', '.tsx'],
  },
```

webpack 会从前到后遍历`extensions`属性来匹配是否有对应扩展名的文件，一些高频的后缀放在前面可以提高 webpack 搜索的速度

### `modules`告诉 webpack 解析模块时应该搜索的目录

```javascript
const path = require('path');

module.exports = {
  //...
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
};
```

上面的代码将告诉`webpack`搜索`src`目录和`node_modules`目录，`src`目录优先搜索。

这样有助于加快搜索时间

### cache 属性

```javascript
module.exports = {
  //...
  cache: {
    type: 'filesystem',
  },
};
```

通过设置 cache 属性为文件系统缓存生成的 webpack 模块和 chunk，来改善构建速度。

### thread-loader

在耗时的操作中使用此 loader 可以生成独立的 worker 池。每个 worker 都是一个独立的 node.js 进程。

相当于开启了多进程来处理耗时慢的`loader`，这样就达到了多`loader`同时处理的效果。

下面是官方文档的示例：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('src'),
        use: [
          'thread-loader',
          // 耗时的 loader （例如 babel-loader）
        ],
      },
    ],
  },
};
```

### 指定 include 或 exclude

最常见的方式是通过`include`或`exclude`属性来帮我们避免不必要的转译，以 babel-loader 为例

```javascript
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
  ];
}
```

上面的属性表示 babel 无需对 node_modules 文件夹或者 bower_components 文件夹做任何处理。

### 开启 loader 的 cache 功能

有些 loader 支持缓存功能，比如说 babel-loader 可以配置`cacheDirectory`属性,这个功能开启后能够用指定目录来缓存 loader 的执行结果。这样当 webpack 再次构建时，能够读取缓存来避免每次执行时，可能产生的高消耗的编译过程。

- DLLPlugin ❌

DLLPlugin 在 webpack5 中已经不用了，害我配了半天。

- happypack ❌

这个功能跟 thread-loader 差不多，都是开启多进程，webpack5 已经不需要了。

## 如何更小——缩小打包体积

缩小打包体积的思路有利用一些 plugin 来缩小代码量，或者利用 webpack 的 Tree-shaking 功能来删除没用过的代码。

### mode 属性

使用 `mode` 为 `"production"` 的配置项以启用[更多优化项](https://webpack.docschina.org/concepts/mode/#usage)，包括压缩代码与 tree shaking。

### 开启压缩

通过[optimization](https://webpack.docschina.org/configuration/optimization/#optimizationminimizer)属性开启压缩功能。告知 webpack 使用 [TerserPlugin](https://webpack.docschina.org/plugins/terser-webpack-plugin/) 或其它在 [`optimization.minimizer`](https://webpack.docschina.org/configuration/optimization/#optimizationminimizer)定义的插件压缩 bundle。

```javascript
module.exports = {
  //...
  optimization: {
    minimize: true,
  },
};
```

### 压缩 JS

使用 webpack5 开箱即用的插件[TerserWebpackPlugin](https://webpack.docschina.org/plugins/terser-webpack-plugin/)来压缩 JavaScript，只需要将插件添加到 `webpack`配置文件中即可。

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true, //记得开启压缩功能
    minimizer: [new TerserPlugin()],
  },
};
```

### 压缩 css

> [Optimize CSS Assets Webpack Plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin)
>
> 使用方式参照官方文档
>
> ```javascript
> var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
> module.exports = {
>   module: {
>   ...
>   },
>   plugins: [
>     new OptimizeCssAssetsPlugin({
>       assetNameRegExp: /\.optimize\.css$/g,
>       cssProcessor: require('cssnano'),
>       cssProcessorPluginOptions: {
>         preset: ['default', { discardComments: { removeAll: true } }],
>       },
>       canPrint: true
>     })
>   ]
> };
> ```
>
> ❌ 这个插件已经过时了

webpack5 推荐使用 [CssMinimizerWebpackPlugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/) 插件，它在 source maps 和 assets 中使用查询字符串会更加准确，支持缓存和并发模式下运行。

安装

```javascript
$ npm install css-minimizer-webpack-plugin --save-dev
```

**webpack.config.js**

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [
      // 在 webpack@5 中，你可以使用 `...` 语法来扩展现有的 minimizer（即 `terser-webpack-plugin`），将下一行取消注释
      // `...`,
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};
```

### Tree Shaking

_tree shaking_ 是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码(dead-code)。

`webpack`内置这个功能，只需要通过`mode:"production"`来开启就行。
