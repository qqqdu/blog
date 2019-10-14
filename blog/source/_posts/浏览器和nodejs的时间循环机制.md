---
title: nodejs 事件循环机制与浏览器的区别
---
区别大了

## 文档

尽管大多数情况它们表现相同，但浏览器的事件循环机制是基于 html5 标准的，nodejs是基于 `libuv` 的，所以这二者肯定是不同的。  

[nodejs](http://nodejs.cn/api/n-api.html#n-api_n_api_libuv_event_loop)  
[html](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

## 浏览器的事件循环

浏览器的事件循环相比 node 而言，简单多了，他将任务分为宏任务和微任务

- macro-task（宏任务） 比如： setTimeout、setInterval、script（整体代码）、 I/O 操作、UI 渲染等
- micro-task （微任务）比如: Promise、  MutationObserver 等。  

> 从 macro-task队列中(task queue)取一个宏任务执行, 执行完后, 取出所有的 micro-task 执行。macro-task 出栈是一个个出的，micro-task 是一组一组出的

## node 事件循环

node 启动后，就会按以下顺序执行，直到有异步事件触发，再次进入新的循环。（以下其实就是`libuv`的执行阶段） 

```
   ┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │ idle, prepare         │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │    check(setImmediate)│
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘
```

Timers(计时器)：  

> 这里执行 setTimeout 和 setInterval 定时器的回调,如果到这一步，参数时间到了，会直接执行。并且`它们的参数是有下限时间的，[1, 2147483647]，就算你设置了 0，也会修正为 1`.

I/O回调：
>一般处理由系统或者网络错误抛出的异常回调函数,比如 TCP Error  

idle, prepare:  

> nodejs 内部函数调用。不需要讨论  
poll 维护着一个队列，这个队列存储着除了 `Timer\setImmediate\close` 之外的异步回调函数，当异步函数完成时，poll 负责执行 callback。
以下是poll(轮询阶段，很关键)的流程,我用伪代码表现流程：  


```
if(poll队列不为空) {
  事件循环先遍历队列并同步执行回调，直到队列清空或执行回调数达到系统上限。
} else {
  if(代码已经被setImmediate()设定了回调) {
    直接结束poll阶段进入check阶段来执行check队列里的回调
  } else if(如果有被设定的timers) {
    如果有一个或多个timers下限时间已经到达，那么事件循环将绕回timers阶段，并执行timers的有效回调队列。
  } else {
    事件循环会阻塞poll阶段等待回调被加入poll队列。
  }
}
```

这句话多看几遍，`事件循环会阻塞在poll阶段等待回调被加入poll队列。`

close callbacks  
> 执行各种 close 回调比如  

```javascript
p.on('close', function (code) {
  console.log('子进程已退出，退出码 '+code);
});
```

### 实例

```javascript
setTimeout(() => {
    console.log('setTimeout');
}, 0);
setImmediate(() => {
    console.log('setImmediate');
})
```

在node 中，这两者的执行顺序是随机的(多运行几次)。首先，上面讲到，setTimeout 的参数会被修正为 1。当 setTimeout 先打印时，我们模拟一遍流程。  

- 当前进程性能突然变低，等 timeout 执行的时候，时间已经大于等于1了，直接执行回调。timer...... -> poll -> setImmediate 

如果执行那一刻进程性能高一点，从 Timers(不执行) -> poll，此时，poll 队列为空，有 setImmediate,进入 check 阶段 -> callbacks -> Timers -> ...... -> poll -> 执行 Timer  

### process 和 Promise  

> process.nextTick()不在以上流程中，它会在主逻辑的末尾任务队列调用之前调用。也在 当前事件循环的最后，下次事件循环之前调用。

怎么理解这句话呢，改造下上面的 demo  

```javascript
setTimeout(() => {
    console.log('setTimeout');
}, 0);
setImmediate(() => {
    console.log('setImmediate');
})
process.nextTick(() => {
  console.log('nextTick');
})
```

你会发现，再也不随机了。结果是  

```
nextTick
setTimeout
setImmediate
```

这个时候，运行顺序就是： 主流程 -> nextTick -> Timer -> setImmediate  
process.nextTick 让事件循环延迟了一小会儿，所以 timeout 的时间总是大于 1 了。
Promise 和 process.nextTick 的执行阶段是一样的，但它比后者优先级低。
### 验证下你真的懂了吗  

```javascript
console.log(1);
setTimeout(() => console.log('setTimeout=> 1'),0);
process.nextTick(() => console.log('nextTick=> 1'));
console.log(2);
setTimeout(() => console.log('setTimeout=> 2'),0);
process.nextTick(() => {
    console.log('nextTick=> 2');
    for (let i = 0; i < 10000222200; i++) {}
});
console.log(3);
process.nextTick(() => console.log('nextTick=> 3'));
setTimeout(() => console.log('setTimeout=> 3'),0);
console.log(4);
setTimeout(() => console.log('setTimeout=> 4'),0);
process.nextTick(() => console.log('nextTick=> 4'));
console.log(5);

for (let i = 0; i < 10000222200; i++) {}
```

## 总结  

这二者表现大多数情况是相同的，但其原理，区别大了。

## 参考  

[nodejs 事件循环](http://nodejs.cn/api/n-api.html#n-api_n_api_libuv_event_loop)  
[html5 事件循环](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)  
[node 事件循环机制](https://segmentfault.com/a/1190000013102056?utm_source=tag-newest)
