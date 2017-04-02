---
title: JavaScript函数式编程(一)
date: 2017-03-28 15:06:55
tags: 
- JavaScript
- 函数式编程
---
为什么要用函数式，因为爽！！！！
[JS函数式编程指南](https://www.gitbook.com/book/llh911001/mostly-adequate-guide-chinese/details)
[JavaScript函数式编程](https://www.amazon.cn/%E5%9B%BE%E4%B9%A6/dp/B01264FOY4/ref=sr_1_1?ie=UTF8&qid=1490667646&sr=8-1&keywords=javascript%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BC%96%E7%A8%8B)
两本不一样
[underscorejs](http://underscorejs.org/)
确保理解JavaScript的闭包和作用域
## 基础知识
明白下面概念
1.  JavaScript中纯函数是一等公民
    什么叫做**纯函数**
    ``` javascript
    function add(a,b){a,b)
    	return a + b
    }
    add(1,2) /*3*/
    add(1,2) /*3*/
    ```
    纯函数是指**不依赖且不改变它作用域之外的变量状态**的函数。下面的是非纯函数
    ``` javascript
    var c = 1
    function addWithC(a,b){
    	return a + b + c
    }
    addWithC(1,2)/*4*/
    c = 2
    addWith(1,2) /*5*/
    ```
    为什么说js中函数是一等公民
    函数可以作为变量、数组元素、对象成员、作为参数、作为return 对象，可以去任何值的地方，所以是一等的公民。
2.  高阶函数
    以一个函数作为参数，以一个函数作为返回结果就为**高阶函数**。
    ``` javascript
    function add(a, b){
    	return a + b
    }
    function addWithC(fn, a, b){
    	return function(c){
    		return fn.call(this,a, b) + c
    	}
    }
    addWithC(add,1,2)(3) /*6*/
    ```
3.  柯里化
    将多个参数的函数转变为接受单一参数的函数
    ```  javascript
    function add(a, b){
    	return  a + b
    }
    var addWith10 = (function addWith10(){
    	return function(a){
    		return add.call(this,10, a)
    	}
    })()
    addWith10(1) /*11*/
    addWith10(2) /*12*/
    ```

## 实战演练
有了基本概念就可以开始实战了
定义几个输出信息的函数
``` javascript
function fail(thing){
	throw new Error(thing)
}
function warn(thing){
	console.warn(["WARNING:", thing].join(' '))
}
function note(thing){
	console.log(["NOTE:", thing].join(' '))
}
```
定义两个常用函数
``` javascript
/*检查值是否为null和undefined*/
function existy(x){ return x != null}
//判断x是否被认为是true的同义词
function truthy(x){ return (x !== false && existy(x))}

[1,null,false,undefined].map(existy)
/*[true, false, true, false]*/
[1,null,false,undefined].map(truthy)
/*[true, false, false, false]*/
```
那么就可以代替以下操作
``` javascript
{
	if(condition)
		return _.isFunction(doSomething) ? doSomething() : doSomething;
	else
		return undefined;
}

function doWhen(cond, action){
	if(truthy(cond))
		return action();
	else
		return undefined;
}
```
返回常量的函数
``` javascript
function always(VALUE){
	return function(){
		return VALUE;
	}
}

var f = always(function(){})
f() === f() //true
```
在来几个基本函数
``` javascript
function cat(){
	var head = _.first(arguments);
	if(existy(head)){
		return head.concat.apply(head, _.rest(arguments));
	}else{
		return [];
	}
}
cat([1,2,3],[4,5],[6,7,8,9]) /*[1, 2, 3, 4, 5, 6, 7, 8, 9]*/
/*第一个*/
function construct(head, tail){
	return cat([head], _.toArray(tail))
}
construct(42,[1,2,3]) /*[42, 1, 2, 3]*/
/*第二个*/
function mapcat(fun, coll){
	return cat.apply(null, _.map(coll,fun))
}
mapcat(function(e){
	return construct(e,[',']);
},[1,2,3]) /*[1, ",", 2, ",", 3, ","]*/

function butLast(coll) {
    return _.toArray(coll).slice(0, -1);
}

function interpost(inter, coll) {
    return butLast(mapcat(function(e) {
        return construct(e, [inter]);
    }, coll))
}
interpost(",",[1,2,3]) //[1, ",", 2, ",", 3]
```
invoker:接受一个方法，并在任何给定的对象上调用它
``` javascript
function invoker(NAME,METHOD){
    return function(target /*args...*/){
        if(!existy(target)) fail('must provide a target');
        var targetMethod = target[NAME];
        var args = _.rest(arguments);
        return doWhen((existy(targetMethod) && METHOD === targetMethod),
            function(){
                return targetMethod.apply(target,args)
            }
        );
    }
}

var rev = invoker('reverse',Array.prototype.reverse)

rev([1,2,3])
//[3, 2, 1]
```
防止不存在的函数：full
``` javascript
var nums = [1,2,3,null,5]
Array.prototype.reduce.call(nums,function(total,n){return total * n}); /*0*/

function fnull(fun /*,default*/){
	var defaults = Array.prototype.slice.call(arguments);
	return function(/*args*/){
		var args = Array.prototype.map.call(arguments, function(e, i){
			return existy(e) ? e : defaults[i];
		});
		return fun.apply(fun, args)
	};
}

var safeMult = fnull(function(total,n){return total * n}, 1, 1)
Array.prototype.reduce.call(nums,safeMult); /*30*/

可以这样使用
function defaults(d){
	return function(o, k){
		var val = fnull(_.identity,d[k])
		return o && val(o[k]);
	}
}

function doSomething(config){
	var lookup = defaults({critical:108});
	return lookup(config, 'critical')
}
console.log(doSomething({critical:9})) /*9*/
console.log(doSomething({})) //108
```
利用invoker 如果调用到目标对象不具有的方法会返回undefined，可以组合多个invoker 形成多态函数，或者根据不同参数产生不同行为的函数
``` javascript

function dispatch(/* funs */){
	var funs = _.toArray(arguments);
	var size = funs.length;
	return function(target /*, args*/){
		var ret = undefined;
		var args = _.rest(arguments);
		var fun;
		for (var funIndex = 0; funIndex < size; funIndex++) {
			fun = funs[funIndex];
			ret = fun.apply(fun, construct(target,args))
			if(existy(ret)) return ret;
		}

		return ret
	};
}

var str = dispatch(
	invoker('toString',Array.prototype.toString),
	invoker('toString',String.prototype.toString)
	)
str("a") /*"a"*/
str([1,2,3,4]) //"1,2,3,4"
```
当然也可以这样做
``` javascript
function stringReverse(s){
	if(!_.isString(s)) return undefined;
	return s.split('').reverse().join('')
}

stringReverse("abc") /*"cba"*/
stringReverse(1) /*undefined*/

var rev = dispatch(
	invoker('reverse',Array.prototype.reverse),
	stringReverse
	)

rev([1,2,3]) /*[3,2,1]*/
rev('abc') // "cba"
```
还可以继续包装返回默认值
``` javascript
var sillyReverse = dispatch(rev,always(42));
sillyReverse([1,2,3]) //[3,2,1]
sillyReverse('abc')//'cba'
sillyReverse(10000) //42
```
这个函数基本可以取代switch case
``` javascript
function isa(type, action){
	return function(obj){
		if(type === obj.type){
			return action(obj)
		}
	}
}
var performCommand = dispatch(
	isa('notify',function(obj){console.log('notify'); return true}),
	isa('join',function(obj){console.log('join'); return true}),
	function(obj){console.log('alert')}
	);

performCommand({type:'notify'}) /*notify*/
performCommand({type:'join'}) /*join*/
performCommand({type:'other'}) /*alert*/
```
可以很轻松的扩展
``` javascript
var performAdminCommand = dispatch(
	isa('kill',function(obj){console.log('kill');return true;}),
	performCommand
	)
performAdminCommand({type:'notify'}) 
performAdminCommand({type:'join'})
performAdminCommand({type:'kill'}) /*kill*/
performAdminCommand({type:'other'})
```
可以实现重载
``` javascript
var performTrialUserCommand = dispatch(
	isa('join',function(obj){console.log('user join');return true;}),
	performCommand
	)
performTrialUserCommand({type:'notify'})
performTrialUserCommand({type:'join'}) /*user join*/
performTrialUserCommand({type:'other'})
```
写一个自动柯里化参数的函数
``` javascript
function curry(fun){
	return function(arg){
		return fun(arg)
	}
}
```
待续