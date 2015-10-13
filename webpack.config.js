var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    './src/bandura.js'
  ],
  output: {
      publicPath: '/dist',
      filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.js$/, include: path.join(__dirname, 'src'), loader: 'babel-loader' }
    ]
  },
  debug: true
};
