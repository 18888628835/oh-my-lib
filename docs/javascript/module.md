# ESM 模块

## 模块简介

所谓的模块就是将普通代码、函数库、类等分拆成多个文件，一个文件就是一个模块。

由于一开始的 JavaScript 并没有语言级的模块系统（一开始的脚本代码相对简单），在 ES6 之前，想要实现模块化是调用社区采用 JS 语法实现的各种模块方法库：

- AMD
- CommonJS
- UMD

在应用日益复杂的今天，ES6 就推出其语言级别的模块系统 Module，用来取代上述模块库。

### Module 的使用

模块之前是可以相互加载的，这里有两个指令，import（导入）和 export（导出）。

```javascript
//index.js
export default function sayHi(user) {
  return `Hello, ${user}!`;
}
```

```html
<script type="module">
  import sayHi from './index.js';
  document.body.innerHTML = sayHi('john');
</script>
```

> 由于模块支持特殊的关键字和功能，所以需要在`script`标签中采用`type='module`来告诉浏览器，以下代码需要用 module 的方式对待。

以上代码就实现了模块化，通过 import 导入入了另一个模块导出的`sayHi`方法。浏览器会自动获取并解析导入模块的代码，并运行该脚本。

### Module 核心

1. **模块默认严格模式**

在模块中，使用以严格模式`use strict`来对待代码

```javascript
<script type="module">a = 5; // error</script>
```

以上代码会报错。

2. **模块级作用域**

**每个模块文件都有自己的顶级作用域**，各个模块间的顶级作用域间的变量是隔离开来，只能用关键指令访问。

```javascript
// hello.js
alert(user); // no such variable (each module has independent variables)
```

```javascript
//user.js
let user = 'John';
```

```html
<!DOCTYPE html>
<script type="module" src="user.js"></script>
<script type="module" src="hello.js"></script>
```

上面的代码，index 和 user 模块是相互隔离的，所以在浏览器中，解析`user.js`模块并不能让其`user`对象被`index.js`模块使用。

我们只能使用关键指令来获取需要的变量

```javascript
// hello.js
import { user } from './user.js';
alert(user);
```

```javascript
//user.js
export let user = 'John';
```

```html
<!DOCTYPE html>
<script type="module" src="hello.js"></script>
```

**这个特性也在浏览器中有所体现，`<script type="module">`中也存在独立的作用域**

```javascript
<script type="module">
  // 变量仅在这个 module script 内可见
  let user = "John";
</script>

<script type="module">
  alert(user); // Error: user is not defined
</script>
```

不过对于 `window`这个全局对象，每个模块间都是可以访问的。（但最好不要将变量存在 window 里）

3. **模块代码仅在第一次导入时被解析**

如果一个模块被导入到多个脚本文件中，那只有第一次被解析时创建，但会被分享给其他文件使用。（导入对象是唯一的）

我们假设一个模块导出了一个对象：

```javascript
// 📁 admin.js
export let admin = {
  name: 'John',
};
```

如果这个模块被导入到多个文件中，模块仅在第一次被导入时被解析，并创建 `admin` 对象，然后将其传入到所有的导入。

所有的导入都只获得了一个唯一的 `admin` 对象：

```javascript
// 📁 1.js
import { admin } from './admin.js';
admin.name = 'Pete';

// 📁 2.js
import { admin } from './admin.js';
alert(admin.name); // Pete

// 1.js 和 2.js 导入的是同一个对象
// 在 1.js 中对对象做的更改，在 2.js 中也是可见的
```

**导出的变量只被执行一次，然后它被分享给将其导入的文件。这一点非常重要。**

比如，下面的示例

```javascript
// 📁 admin.js
export let admin = {};

export function sayHi() {
  alert(`Ready to serve, ${admin.name}!`);
}
```

然后在 init.js 中生成 admin.name,

```javascript
// 📁 init.js
import { admin } from './admin.js';
admin.name = 'Pete';
```

再被其他导入的模块使用，就可以看到，它已经发生变化了。（需要保证 init.js 加载的顺序在 admin.js 之后在其他文件之前）

```javascript
// 📁 other.js
import { admin, sayHi } from './admin.js';

alert(admin.name); // Pete

sayHi(); // Ready to serve, Pete!
```

4. **import.meta**

`import.meta` 对象包含关于当前模块的信息。

它的内容取决于其所在的环境。在浏览器环境中，它包含当前脚本的 URL，或者如果它是在 HTML 中的话，则包含当前页面的 URL。

```html
<script type="module">
  alert(import.meta.url); // 脚本的 URL（对于内嵌脚本来说，则是当前 HTML 页面的 URL）
</script>
```

5. **模块中,顶级 this 是 undefined**

在一个模块中，顶级 `this` 是 undefined。

将其与非模块脚本进行比较会发现，非模块脚本的顶级 `this` 是全局对象：

```html
<script>
  alert(this); // window
</script>

<script type="module">
  alert(this); // undefined
</script>
```

### 浏览器中对 Module 的处理

在浏览器中，`type="module"`除了告知浏览器需要加载和解析 import 和 export 指令外，还有以下拓展

1. **模块是延时的**

   与`defer`特性类似，模块脚本是延时的，这代表：

   - 下载外部模块脚本 `<script type="module" src="...">` 不会阻塞 HTML 的处理，它们会与其他资源并行加载。
   - 模块脚本会等到 HTML 文档完全准备就绪（即使它们很小并且比 HTML 加载速度更快），然后才会运行。
   - 保持脚本的相对顺序：在文档中排在前面的脚本先执行。

   由于模块脚本是等 html 加载后才延时运行的，所以总是能够读到 html 中的元素。

   ```html
   <script type="module">
     alert(typeof button); // object：脚本可以“看见”下面的 button
     // 因为模块是被延迟的（deferred，所以模块脚本会在整个页面加载完成后才运行
   </script>

   相较于下面这个常规脚本：

   <script>
     alert(typeof button); // button 为 undefined，脚本看不到下面的元素
     // 常规脚本会立即运行，常规脚本的运行是在在处理页面的其余部分之前进行的
   </script>

   <button id="button">Button</button>
   ```

   常规版本的`script`会先于`html`标签运行，因为其顺序在 HTML 之上。

   `module`版本的`script`标签虽然在`html`之上,但是其只会同步下载,而晚执行,所以可以获取到`dom`。

   上面代码执行的顺序是

   常规版本 `script`> `HTML`> `module` 版本 `script`

2. **在内联模块脚本中使用 async 属性**

   如果没加`type="module"`,那么 script 标签中的 async 只适用于外部脚本。它相当于一个异步脚本,独立于其他脚本或者 HTML 文档.

   这个属性适用于模块脚本中的内联脚本。

   下面的内联脚本具有 `async` 特性，因此它不会等待任何东西。

   ```html
   <!-- 所有依赖都获取完成（analytics.js）然后脚本开始运行 -->
   <!-- 不会等待 HTML 文档或者其他 <script> 标签 -->
   <script async type="module">
     import { counter } from './analytics.js';

     counter.count();
   </script>
   ```

3) **外部脚本规则**

   具有 `type="module"` 的外部脚本（external script）在两个方面有所不同：

   - 具有相同 `src` 的外部脚本仅运行一次：

   ```html
   <!-- 脚本 my.js 被加载完成（fetched）并只被运行一次 -->
   <script type="module" src="my.js"></script>
   <script type="module" src="my.js"></script>
   ```

   - 从另一个源（例如另一个网站）获取的外部脚本需要 [CORS](https://developer.mozilla.org/zh/docs/Web/HTTP/CORS) header,换句话说，如果一个模块脚本是从另一个源获取的，则远程服务器必须提供表示允许获取的 header `Access-Control-Allow-Origin`。

     ```html
     <!-- another-site.com 必须提供 Access-Control-Allow-Origin -->
     <!-- 否则，脚本将无法执行 -->
     <script type="module" src="http://another-site.com/their.js"></script>
     ```

4. **不允许裸模块**

   在浏览器中，`import` 必须给出相对或绝对的 URL 路径。没有任何路径的模块被称为“裸（bare）”模块。在 `import` 中不允许这种模块。

   例如，下面这个 `import` 是无效的：

   ```JavaScript
   import {sayHi} from 'sayHi'; // Error，“裸”模块
   // 模块必须有一个路径，例如 './sayHi.js' 或者其他任何路径
   ```

   某些环境，像 Node.js 或者打包工具（bundle tool）允许没有任何路径的裸模块，因为它们有自己的查找模块的方法和钩子（hook）来对它们进行微调。但是浏览器尚不支持裸模块。

5. **兼容性**

   旧时的浏览器不理解 `type="module"`。未知类型的脚本会被忽略。对此，我们可以使用 `nomodule` 特性来提供一个后备:

   ```html
   <script type="module">
     alert('Runs in modern browsers');
   </script>

   <script nomodule>
     alert('Modern browsers know both type=module and nomodule, so skip this');
     alert(
       'Old browsers ignore script with unknown type=module, but execute this.',
     );
   </script>
   ```

### 打包工具处理 Module

实际开发中,很少使用原始的浏览器模块来开发,而是使用打包工具来帮助我们完成。例如 webpack 等

使用打包工具的一个好处是 —— 它们可以更好地控制模块的解析方式，允许我们使用裸模块和更多的功能，例如 CSS/HTML 模块等。

打包工具做以下内容：

1. 从一个打算放在 HTML 中的 `<script type="module">` “主”模块开始。

2. 分析它的依赖：它的导入，以及它的导入的导入等。

3. 使用所有模块构建一个文件（或者多个文件，这是可调的），并用打包函数（bundler function）替代原生的 `import` 调用，以使其正常工作。还支持像 HTML/CSS 模块等“特殊”的模块类型。

4. 在处理过程中，可能会应用其他转换和优化：

   - 删除无法访问的代码。
   - 删除未使用的导出（“tree-shaking”）。
   - 删除特定于开发的像 `console` 和 `debugger` 这样的语句。
   - 可以使用 [Babel](https://babeljs.io/) 将前沿的现代的 JavaScript 语法转换为具有类似功能的旧的 JavaScript 语法。
   - 压缩生成的文件（删除空格，用短的名字替换变量等）。

   如果我们使用打包工具，那么脚本会被打包进一个单一文件（或者几个文件），在这些脚本中的 `import/export` 语句会被替换成特殊的打包函数（bundler function）。因此，最终打包好的脚本中不包含任何 `import/export`，它也不需要 `type="module"`，我们可以将其放入常规的 `<script>`：

   ```html
   <!-- 假设我们从诸如 Webpack 这类的打包工具中获得了 "bundle.js" 脚本 -->
   <script src="bundle.js"></script>
   ```

### 总结

      1. 一个模块就是一个文件,浏览器需要用`<script type="module">` 以使 `import/export` 可以工作
      2. 一个模块脚本对于常规脚本有以下区别:
      - 延迟解析
      - Async 可以用于内联脚本
      - 要从另一个源(域/协议/端口)加载外部脚本,需要支持 CORS header
      - 重复的外部脚本会被忽略(src 一致)
      3. 模块具有自己的顶级作用域,不同模块间互相分离,只能通过 `import/export` 关键指令获取
      4. 模块使用采用`use strict`模式
      5. 模块代码只执行一次,导出时仅创建一次
      6. 浏览器会自动加载并解析我们导入导出的模块
      7. 在生产环境,Webpack 这类打包工具会将模块打包在一起,它们的内部实现并不一定用 Module 形式,而是采用自身实现的 bundler 函数来取代`import/export`。同时打包工具自身也会管理变量间导入导出的关系。

## 导入导出

### 声明前导出

```javascript
// 导出数组
export let months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// 导出 const 声明的变量
export const MODULES_BECAME_STANDARD_YEAR = 2015;

// 导出类
export class User {
  constructor(name) {
    this.name = name;
  }
}
```

### 导出与声明分开

```javascript
// 📁 say.js
function sayHi(user) {
  alert(`Hello, ${user}!`);
}

function sayBye(user) {
  alert(`Bye, ${user}!`);
}

export { sayHi, sayBye }; // 导出变量列表
```

### Imoort \*

通常的导入方式是声明式的：

```js
// 📁 say.js
function sayHi(user) {
  alert(`Hello, ${user}!`);
}

function sayBye(user) {
  alert(`Bye, ${user}!`);
}

export { sayHi, sayBye }; // 导出变量列表
```

但也可以将所有内容都导入为一个对象：

```js
import * as say from './say.js';

say.sayHi('John');
say.sayBye('John');
```

开发时需要**根据实际情况**来选择，大部分情况下都会选择声明式导入的原因如下：

1. 构建工具（webpack）将模块打包到一起并且会有优化，以加快加载速度和删除未使用的代码

   比如一个文件中有很多函数方法：

   ```js
   // 📁 say.js
   export function sayHi() { ... }
   export function sayBye() { ... }
   export function becomeSilent() { ... }
   ```

   如果我们只引入其中一个：

   ```js
   // 📁 main.js
   import { sayHi } from './say.js';
   ```

   那么 `optimizer`会检测并删除未被使用的函数，从而让构建更小，做到按需引入。这就是“摇树”`tree-shaking`

2. 明确列出导出内容会使代码重构更容易

### Import as

导入时可以换名字

```js
import { sayHi as hi, sayBye as bye } from './say.js';

hi('John'); // Hello, John!
bye('John'); // Bye, John!
```

### Export as

导出时也可以换名字

```js
export { sayHi as hi, sayBye as bye };
```

其他地方正式用的时候：

```js
import * as say from './say.js';

say.hi('John'); // Hello, John!
say.bye('John'); // Bye, John!
```

### Export default

实际中，主要有两种模块：

- 一个模块中有很多函数包
- 一个模块对应一个实体，比如一个模块只导出一个`class`

开发者倾向于第二种，因为让一个模块只做一件事会使得代码结构更加清晰，重构更加容易。

模块提供了一个特殊的默认导出`export default`以让“一个模块只做一件事”的方式看起来更好。

```js
export default class User {
  // 只需要添加 "default" 即可
  constructor(name) {
    this.name = name;
  }
}
```

每个文件可能只有一个 `export default`

将其导入时不需要加花括号

```js
import User from './user.js'; // 不需要花括号 {User}，只需要写成 User 即可

new User('John');
```

总结一下就是`import`默认导出时不需要加花括号。

| 命名的导出                | 默认的导出                        |
| :------------------------ | :-------------------------------- |
| `export class User {...}` | `export default class User {...}` |
| `import {User} from ...`  | `import User from ...`            |

技术上来说，一个模块可以同时有默认导出和命名导出。

由于每个文件最多只有一个默认导出，所以允许不加名称：

```js
export default class { // 没有类名
  constructor() { ... }
}
```

```js
export default function(user) {
  // 没有函数名
  alert(`Hello, ${user}!`);
}
```

```js
// 导出单个值，而不使用变量名
export default ['Jan', 'Feb', 'Mar', 'Apr', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
```

如果没有`default`，这样的导出会失败：

```js
export class { // Error!（非默认的导出需要名称）
  constructor() {}
}
```

### default 关键字

`default`关键字被用于引用默认的导出，例如：

```js
function sayHi(user) {
  alert(`Hello, ${user}!`);
}

// 就像我们在函数之前添加了 "export default" 一样
export { sayHi as default };
```

还一种情况，假设一个文件既默认导出，又命名导出：

```js
// 📁 user.js
export default class User {
  constructor(name) {
    this.name = name;
  }
}

export function sayHi(user) {
  alert(`Hello, ${user}!`);
}
```

那导入默认的导出以及命名导出的方式是这样的：

```js
import { default as User, sayHi } from './user.js';
// 也可以这样导入
// import User,{ sayHi } from './user.js';

new User('John');
```

如果我们用`*`将模块全部导入进来，则可以看到其实`default`就是导入的对象的一个属性：

```js
import * as user from './user.js';

let User = user.default; // 默认的导出
new User('John');
```

![image-20220612114655239](../assets/image-20220612114655239.png)

### 合理使用默认导出

命名的导出是明确的，它们确切命名了需要导出的内容，并且强制我们使用正确的名称导入：

```js
import { User } from './user.js';
// 导入 {MyUser} 不起作用，导入名字必须为 {User}
```

但默认导出在导入时可以随意指定名称

```js
import User from './user.js'; // 有效
import MyUser from './user.js'; // 也有效
// 使用任何名称导入都没有问题
```

因此，团队成员可能会使用不同名称来导入相同的名字，这不是好实践。

通常，为了保持一致性，可以遵从让导入的变量名跟导入的文件名相对应的规则：

```js
import User from './user.js';
import LoginForm from './loginForm.js';
import func from '/path/to/func.js';
...
```

或者是导入时名称跟导出的名称保持一致：

```js
const name = {};
export default name;
```

```js
import name from './user.js';
```

### 重新导出

`Re-export`语法`export ... from ...`允许导入内容，并立即导出：

```js
export { sayHi } from './say.js'; // 重新导出 sayHi

export { default as User } from './user.js'; // 重新导出 default
```

语法 `export ... from ...` 只是下面这种导入-导出的简写：

```js
import { sayHi } from './say.js';
export { sayHi };

import { default as User } from './user.js';
export { User };
```

### 重新导出默认导出

重新导出时，默认导出需要单独处理。

比如现在有一个`user.js`脚本，其中有很多命名导出和一个默认导出：

```js
//  user.js
export const name = {};
export const getAge = () => 20;

export default class User {
  // ...
}
```

我们必须写两条语句来重新导出

```js
export * from './user.js'; // 重新导出命名的导出
export { default } from './user.js'; // 重新导出默认的导出
```

### 总结

导出

```js
export [default] class/function/variable
```

导出时命名

```js
export {x [as y], ...}
```

重新导出

```js
export { x [as y],...} from 'module'
export * from 'module'  // 不会重新导出默认的导出
export {default [as y] } from 'module'  // 重新导出默认的导出
```

导入

```js
import {x [as y], ...} from "module"
```

导入默认导出

```js
import x from 'module';
import { default as x } from 'module';
```

导入所有

```js
import * as obj from 'module';
```

导入模块，但不需要将其任何导出赋值给变量

```js
import 'module';
```

**上面所有的导入导出都是静态的，静态导入导出在`{...}`中是无效的。**

比如下面的导入就是无效的

```js
if (something) {
  import { sayHi } from './say.js'; // Error: import must be at top level
}
```

如果我们需要像`require`那样可以做到在某个条件下进行导入，就需要学习动态导入。

## 动态导入

前面的导入导出都是静态导入，语法简单且严格。但也不能作为函数调用，同时也没办法在条件或者运行时导入：

```js
import ... from getModuleName(); // Error, only from "string" is allowed

if(...) {
  import ...; // Error, not allowed!
}

{
  import ...; // Error, we can't put import in any block
}
```

这是因为`import/export`是提供代码结构的主干，这样做利于分析代码结构，能够帮助收集模块，并用特殊的工具将收集的模块打包到一个文件中，并且删除未使用的导出（tree-shaking）。这些只能在静态模式下进行。

如果我们希望可以在代码运行时动态引入模块，则可以使用`import()`表达式

### import()表达式

`import(module)`表达式加载模块并且返回一个 promise。这个 promise resolve 为一个包含其所有导出的对象，我们可以在代码任何位置动态使用他们。

```js
import('./src/index.js').then(res => res.sayHi());
```

也可以用`await`

```js
async function execute() {
  const { sayHi } = await import('./src/index.js');
  sayHi();
}
execute();
```

如果有默认导出也是可以拿到的：

```js
// src/index.js
export default {
  name: 'qiuyanxi',
};
export function sayHi() {
  console.log('hi');
}
```

```js
async function execute() {
  const res = await import('./src/index.js');
  console.log(res.default); // 取到的对象中 default 属性就代表默认导出
  res.sayHi();
}
execute();
```

### 注意点

1. 动态导入在常规脚本中工作时，他们不需要`script type='module'`

   ```html
   <script>
     async function load() {
       let say = await import('./say.js');
       say.hi(); // Hello!
       say.bye(); // Bye!
       say.default(); // Module loaded (export default)!
     }
   </script>
   ```

2) `import()`不是函数调用，只是一种特殊语法，类似于`class`中的`super()`，因此我们不能将`import()`放入到一个变量中，或者对其使用`apply/call`等，因为它不是函数
