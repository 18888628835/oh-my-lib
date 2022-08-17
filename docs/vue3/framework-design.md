---
order: 1
---

# 框架设计

## 1.1 命令式和声明式

视图框架分为命令式和声明式两种。

- 命令式

  特点是关注过程。典型代表是 jQuery。

  命令式就是用指令的形式编码来完成功能。比如以下代码：

  ```js
  const div = document.querySelector('#app'); // 获取 div
  div.innerText = 'hello world'; // 设置文本内容
  div.addEventListener('click', () => {
    alert('ok');
  }); // 绑定点击事件
  ```

  代码本身描述的是做事的过程。自然语言能够与代码形成一一对应的关系。

- 声明式

  声明式框架更关注的是结果。上面的代码可以用 Vue 这样实现：

  ```html
  <div @click="()=>alert('ok')">hello world</div>
  ```

  可以看到，我们直接提供了一个结果，而实现结果的过程，则是 Vue 帮我们完成的。换句话说，Vue 帮助我们实现了过程的封装。因此，Vue 的内部实现是指令式的，而暴露给用户的是声明式的 API。

## 1.2 性能与可维护性

**声明式代码的性能不优于命令式代码的性能。**

如果我们想要修改上面例子中 div 的文本内容，那可以调用以下命令来操作：

```js
div.textContent = 'hello vue3';
```

没什么代码能够比上面的代码性能更好。理论上命令式的代码可以做到极致的性能优化。因为我们明确知道哪些东西需要变更，只需要做必要的修改即可。但是声明式的代码不一定能做到这点，因为它描述的是结果：

```html
// 之前
<div @click="()=>alert('ok')">hello world</div>
// 之后
<div @click="()=>alert('ok')">hello vue3</div>
```

为了实现最优的更新性能，框架需要找到前后的差异并且只更新变化的部分。但最终完成本次更新的代码依然会是：

```js
div.textContent = 'hello vue3';
```

由此我们可以得出两个公式：

```
命令式代的更新性能消耗 = A
声明式代码的更新性能消耗 = B + A
```

可以看到，声明式代码的更新性能消耗会比命令式的多出寻找差异的性能消耗。因此，最理想的情况就是，找差异的性能消耗为 0 时，声明式代码会跟命令式的代码性能消耗持平。

**框架本身就是封装了命令式代码才实现了面向用户的声明式**，因此我们得出开头的结论：

**声明式代码的性能不优于命令式代码的性能。**

但是**声明式代码的性能不优于命令式代码的性能。**。

在采用命令式开发时，我们需要维护实现的目标的整个过程，包括手动完成 DOM 元素的增删改查。而声明式的代码展示的是结果，看上去更加直观。

因此，声明式框架的设计者要做的就是：**在保持可维护性的同时让性能损失最小化**。

## 1.3 虚拟 DOM 的性能

**声明式代码的更新性能消耗 = 找出差异的性能消耗 + 直接修改的性能消耗**

因此，如果我们能够将找出差异的性能消耗降低到最低，就可以让声明式的代码无限接近于命令式代码的性能。

虚拟 DOM 就是**为了最小化找出差异的性能消耗**而出现的。

所以，理论上来说，虚拟 DOM 的更新技术不可能比原生 JavaScript 操作 DOM 的性能更高。

但是大部分情况下，我们很难写出绝对优化的命令式代码。

所以虚拟 DOM 要解决的问题就是让我们写声明式代码的情况下，保证应用程序的下限，并且想办法逼近命令式代码的性能。

但为什么用虚拟 DOM 而不用 innerHTML 方案呢？

### 虚拟 DOM 与 innerHTML 的比较

下面就可以比较一下 InnerHTML 与虚拟 DOM 之间的性能差异：

- **InnerHTML 性能消耗**

  不同于 `document.createElement`等现代 DOM 操作的 API。`innerHTML` 能够用 HTML 字符串的形式直接构建标签进而生成 DOM。

  比如下面的代码：

  ```html
  div.innerHTML = `
  <div><span>...</span></div>
  `;
  ```

  为了渲染出页面，上面的 HTML 字符串会被解析成 DOM 树，这涉及 DOM 的运算。

  用一个公式来表达通过 innerHTML 创建页面的性能：**HTML 字符串拼接的计算量+innerHTML 的 DOM 计算量**

- **虚拟 DOM 性能消耗**

  虚拟 DOM 创建页面的过程分为两步：

  1. 创建 JavaScript 对象，这个对象可以理解为真实 DOM 的描述。
  2. 递归遍历虚拟 DOM 并创建真实 DOM。

  用一个公式来表达虚拟 DOM 的性能：\*\*创建 JavaScript 对象的计算量+创建真实 DOM 的计算量

|                 | 虚拟 DOM             | innerHTML         |
| --------------- | -------------------- | ----------------- |
| JavaScript 运算 | 创建 JavaScript 对象 | 渲染 HTML 字符串  |
| DOM 运算        | 新建所有 DOM 元素    | 新建所有 DOM 元素 |

在新建元素时，虚拟 DOM 跟 innerHTML 的性能消耗可能差不多。

但是如果是更新页面，情况就不一样了：

|                 | 虚拟 DOM                      | innerHTML        |
| --------------- | ----------------------------- | ---------------- |
| JavaScript 运算 | 创建新的 JavaScript 对象+Diff | 渲染 HTML 字符串 |
| DOM 运算        | 必要的 DOM 更新               | 销毁旧的 DOM     |
|                 |                               | 新建新的 DOM     |

使用 innerHTML 更新页面的过程是重新构建 HTML 字符串，再重新设置 DOM 元素的 html 属性。换句话说，即使改了一个字，也需要重新设置 innerHTML。所以它的性能消耗就是先销毁旧的 DOM 以及全量新建新的 DOM。

使用虚拟 DOM 需要新建虚拟 DOM 树，再比较新旧 DOM 树之间的差异，找出变化的元素，最后更新 DOM。

也就是说更新页面时虚拟 DOM 只比创建时多了一层 Diff，而且这是 JavaScript 层面的运算，比起 innerHTML 的全量更新，虚拟 DOM 的性能更加有优势。

最后，当更新页面时，影响虚拟 DOM 的性能因素与影响 innerHTML 的性能因素不同。对于虚拟 DOM 来说，无论页面多大，都只会更新变化的内容。对于 innerHTML 来说，页面越大，就意味着更新时性能消耗越大。

|                 | 虚拟 DOM                      | innerHTML        |
| --------------- | ----------------------------- | ---------------- |
| JavaScript 运算 | 创建新的 JavaScript 对象+Diff | 渲染 HTML 字符串 |
| DOM 运算        | 必要的 DOM 更新               | 销毁旧的 DOM     |
|                 |                               | 新建新的 DOM     |
| 性能因素        | 与数据变化量相关              | 与模板大小相关   |

因此，简单总结如下：

性能层面：原生 JavaScript > 虚拟 DOM > innerHTML

维护层面：虚拟 DOM > innerHTML > 原生 JavaScript

## 1.4 运行时和编译时

### 运行时

纯运行时的框架是这样的：我们希望将虚拟 DOM（实际上就是 JavaScript 对象）渲染到页面上，那作为框架开发者，我会规定一套数据结构，然后提供一个 Render 函数，用户根据数据结构创建一个 JavaScript 对象，传到 Render 函数中，这样就能够达到渲染页面的效果。

比如我们规定的数据结构如下：

```js
const obj = {
  tag: 'div',
  children: [{ tag: 'span', children: 'hello world' }],
};
```

然后我们写一个 Render 函数

```js
function Render(vNode, root) {
  const el = document.createElement(vNode.tag);
  if (typeof vNode.children === 'string') {
    el.textContent = vNode.children;
  } else if (vNode.children) {
    vNode.children.forEach(child => {
      Render(child, el);
    });
  }
  root.append(el);
}
```

最后让用户调用：

```js
Render(obj, document.querySelector('#root'));
```

上面的代码最终会在页面上渲染出 `hello world`

### 运行时+编译时

纯运行时的方法会让用户提供一个巨大的树形结构对象。有没有一种方法？比如使用编译的手段简化它呢？

比如

```html
<div>
  <span>hello world</span>
</div>
```

最终被编译成

```js
const obj = {
  tag: 'div',
  children: [{ tag: 'span', children: 'hello world' }],
};
```

为此，框架开发者需要写一个 `Compiler`函数，它的作用就是将字符串转化成 JavaScript 对象

```js
const html = `
<div>
	<span>hello world</span>
</div>
`;
const vNode = Compiler(html);
```

最终给 Render 函数调用

```js
Render(vNode);
```

这时，这就是编译时+运行时的框架

### 编译时

还有一种编译时，它就是把 Render 函数去掉，直接将用户写的字符串转化成命令式代码：

```js
const html = `
<div>
	<span>hello world</span>
</div>
`;
```

上面的代码会转化成

```js
const div = document.createElement('div');
const span = document.createElement('span');
span.innerText = 'hello world';
div.appendChild(span);
document.body.appendChild(div);
```

## 1.5 总结

1. 命令式的范式注重过程，声明式的则注重结果
2. 命令式的代码理论上性能是最好的，但是需要付出很多精力和开发心智
3. 声明式的框架需要做到尽可能地使性能损耗到最低
4. 虚拟 DOM 的性能公式：更新性能消耗 = 找出差异的性能消耗 + 直接修改的性能消耗
5. 虚拟 DOM、innerHTML、原生 JavaScript 操作 DOM，三种方法在创建页面、更新页面时的性能是不一样的，在判断性能差异时还需要考虑页面大小、变更大小等因素
6. 总体来说，虚拟 DOM 的可维护性比原生 JavaScript 更强，性能优于 innerHTML。
7. 运行时、编译时以及运行时+编译时的框架有不同的特点
