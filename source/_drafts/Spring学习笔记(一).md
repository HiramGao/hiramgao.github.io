---
title: Spring学习笔记(一)
date: 2017-04-10 15:04:48
tags:
- JAVA
- Spring
---

阅读《Spring实战（第四版）》

源码 [在此](./SpringiA4_SourceCode.zip)

Spring 的关键策略

>基于POJO的轻量级和最小侵入性编程
>
>依赖注入和面向接口实现松耦合
>
>基于切面和惯例进行声明式编程
>
>通过切面和模板减少样板式代码

### 装配Bean

Spring 提供三种装配机制

- xml配置
- Java代码内配置
- 隐式的bean发现机制和自动装配

推荐自动配置，显式配置越少越好

