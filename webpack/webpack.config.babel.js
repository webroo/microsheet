/* globals __dirname, process */

import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import postCSSNesting from 'postcss-nesting';

// Some options need absolute paths so we create one here that points to the parent project folder
// All other paths will be resolved relative to where webpack is run, usually the project root folder
const PROJECT_ROOT = path.resolve(__dirname, '..');

const isProductionBuild = process.env.NODE_ENV === 'production';

module.exports = {
  // Base path for resolving files in entry{} below, must be absolute
  // context: path.resolve(PROJECT_ROOT, 'src'),

  // Entry points for bundling the scripts. The files will be resolved relative to the project root,
  // or via node_modules folder lookup. Webpack will follow all 'import' declarations in these files.
  entry: {
    // We keep a separate list of vendors so they can be pulled out into their own bundle
    // The CommonsChunkPlugin is then used to omit these from the main bundle
    vendor: [
      'babel-polyfill',
      'immutable',
      'react',
      'react-dom',
      'react-redux',
      'redux',
      'redux-logger',
      'redux-thunk',
      'reselect',
      'whatwg-fetch',
    ],
    main: './src/main.js',
  },

  output: {
    // Folder to export the bundles into, relative to the project root
    path: './build',

    // Filename for each exported bundle, [name] maps to each entry key above
    filename: isProductionBuild ? 'scripts/[name].[chunkhash].js' : 'scripts/[name].js',

    // An additional path to prefix to ALL generated paths by webpack
    // For example a single slash would make all paths absolute
    // publicPath: '/'
  },

  resolve: {
    // If you import a module without prepending ./ then look in the following folders for the modules
    // By default it will look in node_modules and web_modules, so you can omit this if you don't need any others
    // modulesDirectories: ['node_modules', 'web_modules', 'bower_components'],

    // This is necessary in order for npm linked modules to resolve their dependencies.
    // For some reason webpack doesn't like npm linked modules, and can't resolve dependencies within them
    // so if they can't be found then the following directories are looked in as a fallback
    fallback: path.resolve(PROJECT_ROOT, 'node_modules'),
  },

  module: {
    preLoaders: [
      // {
      //   test: /\.js$/,
      //   loader: 'eslint-loader',
      //   // Tells ESLint to only lint files in this folder (and subfolders), must be absolute
      //   include: path.resolve(PROJECT_ROOT, 'src'),
      // },
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // Tells babel to only transform files in this folder (and subfolders), must be absolute
        // We can safely ignore node_modules because they should already be published in ES5
        include: path.resolve(PROJECT_ROOT, 'src'),
      },
      {
        test: /\.css$/,
        // By default the css-loader goes through css files and treats every @import and url() as an ES6 'import'
        // It then extracts the paths, meaning we can do stuff with them in other loaders like file-loader or url-loader
        // The ExtractTextPlugin makes sure that all the css imports are pulled out of the js files and put in a
        // separate file. See it's usage in plugins below for where this is set up.
        // NOTE: because we can't specify a "query" object in ExtractTextPlugin we have to inline the css-loader options
        loader: ExtractTextPlugin.extract('css-loader?modules&localIdentName=[name]_[local]_[hash:base64:5]&importLoaders=1!postcss-loader', {
          // The images and css are separated into asset/ and styles/ folders, meaning we need to prefix a relative
          // path onto every url() path so it finds the right folder
          publicPath: '../',
        }),

        // Tells the css loader to only transform files in this folder (and subfolders), must be absolute
        include: path.resolve(PROJECT_ROOT, 'src'),
      },
      {
        // The 'url-loader' will inline assets as base64 if they're below the size limit, otherwise falls
        // back to using 'file-loader', which just copies the assets over to the build folder
        // If you don't want to inline assets then change 'url-loader' below to 'file-loader'
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        query: {
          // This path is relative to the output.path at the top of this config file
          name: isProductionBuild ? 'assets/[name].[hash:12].[ext]' : 'assets/[name].[ext]',
          // Data uri limit of 10k
          limit: 10000,
        },
        include: path.resolve(PROJECT_ROOT, 'src'),
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      // This will define a value for process.env.NODE_ENV, this allows uglifyjs to strip out entire
      // conditional blocks of code
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    // This uses names for the webpack module ids, rather than numbers. Potential fix for chunkhashes bug.
    // new webpack.NamedModulesPlugin(),

    new webpack.optimize.OccurenceOrderPlugin(),

    // Ensures that wherever you use JSX the React module will be automatically imported
    // This saves you from having to import React in every module
    // new webpack.ProvidePlugin({
    //   React: 'react'
    // }),

    // This moves any modules which are required by more than one entry point into a bundle called vendor
    new webpack.optimize.CommonsChunkPlugin({name: 'vendor'}),

    // Combine css into a single file. Path is relative to the output.build folder
    new ExtractTextPlugin(isProductionBuild ? 'styles/main.[chunkhash].css' : 'styles/main.css'),

    // The bundled scripts and css will be injected into this template html page
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],

  // Enables sourcemaps in dev builds. The 'eval' setting is the fastest but doesn't map directly back
  // to the original ES6 modules, usually it's enough to debug though. If you want direct mapping then
  // use 'cheap-module-eval-source-map', but be aware it's slower to build.
  devtool: isProductionBuild ? false : 'eval',

  devServer: {
    // Where to serve the static files from when running webpack-dev-server. Relative to project root.
    contentBase: './build',

    // Serves the autoreloading on the same page as the app, allowing the routing to be visible in the address bar.
    // When false the app is served in an iframe, meaning the routing is hidden from the address bar.
    inline: true,

    // Ensures html5 push state works. This causes any 404's to fallack to contentBase and react-router to pick them up.
    historyApiFallback: true,

    port: 8080,
  },

  postcss: [
    // PostCSS plugin to enable css-next nesting syntax
    postCSSNesting(),

    // Adds vendor specific prefixes to certain rules
    autoprefixer({browsers: ['last 2 versions', 'not ie < 11']}),
  ],
};
