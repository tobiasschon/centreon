const merge = require('webpack-merge');
const webpack = require('webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require('path');

const devConfig = require('@centreon/frontend-core/webpack/patch/dev');
const baseConfig = require('./webpack.config');

module.exports = merge(baseConfig, devConfig, {
  devServer: {
    host: '0.0.0.0',
    port: 8081,
    writeToDisk: true,
    contentBase: path.resolve(`${__dirname}/www/`),
    publicPath: '/centreon/',
    contentBasePublicPath: '/centreon/',
    hot: true,
    hotOnly: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    /*
    proxy: {
      '*': {
        target: 'http://10.30.2.72/centreon',
      },
    },
    */
  },
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': '@hot-loader/react-dom',
      'react-router-dom': path.resolve('./node_modules/react-router-dom'),
      '@material-ui/core': path.resolve('./node_modules/@material-ui/core'),
    },
  },
  plugins: [
    //new LiveReloadPlugin({ appendScriptTag: true }),
    new webpack.NamedModulesPlugin(),
  ],
});
