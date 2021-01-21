---
title: 记两次AST的应用
date: 2019/09/01
---

终于将 AST 用在需求里辣！

## AST 和 我

之前有在 TOH 前端小组里分享过 AST 的相关概念，以及 `recast` 库来操作 AST 树，  
你可以在这看这篇文章

[抽象语法树(AST)](http://qqqdu.com/2019/03/18/javascript-parse/)

当时分享完觉得很空旷，虽然了解了其部分基础概念，也做了一个小 demo，但还是太过于表面，没有实际应用，纸上得来终觉浅。恰好这周有两次机会用上了 AST。  
我的体验是：

真 TMD 爽！

## 枚举库 和 JSDOC 的碰撞

当 xusy 整理完 项目的枚举，并将它封装为一个库后，MR 发了过来。

之前项目里零零散散的枚举统一由私有库来维护，再也不用每个项目都维护一份了。

但文档似乎有点多，好几十个 js 脚本。于是我

commit：应该再出一份文档，告知开发者这些枚举都是干啥的，这样不需要开发者找代码，而直接调用它。

xusy 说，可以，然后调研了下 JSDOC 库，发现代码格式不符合 JSDOC 的要求。比如：  
备注要像前者，而不是后者：  
`/** 这是JSDOC可识别的备注 */`  
`/* 这是JSDOC不可识别的备注 */`

比如：  
导出的类型要像前者，而不是后者：

```javascript
const applyTypeObj = {
	/** 普通投递 */
	NORMAL_APPLY: 0,
	/** 一键投递 */
	ONE_CLICK_APPLY: 1,
	/** 邀请投递 */
	INVITE_APPLY: 2
}
export const applyTypeEnum = Object.freeze(applyTypeObj)
```

```javascript
// 普通投递
export const NORMAL_APPLY = 0
// 一键投递
export const ONE_CLICK_APPLY = 1
// 邀请投递
export const INVITE_APPLY = 2
```

有 21 个文件、以及文件里的大量枚举 需要这样处理，你可以算算需要多少人工成本，并且处理的过程是枯燥，乏味，容易出错的。

### 你为什么不问问神奇的 AST 呢

有了上次分享的经验，这次应该很容易写出这样的转换代码。  
先构思下基本的流程

递归读取项目文件 -> 读文件 -> AST 操作 -> 写文件

这个流程核心就是 AST 操作。依然用我们可爱的 `recast` 库。

```javascript
function recastFileName(path, fileName) {
	fs.readFile(path, function(err, data) {
		// 读取文件失败/错误
		if (err) {
			throw err
		}
		const code = data.toString()
		console.log(code)
		const ast = recast.parse(code)
		let i = 0
		// 要做的事情很简单，把所有 var 定义的 并且值是 Literal 整合起来
		const maps = {}
		// 各个字段的备注存在这
		const markMap = {}
		let markDown = ''
		recast.visit(ast, {
			visitExportNamedDeclaration: function(path) {
				const init = path.node.declaration.declarations[0].init
				const key = path.node.declaration.declarations[0].id.name
				let value = init.value
				const type = init.type
				if (type === 'UnaryExpression') {
					value = eval(`${init.operator}${init.argument.value}`)
				}
				if (type === 'Literal' || type === 'UnaryExpression') {
					maps[key] = value

					path.node.comments &&
						path.node.comments.map(item => {
							markDown = `/**
* Enum for ${fileName}
* ${item.value}
* @enum {number}
*/\n`
						})
					return null
				}
				return false
			},
			visitVariableDeclaration: function(path) {
				if (
					!path.value.declarations ||
					!path.value.declarations[0] ||
					!path.value.declarations[0].init.elements
				) {
					return false
				}
				console.log('定义')
				console.log(path.value.declarations[0].init.elements)
				path.value.declarations[0].init.elements.map(element => {
					const key = element.properties[0].value.name
					const value = element.properties[1].value.value
					element.properties[0].value = memberExpression(id(`${fileName}Obj`), id(key))
					markMap[key] = value
				})
				return false
			}
		})
		if (!Object.keys(maps).length) {
			console.log('无需转换')
			return
		}
		let mapString = '{\n'
		Object.keys(maps).map((key, index) => {
			if (markMap[key]) mapString += `  /** ${markMap[key]} */\n`
			if (index === Object.keys(maps).length - 1) {
				mapString += `  "${key}": ${maps[key]}\n`
			} else {
				mapString += `  "${key}": ${maps[key]},\n`
			}
		})
		mapString += '}'
		const res = `const ${fileName}Obj = ${mapString}\nexport const ${fileName}Enum = Object.freeze(${fileName}Obj)\n`

		const output = res + recast.print(ast).code
		const finel = recast.print(recast.parse(output)).code
		console.log(finel)
		console.log(output)
		fs.writeFile(path, `${markDown}\n${finel}`, {}, function() {
			console.log(`wirte ${fileName} OK!`)
		})
	})
}
```

代码看起来很懵逼，这里只讲讲核心代码。  

```javascript
const map = []({
	// 很容易看出来，这个方法是用来捕捉 export 语句的
	visitExportNamedDeclaration: function(path) {
		const init = path.node.declaration.declarations[0].init
		const key = path.node.declaration.declarations[0].id.name
		let value = init.value
		const type = init.type
		/* 将
      export const NORMAL_APPLY = 0
      有用的信息拿出来，存进对象里
      maps: { NORMAL_APPLY: 0 }
    */
		if (type === 'Literal' || type === 'UnaryExpression') {
			maps[key] = value
		}
		return false
	}
})
```

当我们枚举都存到 map 对象里的时候，就可以拼接 map 对象，然后 塞进 代码文件里了。

```javascript
let mapString = '{\n'
Object.keys(maps).map((key, index) => {
	if (markMap[key]) mapString += `  /** ${markMap[key]} */\n`
	if (index === Object.keys(maps).length - 1) {
		mapString += `  "${key}": ${maps[key]}\n`
	} else {
		mapString += `  "${key}": ${maps[key]},\n`
	}
})
mapString += '}'
writeFile(mapString)
```

当然，还有很多地方需要注意，比如文件头统一的备注，枚举的单独备注。这里就不赘述了。你可以翻到最上面细读。

这个需求做的还算顺利。

## 又一个需求  
### 小程序路由参数修改
当我花了半天做完 枚举库 的转化后，内心有点小激动，恰好当前版本有一个需求和上面的需求很像。  

小程序项目，路由跳转是这样的：  
```javascript  
wx.navigateTo({
    url: `/pages/resumeOptimize?jobId=${this.jobId}&resume_enhance_source=apply_work_success&workid=${this.jobId}&service_type=resume_optimization`
})

```
长、丑陋、后期加参数容易出错。  

所以需要写成这样。  
```javascript
wx.navigateTo({
  url: `/pages/resumeOptimize?${qs.stringify({
    jobId: this.jobId,
    resume_enhance_source: 'apply_work_success',
    workid: this.jobId,
    service_type: 'resume_optimization'
  })}`
})

```
优雅，缩进漂亮，容易维护。  

### 再问问神奇的 AST ？  

这次的显然比上次难。首先代码文件不是 js，而是 `.wpy`。  

因为小程序用了 wepy 框架，类 vue 结构。  
```html
<template></template>
<script></script>
<style></style>
```
首先要从这个结构里单独将 `script` 抽出来。当然是用强大的正则了。  
```html
function getScript(code) {
  let jsReg = /<script>[\s|\S]*?<\/script>/ig;
  const scriptColletion = code.match(jsReg)[0].replace(/<script>/, '').replace(/<\/script>/, '');
  return scriptColletion
}
```
很容易拿到了 `script` 的内容。  
假设我们将 ast 操作完成了，要将代码文件存回去，同样的。  
```html

// 再把script设置回去
function setScript(code, script) {
  let jsReg = /<script>[\s|\S]*?<\/script>/ig;
  return code.replace(jsReg, `<script>\n${script}</script>`)
}
```
### 需求分析  
上节只是简单的实现了代码的存取，重头戏终于来了。首先分析下我们要做什么。  
- 拦截代码里的 `wx.navigateTo` 或 `wepy.navigateTo`，这两个api相同，开发者都可能调用 
- 将这个 api 的参数，由模版字符串，替换为 `qs.stringify` 方法调用  
- 如果该文件有替换操作，并且，文件头部没有 `import qs from 'qs'`,需要手动加上  
#### 拦截api 
api 方法调用显然是一个 `ExpressionStatement`，因此我们很简单的拦截到了它，并且之后的操作都是在 `visitExpressionStatement` 回调里做的。
```html
recast.visit(ast, {
  visitExpressionStatement: function(path) {
    const callee = path.node.expression.callee
    if(!callee || !callee.object) {
      return false
    }
    const objName = callee.object.name
    const fnName = callee.property.name
    // 调用者是wx 或者 wepy
    if(objName === 'wx' || objName === 'wepy') {
      // 跳转
      if(fnName === 'navigateTo') {
        // 拦截到了
      }
    }
    return false
  },
}
```
#### 模版字符串替换
悪夢の起源  

这里是核心功能，它消耗了我半天多时间。  
我们位于以上代码 ‘拦截到了’ 位置。利用 devTool 找到了 wx.navigateTo 的语法树构成。  
举个🌰：  
```javascript
wepy.navigateTo({
  url: `/pages/detail/jobDetail?id=${e.id}&from=job_detail&num=${e.index}&uniqueKey=${uniqueKey}`
})
```
```html
<pre>
if(fnName === 'navigateTo') {
  const argument = path.node.expression.arguments[0]
  let {expressions, quasis} = argument.properties[0].value
  if(!expressions || !quasis || !expressions.length) {
    return false
  }
  if(expressions.length < 2) {return false}
  expressions = expressions.map((val) => {
      const res = recast.print(val)
      return res.code
  })
  let url = ''
  quasis = quasis.map((val) => {
      const path = val.original.value.cooked
      if(/\?/.test(path)) {
        // 把 url 存下来
        url = path.split('?')[0]
        return path.split('?')[1]
      }
      return path
  })
}
</pre>
```
事实上，ast将这行代码分割成了两组，一组是 expressions，一组是 quasis，我将这二者打印出来。前者是表达式，后者是字符串。正好 表达式长度 = 字符串长度 - 1。  
这符合模版字符串的格式。
```javascript
["e.id", "e.index", "uniqueKey"]
["id=", "&from=job_detail&num=", "&uniqueKey=", ""]
```
我需要将这两个数组拼接起来，并给字符串加上引号。
```html
<pre>

const express = assignArray(quasis, expressions).join('').split('&')
function assignArray(arr2, arr1) {
  // 把 arr2里面的字符串加上引号
  arr2 = arr2.map((val) => val.split('&').map((equel) => {
      if(!equel || !equel.split('=')[1]) {
        return equel
      }
      const value = '\'' + equel.split('=')[1] + '\''
      return [equel.split('=')[0], value].join('=')
    }).join('&'))
  arr1.forEach((item, index) => {
      arr2.splice(2 * (index + 1) - 1, 0, item)
  })
  return arr2
}
</pre>
```
最终是这个样子：  
`["id=e.id", "from='job_detail'", "num=e.index", "uniqueKey=uniqueKey"]`  
接下来，将上面的数组转化成函数的参数即可
```javascript

const results = giveQsString(express, url)
function giveQsString(expressArr, url) {
  let str = `url: \`${url}?\${qs.stringify({\n`
  expressArr.map((val, index) => {
    const [key, value] = val.split('=')
    if(index === expressArr.length - 1)
      str += `  ${key}: ${value}\n`
    else
      str += `  ${key}: ${value},\n`
  })
  str += `})}\``
  console.log(str)
  return str
}

```
最终是这个样子的。  
```javascript
/*
url: `/pages/detail/jobDetail?${qs.stringify({
  id: e.id,
  from: 'job_detail',
  num: e.index,
  uniqueKey: uniqueKey
})}`
*/
```
最重要的一步，将该参数，填到 navigate 的方法中  
```javascript

path.node.expression.arguments[0].properties[0] = templateElement({ 
  "cooked": results, "raw": results 
}, false)
```
就这样，核心的ast就完成了。
#### 加上 qs  
如果该文件进行了以上步骤，那它就需要进行 import qs，这里只需要对 ImportDeclaration 进行判断，如果没有导入 qs 模块，则告诉下游，在文件头部追加 import 语句。
```html
visitImportDeclaration: function(path) {
  // 如果模块引入了qs，则不需要导入
  if(path.node.source.value === 'qs') {
    needQs = false
  }
  return false
}
```
## 总结  
用我周报上的话来总结吧
> 这周的两个需求都用上了AST，也是第一次将AST用在了实际项目中，两个需求产生的效果也不同。  
jobmd_enum 代码结构和注释变更：这个库的代码文件格式比较统一，文件数较多，不太适合手动一个个改写，用AST做减少了不少时间，且难度不高  
jobmd-weapp 路由参数走qs: 这个库的代码格式是wepy类型，做起来难度比较高，花了一整天的时间写AST代码，最终也实现了全局路由的替换，替换后发现需要替换的文件并不多，所以这是一个反例。  
因此，在决定用AST前一定要先调研是否适合用，我认为需要满足以下两个条件:  
1，ast 代码容易写。 2，重复的工作量大

