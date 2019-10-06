---
title: 我不知道的js
---
整理一些没用过的 api

## Array.flat  
扁平化遍历数组  
```javascript
[23, [4,5], [4, [3, 4, 5]]].flat()
// (5) [23, 4, 5, 4, Array(3)]
[23, [4,5], [4, [3, 4, 5]]].flat(1)
// [23, 4, 5, 4, 3, 4, 5]
```
参数代表了要遍历的深度

## Set结构
类似于数组，但其内部成员是不可重复的，可以用来去重
```javascript
Array.form(new Set([2,3,4,4,4,4]))
// [2,3,4]
```
## http2的多路复用

## React 和 Vue 的 diff 时间复杂度从 O(n^3) 优化到 O(n) ，那么 O(n^3) 和 O(n) 是如何计算出来的？  
## 介绍下前端加密的常见场景和方法  

## vue 在 v-for 时给每项元素绑定事件需要用事件代理吗？为什么

## 介绍下 HTTPS 中间人攻击

## 迭代器 
### 如何让对象支持迭代器 
## Reflect
## Array.prototype.sort 的回调参数
## 使用 JavaScript Proxy 实现简单的数据绑定
## HTTPS 握手过程中，客户端如何验证证书的合法性
## React Vue 原理 diff算法