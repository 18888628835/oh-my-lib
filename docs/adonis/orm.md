---
order: 5
---

# ORM

## 创建第一个 model

假设您已经[set up](https://docs.adonisjs.com/guides/database/introduction)了 Lucid，那么运行以下命令来创建您的第一个数据模型。

```js
node ace make:model User -m
```

上面的命令会自动创建两个文件

```js
CREATE: app/Models/User.ts
CREATE: database/migrations/1678525151584_users.ts
```

Models 目录下是定义给 ORM 用的 model 对象,需要自己补充字段和类型，这样会有自动提示。

```js
import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public user: string;

  @column()
  public password: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
```

`database/migrations`目录下用于 migration，在这里定义的字段会在创建表时 migration 到数据库中。

```js
import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("password");
      table.string("user");
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
```

执行命令以创建一张表

```js
node ace migration:run
```
