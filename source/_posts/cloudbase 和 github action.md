---
title: 使用 Github Action/Hexo/Cloudbase 让你的博客更快
date: 2021/07/04
---

## GitHub Actions

这个东西可以让我们写一些简单的 ci 配置，然后代码修改上传到 Github 后，Github 的服务器帮我们执行 ci 任务。

可以是执行一些代码检查/集成测试或者发布流程等等。

之前我的博客是通过运行 Hexo 的命令： `hexo deploy`，自动化的部署到 `Github Page` 上。可以参考这里：https://hexo.io/zh-cn/docs/github-pages

但由于各种原因，博客打开很慢......所以我想将博客部署到 腾讯云的 `Cloudbase` 上。因此花了一丢丢时间使用 `Github Action + Hexo + Cloudbase` 来完成博客的发布。

### Actions 配置

你需要在仓库的根目录创建 `.github/workflows/cloudbase.yml`，yml 文件就是 github 服务会去运行的脚本。这里的文件名可以随意起，如果你有其他类型的任务也可以新增 yml 文件。

它的内容是这样的：

```yml
name: GitHub Actions Build and Deploy
on:
  push:
    branches:
      - master

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 1. git checkout...

        uses: Actions/checkout@v1

      - name: 2. setup nodejs...

        uses: Actions/setup-node@v1

      - name: 3. install hexo...

        run: |
          npm install hexo-cli -g
          npm install
          git clone -b master https://github.com/lewis-geek/hexo-theme-Aath.git themes/aath

      - name: 4. hexo generate public files...

        run: |
          hexo clean
          hexo g
      # 部署到腾讯云
      - name: Deploy static to Tencent CloudBase

        id: deployStatic
        uses: TencentCloudBase/cloudbase-Action@v2
        with:
          secretId: ${{ secrets.SECRET_ID }}
          secretKey: ${{ secrets.SECRET_KEY }}
          envId: ${{ secrets.ENV_ID }}
          staticSrcPath: ./public

      - name: Get the deploy result

        run: echo "Deploy to cloudbase result ${{ steps.deployStatic.outputs.deployResult }}"
```

如果你之前有配置过 Gitlab CI 的话，应该很容易看懂，整个配置文件在描述以下事情：

- step 1 在利用 `Actions/checkout@v1` 来 checkout 代码。
- step 2 在利用 `Actions/setup-node@v1` 安装 node 环境。
- step 3 在做 hexo 工具的安装以及下载 hexo 皮肤。
- step 4 在清除历史文件并重新生成静态资源。

前两步的 Actions 是在 Actions [市场](https://github.com/marketplace?type=Actions) 找到的，你也可以创建自己的 [Actions](https://docs.github.com/en/Actions/hosting-your-own-runners/about-self-hosted-runners)m

接下来我们就需要将生成的 public 资源发布腾讯云静态资源存储上。

### 腾讯云 Cloudbase 静态网站托管

Cloudbase 是腾讯云提供的一站式服务，支持云函数/静态网站托管/后端服务托管/云存储等等功能，在这里我们使用它的静态网站托管来管理我们的博客资源。

我们可以创建一个静态网站托管环境。并且记录它的 ENV_ID

![](https://626c-blog-8gvwbiz0f81b6ce8-1258448523.tcb.qcloud.la/tuchuang/16b7efffb98877b0529b2da134ea586a.png?sign=2b17265124ec8d4bacc67405044a2c30&t=1625453260)
并且在访问管理找到这两个值
SECRET_ID SECRET_KEY
![](https://626c-blog-8gvwbiz0f81b6ce8-1258448523.tcb.qcloud.la/tuchuang/269a5eccc8387620f978ef7cc8421f9b.png?sign=4274f72b9a4ca58d4c26c449e41c67d3&t=1625452789)

以上我们得到了三个参数

这里用到的 Actions 是腾讯云 cloudbase 团队提供的 [cloudbase-Action](https://github.com/TencentCloudBase/cloudbase-Action)

这个 Actions 就需要这三个参数，我们需要将它配置到 Github 中。

### Github 配置自定义参数

在你的项目 settings/secrets 中，新建以上得到的三个 secret，这样，Actions 配置里就能拿到具体的值了。

![](https://626c-blog-8gvwbiz0f81b6ce8-1258448523.tcb.qcloud.la/tuchuang/4dabd3dbd130eab278c3999419d67d05.png?sign=0601e0d4ef7732dd6d447cf10dd6e0af&t=1625453632)

### 提交代码

代码 `push` 到远程之后，Actions 流程将开始执行，你可以在项目 Actions 里面看到执行流程：

![](https://626c-blog-8gvwbiz0f81b6ce8-1258448523.tcb.qcloud.la/tuchuang/c89c811106e1c037a5181807e489ed34.png?sign=d60b1c87ac2fde5217545ab329732fea&t=1625456091)
