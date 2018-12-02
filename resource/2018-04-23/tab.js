var vm = {
  list: ko.observableArray([{
    name: '1',
    active: ko.observable(false),
    dispearright: ko.observable(false),
    dispearleft: ko.observable(false)
  }, {
    name: '2',
    active: ko.observable(false),
    dispearright: ko.observable(false),
    dispearleft: ko.observable(false)
  }, {
    name: '未发布',
    active: ko.observable(false),
    dispearright: ko.observable(false),
    dispearleft: ko.observable(false)
  }, {
    name: '一直没有发布',
    active: ko.observable(false),
    dispearright: ko.observable(false),
    dispearleft: ko.observable(false)
  }]),
  click: function (cur) {
    var outerindex = vm.list().indexOf(cur)
    vm.list().forEach(function (item, innerindex) {
      // 选中且位于左侧
      if (item.active()) {
        if (innerindex < outerindex) {
          item.dispearright(true)
        } else {
          item.dispearleft(true)
        }
      } else {
        item.dispearright(false)
        item.dispearleft(false)
      }
      item.active(false)
    })
    cur.active(true)
  }
}
ko.applyBindings(vm)