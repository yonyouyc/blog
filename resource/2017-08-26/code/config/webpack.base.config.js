const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
// 入口函数，通常来说单页面程序一般只有一个入口函数，所以在这里我们指定了src下的index.js
  entry: {
    app: './src/index.js',
    print: './src/print.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'html from template'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist')
  }
};