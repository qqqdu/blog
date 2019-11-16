---
title: 你为什么看不懂源码之Vue 3.0 釜底抽薪
---
距离上一篇已经过去了好久......  

## 先唠会儿嗑

之前在看 reactive 和 ref 时，总有两团黑雾笼罩着我们，一团是  `track`,一团是 `trigger`。  

二者都来自同一个文件，`effect.ts`。  

在 响应式数据 `get` 时，`track(target, OperationTypes.GET, key)`  

在 `set` 时 `trigger(target, OperationTypes.SET, key, extraInfo)`。  

不扯淡了，往下看吧

## 从 effect 看起

接下来看 `ref.spec.ts` 中的一条用例 (ref 的流程比较简单，容易理解)

```typescript
it('should be reactive', () => {
    const a = ref(1)
    let dummy
    // 副作用包装下
    effect(() => {
      dummy = a.value
    })
    expect(dummy).toBe(1)
    a.value = 2
    expect(dummy).toBe(2)
  })
```

effect 接受一个函数，函数返回 dummy 变量，dummy 是响应式对象 a 的值。当改变了 a 的值时，dummy 也 重新计算了遍！  

这不就是 TMD 计算属性吗！接着往下看。  

首先，需要你人肉调试一遍，顺着 `effect` 函数的轨迹打上备注。  

```typescript
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  // 当然进不去
  if (isEffect(fn)) {
    fn = fn.raw
  }
  // 接下来去 `createReactiveEffect` 里面
  const effect = createReactiveEffect(fn, options)
  // lazy 是false，这里肯定会运行
  if (!options.lazy) {
    effect()
  }
  return effect
}

function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  // 又用 reactiveEffect 包装了一层，进去看看
  const effect = function reactiveEffect(...args: any[]): any {
    return run(effect, fn, args)
  } as ReactiveEffect
  // 这里就是一堆参数
  effect[effectSymbol] = true
  effect.active = true
  effect.raw = fn
  effect.scheduler = options.scheduler
  effect.onTrack = options.onTrack
  effect.onTrigger = options.onTrigger
  effect.onStop = options.onStop
  effect.computed = options.computed
  effect.deps = []
  // 返回的effect 函数会被 执行掉
  return effect
}
```

接下来到 `run` 函数了，这里用了一个巧妙的方法，我们单拿出来  

```typescript
function run(effect: ReactiveEffect, fn: Function, args: any[]): any {
  // 这里默认进不去
  if (!effect.active) {
    return fn(...args)
  }
  // 这里进去，刚开始肯定是 -1
  if (activeReactiveEffectStack.indexOf(effect) === -1) {
    // clear 操作，暂时不关心
    cleanup(effect)
    try {
      activeReactiveEffectStack.push(effect)
      // 这里执行后，返回结果，fn 就是计算函数
      return fn(...args)
    } finally {
      activeReactiveEffectStack.pop()
    }
  }
}
```

后面的 `try...finally`执行顺序换种写法是这样的。

```typescript
activeReactiveEffectStack.push(effect)
const res = fn(...args)
activeReactiveEffectStack.pop()
return res
```

为什么要`try finally`呢？
> 我想因为 `fn(...args)` 是用户写的函数。  它有可能报错，即使它报错了，也应该被 activeReactiveEffectStack.pop，一是 影响性能，二是 activeReactiveEffectStack 在 track 时，负责绑定 target 和 effect。

继续往下看, `fn(...args)` 是 测试用例里的  

```typescript
() => {
  dummy = a.value
}
```

当执行 a.value 时会发生什么？当然是 ref 内部的 `get` 流程，而这个流程是会触发，`track(v, OperationTypes.GET, '')`

终于进入 `track` 时间  

## 相恨见晚的 `track`

```typescript
// ref.ts
track(v, OperationTypes.GET, '')

// effect.ts
export function track(
  target: any,
  type: OperationTypes,
  key?: string | symbol
) {
  // 默认 true
  if (!shouldTrack) {
    return
  }
  // 这时是有值的，在 try finally 流程中存入的
  const effect = activeReactiveEffectStack[activeReactiveEffectStack.length - 1]
  if (effect) {
    if (type === OperationTypes.ITERATE) {
      key = ITERATE_KEY
    }
    let depsMap = targetMap.get(target)
    if (depsMap === void 0) {
      // targetMap 存入 key 为 ref 的 空 Map 对象。
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key!)
    if (dep === void 0) {
      // depsMap 存入 key  为 '' 的 空 Set 对象
      depsMap.set(key!, (dep = new Set()))
    }
    if (!dep.has(effect)) {
      // dep 存入 effect
      dep.add(effect)
      // dep 入栈
      effect.deps.push(dep)
      if (__DEV__ && effect.onTrack) {
        effect.onTrack({
          effect,
          target,
          type,
          key
        })
      }
    }
  }
}
```

`track` 函数在对象被 set 时调用，它只进行了“记录”，记录的值有什么用呢？应该在 `trigger` 时会用到。  

当前我们最好能记一下 `track` 影响了哪些值。  

- 全局的 targetMap，key 为 包装的 响应式对象的 `target`，值为 effect 对象  
- effect对象的 `deps` 数组存了 `effect`，后面应该会有用到。

## `trigger`

继续往下走，

```typescript
it('should be reactive', () => {
  const a = ref(1)
  let dummy
  // 副作用包装下
  effect(() => {
    dummy = a.value
  })
  expect(dummy).toBe(1)
  a.value = 2
  expect(dummy).toBe(2)
})
```

当 `a.value = 2` 时，肯定会调用 ref 对象的 set 方法，
这个时候就走 `trigger` 流程了:  `trigger(v, OperationTypes.SET, '')`

```typescript
export function trigger(
  target: any,
  type: OperationTypes,
  key?: string | symbol,
  extraInfo?: any
) {
  // 还记得吗，前面 set 过了
  const depsMap = targetMap.get(target)
  if (depsMap === void 0) {
    // never been tracked
    return
  }
  const effects = new Set<ReactiveEffect>()
  const computedRunners = new Set<ReactiveEffect>()
  if (type === OperationTypes.CLEAR) {
    // collection being cleared, trigger all effects for target
    depsMap.forEach(dep => {
      addRunners(effects, computedRunners, dep)
    })
  } else {
    // schedule runs for SET | ADD | DELETE
    //addRunners 主要给 computedRunners 和 effects 添加值
    if (key !== void 0) {
      addRunners(effects, computedRunners, depsMap.get(key))
    }
    // also run for iteration key on ADD | DELETE
    // 这里为 数组 和 delete 服务，暂时不讨论
    if (type === OperationTypes.ADD || type === OperationTypes.DELETE) {
      const iterationKey = Array.isArray(target) ? 'length' : ITERATE_KEY
      addRunners(effects, computedRunners, depsMap.get(iterationKey))
    }
  }
  const run = (effect: ReactiveEffect) => {
    scheduleRun(effect, target, type, key, extraInfo)
  }
  // 遍历执行effect 函数，computedRunners 为 计算属性服务，effects 为 单独调用 effect.ts 模块时服务。先谈后者。
  computedRunners.forEach(run)
  effects.forEach(run)
}
      
```

trigger 方法主要从 全局 targetMap 对象中 拿出 target 对应的 effect

这两个函数是重点：`addRunners` 和 `scheduleRun`。  

`addRunners` 将 depsMap 中的 effect 对象赋值给 `effects`，之后遍历 `effects` 执行 `run` 方法 `effects.forEach(run)`  

```typescript
function addRunners(
  effects: Set<ReactiveEffect>,
  computedRunners: Set<ReactiveEffect>,
  effectsToAdd: Set<ReactiveEffect> | undefined
) {
  if (effectsToAdd !== void 0) {
    effectsToAdd.forEach(effect => {
      if (effect.computed) {
        computedRunners.add(effect)
      } else {
        effects.add(effect)
      }
    })
  }
}

function scheduleRun(
  effect: ReactiveEffect,
  target: any,
  type: OperationTypes,
  key: string | symbol | undefined,
  extraInfo: any
) {
  if (__DEV__ && effect.onTrigger) {
    effect.onTrigger(
      extend(
        {
          effect,
          target,
          key,
          type
        },
        extraInfo
      )
    )
  }
  // 当前用例为 undefined
  if (effect.scheduler !== void 0) {
    effect.scheduler(effect)
  } else {
    effect()
  }
}
```

run 方法 调用了 `scheduleRun` 函数，直接运行了 `effect`，然后会走上文中的 `createReactiveEffect` 方法中的 `effect` 函数，直至再次触发以下函数，从而改变 dummy的值。

```typescript
effect(() => {
  dummy = a.value
})
```

简单的 `effect` 流程到这里就结束了。 我将其分为三个阶段：  

> 绑定阶段：effect 函数会包装传入的 方法，将其变成一个 effect 对象，并在绑定阶段的最后执行一遍传入的 方法（初始化）。

> 收集阶段：effect 传入的方法内部，有响应式对象参与了计算，将触发 `get` 操作，会执行 `track` 方法，track 方法的重点是将响应式对象改变的` target` 与 绑定阶段的 `effect` 对象一一对应起来。这两个阶段是同步执行的（`activeReactiveEffectStack` 协调），值会存在全局的 `targetMap`。  

> 触发阶段：当 响应式对象 `set` 时，会触发 `trigger` 方法，它会从 `targetMap` 中拿到 target 对应的 `effects`，并遍历执行。

## 机智的 `computed`

`effect` 就是这样了，但要直接用 `effect` 还是有点蛋疼。 

它默认反回了 `ReactiveEffect` 对象，我要这玩意儿干啥呢，我之前写计算属性，直接返回值就是 计算后的值。而现在：  

``` typescript
let dummy
const obj = reactive({ prop: 'value' })

effect(() => (dummy = obj.prop))
```

每次都要定义一个额外变量 `dummy`，不仅麻烦，还很容易被外界篡改。

所以，终于到了机智的 `computed.ts` 文件，它的代码行数非常之少，八十几行，优秀（废话，核心功能 effect 都实现了。）。  

首先瞅瞅测试用例：  

```typescript
it('should return updated value', () => {
    const value = reactive<{ foo?: number }>({})
    const cValue = computed(() => value.foo)
    expect(cValue.value).toBe(undefined)
    value.foo = 1
    expect(cValue.value).toBe(1)
  })
```

我直接把核心代码贴过来。compmuted 其实就是 对 effect 进一步封装

```typescript
export function computed<T>(
  getterOrOptions: (() => T) | WritableComputedOptions<T>
): any {
  const isReadonly = isFunction(getterOrOptions)
  const getter = isReadonly
    ? (getterOrOptions as (() => T))
    : (getterOrOptions as WritableComputedOptions<T>).get
  // 测试环境会给出 computed 属性不可 set 的提示，正式环境会给一个 空函数
  const setter = isReadonly
    ? __DEV__
      ? () => {
          console.warn('Write operation failed: computed value is readonly')
        }
      : NOOP
    : (getterOrOptions as WritableComputedOptions<T>).set
  // 保证了在 get 时，只执行第一次 runner
  let dirty = true
  let value: T

  const runner = effect(getter, {
    // effect 方法不会立即执行，在 get 时执行
    lazy: true,
    // mark effect as computed so that it gets priority during trigger
    computed: true,
    scheduler: () => {
      dirty = true
    }
  })
  return {
    [refSymbol]: true,
    // 导出了 runner 让 computed 可以被外部暂停
    effect: runner,
    get value() {
      if (dirty) {
        value = runner()
        dirty = false
      }
      // When computed effects are accessed in a parent effect, the parent
      // should track all the dependencies the computed property has tracked.
      // This should also apply for chained computed properties.
      trackChildRun(runner)
      return value
    },
    set value(newValue: T) {
      setter(newValue)
    }
  }
}
```

首先 computed 方法返回了 Ref 对象。  
在 get 时，执行了 effect 方法，执行完毕 dirty 为 false，只有 响应式对象 trigger 后，dirty 才会为 true，在这中间，多次 get 值是一样的(因为响应式数据没有改变时，多次运行 effect 结果是一样的)
在 set 时，正式环境执行空方法，因为 computed 不支持 set。开发环境直接告警。  

> 备注： 按照 computed 参数约束，是可以传入 `WritableComputedOptions` 对象，这样就支持 set 了，具体可参考测试用例：`should support setter`

### 头大 "should work when chained"

这个用例让我读了许久，很容易被绕进去，你最好用个小本本记录流程，然后不断的断点调试，直至清晰。  

```typescript
it('should work when chained', () => {
  const value = reactive({ foo: 0 })
  const c1 = computed(() => value.foo)
  const c2 = computed(() => c1.value + 1)
  // expect(c2.value).toBe(1)
  // expect(c1.value).toBe(0)
  value.foo++
  expect(c2.value).toBe(2)
  // expect(c1.value).toBe(1)
})
```

其实用例在干什么很容易看出来， value 是一个响应式数据， c1作为 计算属性 引用了它，c2 作为计算属性引用了 c1，当 value.foo++ 时，这二者都要更新。c2 为 2， c1 为 1。

我大概描述下整个流程，希望能减轻（增加）你的痛苦。  

> `const value = reactive({ foo: 0 })` -> 创建响应式对象
> `const c1 = computed(() => value.foo)` -> 创建计算属性 -> 包装 effect 对象  
`const c2 = computed(() => c1.value + 1)`  -> 创建计算属性 -> 包装 effect 对象  
`value.foo++` -> 响应式对象 get -> set
`expect(c2.value).toBe(2)` -> c2.value ->  c2 get -> runner -> activeReactiveEffectStack 存入 c2 effect -> 执行 c2 计算函数 -> 执行 c1.value -> c1 get -> runner -> activeReactiveEffectStack 存入 c1 effect -> 执行 c1 计算函数 -> 调用 value 的 get 方法 -> 触发 track -> 绑定 effect 和 deep -> activeReactiveEffectStack 弹出 c1 effect -> **执行 trackChildRun** -> 返回 c1 计算值 -> activeReactiveEffectStack 弹出 c2 -> 返回 c2 计算值  

通过以上步骤，实现了计算属性的链式调用。  

这里重点注意我加粗的地方，`trackChildRun` 是 computed 中的方法。我打上了运行时备注：  

```typescript
// childRunner 是 c1 effect
function trackChildRun(childRunner: ReactiveEffect) {
  // 此时 activeReactiveEffectStack 存在 c2 effect
  const parentRunner =
    activeReactiveEffectStack[activeReactiveEffectStack.length - 1]
  if (parentRunner) {
    for (let i = 0; i < childRunner.deps.length; i++) {
      const dep = childRunner.deps[i]
      // 绑定 dep 和 c2 effect，这里的 dep 对应着全局 targetMap 中的 dep
      if (!dep.has(parentRunner)) {
        dep.add(parentRunner)
        parentRunner.deps.push(dep)
      }
    }
  }
}
```

经过 `trackChildRun` 的处理，响应式数据不仅绑定了 c1 还绑定了 c2，当下次响应式数据变更时，会遍历与其有关的 `dep` ，详见 `effect.ts` 的 `addRunners` 方法

## 未完待续

终于将文章水完了，要是我也能用当下流行的量子波动阅读法来读源码就好了，溜了溜了......