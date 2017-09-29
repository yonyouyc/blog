var DescartesUtils = {

  /**
   * 如果传入的参数只有一个数组，求笛卡尔积结果
   * @param arr1 一维数组
   * @returns {Array}
   */
  descartes1: function(arr1) {
    // 返回结果，是一个二维数组
    var result = [];
    var i = 0;
    for(i = 0; i < arr1.length; i++) {
      var item1 = arr1[i];
      result.push([item1]);
    }
    return result;
  },

  /**
   * 如果传入的参数只有两个数组，求笛卡尔积结果
   * @param arr1 一维数组
   * @param arr2 一维数组
   * @returns {Array}
   */
  descartes2: function(arr1, arr2) {
    // 返回结果，是一个二维数组
    var result = [];
    var i = 0,
      j = 0;
    for(i = 0; i < arr1.length; i++) {
      var item1 = arr1[i];
      for(j = 0; j < arr2.length; j++) {
        var item2 = arr2[j];
        result.push([item1, item2]);
      }
    }
    return result;
  },

  /**
   *
   * @param arr2D 二维数组
   * @param arr1D 一维数组
   * @returns {Array}
   */
  descartes2DAnd1D: function(arr2D, arr1D) {
    var i = 0,
      j = 0;
    // 返回结果，是一个二维数组
    var result = [];

    for(i = 0; i < arr2D.length; i++) {
      var arrOf2D = arr2D[i];
      for(j = 0; j < arr1D.length; j++) {
        var item1D = arr1D[j];
        result.push(arrOf2D.concat(item1D));
      }
    }

    return result;
  },

  descartes3: function(list) {
    var listLength = list.length;
    var i = 0, j = 0;
    // 返回结果，是一个二维数组
    var result = [];
    // 为了便于观察，采用这种顺序
    var arr2D = DescartesUtils.descartes2(list[0], list[1]);
    for(i = 2; i < listLength; i++) {
      var arrOfList = list[i];
      arr2D = DescartesUtils.descartes2DAnd1D(arr2D, arrOfList);
    }
    return arr2D;
  },

  //笛卡儿积组合
  descartes: function(list) {
    if(!list) {
      return [];
    }
    if(list.length <= 0) {
      return [];
    }
    if(list.length == 1) {
      return DescartesUtils.descartes1(list[0]);
    }
    if(list.length == 2) {
      return DescartesUtils.descartes2(list[0], list[1]);
    }
    if(list.length >= 3) {
      return DescartesUtils.descartes3(list);
    }
  }

};