---
title: Github Actions
---
从CI/CD到Gihtub Actions

## GitHub Actions  

这是 Github 正在内测的一个功能，目前我还不知道它具体是干啥的，只看到了 Github 右侧边栏打的广告  

```
GitHub Actions beta, now with CI/CD
Automate any workflow with GitHub Actions. See the latest updates and register for the beta.
```

管他干啥的，先申请内测。  
于是......  
![内测ing](https://s2.ax1x.com/2019/08/11/ev3711.png)  

## CI/CD  

既然要等待，不如先了解下它是干啥的，首先我看到了 CI/CD，那就先了解下这两个概念吧。  

### CI  
持续集成（Continuous Integration，CI）是一种软件开发实践。在持续集成中，团队成员频繁集成他们的工作成果，一般每人每天至少集成一次，也可以多次。每次集成会经过自动构建（包括静态扫描、安全扫描、自动测试等过程）的检验，以尽快发现集成错误。许多团队发现这种方法可以显著减少集成引起的问题，并可以加快团队合作软件开发的速度（以上引用自Martin Fowler 对持续集成的定义）。  
> 人话：持续集成其实就是在代码提交后，进行自动化测试等操作，这样的话，你需要准备编写大量的测试用例，只有测试用例通过的时候，代码才允许走到下一个环节。所以你需要准备一个服务器(也可以是本地)，当代码提交的时候，去跑这些测试用例。
### CD

持续交付（Continuous Delivery）是指频繁地将软件的新版本交付给质量团队或者用户，以供评审，如果评审通过，代码就进入生产阶段。  
> 人话：持续交付接近我们现在的工作流，实在完成 CI 的基础上，对于发布流程进行的优化。当我们通过测试用例后，我们需要将代码发布到测试环境给QA人员进行评审（测试）。评审通过，我们可以通过 发布系统/dxy-matrix 触发项目的发布线上的流程。  

持续部署（Continuous Deployment）是持续交付的下一步，指的是代码通过评审以后，自动部署到生产环境中。

> 人话：持续部署是在持续交付的下一环节，想象一下，当我们通过了自动化测试，通过了QA，那是不是意味着，代码已经可以发线上了，我们连 触发 发布这个动作都不需要了，当我们将分支 push 到 master 的时候，CD 帮我们自动发布到线上。每一次改动都会直接和用户见面。线上有bug，我们可以迅速修掉。
### CI/CD
![图](https://pic4.zhimg.com/80/v2-958984fefb4525db84839cdc619294bf_hd.jpg)

### Github Action

现在是 09.01，终于拿到了 Github Action的内测机会。
![](https://img1.dxycdn.com/2019/0901/932/3365698690744026875-2.png)