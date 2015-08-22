#!/usr/bin/env node

var biliass = require('../lib/biliass');

biliass.downloadAss('http://www.bilibili.com/video/av633818/',
  1, 'downloads', function(err, result){
  if(err) return console.error(err);

  //console.log(result);
});
