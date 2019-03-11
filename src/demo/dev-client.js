let hotclient = require('webpack-hot-middleware/client');

hotclient.subscribe(function(event) {
  if (event.action === 'reload') {
    window.location.reload();
  }
});
