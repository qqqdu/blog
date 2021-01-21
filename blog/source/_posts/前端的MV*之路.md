---
title: 前端的MV*之路
date: 2019/12/06
---



## 三段经历

> 我是从 16 年接触前端的，当时大二，经常干的事情是写一些简单有趣的交互，比如 打飞机/坦克大战/推箱子之类的。
> 这种东西经常一个脚本写一千多行就实现了。参数传来传去，回调调来调去。快乐极了。

> 17 年去一家古老的棋牌游戏公司做前端实习生，整个组就我一个前端，经常干的事情是写游戏抽奖页面，比如 转盘/抽纸牌之类的
> 交互简单字段少的页面。捧着 [ie tester] 兼容 ie6，页面切来切去，和后端模版套来套取，快乐极了。

> 18 年毕业了，在dxy做前端开发，前后端分离，交互复杂，接口繁多，这才用上了 Vue  全家桶。组件写来写去，请求来请求去，快乐极了。

先总结以下这三段经历，

> 16 年因为需求简单，不存在接口请求，所以代码填鸭在一个文件没什么毛病，当时就是 代码 写一个脚本里，频繁的操作 DOM

> 17 年需求更简单，虽然存在接口请求了，但数据量极其少且基本都在后端，前端仅有的状态基本放在全局，所以大量时间交给了页面切图和兼容。除了 DOM 操作变为 jquery，其余好像没什么变化。

> 18 年接口数量上来了，前后端分离，需要维护的状态多了，异步事件多了，交互复杂了，问题则出现了。接触组件，视图逻辑分离......

我的需求在变化，前端也在不断变化，层出不穷的 MV* 到底是怎么变化的，它们解决了什么样的问题，一直困扰我。

我认为解答以上问题，得逐一了解每个库，看看它们各自解决了什么问题。

## Jquery 工具箱

Jquery 谁不知道呢，丰富的 api，简化 Dom 的操作，它就像一个齐全的工具箱。  
比如下面这个例子。

```html
<html>
  <div id="data"></div>
  <script>
    $.ajax({
      url: '',
      success(res) {
        $('#data').text(res.data)
      }
    })
  </script>
</html>
```

瞬间就实现了从接口到视图的转换。毫无疑问开发简单的 web 页面，用它是最快的。

但当我们的项目变得足够大时，仅仅靠 jquery 就力不从心了，因为它的视图和数据是耦合的。

### DOM 和 数据耦合的问题

```html
<html>
  <body>
    <div id="name"></div>
    <div id="year"></div>
    <input id="input" />
    <button id="submit">submit</button>
  </body>
  <script>
    let data = {
      name: 'qqqdu',
      year: '24'
    }
    $('#name').text(data.name)
    $('#year').text(data.year)
    $('#submit').click(() => {
      // 请求1
      $.ajax({
        url: 'URL1',
        data: {
          val: $('#input').val()
        },
        success(res) {
          $('#name').text(res.data.name)
          $('#year').text(res.data.year)
        }
      })
    })
    // some where...
    // 请求2 也修改了视图
    $('#some ID').click(() => {
      // 请求1
      $.ajax({
        url: 'URL2',
        success(res) {
          $('#name').text(res.data.name)
          $('#year').text(res.data.year)
        }
      })
    })
  </script>
</html>
```

以上的例子，当代码执行时，会给 name 和 year 渲染默认值，当用户输入 input 后，点击了提交按钮，dom 将内容直接传给了请求，更改了后台的数据。然后请求返回，接口数据直接被更新在 dom #name。你一定注意到了，还有个 URL2 的请求，同样修改了 DOM #name。  
假设你在调试这个页面，发现页面的值和请求 URL1 的返回值不同，你就困惑了，你得仔细找找代码里有哪些地方也修改了这个 DOM。如果代码量大，找起来肯定会头炸。  
好的代码结构应该是怎么样的？我想它肯定不会让人困惑：

当你需要找事件绑定时，当你需要找数据在哪儿变更时，当你找视图更新时，你脑海中都应该有明确的方向。

那我们就从这三个方面入手，改造以上代码：

```javascript
let app = {
  model: {
    url: {
      'URL1': 'https//xxx/URL1',
      'URL2': 'https//xxx/URL2'
    },
    data: {
      name: 'qqqdu',
      year: '24'
    },
    setYear: data => {
      this.model.data.year = data
      this.view.renderText(this.model.data)
    },
    setName: data => {
      data = 'MR: ' + fullName
      this.model.data.name = data
      this.view.renderText(this.model.data)
    }
  },
  init() {
    this.setData(this.model.data)
    this.view.bindDom()
  },
  view: {
    bindDom() {
      $('#submit').click(() => {
        this.controller.getURL1($('#input').val())
      })
      $('#some ID').click(() => {
        this.controller.getURL2()
      })
      $('#name').input(this.controller.bindName)
      $('#year').input(this.controller.bindYear)
    },
    renderText(options) {
      $('#name').text(options.name)
      $('#year').text(options.year)
    }
  },
  controller: {
    bindName() {
      // 业务处理
      this.setName({
        name: $(this).val()
      })
    },
    bindYear() {
      this.setData({
        year: $(this).val()
      })
    },
    getURL1(data) {
      // 请求1
      $.ajax({
        url: this.model.url.URL1,
        data: {
          val: data
        },
        success: res => {
          // 业务逻辑
          ...
          this.setYear(res.data)
        }
      })
    },
    getURL2() {
      // 请求2
      $.ajax({
        url: this.model.url.URL2,
        success: res => {
          // 业务逻辑
          ...
          this.setData(res.data)
        }
      })
    }
  }
}
```

经过这样的改造，看起来清晰多了：

- 视图内所有的数据都来自于 app.data，引起数据变更的都在 controller 内，
- 所有与 DOM 渲染相关的，都在 View 内
- 所有与事件绑定相关的，都在 View 层，并且事件回调转给 controller 处理。

到这一步你就知道我想说什么了。因为维护的数据过多，需要修改的 Dom 变多，二者耦合在一起难以维护和后期开发。  
因此我们一般会将二者分层，加入中间层 controller 来给二者解耦。

这便是我们常说的 MVC 模式。

### 前端 MVC  

> 我们都知道 前端 MVC 是参考了后端 MVC 的实现。但因为前端业务场景和后端有差别，所以在实现时，也有差别。比如传统的后端 MVC，View 和 Model 层是不会有交互的，它们完全由 controller 完成交互，常常会引发 controller 臃肿问题。  
不同的公司、不同的团队对于 臃肿 的处理方式也各不相同。比如我问了我们的后端：controller 又被分出来一个 service 层，用来做数据验证/业务处理......  
对于前端而言，不同的 MVC 框架 的实现也各不相同，之前我一直纠结哪个框架属于 MVC，哪个不属于，后来我发现这种思考没多少益处。因为分层以及如何分层 都是要根据业务场景决定的。没有银弹。  
在下文，MVC 都为下图。也只讲前端 MVC

先来一张阮一峰大佬画的图吧

![](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015020105.png)

这张图跟我们上面写的代码流程一致，当用户触发 view 时，view 将指令传给 controller，controller 修改 model，并由 model 触发 view 的修改。

因为整个流程是单向的，在维护类似这样的库时：

- View 变更了，一定是 Model 引起的。
- Model 变更了，一定是 Controller 引起的。
- Controller 变更了，一定是 View 引起的。

带着这个思路去维护和开发，相比之前，肯定不会凌乱。并且更改 对应 层的代码时，不用担心影响其他层。

那前端开发，有没有好用的 mvc 框架呢？在这里我们就要引出 jquery 时代，比较火热的框架 `backbone` 了。

## 这个时代名为：backbone

![](http://qqqdu.com/imgs/白胡子.jpg)

### backbone 的 MVC

相信有一部分前端们没听过这个框架，它在前端实现了 MVC，首先来看它的 MVC 分层

它给我们提供了 Model/Collection/View/Router

数据层：Models Collections(想像成 Models 的集合)  
视图层：Views  
逻辑层：Router(Controller)

同样的，放一张阮一峰大佬的Backbone架构图。

![图片](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015020108.png)

> 1. 用户可以向 View 发送指令（DOM 事件），再由 View 直接要求 Model 改变状态。

> 2. 用户也可以直接向 Controller 发送指令（改变 URL 触发 hashChange 事件），再由 Controller 发送给 View。

> 3. Controller 非常薄，只起到路由的作用，而 View 非常厚，业务逻辑都部署在 View。所以，Backbone 索性取消了 Controller，只保留一个 Router（路由器） 。

> 来自：http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html

怎么回事儿，这么复杂，数据流不是单向的了，Views 可以作用于 Models，Models 也可以作用于 Views，这不是又回到之前了吗。（这里的 Controller，就是 backbone 的 Router）

在探究这个问题之前我们先把这张图修改一下，在不考虑路由变更的情况下，去掉 Router(Controller)。

![](http://qqqdu.com/imgs/backbone.png)

也就是说，在去除了 Router 之后，backbone 的分层，只有 View 和 Model。 并且修改是双向的，那我们就得问一个问题：**它们难道不会耦合吗？**

我们接着往下看。

### 熟悉 backbone

#### Model

```javascript
const Input = Backbone.Model.extend({})
const input = new Input({
  background: 'black',
  value: 'white'
})
input.set({
  background: 'white'
})
input.get('background')

this.model.bind('change:value', () => {})
```

通过 Backbone.Model.extend 可以构造一个 Model 类，在这个类实例化时，传入数据结构，通过实例的 set 方法来修改 model，通过 get 方法来获取 model。

并且 model 还可以绑定 change 事件，当数据变更时，会触发回调函数。

#### View

```javascript
// View...
const DocumentRow = Backbone.View.extend({
  model: input,
  initialize: function() {
    this.model.bind('change:value', this.render, this)
  },
  events: {
    'input input': 'changeValue'
  },
  changeValue: function(e) {
    input.set({
      value: e.target.value
    })
  },
  render: function(res) {
    const { value } = res.changed
    $('input').val(value)
    return this
  }
})
const documents = new DocumentRow()
```

同样的，通过 Backbone.View.extend 可以构造 view 类，并且可选参数 model 可以绑定对应的 数据。在 initialize 时，可以监听 model 的事件变更，并且触发 render 函数，来**手动**更新视图。事件绑定写在 events 中，当用户修改了 input 时，会触发 changeValue 去更新 model。

完整的代码在：[backbone DEMO](http://localhost:4000/template/backbone.html)

回到刚刚的问题， Model 和 View 是双向的？这样耦合吗？

#### Model 和 View 耦合吗

先来看看 Backbone 对于二者的介绍

> Models（模型）是任何 Javascript 应用的核心，包括数据交互及与其相关的大量逻辑： 转换、验证、计算属性和访问控制。
> Views(视图) 这里可以写 HTML 或 CSS， 并可以配合使用任何 JavaScript 模板库（默认 underscore）。 一般的想法是将界面组织成逻辑视图，并由 Models 支持， Models 变化时，每一个视图都可以独立地进行更新

如果按照这个思路去写业务，耦合应该是很小的。

但是，我们很可能会写成下面的样子

```javascript
// views
{
  changeValue: function(e){
    let value = e.target.value
    value = value.split(',').join('.')
    value += ' -> good'
    input.set({
      value
    })
  }
}
```

当用户 修改了 input，触发了 changeValue 函数时
在 changeValue 中，对数据进行了加工，之后才修改了数据。这样会有两个问题，一是在项目中，类似的加工变多，View 会变得更加臃肿，二是，对于业务数据的加工，应该也属于 Model 层，如果放在这里，View 和 Model 又耦合了。

所以加工应该放在 Model 层，如下：

```javascript
// model
const InputModel = Backbone.Model.extend({
  editValue(ev) {
    let value = ev.split(',').join('.')
    value += ' -> good'
    this.set({
      value
    })
  }
})
const input = new InputModel({
  background: 'black',
  value: 'white',
})
// views
{
  changeValue: function(e){
    input.editValue(e.target.value)
  }
}
```

所以实际开发中，我们要清楚的认识到，分层的用意，以及合理的把代码写在对应的 views/models 层上。不然分层就又没有意义了......

#### Router（Controller）


再来看看它的 Router（Controller） 层。


```javascript
var AppRouter = Backbone.Router.extend({
  routes: {
    '': 'index',
    list: 'renderList'
  },
  index: function() {
    view.render('index')
  },
  renderList: function() {
    view.render('list')
  }
})

var router = new AppRouter()
```

故名思意，Router 是处理路由逻辑的，它引用在 单页应用，监听 浏览器 URL `hash` 变化，当用户触发了变化，比如改变了 hash 值/回退/前进/刷新...  
`appRouter.routers` 就会执行对应的回调，从而触发 view 层更新。  

比如用户输入 `http://localhost/index.html`，则执行 `appRouter.index()` 方法，渲染 首页相关内容。  

然后用户跳转到 list，`http://localhost/index.html#list`，则执行 `appRouter.list()`方法，渲染 列表页相关内容。

因为 Router 只做简单的路由处理，这层会比较薄。  

### 千年玄铁剑，手无缚鸡人  

Backbone 是一款优秀的类库。  

模版渲染也 由开发者使用 underscore 这样的模版库实现。  

对于开发者，业务逻辑写在 View/Model 层都有可能，很容易造成上文的耦合问题。  

如何在 Model 二次变更后，让节点高效渲染也是个问题。是一次性更改所有相关 DOM，还是判断对应数据，做小范围更改？想想都麻烦。  

最重要的是，它依赖 jQuery, DOM 操作 还是交给开发者。极有可能在一个夜黑风高的加班夜，一个烦躁的小伙子在 Model 层随意操作 DOM～  

对于 Backbone 来说，应用在项目里的不确定性太高了，比如像我这种菜鸟很容易踩以上坑，当然它没落的原因肯定远不止此（[为什么认为Backbone是现代化前端框架的基石
](https://www.jianshu.com/p/513cf989839c))。

但在 jquery 还算盛行的年代，它确实给我们提供了分离 Model 和 View 的解决方案，给我们提供了 单页面路由管理方案等等...相信很多维护公司老项目的同学们肯定能找到它的身影，甚至能看到，在很多年前，写下代码的人，在不断的斟酌，如何优雅的将代码填充在 Backbone 的四肢，让它稳健、坚固的支撑着大大小小的平台和应用。

> 那个时代名为：Backbone

## 彻底拆解（MVP）  

在 mvc 中，不管是一开始说的，C-M-V-C 流向，或者 backbone 的 M-V-M 流向，M 和 V 还是存在着某种联系，那能不能打破这种联系，让二者之间彻底的独立起来。  
我们期望：
V 层只负责更新视图和用户事件监听，这样它可以不受 Model 的限制，自由的被 C 调用  
M层只负责数据存储和业务数据加工，  
让 C 来作为桥梁，M和V的通信只能通过 C   

我们先改造最开始 jQuery 的例子，实现这种流向。  

```javascript
let app = {
  model: {
    url: {
      'URL1': 'https//xxx/URL1',
      'URL2': 'https//xxx/URL2'
    },
    data: {
      name: 'qqqdu',
      year: '24'
    },
    setYear: data => {
      this.model.data.year = data
    },
    setName: data => {
      data = 'MR: ' + fullName
      this.model.data.name = data
    }
  },
  init() {
    this.setData(this.model.data)
    this.view.bindDom()
  },
  view: {
    bindDom() {
      $('#submit').click(this.controller.getURL1)
      $('#some ID').click(this.controller.getURL2)
      $('#name').input(this.controller.bindName)
      $('#year').input(this.controller.bindYear)
    },
    renderText(options) {
      $('#name').text(options.name)
      $('#year').text(options.year)
    }
  },
  controller: {
    bindName() {
      this.model.setName($(this).val())
      this.view.renderText(this.model)
    },
    bindYear() {
      this.model.setYear($(this).val())
      this.view.renderText(this.model)
    }
  }
}
```
改造起来很简单，直接将之前在 model 层触发的视图更新放在了 controller 层。这个 controller 形式上有点像一个中间人，所以这种模式被成为 MVP，P（Presenter）
还是放一张 阮一峰 大佬的图：
![mvp](http://qqqdu.com/imgs/mvp.png)。  

MVP 彻底的分离了 View 和 Model 层，View 将 DOM 事件监听放在了 Presenter，Model 变更的触发以及视图更新的触发也放在了 Presenter，可以预料到，在事件的增多以及数据量变大后，Presenter 会变得臃肿。  

所以对于 MVP 来说，臃肿的 Presenter 又导致了不可维护性和复杂度。这好像又回到了解放前，Backbone 的 View 充满了业务逻辑 和 与 Model 层的交互变得臃肿。这样看好像前者没什么进步呀。  

让我们先想想，导致 Presenter 臃肿的原因是什么：  

- 业务逻辑  
- Model 的变更，需要手动同步到 View  
- View 的变更，需要手动同步到 Model

业务逻辑依然保留在 Presenter。我们能不能着手优化 第2/3点  

## 解放双手（MVVM）  

在接下来的篇幅里，我们尝试实现 M-V V-M流程自动化。目的是不考虑性能，以最简单的方式实现这二者的双向绑定。  

### M -> V

我们先忘掉成熟的 MVVM 或类 MVVM 库，如果一个数据变更了，想要实时反应在视图层，最简单的方式是什么？  

我能想到的就是开一个定时器，不断的监听数据，如果数据和对应视图的值不相等，则更新视图。  

#### 轮训监听  

```javascript
_dirtyCheck() {
  requestAnimationFrame(() => {
    this._dirtyCheck()
    this._render()
  })
}
```
`requestAnimationFrame` 这个 api 根据系统来决定调用时机，一般和屏幕刷新频率有关，如果屏幕的刷新频率是 60HZ，那它会每 1000/60 ms 执行一次。相比 setTimeout 和 setInterval 这种宏任务来说，性能高不少。  

在这里，屏幕每刷新一次，就会执行 `_render` 方法。去判断是否更新视图。这种轮训机制，应该算最简单的实现数据监听的方法了吧。  

我们再实现下 `_render` 方法。  

#### _render 逻辑  

到这一步，我们要去对比数据和视图层的差别，不同则更新视图。那数据和视图势必要有一个绑定机制。我能想到最简单的方法就是给 dom 节点加属性来绑定。  

```html
<div data-mv="year"></div>
<div data-mv="name"></div>
```

假设我们的 model 结构是以下：  

```javascript
let app = {
  model: {
    data: {
      name: 'qqqdu',
      year: '24'
    }
  },
}
```
那 `_render` 函数就可以这么实现，依然是用 jquery  

```javascript

  _render() {
    const vm = $("[data-mv]")
    const self = this
    vm.each(renderFn)
    function renderFn() {
      const el = $(this),
          tagName = el[0].tagName
      const key = el.data('mv')
      const data = self.model.data[key]
      if(/INPUT|SELECT/.test(tagName)) {
        if(el.val() !== data) {
          el.val(data)
        }
      } else {
        if(el.text !== data) {
          el.text(data)
        }
      }
    }
  }
```

遍历拥有 `[data-mv]` 的节点，如果节点的 `[data-mv]`值 不等于 model 中的值，则改变节点的值。当然这里做了一个正则判断，如果是表单元素，则更新其 `value`，否则更新其 `innerText`。  

这样，我们用最简单的方式实现了 M -> V 的更新。  

当然，2020年几乎所有的前端er都知道， Angular 用脏检测来做视图更新，Vue 用 `Object.defineProperty/Proxy`来做数据绑定。不管他们解决了什么其他问题或是优化了什么性能，我们都得知道，最开始他们为什么要这么做。

### V -> M  

至于视图层的变更引起 `Model` 的改变，我们平时接触的最多的就是 `input` 节点，那我们就尝试实现下一个 `input` 节点数据变更时，实时更新到 `Model`。  

同样的，我们得知道 input 和 哪个属性绑定，跟上一节一样。我们可以再定义一个属性 `data-mvvm`，当拥有这个属性的 `input` 节点change 时，我们直接将该节点的 value 赋值给 Model。  

```javascript
// <input data-mvvm="name"/>
_bindMVVM() {
  const vm = $("[data-mvvm]")
  vm.each(ev => {
    const el = $(vm[ev]),
          tagName = el[0].tagName,
          key = el.data('mvvm')
    el[0].addEventListener('input', (ev) => {
      this.model.data[key] = ev.target.value
      console.log(this.model.data, key)
    })
  })
},
```
以上代码也很简单，监听了节点的 `input` 事件，并且在回调里赋值给 `model`。这样 v->m 的流程也自动化了。  
但对于 `input` 节点而言，要绑定两个属性才能同时实现 `v-m` 和 `m-v`。这样有点麻烦，所以我们再改造一下 `_render` 函数。 
以让它可以更新 `[data-mvvm]`属性。  

```javascript

  _render() {
    const vm = $("[data-mv]")
    const mvvm = $("[data-mvvm");
    const self = this
    vm.each(renderFn)
    mvvm.each(renderFn)
    function renderFn() {
      const el = $(this),
          tagName = el[0].tagName
      const key = el.data('mv') || el.data('mvvm')
      const data = self.model.data[key]
      if(/INPUT|SELECT/.test(tagName)) {
        if(el.val() !== data) {
          el.val(data)
        }
      } else {
        if(el.text !== data) {
          el.text(data)
        }
      }
    }
  },
```

### MVVM

从 MVP 到 MVVM，基本上就是我们刚刚做的改变了，视图层和数据层的交互本来需要 `Presenter` 作为中间人来手动更新，当我们在框架层面将这个流程自动化后，就变成了MVVM，而 Presenter 则被改名为 ViewModel

以我们写的 demo 举例子  
View 层变为了 html 模版，它不再需要开发者操作 DOM，改由框架实现，目前唯一的职责是将 事件绑定回调 委托给了 ViewModel，事实上这点也可以放在模版去做，我们最开始不也是这么做的吗 `<button onClick='tap'/>`。  
对于 Model，是很纯粹的数据存储，也可以进行数据加工。  
对于 `ViewModel`,承载更多的是业务逻辑，而非同步视图和数据。  

最终，我们的流向图变成以下：  

![](http://qqqdu.com/imgs/mvvm.png)

完 ##

## 引用

https://juejin.im/post/59fd94475188254115703461

https://uinika.github.io/web/broswer/backbone.html

https://www.jianshu.com/p/6ef75d044731
