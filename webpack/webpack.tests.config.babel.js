/* globals __dirname */

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const PROJECT_ROOT = path.resolve(__dirname, '..');

// This config file bundles the tests together and runs them in mocha.
// It's a completely separate config file from the main one.
module.exports = {
  entry: 'mocha!./webpack/webpack.tests.entrypoint.js', // Path is resolved from the root project folder
  output: {
    path: './build', // Path is resolved from the root project folder
    filename: 'tests.js', // Files are written into the path folder above
  },
  resolve: {
    alias: {
      // Replaces the regular sinon package with some sort of other version
      sinon: 'sinon/pkg/sinon',
    },
  },
  module: {
    noParse: [
      // Tells webpack not to parse sinon through any of the loaders
      /sinon/,
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(PROJECT_ROOT, 'src'), // Path must be absolute
      },
      {
        // We want to ignore any css imports
        test: /\.css$/,
        loader: 'null-loader',
        include: path.resolve(PROJECT_ROOT, 'src'), // Path must be absolute
      },
      {
        // We want to ignore any image imports
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'null-loader',
        include: path.resolve(PROJECT_ROOT, 'src'), // Path must be absolute
      },
    ],
  },
  plugins: [
    // This will create a simple webpage to host the bundled tests in
    new HtmlWebpackPlugin({
      title: 'Test Runner',
    }),
  ],
  devServer: {
    // Where to serve the static files from when running webpack-dev-server
    contentBase: './build', // Path is resolved from the root project folder
    inline: true,
    port: 8081,
  },
};
