const fs = require('fs');
const path = require('path');
const { build, blue } = require('./build');
let builds = require('./config').getAllBuilds();
const chokidar = require('chokidar');
let timeout;

print('Start building in debug mode....\n');

chokidar
  .watch(path.resolve(__dirname, '../src'), {
    recursive: true,
    ignored: /dist/,
    persistent: true,
    ignoreInitial: true
  })
  .on('all', function(event, filename) {
    print('Detected  ' + event);
    if (filename) {
      print('Filename provided: ' + filename);
    } else {
      print('Filename not provided');
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      build(builds);
      timeout = null;
    }, 500);
  });

function print(str) {
  console.log(blue(str));
}
