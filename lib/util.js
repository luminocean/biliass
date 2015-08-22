// 存放一些工具函数
var path = require('path');

var util = {};
module.exports = util;

var HEX_COLOR_LEN = 6;

/**
 * 解析用户输入的路径（相对或绝对地址），返回实际的绝对地址
 * 如果输入的是相对地址，则相对于当前的【执行】目录
 * @param  {string} inputPath 用户的输入路径
 * @return {string} 解析后的实际路径
 */
util.resolePath = function(inputPath){
  var realPath = '';

  // 相对路径
  if(!path.isAbsolute(inputPath)){
    realPath = path.join(process.cwd(),inputPath);
  }else{
    realPath = inputPath;
  }

  console.log('字幕保存到目录：'+realPath);
  return realPath;
}

util.decimalToHex = function(num){   //十进制  转十六进制
  if(isNaN(num)) return 'NaN';

  var result="";
  while(num >= 16){  //循环求余后反向连接字符串
    result = decimalNumToHexChar(num % 16) + result;
    num = parseInt(num / 16);
  }
  result = decimalNumToHexChar(num % 16) + result;

  // 不足部分前面补0
  var vacantCharNum = HEX_COLOR_LEN - result.length;
  for(var i=0; i<vacantCharNum; i++){
    result = '0' + result;
  }

  return result;
}

function decimalNumToHexChar(num){ //十六进制单位转换
  switch(num){
    case 0 : return "0"
    case 1 : return "1"
    case 2 : return "2"
    case 3 : return "3"
    case 4 : return "4"
    case 5 : return "5"
    case 6 : return "6"
    case 7 : return "7"
    case 8 : return "8"
    case 9 : return "9"
    case 10 : return "A"
    case 11 : return "B"
    case 12 : return "C"
    case 13 : return "D"
    case 14 : return "E"
    case 15 : return "F"
  }
}
