const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  output: {
    chunkFilename: `[name].[hash].chunk.js`,
  },
  optimization: {
    minimize: true,
    removeAvailableModules: true,
    removeEmptyChunks: true,
  },
})
