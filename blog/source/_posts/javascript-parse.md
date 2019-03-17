---
title: 抽象语法树(AST)
---
玩转抽象语法树

## 抽象语法树（Abstract syntax tree AST）

> 在计算机科学中，抽象语法和抽象语法树其实是源代码的抽象语法结构的树状表现形式

这种话不太好理解，通俗讲，代码是给程序员看的，但代码写出来后，机器又看不懂，所以需要将代码解释为 AST，这样编译器或者解释器就可以编译或者运行代码了。AST 其实就是一个树状结构，
这里给出一个更好理解 AST 的工具 [click](https://astexplorer.net/)：  

```javascript
var a = 'hello world'
```  
以上代码转换后：  

![img](../../../../imgs/1.jpg)  

这个结构包含了很多属性。  
- VariableDeclaration 变量声明


## 结束
在这里，我会记录一些开发遇到的难点。
你可以找我：
*qq: 1036971959*
*email: 1036971959@qq.com*
----
> https://segmentfault.com/a/1190000012806637 
 https://www.cnblogs.com/nanhuaqiushui/p/8723869.html