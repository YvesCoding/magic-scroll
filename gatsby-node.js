const path = require('path');

function getPath(dirName) {
  return path.resolve(__dirname, `.antdsite/${dirName}`);
}

exports.onCreateWebpackConfig = ({ stage, actions, loaders }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@guide': getPath('guide'),
        '@demo': getPath('demo')
      }
    }
  });
};
