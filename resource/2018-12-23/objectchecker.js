var _ = require('lodash')
// checker的目的，以数组传入一段校验函数
// 需求
var obj = {
  id: '', // should not be null
  name: '', // should not be null
  sex: -2, // should be 0 or 1
  age: 'string2' // should be a number
}
// 普通的写法
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
// console.log(erroMsg)
// 普通写法有一个问题，他只针对特定的obj实体，而无法对所有对象通用。
// 我们的目的是写一个通用的对象校验器，并将只拓展到后续的表单校验组件之中

// 拆解，我们希望将我们的校验方法拆解成一对validate函数, 以及一个统一的checker函数
// checker(obj, validators)
// 进行第一版改造 并将一些通用的校验提取出来,为了其他obj复用

var required = function (obj) {
  // 必填校验
  return obj[this.key] !== '' && obj[this.key] != null
}

var shouldBeNumber = function (obj) {
  // 必须是一个数字
  return !isNaN(obj[this.key])
}
var validators = [{
  key: 'id',
  error: 'id should not be null\n',
  fn: required
}, {
  key: 'name',
  error: 'name should not be null\n',
  fn: required
}, {
  key: 'sex',
  error: 'sex should be 0/1\n',
  fn: function (obj) {
    return obj[this.key] == 0 || obj[this.key] == 1
  }
}, {
  key: 'age',
  error: 'age should be a number\n',
  fn: shouldBeNumber
}]
var checker = function (obj, validators) {
  var errorMsg = '\nnew checker ';
  validators.forEach(function (validate) {
    if (!validate.fn.call(validate, obj)) {
      errorMsg += validate.error
    }
  })
  return errorMsg
}
var result = checker(obj, validators)
// console.log(result)
// 我们可以把validate函数再抽象一下，errorMsg其实针对required类型的都应该是一样的只不过是key不一样
required = function (obj) {
  var val = obj[this.key]
  // 必填校验
  if (val !== '' && val != null) {
    return ''
  } else {
    return this.key + 'should not be null\n'
  }
}
shouldBeNumber = function (obj) {
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
validators = [{
  key: 'id',
  type: 'required' // 原来的fn转换成type，本地页面和内部封装的校验函数通过type关联，解耦
}, {
  key: 'name',
  type: 'required'
}, {
  key: 'sex', // fn和type两种方式都支持，支持自定义校验,所有的校验结果都在fn中返回
  fn: function (obj) {
    if (obj[this.key] != 0 && obj[this.key] != 1) {
      return 'sex必须为0或者1'
    } else {
      return ''
    }
  }
}, {
  key: 'age',
  type: 'number'
}]
checker = function (obj, validators) {
  var errorMsg = [];
  validators.forEach(function (validate) {
    if (validate.type) {
      var returnMsg = defaultValidate[validate.type].call(validate, obj)
      if (returnMsg) {
        errorMsg.push(returnMsg)
      }
    } else {
      if (!validate.fn.call(validate, obj)) {
        errorMsg.push(validate.error)
      }
    }
  })
  return errorMsg
}
var result2 = checker(obj, validators)
// 我们再使用reduce的方式把for循环重写一下
checker = function (obj, validators) {
  return _.reduce(validators, function (errorMsg, validate) {
    if (validate.type) {
      var returnMsg = defaultValidate[validate.type].call(validate, obj)
      if (returnMsg) {
        return _.chain(errorMsg).push(returnMsg).value()
      } else {
        return erroMsg
      }
    } else {
      var error = validate.fn.call(validate, obj)
      if (error) {
        return _.chain(errorMsg).push(error).value()
      } else {
        return erroMsg
      }
    }
  }, [])
}
var result3 = checker(obj, validators)
// 那么还有一个问题，如果我同时有obj1,obj2,obj3三个数据要同时做校验
// 我们当然可以checker(obj1, validators)；checker(obj2, validators)；checker(obj3, validators)
// 每次校验都依赖validators是有点麻烦，我们可以通过高阶函数来处理,同时在初始化的时候就把cheker需要的格式初始化好
var wrapChecker = function (validators) {
  var _validators = _.toArray(validators)
  _validators.forEach(function (item) {
    if (item.type) {
      item.fn = defaultValidate[item.type]
    }
  })
  return function (obj) {
    return _.reduce(_validators, function (errorMsg, validate) {
      var msg = validate.fn.call(validate, obj)
      return msg ? _.chain(errorMsg).push(msg).value() : erroMsg
    }, [])
  }
}
var newChecker = wrapChecker(validators)
var result4 = newChecker(obj)
console.log(result4)
// 至此我们提供了个可通用的校验函数wrapChecker