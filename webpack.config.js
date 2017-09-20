const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_KEY = 'xxxxxxxxxxxxxxx';

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),  
        filename: 'bundle.js',
        publicPath: '/build/'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        inject: true,
      }),
      // TODO: use a legit import once https://github.com/dropbox/dropbox-sdk-js/pull/137 gets merged
      new webpack.ProvidePlugin({
        Dropbox: 'dropbox',
      }),
      new webpack.EnvironmentPlugin({
        APP_KEY,
      })
    ],
    node: {
      process: true
    }
}