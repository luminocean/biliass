// 弹幕模块，用于存放弹幕数据

var assConfig = require('../config/config').ass;

// 弹幕集合，内部放置弹幕
var Danmaku = function(){
  this.items = []; // 存放弹幕对象的数组
};
module.exports = Danmaku;

Danmaku.prototype.addItem = function(startTime,type,fontSize,decimalColor,
  createTime,slot,createrId,danmakuId,text){

  var item = new DanmakuItem(startTime,type,fontSize,decimalColor,
    createTime,slot,createrId,danmakuId,text);

  this.items.push(item);
};

Danmaku.prototype.getItems = function(){
  return this.items;
};

// 将弹幕项进行布局
Danmaku.prototype.layout = function(){
  // 按出现时间排序
  this.items = this.items.sort(function(lhs, rhs){
    var lhsTime = parseFloat(lhs.startTimeNumber);
    var rhsTime = parseFloat(rhs.startTimeNumber);

    if(lhsTime < rhsTime) return -1;
    if(lhsTime > rhsTime) return 1;
    else return 0;
  });

  var layoutManager = new LayoutManager();

  this.items.forEach(function(item){
    var startTime = item.startTimeNumber;
    // 计算弹幕从开始到完全出现需要多少时间
    var duration = assConfig.displayTime * (item.text.length * assConfig.fontSize / assConfig.width);

    var row = layoutManager.callDibs(startTime, duration);
    // 设定该弹幕的纵向位置
    item.yPos = row * assConfig.fontSize;
  });
}

var LayoutManager = function(){
  this.MAX_ROWS = 10;
  this.timeMap = new Array(this.MAX_ROWS);
  // 把每行的时间线归零
  for(var i=0; i<this.MAX_ROWS; i++){
      this.timeMap[i] = 0;
  }
};

LayoutManager.prototype.callDibs = function(startTime, duration){
  // 遍历各条时间线
  for(var i=0; i<this.MAX_ROWS; i++){
    var timeline = this.timeMap[i];

    // 当前时间线还没到弹幕出现时间
    // 可以在当前时间线添加弹幕
    if(timeline < startTime ){
      // 更新时间线
      this.timeMap[i] = parseFloat(startTime) + parseFloat(duration);
      return i; // 返回所处的时间线
    }

    // 否则遍历下一条时间线
  }

  // 如果所有时间线都满了，就返回-1表示隐藏该弹幕
  return -1;
};

// 单条弹幕
function DanmakuItem(startTime,type,fontSize,decimalColor,
  createTime,slot,createrId,danmakuId,text){
    // 设置开始时间
    var startDate = new Date();
    startDate.setHours(startTime/3600);
    startDate.setMinutes((startTime%3600)/60);
    startDate.setSeconds((startTime%3600)%60);
    startDate.setMilliseconds((startTime%3600)%60%1 * 1000);

    // 设置结束时间弹幕持续时间6秒
    var endDate = new Date(startDate.getTime() + assConfig.displayTime*1000);

    // 构造弹幕项
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
      'text':text,
      // 开始时间的数字
      'startTimeNumber':startTime,
      'yPos':0
    };

    // 代替this返回item对象
    return item;
}
