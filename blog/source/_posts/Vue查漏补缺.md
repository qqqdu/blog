---
title: Vue 文档查漏补缺
date: 2019/12/05
---
不能老往前跑，要时不时看会儿地图  

## Vue 文档

工作中用 Vue 比较多，但好像看文档已经是两年前的事情了，有很多边边角角的用法或是不太优雅的写法肯定有遗漏，所以再看一遍，查漏补缺。  

## 避免 `v-for` 和 `v-if` 混合使用  

```html
<div v-for='item in items' v-if='item.active'></div>
```

上面这个写法很常见吧，我也写过不少这样的代码。但文档里说了，不能这样用，原因是 `v-for` 比 `v-if` 优先级高，所以以上模版是这样执行的:  

```javascript
for(item in items) {
  if(item.active) {
    // run something
  }
}
```

乍一看没啥问题，但 items 是响应式的，任意一个数组成员改变了，以上都会执行一遍。  
items 为分两种类型：`active` 和 `unactive`。实际上遍历前者就行了。其余的遍历都是浪费。而且 后者改变了也会遍历。这也是多余的。

```html
<div v-for='item in items'></div>
<script>
  items = items.map(() => {
    return item.active
  })
</script>
```
这样就好多了～

## data 的值必须是函数  

```javascript
data = function(){
  return {
    name: ''
  }
}
```

为什么要这样设计呢？如果组件的 `data` 都是对象的话，组件被调用多次，所有的组件都会共享这个对象。

## Props 描述尽可能详细

```javascript
props = {
  name: {
    type: String,
    required: true,
    default: ''
  }
}
```

详细的 props 就是文档～

## key 字段

```html
<div v-if='flag'>
  <input type='' />
</div>
<div v-else>
  <input type='' />
</div>
```
如果 `flag` 发生变化，`Vue` 只会对 `input` 进行修补，不会重新渲染 `input`，它会尽可能的复用 `DOM`，所以当你在 `input` 键入值时，再切换 `flag`，值依然会存在。  

给他们赋值不同的 `key`，就会避免这种“错误”  

再看下面这个例子
```html
<div v-for='item in items'>
  <input type='' />
</div>
```

当 items 顺序发生变化时，vue 默认不会将节点的顺序调换，因为这比直接删除节点再生成节点的开销大多了。所以再这个 demo 中，Vue 不会复用节点。  

但当子组件的内容过多或者嵌套太深时，复用又很重要了，这时，我们需要加上 `key` ，顺序发生变化时，Vue会复用它。  

## is字段

在下面的例子中，使用 `is="todo-item"` 来代替 `<todo-item>` 的写法，因为 ul 内部只有 li 标签有效，这种写法避免了将 `<todo-item>` 识别为标签潜在的错误。

```html
<ul>
  <li
    is="todo-item"
    v-for="(todo, index) in todos"
    v-bind:key="todo.id"
    v-bind:title="todo.title"
    v-on:remove="todos.splice(index, 1)"
  ></li>
</ul>
```

但以上问题只会在 vue 以 cdn 引入时出现。

## v-modal 修饰符

### .lazy  

在 `input` change 时，才同步，而非 `onInput` 时  

### .number  

自动将用户输入的值转为 number 类型  

### .trim

去除首位字符串  

### 组件也可以用 v-modal  

- props 需要有绑定的值  
- 组件 input 时，需要 $emit('input', event)