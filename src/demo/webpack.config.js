const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');

const resolve = _path => {
  return path.resolve(__dirname, _path);
};

module.exports = {
  entry: [resolve('./dev-client'), resolve('./app')],
  devtool: '#source-map',
  mode: 'development',
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new htmlWebpackPlugin({
      inject: true,
      template: resolve('./index.html')
    })
  ],
  resolve: {
    extensions: ['.js', '.styl']
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname)]
      },
      {
        test: /\.(css|less)$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader'
      },
      {
        test: /\.(jpg|png|jpeg)$/,
        loader: 'url-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS
        ]
      }
    ]
  }
};
