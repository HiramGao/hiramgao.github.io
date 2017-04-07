---
title: Gradle学习笔记
date: 2017-04-07 17:04:46
tags:
- JAVA
- Gradle
---

### 安装

前提必须安装JAVA JDK

下载Gradle

设置**环境遍历**

1. 添加 **GRADLE_HOME** 指明Gradle的安装路径
2. 添加 **%GRADLE_HOME%/bin** 到PATH

mac ox

``` bash
1.vim ~/.bash_profile

2.添加下面内容：
export GRADLE_HOME = /Users/UFreedom/gradle
export PATH=$PATH:$GRADLE_HOME/bin

3.source ~/.brash_profile
```

根据实际情况定

### 基本知识

一个 **task**是一个任务

在目录建立 **build.gradle**

``` groovy
task hello{
  doLast {
    println 'Hello world'
  }
}
```

命令行输入 **gradle -q hello** 输出如下

`Hello world`

**-q**代表quite模式，不会生成 Gradle 的日志信息

#### 快捷的任务定义

``` groovy
task hello << {
  println 'Hello world'
}
```

`<<` 代表doLast

使用Groovy的例子

``` groovy
task upper <<{
	String someString = "my_nAmE"
	println "Original: " + someString
	println "Upper case:"+someString.toUpperCase()
}
/*Original: mY_nAmE*/
/*Upper case: MY_NAME*/

task count << {
	4.times{print "$it "}
}
//0 1 2 3
```

#### 任务依赖

``` groovy
task intro(dependsOn: hello) << {
	print "I'm  Gradle"
}
//Hello world!
//I'm Gradle
task taskX(dependsOn: 'taskY') << {
    println 'taskX'
}
task taskY << {
    println 'taskY'
}
//taskY
//taskX
```

