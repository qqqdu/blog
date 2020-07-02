---
title: 从VSCODE插件开发到微创新
date: 2019/06/13
---
必须有个吊炸天的副标题

## 从 前端群 说起 

> 海燕： 给大家安利一个 vscode 插件， custom-link ，可以便捷跳转到 api mock 系统查看接口文档  

> 我的内心：我的天，这个插件，说大不大，说小不小，开发起来又不难，但用起来还挺有用的，解决了mock链接总需要在浏览器打开的痛点，简直是居家旅行装逼之利器......

![图片](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1560493058164&di=1afd80abd421d445b3317b195c1103c5&imgtype=0&src=http%3A%2F%2Fpic.51yuansu.com%2Fpic3%2Fcover%2F02%2F40%2F85%2F59c2f60bb97c7_610.jpg)

>周三吃完午饭

>天宇：我们也来开发vscode插件吧，做个自动化发布，加上爬虫！ 加上webhook！发布结束必须得在微信群里通知，国际范儿十足，用起来倍儿棒！

>我：听起来不错，搞起来！！！  

## VSCODE 插件 开发  


开发语言：Typescript  
平台: VSCODE  

`npm install -g yo generator-code`  

```
yo code

# ? What type of extension do you want to create? New Extension (TypeScript)
# ? What's the name of your extension? HelloWorld
### Press <Enter> to choose default for all options below ###

# ? What's the identifier of your extension? helloworld
# ? What's the description of your extension? LEAVE BLANK
# ? Initialize a git repository? Yes
# ? Which package manager to use? npm
```
`按 F5 调试`

## 我们要做什么

> 一个能自动发布当前项目的插件，敲一行命令，或者点一个按钮就能完成发布流程

## 怎么做  

>找海燕要接口

>我猜海燕会说：没空，丑拒  

>上回林潇分享的无头浏览器不错,让浏览器代替我们点点点

>可是......它太大了！对于一个插件而言！

>那就分析发布系统接口，nodejs 发请求执行相关操作  

## 从登录做起
先打开一个隐身窗口，NetWork上分析登录请求参数和返回参数  

![登录](https://img1.dxycdn.com/2019/0805/080/3360768203579680112-2.png)  

登录请求要啥你就给他啥，怎么给，看以下代码  
```javascript
import * as request from 'request';
request({
    method: "post",
    url: "http://assets-***.net/login",
    headers: {
        "Content-Type": 'application/x-www-form-urlencoded',
    },
    form: {
        "username": '不告诉你',
        "password": "232323"
    }
}, (error, response, body) => {
    this.cookie = response.request.headers.cookie
    resolve(response.request.headers.cookie)
})
```  
为啥要登录呢，当然是为了拿到我们的小饼干(cookie)，在以后的身份校验请求上都会用到

## 发布分支接口  
同样的，我们先从看请求说起。
![](https://img1.dxycdn.com/2019/0614/866/3351128918282498103-2.png)
 

这里的请求参数传递方式又不一样了，是通过 `multipart/form-data;` 的方式传递的 

通过搜索引擎，发现了 formData 库，可以用它来模拟表单格式发送，代码如下
``` javascript
public publish() {
    var form = new fromData();
    form.append('project', 'jobmd_v3_dynamic')
    form.append('schedule', 'assets-build-dynamic')
    form.append('args', JSON.stringify({"assets-build-dynamic":{"target":"master"},"git-send_type":"branch"}))

    var request = http.request({
    method: 'post',
    host: 'assets-publish*****.net',
    path: '/user/opt/addschedule',
    headers: {
        ...form.getHeaders(),
        "Cookie": this.cookie
    }
    });

    form.pipe(request);

    request.on('response', function(res) {
        console.log(res);
    });
}
```  
## 我们也需要打包信息  

![](https://img1.dxycdn.com/2019/0614/229/3351110001099358346-2.png)
看来这是一个长链接，还需要一个token，那token哪儿来的呢？  
看起来是拿cookie换的
![](https://img1.dxycdn.com/2019/0614/698/3351110479988218385-2.png)  
``` typescript
public getAccesstoken() {
    console.log(this.cookie)
    return new Promise((resolve) => {
        request({
            method: "get",
            url: "http://assets-p****.net/auth/accesstoken",
            headers: {
                "Cookie": this.cookie
            }
        }, (error, response, body) => {
            console.log('拿到token')
            console.log(JSON.parse(body).accesstoken)
            this.accesstoken = JSON.parse(body).accesstoken
            resolve()
        })
    })
}
```  
怎么发起长链接请求呢，瞬间想到了socket.io，但不能直接用，我们得分析分析发布系统用的什么包。
![](https://img1.dxycdn.com/2019/0614/235/3351111087726099297-2.png)  
感谢开发者没有混淆代码，很容易就找到了位置，很显然，他用的原生 websocket 对象。  
so,我们只要找到一个能发socket的node包就行了。 再加上我们拿到的token
```typescript

import * as websocket from 'websocket'
public listener() {
    var WebSocketClient = websocket.client;
    var client = new WebSocketClient();
    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log("Received: '" + message.utf8Data + "'");
            }
        });
    });

    client.connect(`wss://assets-publis***.net/?access_token=${this.accesstoken}`, 'echo-protocol');
}
```  
这样，发布的信息就打印到了控制台，至于后面在vscode如何展示，那就简单的不得了，就不在这儿分享了。  

## 从插件开发到微创新

什么是微创新：现有阶段，在版本快速迭代的时候，我们没有多余的时间和精力来做出像 Api mocker、sentry或者小程序开发文档这种耗时耗力的产品，那我们可以找出项目中的小痛点，如果解决掉它，确实能提高一定的效率，那么就尝试解决它。生产力的小提升 -> 微创新

## 谁痛苦，谁解决  
像mock链接跳转、发布自动化，代码格式这类优化，都是开发人员在日常工作中被折磨的不像样，才去尝试解决它。你迟早会解决这类问题！！！  

## 他痛苦，你也给他解决了呗  

像人才小程序里的测试暗门，像后端写的删除简历、解绑账号的接口，简简单单的几行代码，就可以节省QA人员的很多无脑流程。QA大佬心情好了，也不会随便给我们指bug了
![](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1560450371376&di=8faced84043f792ffd341dee4dbe38ba&imgtype=0&src=http%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2Ff456f6abf04432666eccb1456ea64cc5c090161d.gif)
## 最后
>* 产生不产生价值重要吗？好玩就够了！   --尼古拉斯.杜 
## 引用
https://code.visualstudio.com/api/get-started/your-first-extension