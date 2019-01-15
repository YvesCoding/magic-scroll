var express = require('express');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

var app = express();
var compiler = webpack(webpackConfig);
var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
});

var hotPublish = require('webpack-hot-middleware')(compiler, {
  log: () => {}
});

compiler.plugin('compilation', function(compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function() {
    hotPublish.publish({ action: 'reload' });
  });
});

app.use(devMiddleware);
app.use(hotPublish);

var server = app.listen(3000, '127.0.0.1', function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
