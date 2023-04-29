---
order: 3
---

# HTTP

## Context

## 基本介绍

HTTP context 是 request 特有的对象，用来存放诸如 request body、cookies、headers 等给定的 HTTP request 信息。

HTTP context 被当做引用传递给 route 处理函数、middleware、HTTP hooks 以及 exception 函数。

```js
Route.get('/', ({ request, auth, response }) => {
  /**
   * Request URL
   */
  console.log(request.url());

  /**
   * Request body + query params
   */
  console.log(request.all());

  /**
   * Send response
   */
  response.send('hello world');
  response.send({ hello: 'world' });

  /**
   * Available when auth is configured
   */
  console.log(auth.user);
});
```

当在 controller 方法访问 context 时需要确保 HTTP 的 context 类型是明确的。

```js
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

class HomeController {
  public async index({ request, response }: HttpContextContract) {

  }
}
```

> 在 AdonisJS 中，你不会看到像 req 和 res 这样的对象，这是因为所有东西包括 request 和 response 都是 HTTP context 的一部分。
>
> 我们鼓励你将自定义的属性放到 ctx 对象中，而不是 request 对象中。
>
> 从这里查看[扩展 context](https://docs.adonisjs.com/guides/context#extending-context)

AdonisJS 用 Node.js 的 `Async Local Storage`让任何地方都可以访问到 HTTP context 。

你可以用以下代码访问到当前请求的 context

```js
import HttpContext from '@ioc:Adonis/Core/HttpContext'

class SomeService {
  public async someOperation() {
    const ctx = HttpContext.get()
  }
}
```

## Controllers

Controller（控制器）是用来处理 HTTP 请求的。它们使您能够通过将所有内联路由处理程序移动到它们的专用控制器文件来保持路由文件的整洁。

在 AdonisJS 中，所有的控制器都放在`app/Controllers/Http`目录中。

**注册路由**

```bash
node ace make:controller Post

# CREATE: app/Controllers/Http/PostsController.ts
```

如果您注意到的话，在上面的命令中，我们提到单词 Post 是单数，而生成的文件名是复数形式，并有一个 Controller 后缀。

AdonisJS 应用这些转换来确保文件名在整个项目中保持一致。但是，您可以使用`--exact`标志指示 CLI 不要应用这些转换。

**使用路由**

```js
Route.get('posts', 'PostsController.index');
```

**实现 Controller**

```js
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
  public async index(ctx: HttpContextContract) {
    return [
      {
        id: 1,
        title: 'Hello world',
      },
      {
        id: 2,
        title: 'Hello universe',
      },
    ]
  }
}
```

常见的 CRUD 路由

```js
Route.get('/posts', () => {
  return 'List all posts';
});

Route.get('/posts/create', () => {
  return 'Display a form to create a post';
});

Route.post('/posts', async () => {
  return 'Handle post creation form request';
});

Route.get('/posts/:id', () => {
  return 'Return a single post';
});

Route.get('/posts/:id/edit', () => {
  return 'Display a form to edit a post';
});

Route.put('/posts/:id', () => {
  return 'Handle post update form submission';
});

Route.delete('/posts/:id', () => {
  return 'Delete post';
});
```

## Middleware

中间件是在 HTTP 请求到达路由处理程序之前执行的一系列功能。链中的每个函数都有能力结束请求或将其转发给下一个函数。

```js
Route.get('/users/:id', async () => {
  return 'Show user';
}).middleware(async (ctx, next) => {
  console.log(`Inside middleware ${ctx.request.url()}`);
  await next();
});
```

将中间件编写为内联函数可以进行一些快速测试。但是，我们建议将中间件逻辑提取到它自己的文件中。

您可以通过运行以下 Ace 命令来创建一个新的中间件。

```bash
node ace make:middleware LogRequest

# CREATE: app/Middleware/LogRequest.ts
```

中间件类存储（但不限于）在 app/Middleware 目录中，每个文件代表一个中间件。

每个中间件类都必须实现 handle 方法来处理 HTTP 请求，并调用下一个方法将请求转发到下一个中间件或路由处理程序。

```js
// app/Middleware/LogRequest.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogRequest {
  public async handle(
    { request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    console.log(`-> ${request.method()}: ${request.url()}`)
    await next()
  }
}
```

此外，您可以通过引发异常或使用 response.send 方法发送响应来终止来自中间件的请求。

```js
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Auth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if (notAuthenticated) {
      response.unauthorized({ error: 'Must be logged in' })
      return
    }

    await next()
  }
}
```

要使中间件生效，必须在 start/kernel.ts 文件中将其注册为全局中间件或命名中间件。

对所有 HTTP 请求执行全局中间件的顺序与它们注册的顺序相同。

您可以在 start/kernel.ts 文件中将它们注册为一个数组，如下所示：

```js
// start/kernel.ts
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('App/Middleware/LogRequest'),
]);
```

命名中间件允许您在路由/路由组上选择性地应用中间件。您首先用一个唯一的名称注册它们，然后在路线上用该名称引用它。

```js
Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth'),
});
```

现在，您可以将 auth 中间件附加到一个路由，如下面的示例所示。

```js
Route.get('dashboard', 'DashboardController.index').middleware('auth'); // 👈
```

您还可以在一条路由上定义多个中间件，方法是将它们作为数组传递或多次调用中间件方法。

```js
Route.get('dashboard', 'DashboardController.index').middleware([
  'auth',
  'acl',
  'throttle',
]);
```

```js
Route.get('dashboard', 'DashboardController.index')
  .middleware('auth')
  .middleware('acl')
  .middleware('throttle');
```

命名中间件还可以通过 handle 方法接受运行时配置作为第三个参数。例如：

```js
export default class Auth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>,
    guards?: string[]
  ) {
    await next()
  }
}
```

在上面的例子中，Auth 中间件接受一个可选的`guards`数组。中间件的用户可以按如下方式传递：

```js
Route.get('dashboard', 'DashboardController.index').middleware('auth:web,api');
```
