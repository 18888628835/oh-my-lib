# Commit 规范

**Angular 团队**制定的`提交规范`是目前市场上公认的最合理、最系统、最流行的。

它的规范包含三个内容：Header、Body、Footer。

Header 为必填项，Body 与 Footer 则是可缺省项。这些内容组成一个完整的提交格式：

```bash
<type>(<scope>): <subject>
# 空一行
<body>
# 空一行
<footer>
```

## Header

该部分仅书写一行，包括三个字段，分别是`type`、`scope`和`subject`。

- **type**：用于说明`commit`的提交类型，必选
- **scope**：用于说明`commit`的影响范围，可选
- **subject**：用于说明`commit`的细节描述，必须

`type`用于说明`commit`的提交类型，包括以下选项:

| 类型         | 功能 | 描述                               |
| ------------ | ---- | ---------------------------------- |
| **feat**     | 功能 | 新增功能，迭代项目需求             |
| **fix**      | 修复 | 修复缺陷，修复上一版本存在问题     |
| **docs**     | 文档 | 更新文档，仅修改文档不修改代码     |
| **style**    | 样式 | 变动格式，不影响代码逻辑           |
| **refactor** | 重构 | 重构代码，非新增功能也非修改缺陷   |
| **perf**     | 性能 | 优化性能，提高代码执行性能         |
| **test**     | 测试 | 新增测试，追加测试用例验证代码     |
| **build**    | 构建 | 更新构建，修改构建工具或外部依赖   |
| **ci**       | 脚本 | 更新脚本，修改 CI 或执行脚本配置   |
| **chore**    | 事务 | 变动事务，修改其他不影响代码的事务 |
| **revert**   | 回滚 | 回滚版本，撤销某次代码提交         |
| **merge**    | 合并 | 合并分支，合并分支代码到其他分支   |
| **sync**     | 同步 | 同步分支，同步分支代码到其他分支   |
| **impr**     | 改进 | 改进功能，升级当前功能模块         |

`scope`用于说明`commit`的影响范围。简要说明本次修改的影响范围，例如根据功能可划分为`数据层`、`视图层`和`控制层`，根据交互可划分为`组件`、`布局`、`流程`、`视图`和`页面`。

`subject`用于说明`commit`的细节描述。文字一定要精简精炼，无需备注太多，因为`Body`部分可备注更多细节，同时尽量遵循以下规则。

- 以动词开头
- 使用第一人称现在时
- 首个字母不能大写
- 结尾不能存在句号(`.`)

一个完整的`commit header`示例是这样的：

```js
feat(View): new the button for theme skin switching
```

## Body

该部分可以书写多行，对`subject`做更详细的叙述，内容应该包括`修改动机`和`修改前后的对比`。

## Footer

该部分只适用两种情况，分别是`不兼容变动`与`问题关闭`。

- **不兼容变动**：当前代码与上一版本不兼容，则该部分以`BREAKING CHANGE`开头，关联`变动描述`、`变动理由`和`迁移方法`。
- **问题关闭**：当前代码已修复某些`Issue`，则该部分以`Closes`开头，关联目标`Issue`。

## 使用 commitizen

虽然知道大概的 `commit` 规范，但需要手动去写是一件麻烦的事，我们需要采用`commitizen`这样的工具来帮助生成符合规范的`commit message`。

**安装：**

```bash
npx commitizen init cz-conventional-changelog --save-dev --save-exact
```

- 局部安装`commitizen`与`cz-conventional-changelog`

- 在`package.json`中指定`scripts`与`config`(`config`属性会自动帮我们写好)

  ```json
  {
    "script": {
      "commit": "cz"
    },
    "config": {
      "commitizen": {
        "path": "node_modules/cz-conventional-changelog"
      }
    }
  }
  ```

  写好之后使用`npm run commit`代替`git commit`，然后按照提示步骤写对应的 `commit message`就可以了。

  ```bash
  ? Select the type of change that you're committing: (Use arrow keys)
  ❯ feat:     A new feature
    fix:      A bug fix
    docs:     Documentation only changes
    style:    Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    refactor: A code change that neither fixes a bug nor adds a feature
    perf:     A code change that improves performance
    test:     Adding missing tests or correcting existing tests
  ```

## 使用 cz-customizable

如果我们想要自己定义模板，这需要用到[cz-customizable](https://github.com/leoforfree/cz-customizable)

官方文档里推荐在局部安装：

```bash
npm install cz-customizable --save-dev
```

修改`scripts`属性：

```json
"scripts" : {
  ...
  "commit": "./node_modules/cz-customizable/standalone.js"
}
```

此时需要一份模板文件，一般在项目根目录下新建`.cz-cinfig.js`,然后往里面写配置项。

官方模板：[EXAMPLE](https://github.com/leonardoanalista/cz-customizable/blob/master/cz-config-EXAMPLE.js),

中文模板：[cz-config.js](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FJowayYoung%2Ffe-engineering%2Fblob%2Fmain%2Fcommit-lint%2Fcustom-config%2Fcz-config.js)

写好之后，执行`npm run commit`就可以了。

如果我们使用的是`ESM`模式，那可能会有问题，因为`cz-customizable`是用 `CJS`的方式读配置的。

解决方法是修改文件名`.cz-config.cjs`，这样会用`CJS`的方式来读。

但这样`cz-customizable`就找不到配置文件了。

解决方法是修改`config`属性来指定配置文件：

```json
  "config": {
    "cz-customizable": {
      "config": "./.cz-config.cjs"
    }
  }
```

完成后，执行`npm run commit`，此时已经按照我们的模板修改成功啦：

```bash
? Select the type of change that you're committing: (Use arrow keys)
❯ 功能：新增功能，迭代项目需求 (feat)
  修复：修复缺陷，修复上一版本存在问题 (fix)
  文档：更新文档，仅改动文档不改动代码 (docs)
  样式：变动格式，不影响代码逻辑 (style)
  重构：重构代码，非新增功能也非修改缺陷 (refactor)
  性能：优化性能，提高代码执行性能 (perf)
  测试：新增测试，追加测试用例验证代码 (test)
```

## 使用 release-please

`Change Log` 是发布新版本时，用来说明与上一个版本差异的文档。

如果希望能够根据 `commit` 信息自动生成`Change Log`，这里推荐使用`release-please`。

> 原先比较好的方案`standard-version`已经作废

官方文档：[release-please-action](https://github.com/google-github-actions/release-please-action)

这是 `github` 出的工具，配合 `github Actions`使用。

当我们将代码推送到 `github` 上时，`Actions`可以根据我们的 `commit` 信息自动生成`Change Log`文件，并且给我们推一个 `PR`,如果对生成的文件没有异议，就可以合并这个 `PR`。

使用方法：

- 在项目根目录创建`.github/workflows`目录

- 在目录下创建`release-please.yml`文件

- 写入内容：

  ```yaml
  on:
    push:
      branches:
        - main
  name: release-please
  jobs:
    release-please:
      runs-on: ubuntu-latest
      steps:
        - uses: google-github-actions/release-please-action@v3
          with:
            release-type: node
            package-name: release-please-action
  ```

- 将代码推送到 `github` 上

- 经过 `github-actions` 的一顿操作后，就能够在 `PR` 上看到为我们生成的 `ChangeLog`文件，点击合并即可

同时，`release-please`还能够帮我们修改`npm version`等其他功能。
