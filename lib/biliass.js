// 要对外导出的对象
var biliass = {};
module.exports = biliass;

var http = require('http');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var ejs = require('ejs');
var Danmaku = require('./danmaku');

var danmakuUrlTemplate = 'http://comment.bilibili.com/#{cid}.xml';

/**
 * 从B站页面上下载并转换成ass格式字幕文件
 * @param  {string} pageUrl 视频页面的url
 */
biliass.downloadAss = function(pageUrl, callback){
  fetchDanmaku(pageUrl, function(err, danmakuItems){
    if(err) return callback(err);

    getFileText(path.join(__dirname,'../config/template.ass'),function(err, template){
      var ass = ejs.render(template, {'danmakuItems':danmakuItems});
      console.log(ass);
    });
  });
};

// 获取文件内容
function getFileText(filePath, callback){
  fs.readFile(filePath, function (err, text) {
    if (err) return callback(err);

    callback(null, text.toString());
  });
}

// 获取弹幕数组
function fetchDanmaku(pageUrl, callback){
  fetchCid(pageUrl, function(err, cid){ // 获取cid
    if(err) return callback(err);

    var danmakuUrl = danmakuUrlTemplate.replace('#{cid}',cid);
    fetchInflatedText(danmakuUrl, function(err, xml){ // 获取弹幕xml
      if(err) return callback(err);

      var danmaku = new Danmaku();

      var itemMatches = xml.match(/<d.*<\/d>/g);
      itemMatches.forEach(function(item){
        var regex = /<d p="([\d.]+),(\d+),(\d+),(\d+),(\d+),(\d+),(\w+),(\d+)">(.*)<\/d>/;
        var attrs = item.match(regex);
        attrs.shift(); //移除掉第一个元素

        danmaku.addItem.apply(danmaku, attrs);
      });

      callback(null, danmaku.getItems());
    });
  });
}

//从视频页面上获取视频cid
function fetchCid(pageUrl, callback){
  fetchGunzippedText(pageUrl, function(err, html){
    var matches = html.match(/"cid=(\d+)&/);
    if(matches.length < 2) return callback(new Error('页面中找不到cid值'));

    var cid = matches[1];
    callback(null, cid);
  });
}

// 从资源url中获取gzip格式压缩前的文本
function fetchGunzippedText(url, callback){
  http.get(url, function(res){
    var stream = res.pipe(zlib.createGunzip());

    textFromStream(stream, function(err, text){
      if(err) return callback(err);

      callback(null, text);
    });
  });
}

// 从资源url中获取deflate格式压缩前的文本
function fetchInflatedText(url, callback){
  http.get(url, function(res){
    var stream = res.pipe(zlib.createInflateRaw());
    textFromStream(stream, function(err, text){
      if(err) return callback(err);

      callback(null, text);
    });
  });
}

// 从流中获取文本
function textFromStream(stream, callback){
  var text = '';
  stream.on('data',function(chunk){
    text += chunk;
  });
  stream.on('end', function(){
    callback(null, text);
  });
  stream.on('error', function(err){
    callback(err);
  });
}
