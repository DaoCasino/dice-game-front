require('dotenv').config('.env')

const path = require('path')
const fs = require('fs')
const os = require('os')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

const env = { stringified: {}, raw: {} }
// const raw = require('dotenv').parse(fs.readFileSync('.env'))
const raw = {}
raw.NODE_ENV = process.env.NODE_ENV || 'development'
raw.VERSION = new Date().toISOString()
raw.BUILD_MODE = process.env.BUILD_MODE || 'development'
raw.GAME_IS_MOCK = process.env.GAME_IS_MOCK

const stringified = {
  'process.env': Object.keys(raw).reduce((e, key) => {
    e[key] = JSON.stringify(raw[key])
    return e
  }, {}),
}

function getPlugins() {
  const plugins = [
    new webpack.DefinePlugin(stringified),
    new HtmlWebpackPlugin({
      template: './static/index.html',
      filename: 'index.html',
      publicPath: '/',
      inject: true,
      WEBSOCKET: process.env.WEBSOCKET,
      inlineSource: '.(js|css)$',
    }),
    new CleanWebpackPlugin(['dist']),
    new ScriptExtHtmlWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: './res',
      to: './res',
    }]),
    new CopyWebpackPlugin([{
      from: './static/images',
      to: './',
    }]),
    new CopyWebpackPlugin([{
      from: './src/configs/dapp.manifest.js',
      to: './',
    }]),
  ]

  return plugins
}

module.exports = {
  entry: {
    bundle: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
  },
  optimization: {
    minimize: false,
    /*
    minimizer: [
      new UglifyJsPlugin({
        cache: false,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          warnings: false,
          keep_fnames: true,
          keep_classnames: true,
        },
      }),
    ],
     */
  },
  plugins: getPlugins(),
  resolve: {
    symlinks: false,
    extensions: [
      '.wasm', '.ts', '.tsx', '.js', '.json', '.png',
    ],
  },
  devServer: {
    disableHostCheck: true,
  },
  node: {
    fs: 'empty',
    dgram: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  module: {
    rules: [{
      loader: require.resolve('file-loader'),
      exclude: [/\.(wasm|js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
    }, {
      test: /\.js$/,
      loader: 'babel-loader?presets[]=es2015&plugins[]=transform-class-properties',
      exclude: /(node_modules|bower_components)/,
    }, {
      test: /\.hbs/,
      loader: 'handlebars-loader',
      exclude: /(node_modules|bower_components)/,
    }],
  },
}