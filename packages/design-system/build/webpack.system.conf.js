'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const path = require('path')
const config = require('../config')
const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const MergeWebpackPlugin = require('webpack-merge-and-include-globally')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const SafeParser = require('postcss-safe-parser')
const nodeExternals = require('webpack-node-externals')

const env = require('../config/prod.env')

baseWebpackConfig.entry = {
  system: ['./src/system.js']
}

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.system.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.system.devtool : false,
  output: {
    path: config.system.assetsRoot,
    filename: utils.assetsSystemPath('[name].js'),
    library: '[name]',
    libraryTarget: config.system.libraryTarget
  },
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  performance: {
    hints: config.system.performanceHints
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsSystemPath('[name].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: { parser: SafeParser }
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // Copy and merge Sass tokens and system utilities as well
    new MergeWebpackPlugin({
      files: {
        [utils.assetsSystemPath('system.utils.scss')]: [
          './src/assets/tokens/ods.scss',
          './src/styles/_spacing.scss',
          './src/styles/_mixins.scss',
          './src/styles/_functions.scss'
        ]
      }
    }),
    // copy custom static assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/assets'),
          to: config.system.assetsSubDirectory,
          globOptions: {
            ignore: ['.*', '**/docs.scss', '**/examples/**']
          }
        },
        {
          from: path.resolve(__dirname, '../l10n/translations.json'),
          to: config.system.assetsSubDirectory
        },
        {
          from: path.resolve(__dirname, '../src/helpers/resourceIconMapping.json'),
          to: config.system.assetsSubDirectory
        }
      ]
    })
  ]
})

if (config.system.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp('\\.(' + config.system.productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.system.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
