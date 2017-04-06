---
title: JavaScript函数式编程(三)
tags:
  - JavaScript
  - 函数式编程
date: 2017-04-06 09:16:02
---


利用递归可以创建几个工具函数

andify 传入的所有的参数满足所有条件才返回true

``` javascript
function andify(/* preds */){
    var preds = _.toArray(arguments);
    return function(/* args */){
        var args = _.toArray(arguments);
        var everything = function(ps, truth){
            if(_.isEmpty(ps)){
                return truth;
            }else{
                return _.every(args, _.first(ps))
                    && everything(_.rest(ps), truth)
            }
        };
        return everything(preds, true);
    };
}

var evenNums = andify(_.isNumber, isEven);
evenNums(1,2); /*false*/
evenNums(2, 4, 6, 8); /*true*/
```

orify是：传入的参数满足一个条件即为真

``` javascript
function orify(/* preds */){
    var preds = _.toArray(arguments);
    return function(/* args */){
        var args = _.toArray(arguments);
        var something = function(ps, truth){
            if(_.isEmpty(ps)){
                return truth;
            }else{
                return _.some(args, _.first(ps))
                    || something(_.rest(ps), truth)
            }
        };
        return something(preds, false);
    };
}

function isOdd(n){
    return !isEven(n);
}

var zeroOrOdd = orify(isOdd,zero);

zeroOrOdd();/*false*/
zeroOrOdd(0, 2, 4, 6);/*true*/
zeroOrOdd(2, 4, 6); /*false*/
```

利用相互递归创建拉平函数

```javascript
function flat(array){
    if(_.isArray(array)){
        return cat.apply(cat,_.map(array, flat))
    }else{
        return [array]
    }
}

flat([[1,2],[3,4]]) /*[1, 2, 3, 4]*/
flat([[1,2],[3,4],[[[5]]]]) /*[1, 2, 3, 4, 5]*/
```

利用递归深度克隆

``` javascript
function deepClone(obj){
    if(!existy(obj) || !_.isObject(obj)){
        return obj;
    }
    var temp = new obj.constructor();
    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            temp[key] = deepClone(obj[key]);
        }
    }
    return temp;
}

var x = [{a:[1,2,3],b:42},{c:{d:[]}}];
var y = deepClone(x);
_.isEqual(x, y); /*true*/

y[1]['c']['d'] = 4;
_.isEqual(x, y); /*false*/
```

遍历一个嵌套数组的数组

``` javascript
function visit(mapFun, resultFun, array) {
    if (_.isArray(array)) {
        /* mapFun 会对每个元素处理，resultFun处理最后的数组*/
        return resultFun(_.map(array, mapFun))
    } else {
        /*直接处理*/
        return resultFun(array);
    }
}
visit(_.identity, _.isNumber, 42); /*true*/
visit(_.isNumber, _.identity, [1, 2, null, 3]); /*[true, true, false, true]*/
visit(function(n){return n*2},rev,_.range(10)); /*[18, 16, 14, 12, 10, 8, 6, 4, 2, 0]*/
```

生成器，ES6也有

``` javascript

function generator(seed, current, step) {
    return {
        head: current(seed),
        tail: function() {
            console.log("forced");
            return generator(step(seed), current, step)
        }
    }
}
/*操作生成器函数*/
function genHead(gen){
    return gen.head;
}
function genTail(gen){
    return gen.tail();/*被强制执行*/
}
var ints = generator(0, _.identity, function(n) {return n + 1;});
genHead(ints); /*0*/
genTail(ints); /*生成新的*/
/*{head: 1, tail: function}*/
```

建立一个更大的存取函数

``` javascript
/*蹦床函数,如果结果为function，会自动执行他*/
function trampoline(fun/* , args*/){
    var result = fun.apply(fun, _.rest(arguments));
    while(_.isFunction(result)){
        result = result();
    }
    return result;
}

function getTake(n, gen) {
    var doTake = function(x, g, ret) {
        if(x === 0){
            return ret;
        }else{
            return partial(doTake,x-1,genTail(g),cat(ret,genHead(g)));
        }
    };
    return trampoline(doTake, n, gen, [])
}
getTake(10, ints);/*[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]*/
```

链式调用

``` javascript
/*惰式调用*/
function LazyChain(obj) {
    this._calls = [];
    this._target = obj;
}
LazyChain.prototype.invoke = function(methodName /*, args*/ ) {
    var args = _.rest(arguments);
    this._calls.push(function(target) {
        var meth = target[methodName];
        return meth.apply(target, args);
    });
    return this;
}
LazyChain.prototype.force = function() {
    return _.reduce(this._calls, function(target, thunk) {
        return thunk(target);
    }, this._target)
}
LazyChain.prototype.tap = function(fun) {
    this._calls.push(function(target){
        fun(target);
        return target;
    });
    return this;
}
new LazyChain([2,1,3]).invoke('sort').tap(function(o){
    console.log(o);/*[1, 2, 3]*/
}).invoke('join',' ').force()
/*"1 2 3"*/
```

管道

``` javascript
function pipeline(seed /*, args*/){
	return _.reduce(_.rest(arguments)
		,function(l, r){return r(l)}
		,seed)
}
function fifth(a){
	return pipeline(a
		,_.rest
		,_.rest
		,_.rest
		,_.rest
		,_.first
		)
}
fifth([1,2,3,4,5]) /*5*/
```

使用action组合规范

``` javascript


function actions(acts, done) {
    return function(seed) {
        var init = { values: [], state: seed };
        var intermediate = _.reduce(acts, function(stateObj, action) {
            var result = action(stateObj.state);
            var values = cat(stateObj.values, [result.answer]);

            return { values: values, state: result.state };
        }, init);
        var keep = _.filter(intermediate.values, existy);
        return done(keep, intermediate.state);
    };
}

function lift(answerFun, stateFun) {
    return function( /* args */ ) {
        var args = _.toArray(arguments);
        return function(state) {
            var ans = answerFun.apply(null, construct(state, args));
            var s = stateFun ? stateFun(state) : ans;

            return { answer: ans, state: s }
        }
    }
}

/*模拟栈操作*/

var push = lift(function(stack, e){return construct(e, stack)});
var pop = lift(_.first, _.rest);

var stackAction = actions([
    push(1),
    push(2),
    pop()],
    function(values, state){
        return values;
    });

stackAction([])
/*[[1], [2, 1], 2]*/
```

和其他函数组合

```javascript
pipeline(
        [], stackAction, _.chain
    )
    .each(function(elem) {
        console.log(elem)
    });
```

