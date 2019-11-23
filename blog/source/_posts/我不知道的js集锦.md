---
title: 我不知道的js
---
整理一些没用过的 api
***
## 语法篇
### Array.flat 💋

扁平化遍历数组  

```javascript
[23, [4,5], [4, [3, 4, 5]]].flat()
// (5) [23, 4, 5, 4, Array(3)]
[23, [4,5], [4, [3, 4, 5]]].flat(1)
// [23, 4, 5, 4, 3, 4, 5]
```

参数代表了要遍历的深度
### 迭代器💋
Symbol.iterator是迭代器属性
以下数据类型有迭代器属性： `Array` `Set` `Map` `String` `arguments`  
```javascript
const it = [1,2,3][Symbol.itertaor]
it.next() // {value:1, done: false}
it.next() // {value:2, done: false}
it.next() // {value:3, done: false}
```
也可以用 `for...of` 来遍历  

#### 我想遍历对象怎么办？💋
以下都返回一个迭代器对象
```javascript
Object.keys() // key
Object.values()  // value
Object.entries() //[key, value]
```
### 生成器💋

其实就是 `generator` 函数啦。  
```javascript
// 生成器
function *createIterator() {
    yield 1;
    yield 2;
    yield 3;
}
// 生成器能像正规函数那样被调用，但会返回一个迭代器
let iterator = createIterator();
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
```
惊不惊喜，意不意外，跟迭代器对象调用如此之像，它也可以被迭代。  
```javascript
for(let a of createIterator) { console.log(a) }
```
它还是异步解决方案的一种，遇到 yield 时，会中止函数的执行，此时可以执行相关回调。但由于执行它太麻烦，要有一个允许 gen 方法执行的 chunk 函数。
### Set结构💋
类似于数组，但其内部成员是不可重复的，可以用来去重（或比较两个数字，NaN在它这里是相等的）
```javascript
Array.form(new Set([2,3,4,4,4,4]))
// [2,3,4]
```
方法有 `add\has\delete\clear`  

`set.size` 可以得到 `length`  

`Array.from` 和 `...` 可以将其转为 数组。  
它可以遍历  

#### weakSet💋
绝大多数 GC 机制都采取标记清除的方式，简单来说当变量被设置为 null 或者其所处的函数的生命周期结束时，会被 GC 回收掉。而 weakSet 储存一个对象时，不会被标记引用。比如以下代码  

```javascript
var obj = {}
var set = new Set()
set.add(obj)
obj = null
set // [{}]
// 分割

var obj = {}
var set = new WeakSet()
set.add(obj)
obj = null
set // []
```
当 Set 储存值时，被 GC 机制标记引用，即使将值设置为 null，但 set 中嗨保存一份 “副本”，值仍然存在。  
而 weakMap 储存值时，GC 机制不会标记该值的引用，当值设置为 null 时，理所当然的被回收了。
### Map 结构  💋
与 `Set` 不同，`Map` 储存健值对  
api 是 `set\get\has\delete\clear  
Map 的健值可以是对象，其他也没有啥好说的  

#### weakMap 对象💋
跟 weakSet 相同，不需要赘述了
### 双向绑定的两种实现方法💋
`Object.definePrototype`  
`Proxy`  
### Reflect💋
#### 为什么要引入 Reflect
- 将Object 的方法和属性移植过来
- 将部分操作由报错变为返回一个 bool 值，Reflect.definePorperty  
- 将命令式语句改为方法调用，key in obj -> Reflect.has(obj, key)
- 确保对象的原生行为能准确运行。比如Vue 3.0中 Reflect.set
#### API
- `Reflect.set(target, key, val, receiver)` receiver 是Proxy 的实例，会触发 defineProperty 钩子
- `Reflect.get(target, key ,val)`
- `Reflect.has(target, key)` 会从原型链找
- `Reflect.deleteProperty(obj, key)` 删除属性
- `Reflect.construct(target, [args])` 实例化 target -> `new target(args)`
- `Reflect.getPrototypeOf(obj)` 得到原型链
- `Reflect.setPrototypeOf(obj, key ,val)` 设置原型链
- `Reflect.apply(fn, this, args)` 对应 `fn.apply(this, args)`
- `Reflect.ownKeys(obj)` 返回对象的属性，包括 Symbol 作为健值，不包括原型链，
### Proxy
### Array.prototype.sort 的回调参数
回调函数返回值小于 0，从小到大，大于0，从大到小，等于0，不变
### Promise 实现原理  
### async await 实现原理
### 0.1+0.2===0.3吗💋
不等于，js的浮点数用分数表示，比如 0.5 可以用 1 / 2^1 表示，但 0.1 和 0.2 表示不了，只能近似相等，0.30000000000000004。
### 观察者模式 订阅模式 中介者模式
#### 观察者模式💋
```javascript
const beObserve = {
  name: 'duhao'
}
let name = ''
Object.definePorperty(beObserve, 'name', {
  set(val) {
    observe(beObserve, name, val)
    beObserve.name = name = val
  }
})
function observe(beObserve, oldVal, name) {
  // do something
}
```
#### 发布订阅模式💋
```javascript
class EventEmiter {
  constructor() {
    this.list = new Map()
  },
  addListener(evt, callback) {
    if(this.list.has(evt)) {
      return
    }
    this.list.set(evt, callback)
  },
  removeListener(evt) {
    if(!this.list.has(evt)) {
      return
    }
    this.list.delete(evt)
  },
  trigger(msg) {
    for(let obj of Object.keys(this.list)) {
      if(obj === msg.type) {
        this.list.get(obj)(msg)
      }
    }
  }
}
const events = new EventEmiter()
const obj = 'click'
events.addListener(obj, obj.doSomething)
events.trigger({type: 'click',msg: 'hello'})
```
#### 中介者模式  💋

举个例子就好了，比如枪战游戏，每个角色在打出一枪后，其他角色要校验自身是否中枪，这样比较耦合，现在，设置一个中心，由他来判断谁开枪了，谁中枪了。  
#### ParseInt
ParseInt 有两个参数，第一个参数是字符串，第二个参数是由 2 - 16 的整数。  
第二个参数是可选的，但如果不在 2 - 36之间，会返回NAN。如果第一个参数的首位字符串大于第二个参数，也会返回NAN，因为其不能被第二个参数所表示。  
`parseInt(10, 2)`  
这表示着  `1 * Math.pow(2, 1) + 0 * Math.pow(2, 0)`
***
## 浏览器原理篇  
### 路由的history
### 内存泄漏  💋
- 未关闭的定时器  
- 循环引用  
- alert('dfsf'.length)
- dom 节点未删除  
- 闭包内不用的变量  

### Rem 物理像素 css像素

### 高清屏解决方案 💋
在高清屏手机上，常常多个物理像素代表一个 css 像素，造成了 border: 1px 看起来很粗，过不了设计师这一关，可以通过伪元素设置 1px，然后transform: scale(.5)，然后居中解决；
### 浏览器缓存策略

***
## 网络篇  
### 网络模型  💋

- 应用层 HTTP/FTP
- 表现层
- 会话层
- 传输层 TCP/UPD
- 网络层 IP
- 数据链路层 以太网
- 物理层 光纤 网线  

### HTTP Keep-Alive  💋 
HTTP 一次链接是昂贵的，TCP 三次握手,四次挥手、冗长的请求头。如果能复用一个 TCP 通道，能节省更多资源，在请求头和返回头中 加入 `Connection: Keep-Alive`，使 TCP 通道不会关闭。多个请求可以复用一个TCP链接。但必须是有顺序的。
缺点：1，请求的返回遵循队列原则，如果第一个请求响应慢了，后面的请求会阻塞。2，服务端压力变大。

### http2的多路复用 💋
http1.0的问题
- 1，相同域名下的不同资源，要发多次请求，每次请求都要经过TCP三次握手，浪费时间。（虽然Keep-alive可以解决这个问题，）
- 2，请求头过大
- 3，没有服务端推送

http2 引入流的概念，同一域名只建立一个http请求。压缩了请求头，引入了服务端推送。
### https   💋
第一步，爱丽丝给出协议版本号、一个客户端生成的随机数（Client random），以及客户端支持的加密方法。

第二步，鲍勃确认双方使用的加密方法，并给出数字证书、以及一个服务器生成的随机数（Server random）。

第三步，爱丽丝确认数字证书有效，然后生成一个新的随机数（Premaster secret），并使用数字证书中的公钥，加密这个随机数，发给鲍勃。

第四步，鲍勃使用自己的私钥，获取爱丽丝发来的随机数（即Premaster secret）。

第五步，爱丽丝和鲍勃根据约定的加密方法，使用前面的三个随机数，生成"对话密钥"（session key），用来加密接下来的整个对话过程。
### HTTPS 握手过程中，客户端如何验证证书的合法性   💋
浏览器会内置大多数证书（伪造证书来进行中间人攻击）
https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/142
### 三次握手 四次挥手 💋
#### 三次握手  
假设只有两次握手。  
- 客户端：在吗，我要发消息啦  
- 服务端：OK，你发吧。  
这样看起来很正常，但如果客户端在第一次挥手之后，由于网络的波动，数据迟迟到达不到服务端，客户端挂掉了，而服务端还在傻傻等待，造成了资源的浪费。  

因此还需要客户端说：我开始发了！。  

#### 四次挥手  

为什么是四次呢，其实客户端和服务端都有两个状态：发送和接受。  
- 客户端：我没有东西要发给你了 （第一次挥手）  
- 服务端：好的，我关掉了 接受 态。（第二次挥手）。  
- 服务端：（检查后发现自己也没有数据要发了），我也没有东西发给你了，拜拜（第三次挥手）  
- 客户端：（关掉接受态），拜拜了您嘞～
#### 常见状态码  
```
常见状态码
2开头 （请求成功）表示成功处理了请求的状态代码。
200   （成功）  服务器已成功处理了请求。 通常，这表示服务器提供了请求的网页。
201   （已创建）  请求成功并且服务器创建了新的资源。
202   （已接受）  服务器已接受请求，但尚未处理。
203   （非授权信息）  服务器已成功处理了请求，但返回的信息可能来自另一来源。
204   （无内容）  服务器成功处理了请求，但没有返回任何内容。
205   （重置内容） 服务器成功处理了请求，但没有返回任何内容。
206   （部分内容）  服务器成功处理了部分 GET 请求。
3开头 （请求被重定向）表示要完成请求，需要进一步操作。 通常，这些状态代码用来重定向。
300   （多种选择）  针对请求，服务器可执行多种操作。 服务器可根据请求者 (user agent) 选择一项操作，或提供操作列表供请求者选择。
301   （永久移动）  请求的网页已永久移动到新位置。 服务器返回此响应（对 GET 或 HEAD 请求的响应）时，会自动将请求者转到新位置。
302   （临时移动）  服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求。
303   （查看其他位置） 请求者应当对不同的位置使用单独的 GET 请求来检索响应时，服务器返回此代码。
304   （未修改） 自从上次请求后，请求的网页未修改过。 服务器返回此响应时，不会返回网页内容。
305   （使用代理） 请求者只能使用代理访问请求的网页。 如果服务器返回此响应，还表示请求者应使用代理。
307   （临时重定向）  服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求。
4开头 （请求错误）这些状态代码表示请求可能出错，妨碍了服务器的处理。
400   （错误请求） 服务器不理解请求的语法。
401   （未授权） 请求要求身份验证。 对于需要登录的网页，服务器可能返回此响应。
403   （禁止） 服务器拒绝请求。
404   （未找到） 服务器找不到请求的网页。
405   （方法禁用） 禁用请求中指定的方法。
406   （不接受） 无法使用请求的内容特性响应请求的网页。
407   （需要代理授权） 此状态代码与 401（未授权）类似，但指定请求者应当授权使用代理。
408   （请求超时）  服务器等候请求时发生超时。
409   （冲突）  服务器在完成请求时发生冲突。 服务器必须在响应中包含有关冲突的信息。
410   （已删除）  如果请求的资源已永久删除，服务器就会返回此响应。
411   （需要有效长度） 服务器不接受不含有效内容长度标头字段的请求。
412   （未满足前提条件） 服务器未满足请求者在请求中设置的其中一个前提条件。
413   （请求实体过大） 服务器无法处理请求，因为请求实体过大，超出服务器的处理能力。
414   （请求的 URI 过长） 请求的 URI（通常为网址）过长，服务器无法处理。
415   （不支持的媒体类型） 请求的格式不受请求页面的支持。
416   （请求范围不符合要求） 如果页面无法提供请求的范围，则服务器会返回此状态代码。
417   （未满足期望值） 服务器未满足"期望"请求标头字段的要求。
5开头（服务器错误）这些状态代码表示服务器在尝试处理请求时发生内部错误。 这些错误可能是服务器本身的错误，而不是请求出错。
500   （服务器内部错误）  服务器遇到错误，无法完成请求。
501   （尚未实施） 服务器不具备完成请求的功能。 例如，服务器无法识别请求方法时可能会返回此代码。
502   （错误网关） 服务器作为网关或代理，从上游服务器收到无效响应。
503   （服务不可用） 服务器目前无法使用（由于超载或停机维护）。 通常，这只是暂时状态。
504   （网关超时）  服务器作为网关或代理，但是没有及时从上游服务器收到请求。
505   （HTTP 版本不受支持） 服务器不支持请求中所用的 HTTP 协议版本。
```
***
## 框架篇
### React声明周期及自己的理解  
### Redux数据流的流程
### Redux如何实现多个组件之间的通信，多个组件使用相同状态如何进行管理
### 使用过的Redux中间件
redux-thunk
redux-logger
### 动态路由的两种方案  
require.ensure  
import()
### 如何配置React-Router
### React 和 Vue 的 diff 时间复杂度从 O(n^3) 优化到 O(n) ，那么 O(n^3) 和 O(n) 是如何计算出来的？  
N^3 首先，第一棵树的每一个节点，都要和第二棵数的每一个节点进行对比，这是O(n^2)，其次，要计算树的最小转化路径。

React 认为，Dom运算很少会出现跨层级别的移动，因此只将树按层进行对比。它还做了优化：不同的节点类型直接进行替换、key......
### 介绍下前端加密的常见场景和方法  
sessionId
### vue 在 v-for 时给每项元素绑定事件需要用事件代理吗？为什么
需要，虽然大多数情况都会给每项绑定同样的回调事件，但还是会创建多个监听器。
```
### React Vue 原理 diff算法
// https://juejin.im/post/5d8a49d26fb9a04ddf2c25d6  

### React中Fibber是什么  

### webpack 打包原理  
- 找到entry文件，并分析其使用的模块化方案  
- 根据对应的模块化方案加载模块
- 拿到模块代码后使用对应的loader操作代码
- 打包进一个bundle 文件，模块被分割成一个个函数，并有自己对应的id，webpack按照正确的加载顺序调用它。
### webpack plugin 插件开发
### vue-loader
### React-Router  
### webpack css-loader 和 style-loader 和 postcss  
### 虚拟 Dom 如何实现
## typescript 篇  
### 装饰器 💋
先认识一个设计模式：装饰器模式：
> 装饰器模式：给现有对象或方法添加额外的属性，并且不改变其原有结构。  
举个例子。  
```typescript
class person {
  static skill = ['fly', 'run']
}
function derWrite(target, name, desc) {
  target.skill.push('walk')
  target.prototype.walk = function() {
    console.log('i can walk')
  }
  return (...arguments) => new target(...arguments)
}
const p = derWrite(person)
p.skill // ['fly', 'run', 'walk']
p.walk // ['fly', 'run', 'walk']
```
以上，derWrite 就是 类 person 的装饰器，它使 person 有了 walk 的能力。Person 不需要 知道 derWrite 是如何实现的，它只需调用即可。当下次 Car 类也需要 walk 时， derWrite(Car) 即可。  

上面就是装饰器模式，记得有个大神这么说过，设计模式的出现表示了语言设计的缺陷。对于装饰器来说 js 弥补了这个缺陷，引入了 装饰器 的概念，当仍在提案中......  
但你可以使用 typescript 提前体验。让我们用装饰器重新实现以上例子。  
```typescript
@derWrite();
class person {
  static skill = ['fly', 'run']
}
function derWrite(target, name, desc) {
  target.skill.push('walk')
  target.prototype.walk = function() {
    console.log('i can walk')
  }
  return target
}
new person().skill // ['fly', 'run', 'walk']
new person().walk // ['fly', 'run', 'walk']
```
可以看到，代码非常简洁，没什么好赘述的。
***
## node 篇
### 介绍下 npm 模块安装机制，为什么输入 npm install 就可以自动安装对应的模块？
### KOA2  
### Redis
### 事件循环机制
https://github.com/qqqdu/dxy-node-race/blob/master/eventLoop/README.md
***
## 正则篇💋
### trim 函数
***
## 算法篇  
### 介绍下深度优先遍历和广度优先遍历，如何实现？
### 请分别用深度优先思想和广度优先思想实现一个拷贝函数？
### 二叉树遍历  
### 二叉树路径总和
## 参考

> https://www.jianshu.com/p/f871c4c0663d  
https://juejin.im/post/5b94d8965188255c5a0cdc02#heading-86
https://juejin.im/post/5b94d8965188255c5a0cdc02#heading-21
https://github.com/yygmind/blog/issues/43