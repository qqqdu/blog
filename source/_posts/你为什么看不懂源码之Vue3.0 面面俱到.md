---
title: 你为什么看不懂源码之Vue 3.0 面面俱到
date: 2019/10/10
---
距离上一篇结束已经过去了整整24小时  

## 先唠会儿嗑
这篇主要讲，如何让测试用例跑起来，并且辅助我们解决看不懂的地方。  
## 是骡子是马，牵出来溜溜
熟悉一个源码/工具的方法就是让它跑起来，更快速的熟悉一个源码/工具的方法就是让它的测试用例跑起来。  
先到根目录安装下包
`npm i`  

再运行下 `reactive` 的测试用例  
`jest packages/reactivity/__tests__/reactive.spec.ts`  

命令行输出了让人赏心悦目的结果。  

```
 PASS  packages/reactivity/__tests__/reactive.spec.ts
  reactivity/reactive
    ✓ Object (6ms)
    ✓ Array (1ms)
    ✓ cloned reactive Array should point to observed values (1ms)
    ✓ nested reactives (5ms)
    ✓ observed value should proxy mutations to original (Object) (1ms)
    ✓ observed value should proxy mutations to original (Array) (1ms)
    ✓ setting a property with an unobserved value should wrap with reactive
    ✓ observing already observed value should return same Proxy (1ms)
    ✓ observing the same value multiple times should return same Proxy
    ✓ should not pollute original object with Proxies
    ✓ unwrap (1ms)
    ✓ non-observable values (1ms)
    ✓ markNonReactive (1ms)
```
## 包罗万象

为什么要从测试用例看源码呢，因为它就像我们的产品经理，它会告诉我们输入什么，预期什么。它会考虑边界情况，基本上源码难懂的地方都是边界情况，所以这个阶段，我们可以跑用例来理解。

为了支持单个测试用例运行，在 Vscode 商店中安装
`Jest-Runner` 插件，这个插件可以让我们更简单的运行用例和调试。以下是它的用法。  

![](https://raw.githubusercontent.com/firsttris/vscode-jest-runner/master/public/vscode-jest.gif)

我们先选一个测试用例，花几分钟，看看jest的基本用法。  
这里我选择了 `reactive.spec.js` 用例文件。  

```typescript
import { reactive, isReactive
  , toRaw, markNonReactive 
} from '../src/reactive'
import { mockWarn } from '@vue/runtime-test'
test('Object', () => {
  const original = { foo: 1 }
  // 用 reactive 包装 original，original变成了响应式数据
  const observed = reactive(original)
  // 这句很明显了吧，observed 不等于 original
  expect(observed).not.toBe(original)
  // observed 是响应式数据
  expect(isReactive(observed)).toBe(true)
  // original 不是响应式数据
  expect(isReactive(original)).toBe(false)
  // 通过响应数据 observed 拿到的值与原数据相等
  expect(observed.foo).toBe(1)
  // foo 这个key 值，存在于 observed 中
  expect('foo' in observed).toBe(true)
  // observed 的健集合与原数据相等，toEqual 是深度比较，它会比较值，而非地址
  expect(Object.keys(observed)).toEqual(['foo'])
})
```
读懂 Jest 语法就和读懂白话文的难度一样吧。你可以看到 test 的第一个参数是语义化的，基本上能通过这个参数，猜出每个用例想干什么，我们将 `reactive.spec.js`中的参数 列举出来。  


- Object
- Array
- cloned reactive Array should point to observed values
- nested reactives  
- observed value should proxy mutations to original (Object)
- observed value should proxy mutations to original (Array)
- setting a property with an unobserved value should wrap with reactive
- observing already observed value should return same Proxy
- observing the same value multiple times should return same Proxy
- should not pollute original object with Proxies
- unwrap
- non-observable values
- markNonReactive  

到此为止，接下来我们再跳入代码中，寻找上个文章中留下的问题。
## 优化！优化！还是TMD优化！  
> `在 reactive.ts` 中的 `createReactiveObject` 方法里，为什么要 `set` 两次 `
  toProxy.set(target, observed)
  toRaw.set(observed, target)`  

首先看这两个对象是如何消耗的。  
```
// target already has corresponding Proxy
  let observed = toProxy.get(target)
  if (observed !== void 0) {
    return observed
  }
  // target is already a Proxy
  if (toRaw.has(target)) {
    return target
  }
```
很明显，这两个`Set`是用来优化代码用的，当 target 存在于时，返回即可。不同的是 toProxy 的key值为 target，toRaw 的 key 值 为 observed。  

大胆猜测下，假如 createReactiveObject 运行了两次，第二次的 target 恰好是 第一次包装后的 observed。  

如果是以上情况，那测试用例肯定存在这种情况。稍微看一眼就是这个case： `observing already observed value should return same Proxy`  
```typescript
test('observing already observed value should return same Proxy', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    const observed2 = reactive(observed)
    expect(observed2).toBe(observed)
  })
```
该用例将包装好的 observed 再次作为参数传给了 reactive。
我们把断点打上。验证猜想。  
当 reactive 运行第二次，到 toRaw 判断语句的时候便返回了。
![](https://user-gold-cdn.xitu.io/2019/10/11/16db898d631f1948?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)  
到这里，为什么 reactive 内部会 set 两次的原因已经清晰了：为了优化包装后的对象再次被传入的情况，防止多次proxy。  
以上，是通过测试用例分析的过程。我们再看看其他用例。  

## 令人困扰的 Ref  

上一篇我们是从 `Ref` 开始阅读源码的，只是大体顺了下来，知道了 `Ref` 对象是怎么创建的，以及它的 `get`、`set` 过程。之后，我们看到 `reactive.ts`，知道它是响应式的核心，并且实现了一个简单的demo，那 `Ref` 存在的意义是什么？  

相信我，此时此刻我和你一样困惑。让我们打开 `ref.spec.ts` 测试用例看看他会告诉我们什么。  
```typescript
it('should hold a value', () => {
  const a = ref(1)
  expect(a.value).toBe(1)
  a.value = 2
  expect(a.value).toBe(2)
})
```
第一个测试用例就给 ref 传入一个基本类型`number`。那就该想到，`reactive` 传入基本类型会怎么样？  
让我们试试！在 `reactive.ts` 编写对应测试用例。  
![](https://user-gold-cdn.xitu.io/2019/10/11/16db898d64577081?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
Typescript 的优势体现出来了，入参只支持对象，不支持基本类型！
`reactive.ts` 核心api 是 Proxy，Proxy 的传参只能是对象。如果传基本类型的话，会console  

`
Cannot create proxy with a non-object as target or handler
    at proxyMethod
`  
所以，ref 是为了使基本类型也能成为响应式数据存在的，让我们回到第一个测试用例: `should hold a value`  
```typescript
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
如果 ref 入参是基本类型的话，这个函数就很容易看懂了，返回值是一个被包装过的对象。这个对象在 `get` 时调用 `track` 方法，在 `set`时，调用 `trigger` 方法走更新 `view` 层逻辑。因此它是通过这种方式，实现基本类型的数据绑定的。

为了对 ref 有更详细的认识，我们需要更复杂的的用例。  

我截取了一部分 `toRefs` 的用例，这部分代码不依赖其他模块。  
```typescript
test('toRefs', () => {
    const a = reactive({
      x: 1,
      y: 2
    })

    const { x, y } = toRefs(a)

    expect(isRef(x)).toBe(true)
    expect(isRef(y)).toBe(true)
    expect(x.value).toBe(1)
    expect(y.value).toBe(2)

    // source -> proxy
    a.x = 2
    a.y = 3
    expect(x.value).toBe(2)
    expect(y.value).toBe(3)

    // proxy -> source
    x.value = 3
    y.value = 4
    expect(a.x).toBe(3)
    expect(a.y).toBe(4)
}
```
可以看到，这个用例是来测试 toRefs 方法的。  
如果用例没有 `toRefs(a)`，而是 
```typescript
  const { x, y } = reactive({
    x: 1,
    y: 2
  })
```
毫无疑问，`x` 和 `y` 不是响应式的，二者都是基本类型。我们期望它是响应式数据，所以需要转化成 Ref 对象。视线再转回 `ref.ts`
```typescript

export function toRefs<T extends object>(
  object: T
): { [K in keyof T]: Ref<T[K]> } {
  const ret: any = {}
  for (const key in object) {
    ret[key] = toProxyRef(object, key)
  }
  return ret
}

function toProxyRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): Ref<T[K]> {
  return {
    [refSymbol]: true,
    get value(): any {
      return object[key]
    },
    set value(newVal) {
      object[key] = newVal
    }
  }
}
```
奇怪，前面的 `toRefs` 可以看懂，遍历了 object，并用 `toProxyRef` 包装后重新赋值。 但 `toProxyRef` 内部，仅仅用 `get` `set` 包装下，没有我们可爱的 `trigger` 和 `track`，这是为什么的？  

因为 object 本身就是响应式数据。   

其实这里只需要用存取器包装成对象，让基本类型变为引用类型，当执行 `expect(x.value).toBe(1)` 时，会调用 `object[key]`，所以它也会触发 object 的 `get` 方法。  

同样的，当执行 `x.value = 3` 语句时，会调用 `set` 方法，执行 `object[key] = newVal` 后也会触发 object 的 `set` 方法。  


> 其实 `toRefs` 解决的问题就是，开发者在函数中错误的解构 reactive，来返回基本类型。  `const { x, y } = = reactive({ x: 1, y: 2 })`，这样会使 `x`, `y` 失去响应式，于是官方提出了 `toRefs` 方案，在函数返回时，将 `reactive` 转为 refs，来避免这种情况。  

## 到此为止  
如果我们接着探究的话，不得不涉及到其他模块，比如 `computed` `effect`......, 而这块儿又有些庞大，只能后续更新，所以 `ref` 和 `reactive` 部分探究到此为止。

## 未完待续  

> vue-next 的源码正在不断更新中，小伙伴们在看源码的过程中，要时不时pull一下，防止源码版本滞后呦......

从单测看起的灵感来自： [Vue3响应式系统源码解析(上)](https://juejin.im/post/5d9c9a135188252e097569bd)，老规矩，先点赞。

我会持续更新，敬请关注。😁 (千万别关注我呦)