---
title: JavaScript函数式编程(二)
date: 2017-04-02 21:01:51
tags:
- JavaScript
- 函数式编程

---

接上回

自动柯里化参数的函数

``` javascript
function curry(fun){ /*柯里化一个参数*/
  return function(arg){
    return fun(arg);
  }
}
function curry2(fun) {
    return function(secondArg) {
        return function(firstArg) {
            return fun(firstArg, secondArg)
        }
    }
}
```

柯里化三个参数

``` javascript
function curry3(fun){
  return function(last){
    return function(middle){
      return function(first){
      	return fun(first,middle,last)
      }
    }
  }
}
```

利用curry3实现特定色彩生成HTML十六进制

``` javascript
function toHex(n){
  var hex = n.toString(16);
  return (hex.length < 2) ? [0, hex].join('') : hex;
}
function rgbToHexString(r, g, b){
  return ["#", toHex(r), toHex(g), toHex(b)].join("");
}
var blueGreenish = curry3(rgbToHexString)(255)(200);
blueGreenish(0)
```

柯里化一次只能消耗一个参数，**部分应用**可以消耗多个参数

``` javascript
function partial1(fun, arg1) { /*消耗一个参数*/
    return function(/*args*/){
        var args = construct(arg1, arguments);
        return fun.apply(fun, args)
    }
}
function partial2(fun, arg1, arg2) { /*消耗两个参数*/
    return function(/*args*/){
        var args = cat([arg1, arg2], arguments);
        return fun.apply(fun, args)
    }
}
function div(n, d){
    return n / d;
}

var over10Part1 = partial1(div, 10);
over10Part1(5); /*2*/


var over10Part2 = partial2(div, 10, 5);
over10Part2(); /*2*/
```

部分应用任意数量的参数

``` javascript
function partial(fun /* , pargs*/) { /*消耗一个或者多个参数*/
    var pargs = _.rest(arguments);
    return function(/*arguments*/){
        var args = cat(pargs, _.toArray(arguments));
        return fun.apply(fun, args)
    }
}

var over10Partial = partial(div, 10, 5);
over10Partial(); /*2*/
```

利用**bind**也可以实现上述作用

```javascript
function partialUseBind(fun /*,pargs*/) {
    return fun.bind.apply(fun,_.toArray(arguments))
}
partialUseBind(div,10,5)() /*2*/
```

局部应用实战

``` javascript

function validator(message, fun){
    var f = function(/*args*/){
        return fun.apply(fun, arguments);
    }
    f['message'] = message;
    return f;
}

var zero = validator('cannot be zero', function(n) {
    return 0 === n;
});
var number = validator('arg nust be a number', _.isNumber);
function sqr(n){
    if(!number(n)) throw new Error(number.message);
    if(zero(n)) throw new Error(zero.message);
    return n*n;
}

sqr(10); /*100*/
sqr(0); /*cannot be zero*/
sqr(''); /*arg nust be a number*/
```

可以将验证和计算分离，分为前置条件和后置条件

前置条件：函数的调用者的担保

后置条件：前置条件成立，保证函数的结果

看代码

``` javascript
/*前置条件*/
function condition1(/*validators*/){
    var validators = _.toArray(arguments);
    return function(fun, arg){
        var errors = mapcat(function(isValid){
            return isValid(arg) ? [] : [isValid.message];
        },validators);
        if(!_.isEmpty(errors)){
            throw new Error(errors.join(', '));
        }
        return fun(arg)
    }
}

/*翻转结果*/
function complement(PRED){
    return function() {
        return !PRED.apply(PRED, _.toArray(arguments));
    }
}
var sqrPre = condition1(
        validator("arg must not be zero", complement(zero)),
        validator("arg must be a number", _.isNumber)
    );

sqrPre(_.identity, 10); /*10*/
sqrPre(_.identity, ""); /*arg must be a number*/
sqrPre(_.identity, 0);/*arg must not be zero*/
```

利用已经有工具组合计算

``` javascript
function uncheckSqr(n){return n*n}
uncheckSqr(""); /*0 显然错误*/
var checkSqr = partial1(sqrPre,uncheckSqr);
checkSqr(10); /*100*/
checkSqr("") /*arg must be a number*/
```

分离了计算和有效性验证，可以灵活地扩展

```javascript
function isEven(n){
    return (n%2) === 0;
}
var sillySquare = partial1(
    condition1(validator("should be even", isEven)),
    checkSqr
    );
sillySquare(11) /*should be even*/
```

组合端到端的**拼接函数**

``` javascript
function not(x){return !x}
var isntString = _.compose(not, _.isString)
isntString([]); /*true*/
```

可以重新定义mapcat

``` javascript
/*将传入的参数可以转为数组模式*/
function splat(fun){
    return function(array){
        return fun.apply(null,array)
    }
}

var composeMapcat = _.compose(splat(cat),_.map)
composeMapcat([[1,2],[3,4],5]);/*[1, 2, 3, 4, 5]*/
```

利用拼接函数可以组合前置和后置条件

``` javascript
var greateThan = curry2(function(lhs, rhs) {
   return lhs > rhs;
});

var sqrPost = condition1(
        validator("result should be a number", _.isNumber),
        validator("result should not be zero", complement(zero)),
        validator("result should be positive", greateThan(0))
    );

var megaCheckSqr = _.compose(partial(sqrPost,_.identity),checkSqr);
megaCheckSqr(NaN); /*result should be positive*/
```

一切后置条件的失败都永远是函数的提供者的错。

待续