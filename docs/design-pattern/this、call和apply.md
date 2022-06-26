---
order: 2
---

# 第二章 this、call 和 apply

本章主要理解`this`关键字、`Function.prototype.call`和`Function.prototype.apply`的概念

## 2.1 this

JavaScript 中的 this 总是指向一个对象，具体指向哪个对象则是在运行时基于函数的运行环境来动态绑定的，而不是函数声明时的环境（词法作用域则是根据函数声明时的环境生成的）。

## 2.1.1 this 的指向

this 的指向大概可以分为以下 4 种：

- 作为对象的方法调用
- 作为普通函数调用
- 作为构造函数调用
- `Function.prototype.call`或者`Function.prototype.apply`调用

1. 当作为对象的方法调用时，this 指向该对象

```javascript
var obj = {
  a: 1,
  getA: function() {
    alert(this === obj); // 输出：true
    alert(this.a); // 输出： 1
  },
};

obj.getA();
```

2. 当作为普通函数调用时，指向全局对象，浏览器环境下的全局对象是 window

```JavaScript
    window.name = 'globalName';

    var getName = function(){
        return this.name;
    };

    console.log( getName() );    // 输出：globalName
```

或者

```javascript
window.name = 'globalName';

var myObject = {
  name: 'sven',
  getName: function() {
    return this.name;
  },
};

var getName = myObject.getName;
console.log(getName()); // globalName
```

有时候我们需要在事件函数内部使用一个 callback 方法，这个方法内可能需要用到 this，我们希望它指向触发点击事件的节点，可以这么做

```html
<div id="div">
  我是一个div
</div>
```

```javascript
div.addEventListener('click', function() {
  const that = this; // 使用一个变量保存this
  function callback() {
    console.log(this.id); //undefined
    console.log(that.id); // div
  }
  callback();
});
```

否则`callback`就是普通函数调用，默认 this 指向 window。

在严格模式下，普通函数调用规定不会指向 window，而是 undefined。

```javascript
function callback() {
  'use strict';
  console.log(this); //undefined
}
```

3. 构造器调用

构造器跟普通函数没有区别，只是我们调用它的方式不同。当使用 new 运算符调用时，该函数会返回一个对象。默认情况下，this 会指向返回的这个对象。

```javascript
var MyClass = function() {
  this.name = 'sven';
};

var obj = new MyClass(); // new会新创建一个对象obj，并且让this指向它。相当于obj.name ='sven'
alert(obj.name); // 输出：sven
```

当使用 new 关键字时，还需要注意一个问题，如果构造器显式返回一个 object 类型的对象，那么最终会返回这个对象。而不是 this 原指向的对象。

```JavaScript
        var MyClass = function(){
            this.name = 'sven';
            return {    // 显式地返回一个对象
              name: 'anne'
            }
        };

        var obj = new MyClass(); // 由new关键字创建的并拥有this指向的obj不会被返回了
        alert ( obj.name );     // 输出：anne
```

如果构造器不显式地返回任何数据或者不返回对象类型的数据，那么就不会有问题

```JavaScript
        var MyClass = function(){
            this.name = 'sven'
            return 'anne';    // 返回string类型
        };

        var obj = new MyClass();
        alert ( obj.name );     // 输出：sven
```

4. Function.prototype.call 或 Function.prototype.apply 调用

使用 Function.prototype.call 或 Function.prototype.apply 可以动态地改变传入函数的 this

```JavaScript
        var obj1 = {
            name: 'sven',
            getName: function(){
              return this.name;
            }
        };

        var obj2 = {
            name: 'anne'
        };

        console.log( obj1.getName() );     // 输出： sven
        console.log( obj1.getName.call( obj2 ) );    // 输出：anne
```

## 2.1.2 丢失的 this

```JavaScript
        var obj = {
            myName: 'sven',
            getName: function(){
              return this.myName;
            }
        };

        console.log( obj.getName() );    // 输出：'sven'

        var getName2 = obj.getName;
        console.log( getName2() );    // 输出：undefined
```

当调用 obj.getName 时，getName 方法是作为 obj 对象的属性被调用的，此时的 this 指向 obj 对象。

当用另外一个变量 getName2 来引用 obj.getName，此时是普通函数调用方式，this 是指向全局 window 的，所以程序的执行结果是 undefined。

再来看一个例子，比如我希望封装一个函数来获取 ID 以替代`document.getElementByid()`的写法，我封装的函数是这样的：

```javascript
function getId(id) {
  return document.getElementById(id);
}

getId('div');
```

这种方式没问题。

如果换成这样不是更简单吗？

```javascript
const getId = document.getElementById;
getId('div');
```

**当运行一下，就会发现这样的代码会抛出异常**。

原因是`document.getElementByid`内部使用了 this。

当`getElementById`方法作为`document`对象的属性被调用时，方法内部的`this`确实是指向`document`的

但当用`getId`来引用`document.getElementById`之后，再调用`getId`，此时就成了普通函数调用，函数内部的`this`指向了`window`，而不是原来的`document`。

我们可以尝试使用`call`或者`apply`或者`bind`来将 this 绑定到`document`上，这样就可以运行`getId`了

```javascript
const getId = document.getElementById.bind(document);
getId('div');
console.log(getId('div').id); // 'div'
```

## 2.2 call 和 apply

`Function.prototype`中有两个方法，它们分别是`call`和`apply`，在函数式风格的代码中，它们尤为有用。

### 2.2.1 call 和 apply 的区别

call 和 apply 的作用一模一样，区别只在于传参形式的不同。

apply 接受两个参数，第一个参数指定函数体内的 this 指向，第二个参数是一个数组，也可以是类数组。apply 把第二个参数传递给被调用的函数。

```JavaScript
var func=function(a,b,c){
  console.log(a,b,c)
}
func.apply(null,[1,2,3]) // 1 2 3
```

`call`是包装在`apply`上面的语法糖，第一个参数也指定函数体内的 this 指向，从第二个参数开始，所有参数都会被传递给被调用的函数。

```javascript
var func = function(a, b, c) {
  console.log(a, b, c);
};
func.call(null, 1, 2, 3); // 1 2 3
```

当`call`和`apply`的第一个参数是 null 时，函数内的`this`默认指向`window`。

```JavaScript
        var func = function( a, b, c ){
            alert ( this === window );    // 输出true
        };

        func.apply( null, [ 1, 2, 3 ] );
```

如果是严格模式，那么`this`指向`null`

```JavaScript
        var func = function( a, b, c ){
            "use strict";
            alert ( this === null );     // 输出true
        }

        func.apply( null, [ 1, 2, 3 ] );
```

有时候我们使用`call`或者`apply`的目的是借用其他对象的方法，而不是指定`this`的指向那么我们可以传递`null`来替代某个具体的对象

```javascript
Math.max.apply(null, [1, 2, 3, 4, 5]); // 5
```

### 2.2.2 call 和 apply 的用途

1. 改变`this`指向

   `call`和`apply`最常见的用途就是改变函数内部的`this`指向。

2) 模拟`Function.prototype.bind`

   ```javascript
   Function.prototype.myBind = function(context, ...rest) {
     const thisFuc = this; // 这里的this为调用bind的函数
     return function() {
       //调用call时让函数内部的this指向context
       return thisFuc.call(context, ...rest);
     };
   };
   const getName = function() {
     console.log(this.name);
   };
   const obj = {
     name: 'qiuyanxi',
   };
   getName.myBind(obj)();
   ```

3) 借用其他对象的方法

   - 通过借用构造函数的方法，可以实现继承的效果

     ```JavaScript
             var A = function( name ){
                 this.name = name;
             };

             var B = function(){
                 A.apply( this, arguments );
             };

             B.prototype.getName = function(){
                 return this.name;
             };

             var b = new B( 'sven' );
             console.log( b.getName() );  // 输出： 'sven'
     ```

   - 通过借用其他对象的方法，可以实现某些功能

     函数的`arguments`是一个伪数组，它并没有数组的原型方法，除了使用`Array.from`将其变成真正的数组外，还可以使用`call`或者`apply`来借用数组的方法

     ```javascript
     function fn() {
       Array.prototype.push.call(arguments, 3);
       console.log(arguments); // [1,2,3]
     }
     fn(1, 2);
     ```

     **能够使用这种方法让 arguments 具备数组的能力的原因来自于 V8 的引擎源码：**

     ```JavaScript
             function ArrayPush() {
                 var n = TO_UINT32( this.length );    // 被push的对象的length
                 var m = %_ArgumentsLength();     // push的参数个数
                 for (var i = 0; i < m; i++) {
                   this[ i + n ] = %_Arguments( i );   // 复制元素     (1)
                 }
                 this.length = n + m;      // 修正length属性的值    (2)
                 return this.length;
             };
     ```

     结合例子分析一下源码：

     - 先获取被 push 对象的长度，对应例子中的`arguments`为被 push 的对象，它的长度为 2
     - 获取 push 的参数个数，对应例子中的参数 3
     - 循环遍历被 push 的参数个数，然后直接在`arguments`的末尾位置挨个插入被 push 的值，`%_Arguments`用来获取 V8 源码中的参数对象，`%_Arguments( i )`获取到的是 3。
     - `this[ i + n ] = %_Arguments( i )`就相当于运行`arguments[2]=3`
     - 返回`length`属性

     从源码可以看出，V8 源码不在乎调用`push`方法的是否为真实的数组,它只需要能够获取调用方法的对象的`length`属性，然后按照下标依次添加到被`push`对象上面，顺便修改掉`length`属性就可以了。


     通过`ArrayPush`函数，我们可以知道想要实现`Array.prototype.push.call`类似的效果，需要具备两个条件：

     1. 被`push`对象属性可修改

     2. 被`push`对象属性具有可读写的`length`属性

     验证一下：

     ```javascript
     const obj = {
       length: 0
     }
     const n = 1

     function fn(a) {
       console.log(a)
     }

     Array.prototype.push.call(obj, 1)
     console.log(obj) // {0:1,length:1}

     Array.prototype.push.call(n, 3)
     console.log(n) // 1

     Array.prototype.push.call(fn, 3) //"TypeError: Cannot assign to read only property 'length' of function
     ```

     `obj`对象属性可存取，所以push成功了

     `n`不是对象，属性不可存取，所以push不成功

     `fn`函数的`	length`是形参，只读属性，不可修改，所以报错了
