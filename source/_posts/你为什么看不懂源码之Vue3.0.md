---
title: 你为什么看不懂源码之Vue 3.0
date: 2019/10/09
---
很早之前就想写这一篇  

## 先唠会儿嗑  

记得很早之前，有个人说过，看源码就像武侠小说里的 学习武林秘籍。会耍刀耍剑那是外力，学习武功秘籍才是内力，才能和别人在对波或战前拼气时更升一筹。  
在实际开发中，想象这样一个场景：  

> - 小A：我这儿遇到一个bug，不知道是不是浏览器兼容？也可能是网络问题？会不会是框架问题！  

> - 你：（轻蔑的一瞥），这块儿呀，我之前撸过它的源码，是XX导致了XX，让你这块儿代码产生了XX的影响。（讲完后背着手头也不回的去接杯咖啡。）  

这多装逼呀！  

## 现实总不如意  

读框架的源码的确可以装以上的逼，但......

每当你看源码时，就像初中时听数学课，几分钟前兴致盎然，低头捡根笔，再抬头时已 “物是人非”，源码仿佛变成质能方程，数学老师仿佛变成没有胡子的 爱因斯坦 ？？！  

你看到一个个大V发出来的源码解读文章，为什么别人能看懂？  

你可能会想：是不是我太笨？是不是源码太难懂？是不是我不适合这一行......  

别担心，99%的人和你一样。  

那些大V只告诉你读源码时的过程，却没有告诉你读源码前的准备。  

而我会从读源码的准备阶段讲起。

## 磨刀不误砍柴工  

读源码前，你的基础功一定要扎实。  
比如以下两个方法：  
```typescript
export const isObject = (val: any) =>
  val !== null && typeof val === 'object'
```
```typescript
export const isObject = (val: any) =>
  val !== null && Object.prototype.toString.call(cal) === '[object Object]'
```

同样的函数名，但功能不同，如果你了解 `typeof` 并且了解原型方法 `toString` 以及 `call` 的作用，那你很容易分辨出来这两者的区别和作用。  

当你看源码时，扫一眼函数体，便知道框架作者要做什么。  

你可能会问我，基础功不行怎么看源码？  

emmmm 我的建议是别看了。先磨刀吧。因为你当前阶段提升的最快方法是学习基础知识。

## 预知此事先躬行  

> 小A：我基础功练好了，可以看源码了吧？  

> 我：可以看，也不能看。  

> 小A：你在逗我？  

 不是的，可以看的意思是，我们先大体扫一边源码，这个过程小于 5分钟。看看源码作者用了什么新鲜的api 或老的你没见过的api。  

 现在我们需要把 vue 3.0的源码clone下来，享受这短暂的五分钟。  

 可以看到，vue 3.0 用了大量的  
 
 `Reflect\Proxy\Symbol\Map\Set`  

 你得确保这些api你都了如指掌，如果你做不到了如指掌，也得知道它们分别是干什么的。  
 在这篇文章里我不会给你一一列举它们的功能，我只告诉你读源码前的准备。希望你能自己理解，而不是拾人牙慧。  

 [文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects)

## 要拾人牙慧  

>小A：你上文刚说不要拾人牙慧，这下又要拾人牙慧，你到底要我干什么？  

> 我：上文讲，学习新方法时，要自己探索，照着官方标准自己理解，而这里，要进入源码的阅读了，我们可以站在巨人们的肩膀上，对源码结构稍微有些了解。后面自己阅读时会更容易些.  

>小A：我信你了。  

本文将以Vue数据绑定的核心实现作为例子，所以这一步，需要你在社区找找大V们写好的文章。比如我觉得下面这篇写的不错。  

[Vue3 中的数据侦测
](https://juejin.im/post/5d99be7c6fb9a04e1e7baa34)  

第一步先给文章点个👍，支持下原作者。看文章时，忽略掉你已经知道的知识，比如 proxy 的用法，Reflect 的用法。然后试着手敲一遍文章中的代码demo。  
在这篇文章里你最好自己先实现一遍 Proxy 代理深层对象。  
以下是我写的demo  
```html
<html>
  <div id='array'></div>
  <script>
    const array= document.querySelector('#array')

    const isObject = (val) => val !== null && typeof val === 'object'
    function proxyMethod(obj) {
      let p2 = new Proxy(obj, {
        get(target, key, val) {
          const res = Reflect.get(target, key, val)
          if(isObject(res)) {
            return proxyMethod(res)
          }
          return res
        },
        set(target, key, val, receiver) {
          const res = Reflect.set(target, key, val)
          array.innerHTML = receiver
          console.log('set', receiver)
          return true
        }
      });
      return p2
    }
    let p = {
      arr: [1,2,3],
      c: 2
    }
    let p2 = proxyMethod(p)
    p2.arr.push(8)
    setTimeout(() => {
      p2.arr.push(6)
    }, 1000)
  </script>
</html>
```

将社区的文章看的大概，了解源码的核心功能，则可以进行下一步了。  

## 庖丁解牛  
到目前为止，你知道了源码实现的核心，而其他的就是源码包装核心之后实现功能的代码。举个例子：你现在知道了发动机怎么做，接下来要做的是，装上传动、装上轮胎、装上车架......  
所以接下来你得对代码的全局有个大概的了解，将代码拆开来，你需要知道轮胎在哪儿？车门在哪儿？  

这个过程，我称之为 “架构拆解”，庖丁解牛，你解架构。那如何解呢。先列举下Vue的文件架构。  

这里推荐一个工具，可以在命令行展示文件的树状结构。  
```
brew install tree
tree -L 1

├── compiler-core
├── compiler-dom
├── global.d.ts
├── reactivity
├── runtime-core
├── runtime-dom
├── runtime-test
├── server-renderer
├── shared
├── template-explorer
└── vue
```
接下来逐条对文件夹进行分析。本篇只分析 `reactivity`文件夹。  
```
.
├── README.md
├── __tests__
├── api-extractor.json
├── index.js
├── package.json
└── src
```
有 README 先看 README。  
```
# @vue/reactivity

## Usage Note

This package is inlined into Global & Browser ESM builds of user-facing renderers (e.g. `@vue/runtime-dom`), but also published as a package that can be used standalone. The standalone build should not be used alongside a pre-bundled build of a user-facing renderer, as they will have different internal storage for reactivity connections. A user-facing renderer should re-export all APIs from this package.

For full exposed APIs, see `src/index.ts`. You can also run `yarn build reactivity --types` from repo root, which will generate an API report at `temp/reactivity.api.md`.

## Credits

The implementation of this module is inspired by the following prior art in the JavaScript ecosystem:

- [Meteor Tracker](https://docs.meteor.com/api/tracker.html)
- [nx-js/reactivity-util](https://github.com/nx-js/reactivity-util)
- [salesforce/observable-membrane](https://github.com/salesforce/observable-membrane)

## Caveats

- Built-in objects are not observed except for `Map`, `WeakMap`, `Set` and `WeakSet`.

```
从上段看出来，这个包可以独立使用。至于如何使用，可以看 `index.ts` 文件，前提是，我们了解它导出的每一对象。  

我们再看看 `src` 的结构  

```
.
├── baseHandlers.ts
├── collectionHandlers.ts
├── computed.ts
├── effect.ts
├── index.ts
├── lock.ts
├── operations.ts
├── reactive.ts
└── ref.ts
```
接下来的工作是标注每一个文件的作用。最好能做备注。从 `index.ts` 读起，采用 `深度优先` 的方式。  

接下来我会一行行读，你可以跟随我的脚步......  
## 秘径追踪
>index.ts
```typescript
export { ref, isRef, toRefs, Ref, UnwrapRef } from './ref'
```
先进入 ref 文件看看 ref 方法怎么来的。
>ref.ts  
```typescript
import { track, trigger } from './effect'
import { OperationTypes } from './operations'
import { isObject } from '@vue/shared'
import { reactive } from './reactive'

export const refSymbol = Symbol(__DEV__ ? 'refSymbol' : undefined)

export interface Ref<T> {
  [refSymbol]: true
  value: UnwrapNestedRefs<T>
}

export type UnwrapNestedRefs<T> = T extends Ref<any> ? T : UnwrapRef<T>

const convert = (val: any): any => (isObject(val) ? reactive(val) : val)

export function ref<T>(raw: T): Ref<T> {
  // 如果是对象，则用 reactive 方法 包装 raw
  raw = convert(raw)
  // 返回一个 v 对象，在 取value 值时，调用 track 方法，在存 value 值时，调用 trigger方法
  const v = {
    [refSymbol]: true,
    get value() {
      track(v, OperationTypes.GET, '')
      return raw
    },
    set value(newVal) {
      raw = convert(newVal)
      trigger(v, OperationTypes.SET, '')
    }
  }
  return v as Ref<T>
}
```
可以看到，我们遇到了三个未知函数
- convert 方法里调用了 `reactive` 方法，对ref 的参数进行了包装。
- 在 v 对象中， 取value 值时，调用 track 方法，在存 value 值时，调用 trigger方法  

继续往下走，看看 reactive 方法的内容，*我将我读代码的思路写进了备注里，你可以检索 MARK1 - MARK10 来逐行看思路。*
reactive.ts
```typescript
import { isObject, toTypeString } from '@vue/shared'
import { mutableHandlers, readonlyHandlers } from './baseHandlers'

import {
  mutableCollectionHandlers,
  readonlyCollectionHandlers
} from './collectionHandlers'

import { UnwrapNestedRefs } from './ref'
import { ReactiveEffect } from './effect'
// WeakMap 主要是用来储存 {target -> key -> dep} 的链接，它更像是 依赖 Dep 的类，它包含了一组 Set，但我们只是简单的储存它们，以减少内存消耗
export type Dep = Set<ReactiveEffect>
export type KeyToDepMap = Map<string | symbol, Dep>
export const targetMap = new WeakMap<any, KeyToDepMap>()

// WeakMaps that store {raw <-> observed} pairs.
const rawToReactive = new WeakMap<any, any>()
const reactiveToRaw = new WeakMap<any, any>()
const rawToReadonly = new WeakMap<any, any>()
const readonlyToRaw = new WeakMap<any, any>()

// WeakSets for values that are marked readonly or non-reactive during
// observable creation.
const readonlyValues = new WeakSet<any>()
const nonReactiveValues = new WeakSet<any>()

const collectionTypes = new Set<Function>([Set, Map, WeakMap, WeakSet])
const observableValueRE = /^\[object (?:Object|Array|Map|Set|WeakMap|WeakSet)\]$/
// MARK9: ->进去看
const canObserve = (value: any): boolean => {
  return (
    // 不是vue 对象
    !value._isVue &&
    // 不是 vNode
    !value._isVNode &&
    // 白名单： Object|Array|Map|Set|WeakMap|WeakSet
    observableValueRE.test(toTypeString(value)) &&
    // 没有代理过的
    !nonReactiveValues.has(value)
  )
}

export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  // MARK1: 如果target 只读，则返回它
  if (readonlyToRaw.has(target)) {
    return target
  }
  // MARK2: 如果target被用户设置为只读，则让它只读，并返回
  if (readonlyValues.has(target)) {
    return readonly(target)
  }
  // MARK3: 貌似到重点了
  return createReactiveObject(
    target,
    // MARK3: 底下这一堆是 weakMap，先不管它们
    rawToReactive,
    reactiveToRaw,
    mutableHandlers,
    mutableCollectionHandlers
  )
}

export function readonly<T extends object>(
  target: T
): Readonly<UnwrapNestedRefs<T>>
export function readonly(target: object) {
  // value is a mutable observable, retrieve its original and return
  // a readonly version.
  if (reactiveToRaw.has(target)) {
    target = reactiveToRaw.get(target)
  }
  return createReactiveObject(
    target,
    rawToReadonly,
    readonlyToRaw,
    readonlyHandlers,
    readonlyCollectionHandlers
  )
}

function createReactiveObject(
  target: any,
  toProxy: WeakMap<any, any>,
  toRaw: WeakMap<any, any>,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  // MARK4: 很明显，这里只 typeof判断，Array Date之类的也能通过
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // MARK5: 已经代理过的对象，不需要在代理
  let observed = toProxy.get(target)
  // MARK6: 这里用 void 0代替了undfined，防止 undfined 被重写。get 到新姿势了。
  if (observed !== void 0) {
    return observed
  }
  // MARK7: 目标本身就是一个 proxy 对象
  if (toRaw.has(target)) {
    return target
  }
  // MARK8: 只有加入白名单的对象才能被代理
  if (!canObserve(target)) {
    return target
  }
  // MARK10: collectionTypes 可以看到是一个Set结构，放了几个构造函数：[Set, Map, WeakMap, WeakSet]，这个三目表达式就是区分了以上四种对象和其他对象的 handlers，我们先从 baseHandlers 看起
  const handlers = collectionTypes.has(target.constructor)
    ? collectionHandlers
    : baseHandlers
  observed = new Proxy(target, handlers)
  // 以下则是存储下已经代理过的对象，以作优化。
  toProxy.set(target, observed)
  toRaw.set(observed, target)
  if (!targetMap.has(target)) {
    targetMap.set(target, new Map())
  }
  // 返回代理后的对象
  return observed
}

export function isReactive(value: any): boolean {
  return reactiveToRaw.has(value) || readonlyToRaw.has(value)
}

export function isReadonly(value: any): boolean {
  return readonlyToRaw.has(value)
}

export function toRaw<T>(observed: T): T {
  return reactiveToRaw.get(observed) || readonlyToRaw.get(observed) || observed
}

export function markReadonly<T>(value: T): T {
  readonlyValues.add(value)
  return value
}

export function markNonReactive<T>(value: T): T {
  nonReactiveValues.add(value)
  return value
}

```
reactive.ts 终于完了，接下来我们从 上文的 MARK10 进入 到 `handler.ts` 中，老规矩，这里的代码思路从 MARK11 开始。  
```javascript
import { reactive, readonly, toRaw } from './reactive'
import { OperationTypes } from './operations'
import { track, trigger } from './effect'
import { LOCKED } from './lock'
import { isObject, hasOwn } from '@vue/shared'
import { isRef } from './ref'

const builtInSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(key => (Symbol as any)[key])
    .filter(value => typeof value === 'symbol')
)

function createGetter(isReadonly: boolean) {
  return function get(target: any, key: string | symbol, receiver: any) {
    const res = Reflect.get(target, key, receiver)
    //MARK13: 防止key为Symbol的内置对象，比如 Symbol.iterator
    if (typeof key === 'symbol' && builtInSymbols.has(key)) {
      return res
    }
    //MARK14: 从上文知道，被ref 包装过，则返回
    if (isRef(res)) {
      return res.value
    }
    // 这里貌似是依赖收集的，暂且不深入
    track(target, OperationTypes.GET, key)
    // MARK15 对深层对象再次包装
    // res 是深层对象，如果它不是只读对象，则调用 reactive 继续代理，上文自己实现过，这里很好理解
    return isObject(res)
      ? isReadonly
        ? // need to lazy access readonly and reactive here to avoid
          // circular dependency
          readonly(res)
        : reactive(res)
      : res
  }
}

function set(
  target: any,
  key: string | symbol,
  value: any,
  receiver: any
): boolean {
  // MARK16 优化：之前有存过，直接拿就行了
  value = toRaw(value)
  // MARK17 key 是否为 taget 的属性，
  /**
   * 
   * export const hasOwn = (
        val: object,
        key: string | symbol
      ): key is keyof typeof val => hasOwnProperty.call(val, key)

      这个方法是解决 数组push时，会调用两次 set 的情况，比如 arr.push(1)
      第一次set，在数组尾部添加1
      第二次set，给数组添加length属性
      hasOwnProperty 方法用来判断目标对象是否含有指定属性。数组本身就有length的属性，所以这里是 true
   */
  const hadKey = hasOwn(target, key)
  const oldValue = target[key]
  /**
   * MARK18 如果 value 不是响应式数据，则需要将其赋值给 oldValue
   */
  if (isRef(oldValue) && !isRef(value)) {
    //MARK19 这将触发 oldValue 的 set value 方法，如果 isObject(value) ，则会经过 reactive 再包装一次，将其变成响应式数据
    oldValue.value = value
    return true
  }
  const result = Reflect.set(target, key, value, receiver)
  // MARK20 target 如果只读 或者 存在于 reactiveToRaw 则不进入条件，reactiveToRaw 储存着代理后的对象
  if (target === toRaw(receiver)) {
    /* istanbul ignore else */
    if (__DEV__) {
      const extraInfo = { oldValue, newValue: value }
      if (!hadKey) {
        trigger(target, OperationTypes.ADD, key, extraInfo)
      } else if (value !== oldValue) {
        trigger(target, OperationTypes.SET, key, extraInfo)
      }
    // MARK21 只看生产环境
    } else {
      //MARK22 属性新增，触发 ADD 枚举
      if (!hadKey) {
        trigger(target, OperationTypes.ADD, key)
      } else if (value !== oldValue) {
        //MARK23 属性修改，触发 SET 枚举
        trigger(target, OperationTypes.SET, key)
      }
    } 
    /** MARK24 对应 MARK17
     * else {}
     */
  }
  return result
}

function deleteProperty(target: any, key: string | symbol): boolean {
  const hadKey = hasOwn(target, key)
  const oldValue = target[key]
  const result = Reflect.deleteProperty(target, key)
  if (hadKey) {
    /* istanbul ignore else */
    if (__DEV__) {
      trigger(target, OperationTypes.DELETE, key, { oldValue })
    } else {
      trigger(target, OperationTypes.DELETE, key)
    }
  }
  return result
}

function has(target: any, key: string | symbol): boolean {
  const result = Reflect.has(target, key)
  track(target, OperationTypes.HAS, key)
  return result
}

function ownKeys(target: any): (string | number | symbol)[] {
  track(target, OperationTypes.ITERATE)
  return Reflect.ownKeys(target)
}

export const mutableHandlers: ProxyHandler<any> = {
  get: createGetter(false),
  set,
  deleteProperty,
  has,
  ownKeys
}
// MARK11 入口函数
export const readonlyHandlers: ProxyHandler<any> = {
  // MARK12: 创建 getter
  get: createGetter(true),
// MARK12: 创建 setter
  set(target: any, key: string | symbol, value: any, receiver: any): boolean {
    if (LOCKED) {
      if (__DEV__) {
        console.warn(
          `Set operation on key "${String(key)}" failed: target is readonly.`,
          target
        )
      }
      return true
    } else {
      return set(target, key, value, receiver)
    }
  },

  deleteProperty(target: any, key: string | symbol): boolean {
    if (LOCKED) {
      if (__DEV__) {
        console.warn(
          `Delete operation on key "${String(
            key
          )}" failed: target is readonly.`,
          target
        )
      }
      return true
    } else {
      return deleteProperty(target, key)
    }
  },

  has,
  ownKeys
}


```
## 未完待续
到此为止，你对代码整体有了模糊的理解，但还有些棱角不清晰，比如：
- MARK4 那一连串 `WeakMap` 是干啥的？
- MARK10 下面为什么 set 了多次？  
......  
在后面的文章中，我会逐条分析。读懂源码是个漫长的过程，未完待续......