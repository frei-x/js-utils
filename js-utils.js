/**
 * @description js工具箱
 * @author 浩  javascript.h@qq.com
 * @date 2019-01-11
 */
(function () {
  "use strict";
  var vm = {
    // 事件总线:
    on: function () { },
    emit: function () { },
    _arrOnEvent: [],
    // 处理先emit后on的情况,将漫游中的emit'暂存'
    _arrCacheEmit: [{}, {}]
  };

  /**
   * @description 检测数据类型
   * @param {*} variable
   * @returns {String} type 返回类型,首字母大写
   */
  vm.getType = function (variable) {
    // 11种
    // console.log(Object.prototype.toString.call("sstr"));//[object String]
    // console.log(Object.prototype.toString.call(12));//[object Number]
    // console.log(Object.prototype.toString.call(true));//[object Boolean]
    // console.log(Object.prototype.toString.call(undefined));//[object Undefined]
    // console.log(Object.prototype.toString.call(null));//[object Null]
    // console.log(Object.prototype.toString.call({}));//[object Object]
    // console.log(Object.prototype.toString.call(function () { }));//[object Function]
    // console.log(Object.prototype.toString.call([]));//[object Array]
    // console.log(Object.prototype.toString.call(new Date));//[object Date]
    // console.log(Object.prototype.toString.call(/\d/));//[object RegExp]
    //!! console.log(Object.prototype.toString.call(Symbol));//[object Function] !!
    //console.log(Object.prototype.toString.call(Symbol()));//[object Symbol]
    var type = Object.prototype.toString.call(variable).slice(8, -1);
    return type;
  };

  /**
   * @description 根据on与emit的参数执不同的策略
   * @param {String | Array} eventName
   * @param {Function} callback
   */
  vm._eventPublicCheckArgType = function (eventName, callback) {
    let arrEventName = [];
    if (Array.isArray(eventName) && eventName.length > 0) {
      //console.log("数组");
      arrEventName = eventName;
    } else if (typeof eventName == 'string' && eventName.trim().length > 0 && eventName.split(',').length > 1) {
      //console.log("多字符串拆数组");
      arrEventName = eventName.split(',');
    } else if (typeof eventName == 'string' && eventName.trim().length > 0 && eventName.split(',').length == 1) {
      //console.log('单字符串还原数组');
      arrEventName = [eventName];
    } else {
      console.error('未知类型')
    }
    callback.call(this, arrEventName);
  };

  /**
   * @description 发送事件
   * @param {String | Array} eventName
   * @param {*} params
   */
  vm.emit = function (eventName, params) {
    let sItemEvent = '';
    function funCheckArrFunHaveEventName(arrEventName) {
      var arrEventNameLen = arrEventName.length;
      for (let i = 0; i < arrEventNameLen; i++) {
        ((i) => {
          let isHaveEvent = this._arrOnEvent.some((item, index) => {
            sItemEvent = item;
            return item.name == arrEventName[i];
          });
          if (isHaveEvent) {
            sItemEvent.fun(params);
            return true;
          } else {
            console.error(eventName, '该事件未被监听,emit被挂起');
            this._arrCacheEmit.push({ name: eventName, param: params });
            return false;
          }
        })(i);

      }
    }
    vm._eventPublicCheckArgType.call(this, eventName, funCheckArrFunHaveEventName);
  }


  /**
 * @description 监听事件
 * @param {String | Array} eventName
 * @param {Function} [callback=function () { }]
 */
  vm.on = function (eventName, callback = function () { }) {
    function funAddon(arrEventName) {
      if (vm.getType(callback) === 'Function') {
        // 先检查存在漫游事件
        this._arrCacheEmit.forEach(function (item, index) {
          for (let i = 0; i < arrEventName.length; i++) {
            // item.name == arrEventName[i].name可能都为undefined....
            if (item.name && arrEventName[i] && item.name == arrEventName[i]) {
              //有漫游
              callback(item.param);
              console.log(item.name, arrEventName[i]);
            } else {
              this._arrOnEvent.push({ name: eventName, fun: callback.bind(this) })
            }
          }
        }, this);
      } else {
        console.error(callback + ' is not function');
      }
    }
    this._eventPublicCheckArgType.call(this, eventName, funAddon);
  }

  /**
   * @description web worker,无需外部文件
   * 试了很多办法都无法直接将计算结果返回到最外层函数(vm.worker),只能用回调函数了
   * @date 2019-01-15
   * @param {Function} fun 需要worker异步加速计算的程序
   * @param {*} param
   * @param {Function} [success=function () { }]  成功的回调
   */
  vm.worker = function* (fun, param, success = function () { }) {
    let blob = new Blob([fun], { type: 'text/plain' });
    let worker = new Worker(window.URL.createObjectURL(blob));
    postMessage(1);
    var v = 0;
    yield worker.onmessage = function* aaa(e) {
      success(e);
      setTimeout(() => {
        console.log(e);
      }, 3000);
      worker.terminate();
      v = e;
      yield e;
    }
    //worker.onmessage = aaa; 
  }
  console.log(vm.worker(`
    postMessage(1);
    onmessage=function(e){
      
    }
  `, [1], function (r) {
      console.log(r)
    }).next().value)
  window.vm = vm;
})();
export default vm;
