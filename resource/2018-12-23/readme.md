# 通过对象校验器的实现来学习函数抽象和高阶函数的使用

本文会通过一个对象校验器的需求不通版本实现的演进，让大家更好的理解函数抽象，进而初步掌握一些高阶函数的使用。

我们先描述一下需求

```javascript
// 以下是一个js object，
var obj = {
  id: '',
  name: '',
  sex: -2,
  age: 'string2'
}
```

- 我们期望对 obj 字段在保存前做以下校验
- 1.id should not be null
- 2.name should not be null
- 3.sex should be 0 or 1
- 4.age should be a number

## 1. 普通的写法

```javascript
var erroMsg = ''
if (!obj.id) {
  erroMsg += 'id should not be null'
}
if (!obj.name) {
  erroMsg += 'name should not be null'
}
if (obj.sex !== 1 && obj.sex !== 0) {
  erroMsg += 'sex should be 0 or 1'
}
if (isNaN(obj.age)) {
  erroMsg += 'age should be a number'
}
console.log(erroMsg)
```

普通写法有一个问题，他只针对特定的 obj 实体，而无法对所有对象通用。

我们的目的是写一个通用的对象校验器，并将他拓展到后续的表单校验组件之中

## 2.可复用版本(第一版)

首先，我们希望将我们的校验方法拆解成一对 validate 函数, 以及一个统一的 checker 函数

```javascript
checker(obj, validators)
```

于是进行第一版改造 并将一些通用的校验函数提取出来,为了其他 obj 复用

```javascript
// 必填校验
var required = function(obj) {
  return obj[this.key] !== '' && obj[this.key] != null
}
// 必须是一个数字
var shouldBeNumber = function(obj) {
  return !isNaN(obj[this.key])
}
```

### 校验函数 validators

```javascript
var validators = [
  {
    key: 'id',
    error: 'id should not be null\n',
    fn: required
  },
  {
    key: 'name',
    error: 'name should not be null\n',
    fn: required
  },
  {
    key: 'sex',
    error: 'sex should be 0/1\n',
    fn: function(obj) {
      return obj[this.key] == 0 || obj[this.key] == 1
    }
  },
  {
    key: 'age',
    error: 'age should be a number\n',
    fn: shouldBeNumber
  }
]
```

### checker 函数

```javascript
// 把所有错误结果放入一个数组之中
var checker = function(obj, validators) {
  var errorMsg = []
  validators.forEach(function(validate) {
    if (!validate.fn.call(validate, obj)) {
      errorMsg.push(validate.error)
    }
  })
  return errorMsg
}
```

### 使用 checker

```javascript
var result = checker(obj, validators)
```

### validators 进一步封装

我们可以把 validate 函数再抽象一下，errorMsg 其实针对 required 类型的都应该是一样的只不过是 key 不一样

```javascript
required = function(obj) {
  var val = obj[this.key]
  // 必填校验
  if (val !== '' && val != null) {
    return ''
  } else {
    return this.key + 'should not be null\n'
  }
}
shouldBeNumber = function(obj) {
  // 必须是一个数字
  if (!isNaN(obj[this.key])) {
    return ''
  } else {
    return this.key + 'should be a number\n'
  }
}
var defaultValidate = {
  required: required,
  number: shouldBeNumber
}
// 进而修改validates
validators = [
  {
    key: 'id',
    type: 'required' // 原来的fn转换成type，本地页面和内部封装的校验函数通过type关联，解耦
  },
  {
    key: 'name',
    type: 'required'
  },
  {
    key: 'sex', // fn和type两种方式都支持，支持自定义校验,所有的校验结果都在fn中返回
    fn: function(obj) {
      if (obj[this.key] != 0 && obj[this.key] != 1) {
        return 'sex必须为0或者1'
      } else {
        return ''
      }
    }
  },
  {
    key: 'age',
    type: 'number'
  }
]
```

### 改造 checker 函数

```javascript
checker = function(obj, validators) {
  var errorMsg = []
  validators.forEach(function(validate) {
    // 根据type来判断对应的校验函数
    if (validate.type) {
      var returnMsg = defaultValidate[validate.type].call(validate, obj)
      if (returnMsg) {
        errorMsg.push(returnMsg)
      }
    } else {
      // 自定义校验函数
      if (!validate.fn.call(validate, obj)) {
        errorMsg.push(validate.error)
      }
    }
  })
  return errorMsg
}
var result2 = checker(obj, validators)
```

### 使用 reduce 把 forEach 重写一下，减少中间变量 errorMsg 的使用

```javascript
checker = function(obj, validators) {
  return _.reduce(
    validators,
    function(errorMsg, validate) {
      if (validate.type) {
        var returnMsg = defaultValidate[validate.type].call(validate, obj)
        if (returnMsg) {
          return _.chain(errorMsg)
            .push(returnMsg)
            .value()
        } else {
          return erroMsg
        }
      } else {
        var error = validate.fn.call(validate, obj)
        if (error) {
          return _.chain(errorMsg)
            .push(error)
            .value()
        } else {
          return erroMsg
        }
      }
    },
    []
  )
}
var result3 = checker(obj, validators)
```

## 2.可复用版本(第二版)

以上的代码其实还是有一点繁琐的。如果我同时有 obj1,obj2,obj3 三个数据要同时做校验，
我们当然可以用下面这三种方式来处理

```javascript
checker(obj1, validators)
checker(obj2, validators)
checker(obj3, validators)
```

每次校验都写一遍 validators 是有点麻烦，我们可以通过高阶函数来处理,同时在初始化的时候就把 cheker 需要的格式初始化好，进一步简化代码提升效率。

```javascript
// 最终版本
var wrapChecker = function(validators) {
  var _validators = _.toArray(validators)
  _validators.forEach(function(item) {
    if (item.type) {
      item.fn = defaultValidate[item.type]
    }
  })
  return function(obj) {
    return _.reduce(
      _validators,
      function(errorMsg, validate) {
        var msg = validate.fn.call(validate, obj)
        return msg
          ? _.chain(errorMsg)
              .push(msg)
              .value()
          : erroMsg
      },
      []
    )
  }
}
var newChecker = wrapChecker(validators)
var result4 = newChecker(obj)
console.log(result4)
```

至此我们提供了个可通用的校验函数 wrapChecker。大家可以针对这个对象校验器实现的演化来理解一些函数抽象的好处，逐渐入门函数式编程。
