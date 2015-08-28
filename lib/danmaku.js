// 弹幕模块，用于存放弹幕数据

var util = require('./util');
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

  // 布局管理器
  var layoutManager = new LayoutManager();
  // 所有弹幕项逐个进行布局
  this.items.forEach(function(item){
    if(item.type === 'float') return placeFloatDanmaku(item);
    if(item.type == 'bottom') return placeBottomDanmaku(item);
    if(item.type == 'top') return placeTopDanmaku(item);

    placeDefalut(item);
  });

  // 底部弹幕布局
  function placeBottomDanmaku(item){
    var duration = assConfig.displayTime;
    var row = dib(item, duration);
    // 设定该弹幕的纵向位置
    item.yPos = assConfig.height - row * assConfig.fontSize;
  }

  // 底部弹幕布局
  function placeTopDanmaku(item){
    var duration = assConfig.displayTime;
    var row = dib(item, duration);
    // 设定该弹幕的纵向位置
    item.yPos = row * assConfig.fontSize;
  }

  // 滚动弹幕布局
  function placeFloatDanmaku(item){
    // 计算滚动弹幕从开始到完全出现需要多少时间
    var duration = assConfig.displayTime * (item.length / assConfig.width);
    var row = dib(item, duration);
    // 设定该弹幕的纵向位置
    item.yPos = row * assConfig.fontSize;
  }

  // 默认弹幕布局
  function placeDefalut(item){
    // 默认当做滚动弹幕处理
    placeFloatDanmaku(item);
  }

  // 根据[弹幕项自己的类型]进行占位，返回占位得到的行
  function dib(item, duration){
    var startTime = item.startTimeNumber;

    var row = layoutManager.callDibs(item.type, startTime, duration);
    return row;
  }
};

// 布局管理器
var LayoutManager = function(){
  var MAX_ROWS = this.MAX_ROWS = assConfig.maxRows;
  // 所有的弹幕类型
  var danmakuTypes = ['float','bottom','top'];
  // 时间线map，每个弹幕类型都有自己的时间线对象，如timeMap['float']就是滚动弹幕的时间线对象
  // 每个时间线对象都是一个数组，里面有MAX_ROWS个浮点数，对应了弹幕可以同时有多少行。比如当MAX_ROWS=10那么弹幕最多有10行
  // 具体每个浮点数代表了当前这一行弹幕里最新的一个弹幕的结束时间，这样的浮点数称为一条时间线
  var timeMap = this.timeMap = {};

  danmakuTypes.forEach(function(type){
    // 为每种弹幕设置时间线对象（数组）
    timeMap[type] = new Array(MAX_ROWS);
    // 把每行的时间线清空
    for(var i=0; i<MAX_ROWS; i++){
        timeMap[type][i] = null;
    }
  });
};

// 占位
// 按照出现时间逐个遍历读入的弹幕时，依次调用这个函数，就可以把这个弹幕在时间线对象上进行占位
// 返回这个弹幕应该出现在哪一行
LayoutManager.prototype.callDibs = function(type, startTime, duration){
  // 遍历各条时间线
  for(var i=0; i<this.MAX_ROWS; i++){
    var timeline = this.timeMap[type][i];

    // 当前时间线为空，直接把当前弹幕的结束时间赋值给当前时间线
    if(timeline === null){
      this.timeMap[type][i] = parseFloat(startTime) + assConfig.displayTime;
      return i; // 返回所处的时间线
    }

    // 当前时间线已经记录了上一条弹幕消失的时间
    // 现在要判断当前这条弹幕会不会在上一条消失之前碰到
    // 如果会碰到，那么就把这条弹幕顺延到下一条时间线上
    // 否则更新当前时间线
    if(timeline < parseFloat(startTime) + parseFloat(assConfig.displayTime) - parseFloat(duration) ){
      this.timeMap[type][i] = parseFloat(startTime) + assConfig.displayTime;
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

    var length = text.length * assConfig.fontSize;

    // 将弹幕类型从数字转换成字符串，更可读
    var typeStr = 'float';
    switch(parseInt(type)){
      case 1: typeStr = 'float'; break;
      case 4: typeStr = 'bottom'; break;
      case 5: typeStr = 'top'; break;
      default: typeStr = 'float'; break;
    }

    // 将xml文件中的十进制颜色转换为十六进制
    var hexColor = util.decimalToHex(decimalColor);

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
      'type':typeStr,
      'fontSize':fontSize,
      'color':hexColor,
      'createTime':createTime,
      'slot':slot,
      'createrId':createrId,
      'danmakuId':danmakuId,
      'text':text,
      // 开始时间的数字
      'startTimeNumber':startTime,
      // y轴上的位置
      'yPos':0,
      // 弹幕的像素级长度
      'length':length
    };

    // 代替this返回item对象
    return item;
}
