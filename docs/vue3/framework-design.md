---
order: 1
---

# 框架设计

## 基本概念

### 1.1 命令式和声明式

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

### 1.2 性能与可维护性

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

### 1.3 虚拟 DOM 的性能

**声明式代码的更新性能消耗 = 找出差异的性能消耗 + 直接修改的性能消耗**

因此，如果我们能够将找出差异的性能消耗降低到最低，就可以让声明式的代码无限接近于命令式代码的性能。

虚拟 DOM 就是**为了最小化找出差异的性能消耗**而出现的。

所以，理论上来说，虚拟 DOM 的更新技术不可能比原生 JavaScript 操作 DOM 的性能更高。

但是大部分情况下，我们很难写出绝对优化的命令式代码。

所以虚拟 DOM 要解决的问题就是让我们写声明式代码的情况下，保证应用程序的下限，并且想办法逼近命令式代码的性能。

但为什么用虚拟 DOM 而不用 innerHTML 方案呢？

**虚拟 DOM 与 innerHTML 的比较**

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

### 1.4 运行时和编译时

**运行时**

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

**运行时+编译时**

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

**编译时**

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

### 1.5 总结

1. 命令式的范式注重过程，声明式的则注重结果
2. 命令式的代码理论上性能是最好的，但是需要付出很多精力和开发心智
3. 声明式的框架需要做到尽可能地使性能损耗到最低
4. 虚拟 DOM 的性能公式：更新性能消耗 = 找出差异的性能消耗 + 直接修改的性能消耗
5. 虚拟 DOM、innerHTML、原生 JavaScript 操作 DOM，三种方法在创建页面、更新页面时的性能是不一样的，在判断性能差异时还需要考虑页面大小、变更大小等因素
6. 总体来说，虚拟 DOM 的可维护性比原生 JavaScript 更强，性能优于 innerHTML。
7. 运行时、编译时以及运行时+编译时的框架有不同的特点

## 设计思路

### 2.1 声明式 UI

编写前端页面一共分以下内容：

1. DOM 元素：例如 div 标签
2. 属性：例如 id、class 等属性
3. 事件：click 事件等
4. 元素的层级结构：DOM 树的层级

Vue3 对此的解决方案是这样的：

1. 用 HTML 标签的形式来描述 DOM 元素，例如描述 div 标签使用的是`<div></div>`
2. 使用 HTML 的形式描述属性，例如`<div id="hello"></div>`
3. 使用`:`或者 v-bind 绑定动态属性，例如`<div :id="dynamicId"></div>`
4. 使用`@`或者 v-on 绑定事件，例如`<div @click="handler"></div>`
5. 使用 HTML 标签来描述 DOM 的层级，例如 `<div><span></span></div>`

除此之外，还可以用 JavaScript 对象的方式来描述 UI。

```js
const title = {
  tag: 'h1',
  props: { onClick: handler },
  children: [{ tag: 'span' }],
};
```

用 JavaScript 对象的方式来描述 UI，实际上就是虚拟 DOM。

在 vue 中有一种 h 函数的调用，这个函数会返回虚拟 DOM，本质上 h 函数是为了更方便地写虚拟 DOM

```js
import { h } from 'vue';
export default {
  render() {
    return h('h1', { onClick: handler });
  },
};
```

相当于：

```js
import { h } from 'vue';
export default {
  render() {
    return {
      tag: 'h1',
      props: { onClick: handler },
      children: [{ tag: 'span' }],
    };
  },
};
```

上面代码中有两个函数：render 和 h 函数

h 函数是辅助创建虚拟 DOM 用的，render 函数是**渲染函数**，render 函数能够根据其返回值（虚拟 DOM）将组件的内容渲染出来。

### 2.2 渲染器

渲染器的作用是把虚拟 DOM 渲染成真实 DOM。

假设我们有以下虚拟 DOM：

```js
const vNode = {
  tag: 'div',
  props: { onClick: () => alert('hello') },
  children: 'click me',
};
```

下面我们需要编写渲染器，让其变成真实的 DOM。

```js
function renderer(vNode, root) {
  const el = document.createElement(vNode.tag);

  for (let key in vNode.props) {
    // on 开头的都是事件
    if (/^on/.test(key)) {
      el.addEventListener(key.substr(2).toLowerCase(), vNode.props[key]);
    }
  }
  if (typeof vNode.children === 'string') {
    el.innerText = vNode.children;
  } else if (Array.isArray(el.children)) {
    el.children.forEach(v => {
      renderer(v, el);
    });
  }
  root.append(el);
}
renderer(vNode, document.body);
```

render 渲染器的实现思路分为三步：

1. 根据虚拟 DOM 提供的信息来创建元素
2. 给元素添加事件和属性（通过 props 属性）
3. 递归调用 render 渲染器，将 children 挂载到父节点

使用渲染器的原理很简单，本质上就是通过 DOM 操作 API 来完成渲染工作。

### 2.3 组件的本质

组件就是一组 DOM 元素的封装。

这组 DOM 元素就是组件要渲染的内容，因此我们可以定义一个函数来代表组件，而函数的返回值就是需要渲染的内容。

```js
const myComponent = function() {
  return {
    tag: 'div',
    props: { onClick: () => alert('hello') },
    children: 'click me',
  };
};
```

上面的函数组件的返回值同样也是虚拟 DOM，它能够代表组件需要渲染的内容。

我们可以依然使用虚拟 DOM 中的 tag 来保存组件

```js
const vNode = {
  tag: myComponent,
};
```

此时 tag 描述的是组件函数，此时修改渲染器

```js
function renderer(vNode, container) {
  if (typeof vNode.tag === 'string') {
    // ...说明描述的是标签
    mountElement(vNode, container);
  } else if (typeof vNode.tag === 'function') {
    // ...说明描述的是组件
    mountComponent(vNode, container);
  }
}
```

此时将原来渲染器的逻辑抽离出来，变成`mountElement`和`mountComponent`函数

```js
function mountElement(vNode, container) {
  const el = document.createElement(vNode.tag);

  for (let key in vNode.props) {
    // on 开头的都是事件
    if (/^on/.test(key)) {
      el.addEventListener(key.substr(2).toLowerCase(), vNode.props[key]);
    }
  }
  if (typeof vNode.children === 'string') {
    el.innerText = vNode.children;
  } else if (Array.isArray(el.children)) {
    el.children.forEach(v => {
      mountElement(v, el);
    });
  }
  container.append(el);
}
```

```js
function mountComponent(vNode, container) {
  // 返回的虚拟 DOM
  const subtree = vNode.tag();
  renderer(subtree, container);
}
```

可以看到，现在逻辑比较清晰简单。调用 `tag` 函数，我们知道它其实就是函数本身，返回值也是虚拟 `DOM`，我们在这里命名为 `subtree`。既然 `subtree` 也是虚拟 `DOM`，那么调用 `renderer` 渲染器完成渲染即可。

同样地，组件不单单可以是函数，还能够是对象，我们只需要做一点微小的改动：

```js
const myComponent = {
  render() {
    return {
      tag: 'div',
      props: { onClick: () => alert('hello') },
      children: 'click me',
    };
  },
};
```

然后在`renderer`函数上修改一下判断条件

```diff
function renderer(vNode, container) {
  if (typeof vNode.tag === "string") {
    // ...说明是标签
    mountElement(vNode, container);
  }
-  if (typeof vNode.tag === "function") {
-    // ...说明是组件
-    mountComponent(vNode, container);
-  }
+  if (typeof vNode.tag === "object") {
+    // ...说明是组件
+    mountComponent(vNode, container);
+  }
}
```

最后修改`mountComponent`里面的调用

```diff
function mountComponent(vNode, container) {
-  const subtree = vNode.tag();
+  const subtree = vNode.tag.render();
  mountElement(subtree, container);
}
```

最后我们就完成了用对象来表达组件的需求。

### 2.4 模板的工作原理

无论是手写虚拟 DOM 还是使用模板，都是声明式描述 UI。

模板需要通过**编译器**编译成对应的渲染函数。

例如以下模板：

```html
<div @click="handler">
  click me
</div>
```

对于编译器来说，模板就是一个普通的字符串，它会分析字符串并生成一个功能与之相同的渲染函数

```js
render(){
	return h('div',{onClick: handler },'click me')
}
```

以 `.Vue`文件为例

```html
<template>
  <div @click="handler">click me</div>
</template>

<script>
  export default {
    data() {},
    methods() {
      handler: () => {};
    },
  };
</script>
```

最终会被编译成：

```js
export default {
  data() {},
  methods() {
    handler: () => {};
  },
  render() {
    return h('div', { onClick: handler }, 'click me');
  },
};
```

`<template>`里面的内容就是模板内容，编译器会将这个内容编译成渲染函数然后添加到`<script>`标签块的组件对象里上。

对于一个组件来说，它渲染内容的步骤是这样的：

1. 编译器将模板编译成渲染函数

2. 通过渲染函数生成虚拟 DOM

3. 虚拟 DOM 经过**渲染器**渲染为真实 DOM

### 2.5 各模板配合

组件的实现依赖**渲染器**，模板的编译依赖**编译器**，编译后的内容是根据渲染器和虚拟 DOM 的设计决定的。

这里以编译器和渲染器两个关键模块为例，看看它们之间互相配合是如何提升性能的。

以下面模板为例：

```html
<div id="foo" :class="cls"></div>
```

我们知道它最终会被编译成渲染函数：

```js
  render() {
  	// 编译器会编译成 h 函数，h 函数最终返回的结果是虚拟 DOM
  	// return h('div',{ id: "foo", class: cls })
    return {
      tag: "div",
      props: { id: "foo", class: cls },
    };
  }
```

上面的代码中，cls 是一个可能发生变化的内容。渲染器的作用之一是寻找并且只更新变化的内容，所以当 cls 发生变化时，渲染器需要自行寻找变量，这个寻找可能需要花一些力气。

如果编译器能够分析这个内容，并在编译时就将信息提取出来，然后直接交给渲染器，就能够减少渲染器寻找的时间。

从 Vue 的模板特征来看，我们能够看出 :class="cls" 是动态绑定的，所以 cls 是可能会发生变化的。而 id="foo" 是永远不会变化的。

因此编译器能够识别出哪些是静态属性，哪些是动态属性，在生产代码时完全可以附带这些信息：

```js
  render() {
  	// 编译器会编译成 h 函数，h 函数最终返回的结果是虚拟 DOM
  	// return h('div',{ id: "foo", class: cls })
    return {
      tag: "div",
      props: { id: "foo", class: cls },
      patchFlags: 1 // 假设数字 1 代表 class 是动态的
    };
  }
```

如上面的代码所示，在编译后生成的 DOM 对象中多出一个 patchFlags 属性，假设 1 代表 class 是动态的，那么渲染器看到后就知道这段虚拟 DOM 只有 class 会发生改变。这样就省去了寻找变更点的工作量，性能也就提升了。

现在我们知道编译器和渲染器之间是存在信息交流的，它们的互相配合能够促使性能进一步提升，它们之间交流的媒介是虚拟 DOM 对象。

### 2.6 总结

Vue 是声明式 UI 的框架，我们不需要关心过程，只需要描述结果。Vue 采用模板和虚拟 DOM 两种方式描述 UI。

渲染器的作用是将虚拟 DOM 对象转化成真实的 DOM。它的工作原理是，递归遍历虚拟 DOM 对象，并调用原生 API 来完成真实 DOM 的创建。但渲染器的精髓在于后续的更新，它会通过 Diff 算法找出变更点，并且只会更新需要更新的内容。

组件的本质是一种虚拟 DOM 的封装，它可以是返回虚拟 DOM 的函数，也可以是一个对象，但这个对象必须包含一个返回值为虚拟 DOM 的函数。渲染器在渲染组件时，会拿到组件返回的虚拟 DOM，在例子中，我们命名为 `subtree`,拿到后递归调用渲染器将`subtree`渲染出来即可。

Vue 的模板会被编译器编译成渲染函数。编译器和渲染器等各个模块之间组成一个整体，不同模块之间能够互相配合，进一步提升框架性能。
