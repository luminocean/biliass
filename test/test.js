#!/usr/bin/env node

var biliass = require('../lib/biliass');

biliass.downloadAss('http://www.bilibili.com/video/av2619325/',function(err, result){
  if(err) return console.error(err);

  console.log(result);
});
