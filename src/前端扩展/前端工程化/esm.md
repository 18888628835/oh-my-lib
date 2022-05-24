# Node 环境使用 ESM

## 概念

**名词解释：**

- 模块化：将代码拆分成多个文件(即模块)。

  模块化的好处是：

  1. 解决变量名冲突问题
  2. 将代码拆分，能够整理成可复用、易维护、可读性强的代码块
  3. 自动处理依赖关系，不会造成混乱
  4. 抽离公共代码
  5. 隔离作用域，不会污染全局变量

  模块的核心是：

  1. 拆分：将代码拆分成多个可复用的模块
  2. 加载：通过指定方式加载模块并执行
  3. 注入：将一个模块的输出注入到另一个模块中
  4. 管理：管理各个模块间的依赖关系

- ESM：ES6 模块化方案 —— 常用 `import`、`export`等引入、导出模块

- CJS：CommonJS 模块化方案 —— Node 服务端环境采用方案，常用 `required` 来引入模块

**CJS 和 ESM 的主要区别**

| -            | **CJS**                                             | **ESM**                                         |
| ------------ | --------------------------------------------------- | ----------------------------------------------- |
| **语法类型** | 动态                                                | 静态                                            |
| **关键声明** | `require`                                           | `export`与`import`                              |
| **加载方式** | 运行时加载                                          | 编译时加载                                      |
| **加载行为** | 同步加载                                            | 异步加载                                        |
| **书写位置** | 任何位置                                            | 顶层位置                                        |
| **指针指向** | `this`指向`当前模块`                                | `this`指向`undefined`                           |
| **执行顺序** | 首次引入时`加载模块` 再次引入时`读取缓存`           | 引入时生成`只读引用` 执行时才是正式取值         |
| **属性引用** | 基本类型属于`复制不共享` 引用类型属于`浅拷贝且共享` | 所有类型属于`动态只读引用`                      |
| **属性修改** | 工作空间可修改引入的值                              | 工作空间不可修改引入的值 但可通过引用的方法修改 |

- 运行时加载指整体加载模块生成一个对象，再从对象身上获取所需的属性和方法。最大特点是全局加载，只有运行时才能得到该对象
- 编译时加载指直接从模块中获取所需的属性和方法。最大特性是**按需加载**。在编译时就完成模块加载，效率比其他方案高，无法引用模块本身(`本身不是对象`)，但可拓展 JS 高级语法(`类型校验`)。

## 高版本 Node 解决方案

web 端已大量采用 `ESM` 编码，但由于历史原因， Node 服务端官方是采用 `CJS` 编码的，使用`ESM`编码时需要做一些细微的处理。

对于`Node v13.2.0`版本及以上的 Node 环境，只需要做以下操作之一即可实现 ESM

- 使用`type`指定模块方案：
  - 在`package.json`中指定`type`为`commonjs`，则使用`CJS`
  - 在`package.json`中指定`type`为`module`，则使用`ESM`
- 使用`--input-type`指定入口文件的模块方案，与`type`一样：
  - 命令中添加参数`--input-type=commonjs`，则使用`CJS`
  - 命令中添加参数`--input-type=module`，则使用`ESM`
- 支持新扩展名：
  - 文件后缀名使用`.cjs`，则使用`CJS`
  - 文件后缀名使用`.mjs`，则使用`ESM`

除此之外还有一些新特性：

- 使用`--es-module-specifier-resolution`指定文件名称引入方式：
  - 命令中添加参数`--es-module-specifier-resolution=explicit`，则引入模块时必须使用文件扩展名(`默认`)
  - 命令中添加参数`--es-module-specifier-resolution=node`，则引入模块时无需使用文件扩展名
- 在`package.json`中指定`main`后会根据`type`指定模块方案加载文件

### 示例

```bash
$ mkdir node-demo
$ cd node-demo
$ code .
$ npm init
```

一直按回车后生成 `package.json`

```json
{
  "name": "demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "qiuyanxi",
  "license": "ISC"
}
```

然后新建 `main.js`文件和 `utils.js`文件

**utils.js**

```js
export const user = { name: 'qiuyanxi' };
```

**main.js**

```js
import { user } from './utils';

console.log(user);
```

执行命令：

```js
$ node main.js
```

会出来以下报错：

```js
(node:7248) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
/Users/qiuyanxi/Desktop/node-demo/main.js:1
import { user } from './utils';
^^^^^^
```

根据提示，在 `package.json`写入 `"type": "module"` 字段，或者将 `main.js`后缀改成 `.mjs`。

此时重新执行命令，会报错：

```js
node:internal/process/esm_loader:94
    internalBinding('errors').triggerUncaughtException(
                              ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/qiuyanxi/Desktop/node-demo/utils' imported from /Users/qiuyanxi/Desktop/node-demo/main.js
Did you mean to import ../utils.js?
```

这是因为我们引入时没有写`.js`后缀名。

修改命令：

```js
$ node --es-module-specifier-resolution=node main.js
```

此时就没有问题了。

这段命令可以写到`package.json`的`scripts`属性中：

```diff
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
+   "start": "node  --es-module-specifier-resolution=node main.js"
  },
```

此时执行以下命令，也会有一样的效果。

```js
$ npm start
```

为了让`Node`支持`ESM`，我们还需为其指定`Node/Npm`版本限制。这是为了避免预设和实际情况不同而报错，比如说预设该项目在高版本中运行，实际却在低版本中运行。

`Node`与`Npm`是成双成对地安装，可通过[Node Releases](https://link.juejin.cn/?target=https%3A%2F%2Fnodejs.org%2Fzh-cn%2Fdownload%2Freleases)查询到`Node v13.2.0`对应`Npm v6.13.1`。

```json
{
  "type": "module",
  "engines": {
    "node": ">=13.2.0",
    "npm": ">=6.13.1"
  }
}
```

## 低版本 Node 解决方案

低版本`Node`不支持 `ESM`。

而且`Npm` 包很多都是用 `CJS` 编码,同时使用`require`和`export/import`会报错，所以有些模块可能没办法使用 `ESM`。

对于这个问题，我们需要用`babel`将代码从`ESM`转化成`CJS`。

步骤：

1. 安装 `babel` 相关模块

   ```bash
   npm install @babel/cli @babel/core @babel/node @babel/preset-env -dev
   ```

   - **@babel/cli** - 提供`@babel/core`的命令行环境
   - **@babel/core** - 提供转译函数
   - **@babel/node** - 提供支持`ESM`的命令行运行环境
   - **@babel/preset-env** - 语法转换的预设环境

2. 修改 `package.json`

   ```json
     "scripts": {
       "start": "babel-node src/index"
     },
     "babel": {
       "presets": [
         "@babel/preset-env"
       ]
     }
   ```

3. 运行 `npm start`

这个方案下，我们不需要设置`package.json`的`type`与`engines`字段了。

一句话总结这个方案就是开发用 `ESM`,编译后的代码依然是 `CMJ`。

## 添加 nodemon

`nodemon` 是自动检测项目文件发生变化就会重启的 `Npm` 模块。每次修改代码后，都会自动帮我们执行`npm start`。

以下以低版本 `Node` 解决方案为例：

安装：

```bash
npm install nodemon -dev
```

修改`package.json`：

```json
"scripts": {
    "start": "nodemon -x babel-node src/index"
  },
"nodemonConfig": {
		"env": {
			"NODE_ENV": "dev"
		},
		"execMap": {
			"js": "node --harmony"
		},
		"ext": "js json",
		"ignore": [
			"dist/"
		],
		"watch": [
			"src/"
		]
	}
```

## Node 环境下使用 TypeScript

[Node 环境下使用 TypeScript](https://github.com/18888628835/Blog/blob/main/Node.js/Node.js基础.md#七使用-typescript-运行-node)

按照上面的步骤就可以在 `Node` 环境下运行 `TypeScript`并直接使用`ESM` 编码，相当于低版本 `Node` +`nodemon`的解决方案。

`TypeScript` 会直接根据`tsconfig.json`中的`module`来对代码进行编码并转译成对应的`JS`代码。

例如，默认的`module`为`commonjs`，那么会生成`commonjs`的代码。

**示例代码：**

src/index.ts

```typescript
import user from '../utils';
console.log(user);
```

utils.ts

```typescript
const user = { name: 'qiuyanxi' };
export default user;
```

转译成：

src/index.js

```js
'use strict';
exports.__esModule = true;
var utils_1 = require('../utils');
console.log(utils_1['default']);
```

Utils.js

```js
'use strict';
exports.__esModule = true;
var user = { name: 'qiuyanxi' };
exports['default'] = user;
```

## Node 使用 ESM 产生的差异

Node 环境使用 ESM 后会有以下差异：

- 不能使用`__dirname`、`__filename`
- 不能使用`require`、`module`和`exports`
- 不能引入 `json` 文件

解决方法：

- `__dirname`、`__filename`使用`import.meta.url`重建

  ```js
  import { dirname } from 'path';
  import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  ```

  如果是找项目的根目录，则可以使用 `process`来完成

  ```js
  process.cwd();
  ```

- `require`、`module`和`exports`使用`import`、`export`语法代替

- `json` 文件通过 `fs`模块来引入

  ```js
  import { readFileSync } from 'fs';

  const json = readFileSync('./info.json');
  const info = JSON.parse(json);
  ```
