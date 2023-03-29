---
order: 1
---

# AdonisJS at a glance

本章节旨在给出框架的鸟瞰视角，让你对创建 `AdonisJS` 应用有一个初步的了解。

当你准备好去写项目时，可以直接[进入技术指南](https://docs.adonisjs.com/guides/introduction)。

`AdonisJS`是一个后端框架。它能帮助你创建以数据驱动的动态 Web 应用。

使用`AdonisJS`，你可以处理 HTTP 请求、查询数据库、用户验证、上传文件、发送 Email 等内容。

如果你曾经使用过其他后端框架比如`Rails`、`Laravel`或`Django`,你就可以把 `AdonisJS` 看成是同一类的框架。

## 用 routes 创建路由

你能使用 routes （即路由）模块定义 URL。

你可以把 routes 看成是 URL 和 JavaScript 函数间的映射，当用户访问该 URL 时，就能执行路由上的 JavaScript。

```js
import Route from '@ioc:Adonis/Core/Route';

Route.get('/', () => {
  return 'Hello! This is the homepage of my new app';
});
```

上面的代码定义了一个静态的路由。然而，数据驱动的应用往往需要一种能注册动态路由的能力。举个例子：利用 URL 上的 id 来查询数据库。

```js
import Route from '@ioc:Adonis/Core/Route';
import Database from '@ioc:Adonis/Lucid/Database';

Route.get('posts/:id', ({ params }) => {
  return Database.from('posts')
    .select('*')
    .where('id', params.id)
    .first();
});
```

## 用 Controller 处理请求

在 AdonisJS 中，Controller（控制器）是一种处理网络请求的事实标准方法，它们帮助您从路由文件中提取所有内联函数调用到专用的控制器文件中，并保持您的路由文件整洁。

第一步：创建控制器

```bash
node ace make:controller Posts
```

第二步：实现所需要的请求处理方法

```js
  import Database from '@ioc:Adonis/Lucid/Database'

  export default class PostsController {
    public async show({ params }) {
      return Database
        .from('posts')
        .select('*')
        .where('id', params.id)
        .first()
    }
  }
```

第三步：在路由上注册

```js
Route.get('posts/:id', 'PostsController.show');
```

## 用 ORM 查询数据库

你能使用官方的 ORM 库- Lucid 来与 SQL 数据库进行交互。Lucid 具有丰富的 API，可执行模式迁移、使用 JavaScript API 构建 SQL 查询以及为数据库添加虚拟数据。

更重要的是，Lucid 在活动记录模式的基础上构建了数据模型。您可以按如下方式创建和使用模型：

1. 创建一个新的模型

   ```bash
   node ace make:model Post
   ```

2. 配置列信息

   ```js
     import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

     export default class Post extends BaseModel {
       @column({ isPrimary: true })
       public id: number

       @column()
       public title: string

       @column()
       public description: string
     }
   ```

3. 在控制器中引入并使用它们

   ```js
     import Post from 'App/Models/Post'

     export default class PostsController {
       public async show({ params }) {
         const post = await Post.find(1)
         return post
       }
     }
   ```

## 用 templates 渲染 HTML

AdonisJS 附带一个自主开发的模版引擎——`Edge`.`Edge`支持布局、部分渲染、条件语句、循环等。但最耀眼的是 edge 的组件系统。

1. 创建 View 模板

   ```bash
     node ace make:view posts/index
   ```

2. 书写标记

   ```html
   <div class="article">
     <h1>{{ post.title }}</h1>
     <p>{{ post.description }}</p>
   </div>
   ```

3. 在控制器中渲染模板

   ```js
     import Post from 'App/Models/Post'

     export default class PostsController {
       public async show({ params, view }) {
         const post = await Post.find(1)
         return view.render('posts/index', { post })
       }
     }
   ```

## 用 auth package 鉴权

AdonisJS 支持各种身份鉴权系统，满足传统的 Web App 和 API Servers 的需要。在鉴权守卫（guard）的帮助下，您可以使用基于 session（会话）的登录或创建用于无状态身份验证的 API 令牌。

1. 按照和设置 auth package

   ```bash
     npm i @adonisjs/auth

     node ace configure @adonisjs/auth
   ```

2. 使用 session 登录

   ```js
     export default class AuthController {
       public async login({ request, auth, response }) {
         const email = request.input('email')
         const password = request.input('password')

         await auth
           .use('web') // 👈 using sessions guard
           .attempt(email, password)

         response.redirect().toRoute('dashboard')
       }
     }
   ```

3. 或者生成 API 令牌（Token）替代 session

   ```js
     export default class AuthController {
       public async login({ request, auth }) {
         const email = request.input('email')
         const password = request.input('password')

         const token = await auth
           .use('api') // 👈 using API guard
           .attempt(email, password)

         return token
       }
     }
   ```

## 用 validator 校验

将 validators 作为第一道防线以保护应用不受无效数据或者缺失数据的影响。

未能满足验证规则的请求将被重定向回表单，并显示正确的错误消息。反之，您可以使用正确的数据类型访问已验证的值。

1. 创建 validator

   ```bash
     node ace make:validator CreatePost
   ```

2. 定义 validation schema

   ```js
     import { schema, rules } from '@ioc:Adonis/Core/Validator'
     import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

     export default class CreatePostValidator {
       constructor (protected ctx: HttpContextContract) {
       }

       public schema = schema.create({
         title: schema.string(),
         description: schema.string({}, [
           rules.escape()
         ]),
       })
     }
   ```

3. 验证请求

   ```js
     import CreatePost from 'App/Validators/CreatePostValidator'

     export default class PostsController {
       public async store({ request }) {
         const post = await request.validate(CreatePost)
         console.log(post.title)
         console.log(post.description)
       }
     }
   ```

## 用 webpack encore 编译资源

在某个时间点，你可能需要使用 CSS 框架并希望添加一些 JavaScript 使你的 Web 应用程序具有交互性。

根据今天的标准，CSS 和前端 JavaScript 在传输到浏览器之前需要进行转译和压缩。这个打包过程并不简单，因此你必须使用打包工具。

AdonisJS 使用合理的默认设置预配置了 Webpack（一个行业标准的打包工具），这样你就不必浪费时间调整它的参数。

1. 配置 webpack encore

   ```bash
     node ace configure encore
   ```

2. 启动开发服务器

   ```bash
     node ace serve --watch

     # Serve command starts both
     # ✅ The AdonisJS HTTP server
     # ✅ And the Webpack dev server
   ```

3. 构建生产环境

   ```bash
     node ace build --production

     # Build commands compile both
     # ✅ The AdonisJS Typescript source to JavaScript
     # ✅ And the frontend assets using Webpack
   ```
