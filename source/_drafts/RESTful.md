---
title: RESTful
date: 2017-04-14 20:42:51
tags:
- RESTful
---

## 写在前面的话

### URI vs URL:

每一个URL都是一个URI。一个URI并不保证具有表述。一个URI什么都不是，它只是一个标识。而一个URL是一个可以被**引用**的标识。`http:URI`，`ftp:URI`这些是URL，非URL的URI：`urn:isbn:97814449358093`。

### REST:

REST起源于Roy Thomas Fieling 的[论文](http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)。

REST(Representational State Transfer)，资源在网络中以某种表现形式进行状态转移。

**Resources**:**资源**，是网络上的一个具体信息。可以是一段文本，一张图片…任何可以被引用的事物都可以是资源，唯一的条件就是**每个资源都必须拥有url**。

**Representation**：**表现层**，把资源具体呈现出来的形式，叫做它的**表现层**。

**State Transfer**：**状态转移**，客户端想要操作服务器，必须通过某种手段，让服务器发生状态转移。状态转移是建立在表现层之上的，所以叫"**表现层状态转移**"。

### HTTP动词：

- **GET**:获取资源的某个标识。
- **DELETE**:销毁一个资源。
- **POST**:基于给定的表述信息，在当前资源的下一级创建新的资源。
- **PUT**:用给定的表述信息完整的替换资源的当前状态。
- **PATCH**:用给定的表述信息部分的替换资源的当前状态。
- **HEAD**:只返回HTTP状态码和报头，
- **OPTIONS**:返回的报头展示这个资源所支持的所有HTTP方法。

### 补充

**幂等性：**`5 * 0 = 0，5 * 0 * 0=0`例如DELETE一个资源，无论发送多少次请求，资源的状态和你发送的第一次DELETE请求都是一样的。PUT，GET也是幂等的。

一句话描述就是：**URL定位资源，用HTTP动词（`GET`,`POST`,`DELETE`,`PUT`...）描述操作。**

---

## 如何设计

API尽量部署到专用域名下且总是使用HTTPs协议。

也可以放在主域名下。

``` 
https://api.example.com
https://www.example.com/api/
```

URL只使用**名词的复数**来指定资源，**不使用动词**，

``` 
GET https://www.api.example.com/friends   获取某人好友列表
POST https://www.api.example.com/friends/ 添加好友
```

将API版本放在URL中，另外一种是放在HTTP头信息中。

```
https://api.example.com/v1/
```