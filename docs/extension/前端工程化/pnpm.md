# pnpm

## npm 和 yarn 的问题

```bash
mkdir demo-1
// 下载 4.0 版本 node
nvm install 4
// 使用 4.0 版本 node
nvm use 4
// 此时 npm 版本为 2.15.11
npm --version
cd demo-1
// 初始化项目获取 package.json
npm init -y
npm install koa
```

根据上面的操作，koa 的包会下载到 node_modules 中。

我们点开看一下：

![image-20230429202601634](../../assets/image-20230429202601634.png)

可以看到 koa 中也依赖了其他的包，所以也一个`node_modules`。

再展开一个看看：

![image-20230429203126753](../../assets/image-20230429203126753.png)

可以得出在 npm2.0 版本中，node_modules 是嵌套的。

这样有一个很大的问题：如果多个包之前有共同的依赖，这样的嵌套结构会复制很多次，占据比较大的磁盘空间。

同时，过度的嵌套会有可能超过 windows 的文件路径长度（windows 的文件路径最长是 260 个字符）。

为了解决这个问题（当然 npm3.0 也解决了），yarn 出现了。

yarn 是如何解决这个问题的呢？

删掉 node_module 并将 node 版本提高到`16`以上，使用 yarn 再装一遍。

![image-20230429204045376](../../assets/image-20230429204045376.png)

可以看出来 yarn 将 node_module 给铺开了，node_modules 不再是嵌套结构而是只有一层。

但是如果是相同的包不同的版本，yarn 是怎么做的呢？

我们点开`http-errors`这个包，可以看到它也有 node_module，里面依赖了 depd ，最外层也有 depd 这个包。

![image-20230429204836507](../../assets/image-20230429204836507.png)

这说明在相同依赖但不同版本的情况下，还是会用嵌套的方式来组织 node_module。

不管怎么样，对比起 NPM2.X 版本的嵌套，扁平化的方式已经是巨大的进步了，占用的空间也更小了。

> 后来 NPM3.0 开始也实现了类似的功能。

但扁平化的方式依然无法解决一些问题：

- 幽灵依赖

  所谓幽灵依赖，是指由于扁平化了所有依赖，所以我们在不安装的情况下，可以自行引入某个包里安装的依赖。

  例如：我们现在就可以在项目中引入`cookies`这个包而无需 `yarn insall`。

  ```js
  import cookies from 'cookies';
  console.log(cookies);
  ```

  但是有一天，我们升级了 koa，而升级后的 koa 内部不再使用 cookies 这个包，那我们的项目就会出错。

  因为我们一开始就没下载过 cookies，所以 package.json 中没有这个包的信息，而我们的代码却引用了这个包。

  这就是幽灵依赖。

- 一个依赖包有多种版本，依然会有嵌套

为了解决上面的问题，pnpm 给出了方案。

## pnpm

pnpm 的思路是这样的：

在一个全局的仓库中保存 npm 包的内容，再在项目中创建.pnpm 目录，将所有包都通过 link 的方式链接过去。

我们删掉 node_module 用`pnpm install`重新安装一下，可以获得以下信息：

![image-20230429211210386](../../assets/image-20230429211210386.png)

英文的意思是说 package 已经从 content-addressable store 链接到了 virtual store 了。

这个 virtual store 在本地的`node_modules/.pnpm`中。

我们点开它，可以看到在这里所有依赖都是铺平的，每个包的后缀都有版本号。

![image-20230429212258611](../../assets/image-20230429212258611.png)

同时，由于只安装了 koa，所以 node_modules 中只有 koa 这个包了，这个包会连接到.pnpm 中对应版本的依赖包。

![image-20230429211628683](../../assets/image-20230429211628683.png)

包与包之间的关系也是通过连接来组织的。我们找到 koa 对应版本的包，点开看一下：

![image-20230429215526326](../../assets/image-20230429215526326.png)

可以发现 koa@2.14.2/node_module 中有 koa 所需要的所有依赖，这些依赖也是通过连接维护的。

总结一下：

pnpm 先创建了一个全局 store，每个包都会带着版本号保存，并创建一份虚拟链接到项目中。

项目使用的包会连接到`.pnpm`中对应的包上。有依赖关系的包之间也是通过链接获取依赖包的信息的。

官方给了一张原理图：

![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/326a2090786e4d16b2d6fce25e876680~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

根据上面的图，我们分析一下：

1. 幽灵依赖的问题解决了，因为在项目的 node_module 中，并没有安装那个包，所以你在代码中无法引入你没有安装过的包。
2. 每个版本的包你只需要安装一次，各种包都会通过 link 连接到全局 store 中下载的原始包，大大节省了内存。
