---
title: 抽象语法树(AST)
---
玩转抽象语法树

## 抽象语法树（Abstract syntax tree AST）

> 在计算机科学中，抽象语法和抽象语法树其实是源代码的抽象语法结构的树状表现形式

这种话不太好理解，通俗讲，代码是给程序员看的，但代码写出来后，机器又看不懂，所以需要将代码解释为 AST，这样编译器或者解释器就可以编译或者运行代码了。

## 前端工程化，离不了 AST

虽然AST是编译原理中的基础内容，但在大前端时代，它有很广的应用。
比如我们的babel、eslint、代码格式化、代码自动补全、代码压缩、JSX甚至Typescript 都是在 AST 上进行操作的。

## 初识 AST

AST 其实就是一个树状结构，
这里给出一个更好理解 AST 的工具 [click](https://astexplorer.net/)：  

```javascript
var a = 'hello world'
```  
以上代码转换后：  

![img](../../../../imgs/1.jpg)  

这个结构包含了很多属性。  
- VariableDeclaration 变量声明
- FunctionDeclaration 函数声明
- Expression 表达式
- ThisExpression this表达式
- ...
你可以在文档里找到大部分属性 (文档)[https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Node_objects] 
可以在ES标准里找到所有属性 (文档)[https://github.com/estree/estree]

## AST 应用  
应用AST，首先得先把 `JS` 代码转成 `AST`，然后用 文档中的 `API` 去修改树，修改完成后，输出 `JS` 代码。  
以下以 `recast` 举例。
`recast` 是 Javascript 解析器，提供了AST接口。
### 安装 
npm install recast
### 新建 JS
```
const recast = require("recast");

// 你的"机器"——一段代码
// 我们使用了很奇怪格式的代码，想测试是否能维持代码结构
const code =
  `
  function add(a, b) {
    return a +
      // 有什么奇怪的东西混进来了
      b
  }
  `
// 用螺丝刀解析机器
const ast = recast.parse(code);

// ast可以处理很巨大的代码文件
// 但我们现在只需要代码块的第一个body，即add函数
const add  = ast.program.body[0]

console.log(add)
```
### 运行
node js
## 结束
> https://segmentfault.com/a/1190000016231512
> https://astexplorer.net