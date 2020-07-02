---
title: 怒了，上 Docker
date: 2010/10/12
---
环境使人头大  

## node 版本管理包 n  

n 这个玩意儿好用是好用，但会导致很多问题，比如常见的 `npm list`，它会破坏 node 的全局环境，它会让我维护的一个 vscode 插件无法发布，在我尝试了两三个小时修复后(重复卸载安装node)，我决定放弃，还是创建一个干净的环境来发布吧......

#	Docker 显然不错
mac 获取 Docker  

https://hub.docker.com/  

你需要注册登录并下载安装(一顿操作猛如虎,过程就忽略了)  
安装完毕后，运行下 `docker -v`  
`Docker version 19.03.2, build 6a30dfc`  
说明安装成功了，进行下一步。
#	Docker 简介
> 小A：Docker 是啥呀，你就让我安装了，它凭啥能创建一个干净的环境呢？ 

> 我： docker的整个生命周期有三部分组成：镜像（image）+容器（container）+仓库（repository)，容器是镜像实例化来的，这里类比为 类 的实例化。这就好理解了吧，类实例化后的对象是互不干扰的，容器也是。  


让我们先下载一个镜像吧。  
`docker pull ubuntu`  
镜像下载后，先创建个容器并打开  
`sudo docker run -it ubuntu bash`  
用sudo 防止后面下载nodejs时不成功
打开后，运行 `ls` 命令。  
`bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var`  
看来已经创建好并打开了。  

接下来下载安装 nodejs。  
先更新下下载源： `apt-get update`
下载node  
 `apt-get install nodejs`  
 `apt-get install npm`