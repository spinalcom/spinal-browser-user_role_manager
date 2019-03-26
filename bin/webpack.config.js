"use strict";
const path = require("path");
const {
  VueLoaderPlugin
} = require("vue-loader");
var Visualizer = require("webpack-visualizer-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const StringReplacePlugin = require('string-replace-webpack-plugin')

console.log(process.env.NODE_ENV);
const outputDir = path.resolve(__dirname, "../www/")
var config = {
  entry: {
    index: "./src/app.js"
  },
  output: {
    path: outputDir,
    filename: "./dist/[name].js"
  },
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.exec\.js$/,
      use: ['script-loader']
    }, {
      test: /\.vue$/,
      exclude: /node_modules(\/|\\)(?!(framework7|framework7-vue|template7|dom7)(\/|\\)).*/,
      loader: "vue-loader",
      options: {
        loaders: {
          js: {
            loader: "babel-loader",
            options: {
              presets: ["env"],
              plugins: ["transform-object-rest-spread"]
            }
          }
        }
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules(\/|\\)(?!(framework7|framework7-vue|template7|dom7)(\/|\\)).*/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["env"],
          plugins: ["transform-runtime", "transform-object-rest-spread"]
        }
      }
    }, {
      test: /\.css$/,
      use: ["vue-style-loader", "css-loader"]
    }, {
      test: /\.scss$/,
      use: ["vue-style-loader", "css-loader", "sass-loader"]
    }, {
      test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      use: "base64-inline-loader?&name=[name].[ext]"
    }, {
      parser: {
        amd: false
      }
    }, {
      enforce: 'post',
      test: /fontkit[/\\]index.js$/,
      loader: "transform-loader?brfs"
    }, {
      enforce: 'post',
      test: /unicode-properties[/\\]index.js$/,
      loader: "transform-loader?brfs"
    }, {
      enforce: 'post',
      test: /linebreak[/\\]src[/\\]linebreaker.js/,
      loader: "transform-loader?brfs"
    }, {
      test: /fontkit[/\\]index.js$/,
      loader: StringReplacePlugin.replace({
        replacements: [{
          pattern: /fs\./g,
          replacement: function() {
            return 'require(\'fs\').';
          }
        }]
      })
    }]
  },
  plugins: [
    new VueLoaderPlugin(),
    new Visualizer(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, "../www/index.html"),
      template: "./src/index.ejs",
      inject: false
    })
  ],
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  node: {
    fs: 'empty'
  }

};

if (process.env.NODE_ENV !== "production") {
  config.mode = "development";
  config.watch = true;
  config.watchOptions = {
    aggregateTimeout: 500,
    poll: 1000
  };
  // const webpack = require("webpack");
  // config.plugins.unshift(new webpack.HotModuleReplacementPlugin());
  // config.entry = [
  //   'webpack-hot-middleware/client?path=http://localhost:8080/__webpack_hmr',
  //   'webpack/hot/only-dev-server'
  // ]
  // config.devServer = {
  //   hot: true,
  //   contentBase: outputDir
  // }
} else {
  config.mode = "development";
}

module.exports = config;
