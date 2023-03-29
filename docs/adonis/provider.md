---
order: 6
---

# Service Provider

adonisJS 要实现 Controller 和 Service 的分离，这里用到 Service Provider。

1. 将 Provider 注入到 adonis 中

   ```bash
   touch providers/ServiceProvider.ts
   ```

   在配置文件`.adonisrc.json`中注入这个 Provider。

   ```js
     "providers": [
       "./providers/ServiceProvider",
       ...
     ]
   ```

2. 创建一个接口并用一个 class implement 它，这个 class 里写 service 代码

   ```bash
   touch Service/Login.ts
   ```

   ```js
   export interface Login_Interface {
     signup: () => Promise<any>;
   }

   export default class Login implements Login_Interface {
     public database;
     constructor(database: typeof Database) {
       this.database = database;
     }
     public async signup() {
     	...
     }
   }
   ```

   注意：由于注入的 Service 的实例方法中不能直接使用`import Database from @ioc:Adonis/Lucid/Database`,所以这里在 constructor 时传递 database 过去。

3. 在 ServiceProvider 中注册 Service

   ```js
   import { ApplicationContract } from "@ioc:Adonis/Core/Application";
   import Login from "../Service/Login";

   export default class ServiceProvider {
     constructor(protected app: ApplicationContract) {}
     public register() {
       this.app.container.singleton("Loc/Signup", () => {
         const database = this.app.container.use("Adonis/Lucid/Database");
         return new Login(database);
       });
     }
     public async boot() {
       // IoC container is ready
     }

     public async ready() {
       // App is ready
     }

     public async shutdown() {
       // Cleanup, since app is going down
     }
   }
   ```

   这个 Provider 的注册周期内，用单例模式注册一个 Login 实例。

   由于 Provider 中也不能直接引入`Database`，所以这里使用`this.app.container.use("Adonis/Lucid/Database")`将 database 对象传递过去，这里就接上了第一步中的`constructor`。

4. 暴露出这个实例的方法

   ```bash
   touch contracts/login.ts
   ```

   ```js
   declare module "@ioc:Loc/Signup" {
     import { Login_Interface } from "Service/Login";
     const login: Login_Interface;
     export default login;
   }
   ```

   这样在 Typescript 下，就会有语法提示。

5. Controller 中调用 Service 的代码

   ```js
   import loginInstance from "@ioc:Loc/Signup";

   export default class LoginController {
     public async signup() {
       return loginInstance.signup();
     }
     ...
   }
   ```

6. 补充 service 方法，这里的示例是调用数据库查询

   ```js
     public async signup() {
       const { default: Users } = await import("App/Models/User");
       const dbRes = await this.database.from("users").where("user", "邱彦兮");
       const ormRes = await Users.query().select("*").where("user", "邱彦兮");
       console.log("🚀🚀🚀🚀🚀 - res:", [...dbRes, ...ormRes]);
       return [...dbRes, ...ormRes];
     }
   ```

   在 service 中，不管是用 database 还是 orm 都不能直接`import xxx from xxx`。

   这里的细节在于：

   1. 取`constructor`后的 database 对象来查询数据库
   2. 使用`await import("App/Models/User")`获取 orm 版本的数据库查询对象来查询数据库

现在你已经实现了 Controller 和 Service 的分离。
