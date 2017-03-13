---
title: hexo 结合 travis 实现静态页面的自动部署
date: 2017-03-13 12:23:58
tags: 
	- hexo
	- travis

---

### 1. 部署hexo

参见官方教程 [hexo](https://hexo.io/docs/index.html)

### 2. 提交git

分别将生成的静态页面和项目本体提交到不同的分支

例如： [静态页面](https://github.com/HiramGao/hiramgao.github.io/tree/master) [项目分支](https://github.com/HiramGao/hiramgao.github.io/tree/dev)

### 3. 自动发布静态文件

[Travis CI官网](https://travis-ci.org/)利用github账号登录

将当前的项目添加为自动构建的仓库

打开  **Build only if .travis.yml is present** 和 **Build pushes** 选项

利用 `ssh-keygen -t rsa -C “例子@gmail.com”` 生成id_rsa和id_rsa.pub

将.pub文件内容添加到 github 项目 **settings > Deploy keys** 处，记得勾选 **Allow write access**

安装travis命令行

``` bash
gem install travis
travis login --auto
# 将id_rsa加密
travis encrypt-file id_rsa --add
# 产生.enc文件
```



在项目文件夹建立`.travis`文件夹，将生成的`.enc`文件放入其中，同时添加`ssh_config`文件，填写一下内容

``` yaml
Host github.com
    User git
    StrictHostKeyChecking no
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
```



添加部署文件 `.travis.yml`

``` yaml
language: node_js
sudo: false
branches:
  only:
  - dev
before_install:
- openssl aes-256-cbc -K $encrypted_24f627a79d15_key -iv $encrypted_24f627a79d15_iv -in ./.travis/id_rsa.enc -out ~/.ssh/id_rsa -d
- chmod 600 ~/.ssh/id_rsa
- eval $(ssh-agent)
- ssh-add ~/.ssh/id_rsa
- cp .travis/ssh_config ~/.ssh/config
- git config --global user.name 'hiramgao'
- git config --global user.email hiramgao@163.com
install:
- npm install hexo-cli -g
- npm install
script:
- npm run deploy
cache:
  directories:
  - node_modules
```



最后 提交到github 会自动构建并发布页面



参考 [我的博客](https://hexo.io/docs/index.html)

