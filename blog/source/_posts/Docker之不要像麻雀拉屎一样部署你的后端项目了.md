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

`Docker` 的意思是 码头工人/搬运工人

### 开发环境安装 `Docker`

推荐直接根据菜鸟教程安装桌面端，省去很多烦恼: [MAC 安装](https://www.runoob.com/docker/macos-docker-install.html)

因为我很懒，关于 Docker 的基本操作就不介绍了，我从 `Docker Compose` 直接讲起，

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

当你想在一台新服务器上部署该应用时，一句命令就省去你的烦恼，你又多了一个午后。而且云服务基本都内置了 Docker，应用的部署更为简单。

## 前端部署
