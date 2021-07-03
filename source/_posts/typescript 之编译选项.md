---
title: Typescript 之编译选项
date: 2021/01/27
---

typescript

## 代码检查

### 谈谈 tslint

tslint 早在 19 年官方就不推荐使用了，直到去年 1 月份官方也不接受任何 PR 了。我翻了翻 19 年写的个人项目，竟然发现了 tslint 配置https://github.com/qqqdu/React-map-editor/blob/master/tslint.json。而我们的项目，早就开始使用 `typescript-eslint-parser`，为什么 `tslint` 被官方废弃掉？

在 tslint 核心开发成员 palantir 的博客（https://medium.com/palantir/tslint-in-2019-1a144c2317a9）里他解释了：

- 当 javascript 开发人员向 typescript 开发人员转换的过程中，eslint -> tslint 是很重要的一个障碍，使用 eslint 可以减少这一环。
- eslint 提供了 typescript 的解析检查，而 tslint 底层实现针对的是 typescript 的 ast，所以为了社区标准化，为了社区团结，减少不必要竞争性，一起干好 eslint 才是正经事儿。（看看人对造轮子的态度）
- eslint 分析基础架构性能更高
- eslint 社区庞大！基于第二点，tslint 无妨共享其社区资源。

当然，这段话对你来说没什么用，你也没什么项目需要从 tslint -> eslint 转换。让我们忘掉 tslint，来找一个 eslint 最佳方案。

## 项目中最佳代码检查实践

### 开发前

#### 1. 安装

npm i eslint @tencent/eslint-config-tencent --save-dev

#### 2. 新建 .eslintrc.js

```javascript
module.exports = {
  extends: [
    '@tencent/eslint-config-tencent',
    '@tencent/eslint-config-tencent/ts',
  ],
};
```

#### 3. 新建 .eslintignore

node_modules
guide
references
dist

#### 4. 将以下代码添加在 package.json 的 script

"lint": "eslint ./ --fix --ext .jsx,.js,.ts"

### 开发中

#### 1，修改 vscode 配置

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

保存时，自动修复：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### 插件配置

vscode 应用市场：eslint/prettier，后者主要用来修复代码风格。

这二者在某些规则下会冲突，比如 eslint 单引号，prettier 双引号，那么你开发时就会左右横跳，因此需要关掉那些冲突的规则。下面这个库就是干这个事儿的：

`tnpm install --save-dev eslint-config-prettier`

然后修改 eslint 配置，注意 prettier 一定要放在其他配置项的下面，因为他要覆盖其他规则：

```javascript
module.exports = {
  extends: [
    '@tencent/eslint-config-tencent',
    '@tencent/eslint-config-tencent/ts',
    'prettier',
    'prettier/@typescript-eslint',
  ],
};
```

### 开发结束

#### 上传代码

在 `git commit` 时可校验 eslint 规则，如果有 `Error` 则中断提交，这可以防止你有天忘了项目代码里未修复的 eslint 错误而盲目提交，算是比较末尾的一环。

`tnpm install pre-commit --save-dev`

然后是 package.json 的配置：

```json
{
  "script": {
    "lint": "eslint ./src/*.ts"
  },
  "pre-commit": ["lint"]
}
```

这样，在 commit 前会执行 lint 命令。

#### 最后一环

我是做到了上一步，如果你想更完美，去检验那些代码安全问题/圈复杂度云云，你可以继续探究，采用公司成熟的 ci 服务：orange-ci 以及 蓝盾 codecc 接入。这块石头哥最近好像在搞，等他搞好了分享一波～

## 编译选项

中文版的 typescript 官网 是很拉垮的，推荐英文官网：https://www.typescriptlang.org/tsconfig

编译选项是很庞大的一环，因为选项众多，我不可能照着文档一个个讲，所以我找了一个方法，拿出业务项目里的 `tsconfig` 配置，这些是比较常用的，搞懂这些也就够用了，这里先粘贴一下，我采用的是 Tdesign 的配置项：

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "removeComments": true,
    "suppressImplicitAnyIndexErrors": true,
    "resolveJsonModule": true,
    "importHelpers": true,
    "isolatedModules": false,
    "moduleResolution": "node",
    "jsx": "preserve",
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "lib": ["esnext", "dom", "dom.iterable", "scripthost"]
  },
  "rules": { "trailing-comma": false },
  "include": ["./**/*.ts", "./**/*.tsx", "./**/*.vue"],
  "exclude": ["node_modules", "docs/common/tdesign-doc-loader.js"]
}
```

### 模块解析

#### target

指定编译后 js 的目标版本，官网是这么描述的：

> 指定 ECMAScript 目标版本 "ES3"（默认）， "ES5"， "ES6"/ "ES2015"， "ES2016"， "ES2017"或 "ESNext"。

ESNext 指的是当前 ts 支持的最新版 es 标准，在 https://github.com/tc39/proposals 可以看到。

需要注意的是， ESNext 是不稳定的，ts 版本升级时会有风险，所以尽量不配置它。

#### lib

> 编译过程中需要引入的库列表，有默认值，和 target 绑定：
> ► 针对于--target ES5：DOM，ES5，ScriptHost
> ► 针对于--target ES6：DOM，ES6，DOM.Iterable，ScriptHost

因为 target 值为 esnext，所以这里要加上 esnext 的 lib。

DOM.Iterable 和 scriptHost 是什么？

#### module

> 指定生成哪个模块系统代码： "None"， "CommonJS"， "AMD"， "System"， "UMD"， "ES6"或 "ES2015"。
> ► 只有 "AMD"和 "System"能和 --outFile 一起使用。
> ► "ES6"和 "ES2015"可使用在目标输出为 "ES5"或更低的情况下。

#### moduleResolution

指定模块解析策略，可选值有： node 和 classic

简单来讲，这玩意儿是用来告诉编译器怎么找模块的，比如以下这个例子： `import {a} from 'moduleA'`，typescript 将用两种策略去寻找 moduleA 模块。

##### 对于 classic

**相对导入**
import { b } from "./moduleB"在源文件/root/src/folder/A.ts 中将导致以下查找：

- /root/src/folder/moduleB.ts
- /root/src/folder/moduleB.d.ts

**非相对导入**
import { b } from "moduleB 在源文件 /root/src/folder/A.ts 中，将导致以下查找

- /root/src/folder/moduleB.ts
- /root/src/folder/moduleB.d.ts
- /root/src/moduleB.ts
- /root/src/moduleB.d.ts
- /root/moduleB.ts
- /root/moduleB.d.ts
- /moduleB.ts
- /moduleB.d.ts  
  聪明的你已经发现了，非相对导入是从源文件一步步往上层文件夹寻找的。

##### 对于 node

**相对导入**
var x = require("./moduleB"); 在源文件 /root/src/moduleA.js 中，将导致以下查找

- 询问名为的文件/root/src/moduleB.js 是否存在。
- 询问文件夹/root/src/moduleB 是否包含 package.json 指定"main"模块的文件。在我们的示例中，如果 Node.js 找到/root/src/moduleB/package.json 包含的文件{ "main": "lib/mainModule.js" }，则 Node.js 将引用/root/src/moduleB/lib/mainModule.js。
- 询问该文件夹/root/src/moduleB 是否包含名为的文件 index.js。该文件被隐式视为该文件夹的“主”模块。

**非相对导入**
var x = require("moduleB"); 在源文件 /root/src/moduleA.js 中，将导致以下查找

- /root/src/node_modules/moduleB.js
- /root/src/node_modules/moduleB/package.json（如果指定了"main"属性）
- /root/src/node_modules/moduleB/index.js
- /root/node_modules/moduleB.js
- /root/node_modules/moduleB/package.json（如果指定了"main"属性）
- /root/node_modules/moduleB/index.js
- /node_modules/moduleB.js
- /node_modules/moduleB/package.json（如果指定了"main"属性）
- /node_modules/moduleB/index.js

##### 对于 typescript

ts 的导入模仿 node 的导入方式，但有不同点，在于多了 .ts, .tsx, and .d.ts 文件的解析。相对导入就不介绍了，直接看非相对导入：  
对于 import { b } from "moduleB" 在 /root/src/moduleA.ts 中引入：

- /root/src/node_modules/moduleB.ts
- /root/src/node_modules/moduleB.tsx
- /root/src/node_modules/moduleB.d.ts
- /root/src/node_modules/moduleB/package.json (if it specifies a "types" property)
- /root/src/node_modules/@types/moduleB.d.ts
- /root/src/node_modules/moduleB/index.ts
- /root/src/node_modules/moduleB/index.tsx
- /root/src/node_modules/moduleB/index.d.ts

- /root/node_modules/moduleB.ts
- /root/node_modules/moduleB.tsx
- /root/node_modules/moduleB.d.ts
- /root/node_modules/moduleB/package.json (if it specifies a "types" property)
- /root/node_modules/@types/moduleB.d.ts
- /root/node_modules/moduleB/index.ts
- /root/node_modules/moduleB/index.tsx
- /root/node_modules/moduleB/index.d.ts

- /node_modules/moduleB.ts
- /node_modules/moduleB.tsx
- /node_modules/moduleB.d.ts
- /node_modules/moduleB/package.json (if it specifies a "types" property)
- /node_modules/@types/moduleB.d.ts
- /node_modules/moduleB/index.ts
- /node_modules/moduleB/index.tsx
- /node_modules/moduleB/index.d.t

TIP：如果你模块导入有问题了，不妨试试将改属性改为 node

#### outFile

输出文件会被打包到单一文件中

> 注：除非 module 是 None，System 或 AMD， 否则不能使用 outFile。 这个选项 不能 用来打包 CommonJS 或 ES6 模块。

#### outDir

指定生成文件的目标目录，没指定会在对应 ts 文件相同目录生成对应 js 文件。

结合 outFile 和 outDir，你可以把单文件生成到 build 目录里。

```json
{
  "outDir": "build/",
  "outFile": "build/index.js"
}
```

### 严格模式

通过设置：alwaysStrict 可以开启 js 的严格模式,如果触发了严格模式，则编译不会通过。

还有其他模式的配置项，一一列举一下

#### noImplicitAny

不能有隐式的 any
参数必须经过定义，否则不通过编译，比如这个形参未定义类型，如果设置该属性为 true 的话，编译时这里会报未定义类型的错误，当然，你也可以设置 `any` 类型。

```typescript
function fn(s) {
  //Parameter 's' implicitly has an 'any' type.
  console.log(s.subtr(3));
}
```

#### noImplicitThis

不能有隐式的 this

```typescript
function fn(s: any) {
  //'this' implicitly has type 'any' because it does not have a type annotation.
  return this.a;
}
```

比如这个例子，this 的指向取决于函数的调用方，所以这个 this 指向是不明确的，当设置了该属性时，编译就不会通过了

#### strictBindCallApply

call 和 apply 方法的底层函数参数会被校验

```typescript
// With strictBindCallApply on
function fn(x: string) {
  return parseInt(x);
}

const n1 = fn.call(undefined, '10');

const n2 = fn.call(undefined, false);
```

如果设置了该参数，则 n2 会报错： Argument of type 'boolean' is not assignable to parameter of type 'string'.

#### strict

还有更多类型，像：strictFunctionTypes strictNullChecks strictPropertyInitialization 就不一一列举了，如果你嫌麻烦，想启用所有严格模式，你可以将 strict 参数设置为 true

### 其他设置

- removeComments 移除 log
- resolveJsonModule 允许导入 json
- paths 路径别名，厌倦了 ../../可以使用
- sourceMap 不多说了
