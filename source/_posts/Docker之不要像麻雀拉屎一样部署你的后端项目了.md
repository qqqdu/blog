---
title: Docker之不要像麻雀拉屎一样部署你的后端项目了
date: 2021/01/12
---

docker python nodejs

## 前言

> 现在手里没几个 `NodeJs` 应用还好意思自称前端嘛（误）？

想象这样一个场景，你翻开 express 官网，本地环境照着文档写一个路由 `app.get('/', res => res.send('hello world'))`，然后浏览器一输 `localhost`，看到了熟悉的字符串，你很开心。然后上传代码到 `github`，首充 `9.9` 买了云服务器，之后就是痛苦的装 `Node` 啦、配环境变量啦、装 `Git` 啦、拉代码啦、`npm install` 啦......一个美好的午后很快过去......

一顿操作之后，终于你在浏览器通过云服务器的 `ip` 又看到了熟悉的字符串，你很开心。

过了一段时间，由于你工作繁忙，服务器忘记续费被回收了，但你又想学 `Node` 了，于是你又要花一段时间重复以上的操作。

以上这段只是我为了表示你写的服务需要容易迁移而举的例子，你可能说，我的服务器续费了 99 年，我过期了，它都不会过期，但你还可以想想以下这些场景：

- 维护了两年的内网应用，由于机房搬迁，你的服务器在裁撤名单里
- 维护了两年的内网应用，由于你要离职，大量的鸟屎服务散落在各地，你要在一周内把它交接给你可怜的同事
- 你不小心运行了 `rm -rf *` 命令
- 服务器要负载均衡，你要快速部署服务到多个服务器
- ......

再想想，每次迁移前后操作系统的版本不一致，那么各种接口的不兼容会带给你什么！？

## 人生苦短，我用 Docker

为什么我决定用 Docker 呢？是因为我真的遇到了上面问题之一，当时我的图标库后端服务上线没几天，突然被拉近了一个企业微信群，说是重庆机房对部分服务器进行裁撤，需要自行对服务进行迁移，我当时心凉了半截，因为我的服务器 ip 出现在了裁撤名单里！！！

要知道我的图标库项目维护着两个后端服务，一个是 Node 服务，负责爬取海量 `ICON` 图片，并处理一些简单的 `CURD` 请求。另一个是 `Python` 服务，负责批量生成搜图模型以及搜图接口。当时配置服务器环境花了我不少时间，尤其是蛋疼的 `Python` 版本，部署过 `Python` 服务的人，肯定感受过`Python 2` 和 `Python 3` 的版本痛苦。

不过后续还好，由于我使用的云服务器，机房迁移对我是无感的，也不需要我做额外的操作。但那个下午确实让我担惊受怕，所以我当时就想，如果出了类似问题，需要在短时间内对服务进行迁移，我该怎么做呢？答案呼之欲出：人生苦短，我用 `Docker` (`Python`：不是我吗？？)

## Docker 介绍

`Docker` 的意思是 码头工人/搬运工人，它的起名来自于集装箱策略，简单的来描述下：

早期海运成本很高，有一部分时间和金钱花在了装货和卸货，由于运输货物的大小不同，为了节省空间需要人员来进行货物打包并且搬上轮船，可想而知成本极大，要知道贸易的积极性取决于利润，而减少贸易成本则会提高利润。如何减少这个成本？

为何不把所有东西塞进一个统一大小的箱子里，统一装卸和搬运，于是集装箱出现了，集装箱不仅仅是一个铁盒子这么简单，伴随它的有集装箱标准，有了统一的标准，才能让集装箱被搬上火车/搬上货车/搬上轮船。

先从集装箱的思绪中出来，想想我们拿到一台新服务器，装软件/配环境变量/装各种包，一顿操作。像不像那个在码头流着汗打包的工人？

Docker 就是来解放我们的。他有三个概念：仓库/镜像和容器。仓库类比为 github，他是用来存镜像的，而镜像就相当于集装箱标准，它规定了软件运行的环境和版本。容器就是我们服务运行的标准化环境，他是由镜像打包而来的。可能你看到这里有点懵，但没关系，一个简单的实例就能让你理解这些。

### 开发环境安装 `Docker`

推荐直接根据菜鸟教程安装桌面端，省去很多烦恼: [MAC 安装](https://www.runoob.com/docker/macos-docker-install.html)

因为我很懒，关于 Docker 的基本操作就不介绍了，后面碰见需求一步步熟悉，我先从 `Docker Compose` 直接讲起，

### Docker Compose

`Docker Compose` 是 `Docker` 的工具，你可以通过 `YML` 文件配置来运行 `Docker`。

```yml
# compose 依赖的版本
version: '3'
# 指定容器名称
container_name: 'my-docker'
# 构建设置
services:
  web:
    # 当前目录构建
    build: .
    # 端口映射
    ports:
      - '80:80'
```

简单的讲，Docker Compose 就是可以让你把 docker 命令配置写在配置文件里然后运行的工具。接下来的案例都会使用它来进行操作。

### Dockerfile

Dockerfile 就是来告诉 Docker 怎么创建镜像以及创建完成后的各种操作，其内容就是一条条指令，
直接举例子，以下是名为 Dockerfile 的文件，，包括镜像/工作空间/文件拷贝等等。具体作用见备注。

```Dockerfile
# 镜像是 node 的 14.9.0 版本，后续指令都将在这个环境下运行
FROM node:14.9.0
# 工作空间设置为 /app，这指的是容器内的工作空间
WORKDIR /app
# 拷贝当前工作目录的 package.json -> 容器的工作空间 /app
COPY package.json /app
# 设置镜像源并安装包
RUN npm i --registry=http://r.tnpm.oa.com && npm install
# 复制当前工作目录的所有文件到 /app
COPY . /app
# 声明 80 端口，仅仅告诉镜像使用者默认端口，实际映射在下文告知
EXPOSE 80
# 运行 node 脚本
CMD node server.js
```

通过以上文件，就描述了一个 `nodejs` 应用的简单部署流程。

### .dockerignore

这个文件类似 `.gitignore`，Docker 运行时，会忽略掉本地工作空间里被配置到 `.dockerignore` 中的文件。

为什么要有这个文件，比如你在 mac 环境下 安装了 `npm` 包，`Docker` 在运行时，直接将 `node_modules` 拷贝到了 容器内 的`linux` 工作空间，那就会有兼容问题。  
比如我就遇到类似问题，在 mac 安装的 `sharp` 包, 拷贝到容器后，在 `Docker` 内运行代码时会提示 `error: 'darwin-x64' binaries cannot be used on the 'linux-x64' platform. #2443`，因此我们最好将 `node_modules` 忽略掉。

当然，忽略掉一些不必要的文件也可以提高 `docker` 的构建速度。

```.dockerignore
# 和.gitignore 配置一致
node_modules
```

### 运行

当你把以上三个文件创建完毕后，你的目录结构大概是这样的：

```
.
├── Dockerfile
├── docker-compose.yml
├── node_modules
├── package.json
├── server.js
```

然后就可以创建运行 docker 容器了，非常简单，运行：  
`docker-compose up`
此时，你的服务就可以通过 `localhost` 访问到了。

### 进入容器

你已经启动了一个容器，但什么也没见到过，他就运行起来了，现在，你可以运行 `docker ps` 命令看到当前运行的容器。

之后，通过 `docker exec -it container-id /bin/bash` 进入容器内部，熟悉的 `/app` 工作空间摆在你面前。

当你修改了代码之后，你可以通过 `docker-compose up --build` 再重新构建容器，因为有缓存机制，这次构建会很快速！

### 部署

公司内的 devCloud 已经内置了 docker，你只需要登陆云开发，然后下载安装 docker-compose：

```c
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

将代码克隆到相关目录，然后在项目根目录执行：  
`docker-compose up`

一切都完成了！！！

### python 配置

这里再贴一下 python 的 Dockerfile：

```
FROM python:3.8.5
WORKDIR /code
ENV FLASK_APP ./search-picture/server.py
ENV FLASK_RUN_HOST 0.0.0.0
ENV FLASK_RUN_PORT 8082
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . /code
CMD ["flask", "run"]
```

## 总结

我用两周时间将自己的两个后端服务 docker 化，容器应该是最小粒度的，你可以把它想像成组件，所以对于 python 服务和 node 服务应该拆分开了，作为两个容器运行，但我之前使用 node 服务来爬取图片，存在 python 的工作目录，然后 python 再去消费，这个过程是耦合的。

所以我用了很大一部分时间去拆分服务，爬取图片部分也用 python 重写了。现在两个项目都容器化，服务变得十分容易拓展，这意味着什么？

我的服务可以光速交接/服务器裁撤与我无关/本地环境和云端保持一致

## 常见问题

_备注：你可能会遇到这个问题，参考：http://km.oa.com/group/16523/articles/show/412832 _

> 最近使用公司自研云中的 docker 在创建网络时候出现了以下错误：
> Docker “ERROR: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network”  
>  解决方法：
> 需要指定一下 IP 段就好了
> // 删除一个网段，可选 172 和 198
> ip route del 172.16.0.0/12
> // tlinux 需要改路由，下面这个文件不删除重启又会占用网段
> vim /etc/sysconfig/network-scripts/setdefaultgw-tlinux
> 删除下面一行
> 172.16.0.0/12
