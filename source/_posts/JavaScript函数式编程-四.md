---
title: JavaScript函数式编程(四)
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

``` javascript
/*mixin*/
function Container(val) {
    this._value = val;
    this.init(val);
}
Container.prototype.init = _.identity;

var HoleMixin = {
    setValue: function(newValue) {
        var oldValue = this._value;
        this.validate(newValue);
        this._value = newValue;
        this.notify(oldValue, newValue);
        return this._value;
    },
};
var Hole = function(val) {
    Container.call(this, val);
};

var ObserverMixin = (function() {
    var _watchers = [];
    return {
        watch: function(fun) {
            _watchers.push(fun);
            return _.size(_watchers);
        },
        notify: function(oldValue, newValue) {
            _.each(_watchers, function(watcher) {
                watcher.call(this, oldValue, newValue);
            });
            return _.size(_watchers);
        }
    };
})();
var ValidateMixin = {
    addValidator: function(fun) {
        this._validator = fun;
    },
    init: function(val) {
        this.validate(val);
    },
    validate: function(val) {
        if (existy(this._validator) && !this._validator(val)) {
            fail("Attempted to set invalid value " + poloToString(val));
        }
    }
};

_.extend(Hole.prototype, HoleMixin, ValidateMixin, ObserverMixin);

var h = new Hole(42);
h.addValidator(always(false))
h.setValue(9)
/*Attempted to set invalid value 9*/

var h = new Hole(42);
h.addValidator(isEven);
h.setValue(9)
/*Attempted to set invalid value 9*/
h.setValue(108)
/*108*/

```

通过混合成一个新的数据结构

``` javascript
var SwapMixin = {
    swap: function(fun /*, args*/){
        var args = _.rest(arguments);
        var newValue = fun.apply(this, construct(this.value, args));

        return this.setValue(newValue);
    }
};
var SnapshotMixin = {
    snapshot: function(){
        return deepClone(this._value);
    }
};

_.extend(Hole.prototype, HoleMixin, ValidateMixin, ObserverMixin, SwapMixin, SnapshotMixin);

var h = new Hole(42)
h.snapshot()
/*42*/
h.swap(always(99));
h.snapshot()
/*99*/
```

实现一个新的类型CAS

``` javascript
var CAS = function(val){
    Hole.call(this, val);
}
var CASMixin = {
    swap: function(oldVal, f){
        if(this._value === oldVal){
            this.setValue(f(this._value));
            return this._value;
        }else{
            return undefined;
        }
    },
};

_.extend(CAS.prototype, HoleMixin, ValidateMixin, ObserverMixin, SwapMixin, CASMixin, SnapshotMixin);
var c = new CAS(42);
c.swap(42, always(-1));
c.snapshot()
/*-1*/
```

方法是低级别的操作，将上列操作封装成函数式API