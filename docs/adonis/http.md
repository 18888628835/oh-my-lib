---
order: 3
---

# HTTP

## Context

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

## Controllers

注册路由

```js
// start/routes.ts
Route.get('/signup', 'LoginController.signup');
```

实现 Controller

```js
import loginInstance from "@ioc:Loc/Signup";

export default class LoginController {
  public async signup() {
    ...
  }
}
```
