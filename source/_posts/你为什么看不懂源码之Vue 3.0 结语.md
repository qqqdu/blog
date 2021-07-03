---
title: 你为什么看不懂源码之Vue 3.0 结语
date: 2019/10/29
---
距离上一篇已经过去了好久......  

## 先唠会儿嗑
之前大概了解了 响应式原理、让普通属性变成响应式数据的 ref、effect 的实现以及 计算属性的包装。  
  
本篇从逆向的角度做个简单的整理

## 假如你是作者

你的需求是开发 `reactive` 模块，它是干什么的呢？将变量生成响应式数据。  

响应式数据被更改时，需要做一些反应。那怎么能检测响应式的变更呢？在谈这个问题前，得先罗列下，变量有哪些类型？  

### 变量的类型  

#### 基本类型

String Number Symbol Boolean

形如:  

```javascript
let a = 2
let b = 'lalla'
let c = Symbol('cObj')
```

#### 普通对象

形如：

```javascript
let obj = { name: 'obj' }
```

#### 集合对象

Map WeakMap Set WeakSet
形如

```javascript
let map = new Map([{name: 'map'}])
let set = new Set([1,2,3])
```

基本上是这三类，但这三类可能交织纵横，互相“包庇”！我太难了。

### 拦截

既然分出了变量的类型，逐一拦截，然后再做“反应”就行了。先从普通变量谈起。

#### 普通变量拦截

不管是 `Object.defineProperty()` 还是 `Proxy()`，拦截的都是对象，所以通过这两种方式来拦截普通变量肯定行不通，但我们可以包装它，从而实现拦截。最简单的方式便是对象的特性“存取器”。

```javascript
let a = 3
const b = {
  get value() {
     return a
  },
  set value(val) {
     a = val
  }
}
```

这块儿的实现便是 `Ref.ts`

### 普通对象的拦截

这在 Vue2.0 中已经实现过了，用的 ES5 的 `Object.defineProperty`。直接拿来用就行了。  

> A:  等等，不能用！！  
> B: 为什么？  
>A: Object.defineProperty 在拦截对象时，需要遍历其 key 值。如果对象层级深，还要递归的遍历。
```javascript
Object.keys(obj).forEach((key) => {
  Object.defineProperty(obj, key, handlers)
})
```
>A： 它还拦截不了数组的方法，想拦截还得做 hack，包装 push\pop......操作。  
>B: 那咋整  
>A: Proxy 呀，以上问题它都能迎刃而解，具体我们不是在往期文章分析过了么。这里就不赘述了。

### 集合的拦截

`Proxy` 这么牛，集合应该也能拦截呀。不幸的是，集合的各种方法都不能被 Proxy 拦截。
拿 Set 类型举例子。  

```javascript
const sets = new Set([1,2,3])
let p2 = new Proxy(sets, {
  get(target, key ,receiver) {
    return Reflect.get(target, key, receiver)
  },
  add() {}
})
p2.add(6)
```

当你这样调用时，会发现控制台报错了  

`Uncaught TypeError: Method Set.prototype.add called on incompatible receiver [object Object]`

导致这个报错的原因是，在调用 `add` 时，其内部的 `this` 本应该是 `set` 本身，但在此处变为了 `p2`。

那咋整呢，要不，我们自己实现个 add 方法，在 `p2.add` 时，用 `apply`改变 指针。
```typescript
const sets = new Set([1,2,3])
let p2 = new Proxy(sets, {
  get(target, key ,receiver) {
    const fn = Reflect.get(target, key, receiver)
    if(typeof fn === 'function') {
      return (...val) => {
        return target[key].apply(sets, val)
      }
    }
    return fn
  }
})
p2.add(6)
```
真实情况比这要复杂，你需要考虑各种 traps。  

经过以上，目前我们也能拦截到 `collections` 了。

### 计算属性

响应式数据是不够的，如果一个数据的变更引起了一堆复杂的逻辑，我们处理起来就会特别麻烦，计算属性显然是个好选择。  

```javascript
const data = reactive({
  name: 'qqqdu'
})
computed((val) => {
  return data.name + ' hello'
})
```

以上方法有两个场景：  

- 1，初始化时，计算属性的函数参数会被执行一遍
- 2，每次函数内计算属性改变时，函数也会执行一遍。

前者好说，要实现 2，就需要建立起 函数与计算属性的联系。这个联系在什么阶段建立比较好呢，当然是初始化的时候。  

当初始化时，开始调用函数时加锁，运行到 `data.name` 会触发其 `Proxy get`，这说明该函数依赖这个计算属性，那他们之间的联系就建立起来了。当函数生命周期结束时，解锁就可以了。  

那 2，什么时候执行呢，当然是计算属性 `set` 时了，如果值发生了变化，就要遍历执行与之相关的所有计算函数。  

到这里就可以了，带着这个思路再回顾，会清晰不少。

### 结束  

> 源码这种东西吧，越看越觉得自己卑微，向大佬们致敬！  --xiaodu

## 参考文献  
[ecma](https://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects)
https://tc39.es/ecma262/