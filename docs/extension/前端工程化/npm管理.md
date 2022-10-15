# Npm 管理

## NVM 版本管理

### 安装

不同项目所依赖的 Node 版本并不相同，如果想要来回切换 Node 版本，一个比较好的方案是使用 NVM 工具。

按照 NVM 需要清理原来的 Node 环境。

`mac` 电脑执行以下命令即可卸载原来的 Node：

```bash
rm -rf /Users/$USER/.npm
rm -rf /usr/local/{bin/{node,npm},lib/node_modules/npm,lib/node,share/man/*/node.*}
rm -rf /usr/local/bin/node
rm -rf /usr/local/include/node
rm -rf /usr/local/lib/node_modules
rm -rf /usr/local/share/doc/node
rm /Users/$USER/.npmrc
rm /usr/local/lib/dtrace/node.d
rm /usr/local/share/man/man1/node.1
rm /usr/local/share/systemtap/tapset/node.stp
rm /var/db/receipts/org.nodejs.*
rm /var/root/.npm
rm /var/root/.npmrc
```

**安装**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

**使用**

```bash
nvm install node # "node" is an alias for the latest version
nvm install 14.7.0 # or 16.3.0, 12.22.1, etc
nvm ls # list local node
nvm use node # 切换到最新版本
nvm use 4.22 # toggle node 4.22
```

## NRM 镜像管理

发布开源项目时，我们需要使用`npm` 官方镜像，但是官方镜像速度很慢，在开发的时候非常耽误功夫。

所以一般会在开发时用国内镜像而发布时则使用官方镜像。

这时候可以通过`nrm`来进行镜像管理。

**安装**

```bash
npm install -g nrm
```

**查看镜像**

```bash
nrm ls
```

```bash
  npm ---------- https://registry.npmjs.org/
  yarn --------- https://registry.yarnpkg.com/
  tencent ------ https://mirrors.cloud.tencent.com/npm/
  cnpm --------- https://r.cnpmjs.org/
  taobao ------- https://registry.npmmirror.com/
  npmMirror ---- https://skimdb.npmjs.com/registry/
```

**常用命令**

```bash
nrm add <name> <url> # 新增镜像
nrm del <name> # 删除
nrm test <name>	# 测试镜像
nrm use <name> # 使用哪个镜像
nrm current # 查看当前镜像
```

**测试速度**

<img src="../../assets/image-20220525221403736.png" alt="image-20220525221403736" style="zoom:50%;" />

### 问题

有些 npm 依赖了 `C++`模块，在安装过程中会隐式安装`node-gyp`，`node-gyp`可编译这些依赖`C++模块`的模块。

`node-gyp`在首次编译时会依赖`Node源码`，所以又悄悄去下载`Node`。虽然上述已切换到`淘宝镜像`，但并没有效果。又因为国内网络环境原因，再次遇上`安装过慢`或`安装失败`的情况。

还好`npm config`提供一个参数`disturl`，它可设置`Node镜像地址`，当然还是将其指向国内的淘宝镜像。这样又能愉快地安装这些依赖`C++模块`的模块了。

```bash
npm config set disturl https://npm.taobao.org/mirrors/node/
```

这样的问题非常多，下面是常见的解决方案：

```bash
npm config set electron_mirror https://npm.taobao.org/mirrors/electron/
npm config set phantomjs_cdnurl https://npm.taobao.org/mirrors/phantomjs/
npm config set puppeteer_download_host https://npm.taobao.org/mirrors/
npm config set python_mirror https://npm.taobao.org/mirrors/python/
npm config set sass_binary_site https://npm.taobao.org/mirrors/node-sass/
npm config set sentrycli_cdnurl https://npm.taobao.org/mirrors/sentry-cli/
npm config set sharp_binary_host https://npm.taobao.org/mirrors/sharp/
npm config set sharp_dist_base_url https://npm.taobao.org/mirrors/sharp-libvips/
npm config set sharp_libvips_binary_host https://npm.taobao.org/mirrors/sharp-libvips/
npm config set sqlite3_binary_site https://npm.taobao.org/mirrors/sqlite3/
```

遇到安装失败的情况需要清除缓存，再重新 `build`

```bash
# 安装失败
npm cache clean -f
npm rebuild <package name> # 例如 node-sass
# 或 npm run reinstall
```
