const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');

const baseConfig = require('@centreon/frontend-core/webpack/base');
const extractCssConfig = require('@centreon/frontend-core/webpack/patch/extractCss');

module.exports = merge(baseConfig, extractCssConfig, {
  entry: ['react-hot-loader/patch', '@babel/polyfill', './www/front_src/src/index.js'],
  output: {
    path: path.resolve(`${__dirname}/www/static`),
    //publicPath: 'http://10.30.2.72:8081/centreon',
    publicPath: './static/',
    library: ['name'],
    filename: 'index.js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './www/front_src/public/index.html',
      filename: '../index.html',
    }),
  ],
  module: {
    rules: [
      { parser: { system: false } },
      {
        test: /fonts(\\|\/).+\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash:8].[ext]',
              publicPath: './',
            },
          },
        ],
      },
      {
        test: /\.icon.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(bmp|png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: '[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
});
