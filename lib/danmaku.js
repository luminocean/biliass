// 弹幕模块，用于存放弹幕数据

var Danmaku = function(){
  this.items = []; // 存放弹幕对象的数组
};
module.exports = Danmaku;

Danmaku.prototype.addItem = function(startTime,type,fontSize,decimalColor,
  createTime,slot,createrId,danmakuId,text){

  var startDate = new Date();
  startDate.setHours(startTime/3600);
  startDate.setMinutes((startTime%3600)/60);
  startDate.setSeconds((startTime%3600)%60);
  startDate.setMilliseconds((startTime%3600)%60%1 * 1000);

  // 弹幕持续时间6秒
  var endDate = new Date(startDate.getTime() + 6000);

  var item = {
    'startTime':{
      'hour':startDate.getHours(),
      'minute':startDate.getMinutes(),
      'second':startDate.getSeconds(),
      'millisecond':startDate.getMilliseconds()
    },
    'endTime':{
      'hour':endDate.getHours(),
      'minute':endDate.getMinutes(),
      'second':endDate.getSeconds(),
      'millisecond':endDate.getMilliseconds()
    },
    'type':type,
    'fontSize':fontSize,
    'decimalColor':decimalColor,
    'createTime':createTime,
    'slot':slot,
    'createrId':createrId,
    'danmakuId':danmakuId,
    'text':text
  };
  this.items.push(item);
};

Danmaku.prototype.getItems = function(){
  return this.items;
};
