---
title: 'JavaScript函数式编程(四)“ '
date: 2017-04-06 23:23:35
tags:
- JavaScript
- 函数式编程
---

无类编程-数据导向

``` javascript
function LazyChain(obj) {
    var calls = [];
    return {
        invoke: function(methodName /*, args*/ ) {
            var args = _.rest(arguments);
            calls.push(function(target) {
                var meth = target[methodName];
                return meth.apply(target, args);
            });
            return this;
        },
        force: function() {
            return _.reduce(calls, function(ret, thunk) {
                return thunk(ret);
            }, obj)

        }
    };
}


function deferredSort(ary){
    return LazyChain(ary).invoke("sort");
}
function force(thunk){
    return thunk.force();
}
var deferredSorts = _.map([[2,1,3],[7,7,1],[0,9,5]],deferredSort);
_.map(deferredSorts,force)
/*[[1,2,3],[1,7,7],[0,5,9]]*/
```

添加一个验证函数

``` javascript
var validateTriples = validator(
    "Each array should have three elemetns",
    function(arrays){
        return _.every(arrays, function(a){
            return a.length === 3;
        })
    }
    );

var validateTriplesStore = partial1(condition1(validateTriples), _.identity);
validateTriplesStore([[2,1,3],[7,7,1],[0,9,5]]);
```

组合

``` javascript

function postProcess(arrays){
    return _.map(arrays,function(e){
        return e[1];
    })
}

function processTriples(date){
    return pipeline(
        date
        , JSON.parse
        , validateTriplesStore
        , deferredSort
        , force
        , postProcess
        , invoker("sort", Array.prototype.sort)
        ,function(o){
            return o
        });
}
processTriples("[[2,1,3],[7,7,1],[0,9,5]]")
/*[1, 7, 9]*/
```

Mixins

``` javascript
function stringifyArray(ary){
    return ["[", _.map(ary, poloToString).join(","), "]"].join("");
}

var poloToString = dispatch(
    function(s){return _.isString(s) ? s : undefined},
    function(s){return _.isArray(s) ? stringifyArray(s) : undefined},
    function(s){return _.isObject(s) ? JSON.stringify(s) : undefined},
    function(s){return s.toString()}
    );
poloToString("1")
poloToString([1,2])
poloToString({a:1})
```

使用Mixin扁平化结构