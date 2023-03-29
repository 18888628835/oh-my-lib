---
order: 2
---

# 基本概念

## Application

application 模块负责在不同的环境中启动 app。

当我们从 `server.ts`文件中启动 HTTP 服务器或者执行`node ace server`命令，就会为`web`环境开启应用。

而执行`node ace repl`命令时会在`repl`环境开启应用。

其他的所有命令都会在`console`环境中启动应用。

应用程序的环境在决定执行哪些操作方面起着至关重要的作用。举个例子：web 环境不会注册或者启动 Ace providers。

你可以用`environment`属性访问当前的应用环境。以下是已知的应用环境：

- `web`环境是为 HTTP 服务器开启的进程
- `console`环境是指除 REPL 命令之外的 Ace 命令
- `repl`环境是用`node ace repl`命令开启的进程
- `test`环境是用`node ace test`命令开启的进程

```js
import Application from '@ioc:Adonis/Core/Application';
console.log(Application.environment);
```

## 生命周期

下面是应用的启动生命周期

![image-20230329195642715](data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1666 1760"></svg>)

一旦应用程序的状态设置成`booted`或者`ready`，你就可以访问`IoC Container bindings` 。

尝试在启动状态之前访问`IoC Container bindings` 会导致异常。

举个例子，如果你有一个`service provider`想要解析容器的绑定，你应该在`boot`或者`ready`方法内引入声明。

❌ 顶级的 import 不会工作

```js
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Route from '@ioc:Adonis/Core/Route'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    Route.get('/', async () => {})
  }
}
```

✅ 将 import 放到 boot 方法中

```js
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const { default: Route } = await import('@ioc:Adonis/Core/Route')
    Route.get('/', async () => {})
  }
}
```

## 版本

你可以使用`version`和`adonisVersion`属性访问应用和框架的版本。

`version`指向的是`package.json`里面 `version`属性。

`adonisVersion`属性是指`@adonisjs/core`包的安装版本。

```js
import Application from '@ioc:Adonis/Core/Application'

console.log(Application.version!.toString())
console.log(Application.adonisVersion!.toString())
```

两个版本属性都表示为一个具有 major、minor 和 patch 子属性的对象。

```js
console.log(Application.version!.major)
console.log(Application.version!.minor)
console.log(Application.version!.patch)
```

## Node 环境

你能够使用`nodeEnvironment`属性访问 node 环境。这个值是`NODE_ENV`环境变量的引用。

```js
import Application from '@ioc:Adonis/Core/Application';

console.log(Application.nodeEnvironment);
```

| NODE_ENV | Normalized to |
| :------- | :------------ |
| dev      | development   |
| develop  | development   |
| stage    | staging       |
| prod     | production    |
| testing  | test          |

此外，您可以使用以下属性作为了解当前环境的速记。

- inProduction

  ```js
  Application.inProduction;

  // Same as
  Application.nodeEnvironment === 'production';
  ```

- inDev

  ```js
  Application.inDev;

  // Same as
  Application.nodeEnvironment === 'development';
  ```

- inTest

  ```js
  Application.inTest;

  // Same as
  Application.nodeEnvironment === 'test';
  ```
