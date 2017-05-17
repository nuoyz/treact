"use strict";
let webpack = require('webpack');
let CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'build/treact.js',
    libraryTarget: 'var',
    library: 'treact'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          plugins: [
            ['transform-react-jsx', {pragma: 'React.createElement'}],
            'transform-class-properties'
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new CircularDependencyPlugin(),
  ]
}
