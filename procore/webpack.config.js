const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    ],
    node: {
      process: true,
      require: true,
    }
}