# 什么是webpack

WebPack可以看做是模块打包机：它做的事情是，分析你的项目结构，找到JavaScript模块以及其它的一些浏览器不能直接运行的拓展语言（Scss，TypeScript等），并将其打包为合适的格式以供浏览器使用。

# 我们都在哪里用了webpack

招投标工程，供应商管理，在线竞价，所有基于vue开发的工程：官网，供应商库,项目看板，私有门户等等

> 今天的教程大家可以参考webpack官方文档[https://doc.webpack-china.org/guides/installation/](https://doc.webpack-china.org/guides/installation/)

下面我们开始吧，所有的代码都会放到xxx下面。

开始之前请大家确认一件事情，那就是你的[node.js](https://nodejs.org/en/)已经升级到了最新的版本，并且本地安装了yarn。

1. 进入一个新目录创建package.json

```
yarn init
```
输入完一些项目信息后你会发现项目下多了一个package.json
2. 既然是学习webpack，那么我们就需要安装webpack

```
yarn add webpack
```
注意我们默认使用的是webpack@3.5.5 最新版本
3. 我们新建几个文件如下

```
|- package.json
|- /src
   |- index.js
```

index.js

```
var el = document.getElementById('app')
el.innerHTML = 'Getting Start'
```
4. 增加webpack的配置文件 config/webpack.base.config.js
```
|- cofig
   |-webpack.base.config.js    +
|- package.json
|- /src
   |- index.js
```
webpack.base.config.js

```
const path = require('path');

module.exports = {
// 入口函数，通常来说单页面程序一般只有一个入口函数，所以在这里我们指定了src下的index.js
  entry: './src/index.js',
  // 输出文件，在根目录dist下生成一个压缩或的bundle.js
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist')
  }
};
```
5. 修改package.json,添加以下片段

```
"scripts": {
    "build": "webpack --config config/webpack.base.config.js"
  },
```
然后运行

```
yarn build
// 相当于运行 webpack --config config/webpack.base.config.js
```

6. 查看dist目录
```
|- cofig
   |-webpack.base.config.js
|- dist
   |- bundle.js              +
|- package.json
|- /src
   |- index.js
```
查看关键代码段（相当于原来src/index.js的内容，被打包到里面来了）

```
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var el = document.getElementById('app')
el.innerHTML = 'Getting Start'

/***/ })
/******/ ]);
```


7. 已经生成了js 我们可以在dist下新建一个html页面，这样就可以看到效果了

```
|- cofig
   |-webpack.base.config.js
|- dist
   |- index.html               +
   |- bundle.js
|- package.json
|- /src
   |- index.js
```


index.html

```
<html>
<head>
    <title>Getting Started</title>
</head>
<body>
<div id="app"></div>
<script src="./bundle.js"></script>
</body>
</html>
```
直接打开index.html可以看到页面运行效果

9. 多入口管理
> 当页面只引用了一个bundle.js，手动改起来还比较方便，当后续开发过程中资源引用成倍的增长时，手动引用就比较麻烦了，所以我们需要引入一些插件来做这个事情,如多入口页面

首先我们先调整一下我们的项目结构
```
|- cofig
   |-webpack.base.config.js
|- dist
   |- index.html               +
   |- bundle.js
|- package.json
|- /src
   |- index.js
   |- print.js
```
print.js

```
export default function printMe() {
  console.log('I get called from print.js!');
}
```

修改webpack.base.config.js

```
module.exports = {
// 入口函数，通常来说单页面程序一般只有一个入口函数，所以在这里我们指定了src下的index.js
  entry: {
    app: './src/index.js',
    print: './src/print.js'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist')
  }
};
```
如果这时候直接运行 yarn build则报错

```
Hash: c4eb8bdf2551f59b0da7
Version: webpack 3.5.5
Time: 81ms
    Asset     Size  Chunks             Chunk Names
bundle.js  2.75 kB       0  [emitted]  print
   [0] ./src/index.js 70 bytes {1} [built]
   [1] ./src/print.js 83 bytes {0} [built]

ERROR in chunk app [entry]
bundle.js
Conflict: Multiple assets emit to the same filename bundle.js
error Command failed with exit code 2.
// 因为拿第一个入口app生成了bundle.js,第二个入口也会生成同样的文件（output定死了叫bundle.js）
```
修改webpack配置
```
module.exports = {
// 入口函数，通常来说单页面程序一般只有一个入口函数，所以在这里我们指定了src下的index.js
  entry: {
    app: './src/index.js',
    print: './src/print.js'
  },
  output: {
    //filename: 'bundle.js',    -
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist')
  }
};
```
再次运行yarn build 发现dist目录下多了app.bundle.js和print.bundle.js

10.于是我们需要引入HtmlWebpackPlugin来帮助我们自动在index.html中补充上对这两个js的引用

首先先安装插件

```
yarn add html-webpack-plugin
```
然后修改webpack.base.config.js

```
const path = require('path');
+ const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
// 入口函数，通常来说单页面程序一般只有一个入口函数，所以在这里我们指定了src下的index.js
  entry: {
    app: './src/index.js',
    print: './src/print.js'
  },
+   plugins: [
+     new HtmlWebpackPlugin({
+       title: 'html from template'
+     })
+   ],
  output: {
    //filename: 'bundle.js',    -
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist')
  }
};
```
运行 yarn build

```
Hash: 537420048e63ff52c2e6
Version: webpack 3.5.5
Time: 431ms
          Asset       Size  Chunks             Chunk Names
print.bundle.js    2.75 kB       0  [emitted]  print
  app.bundle.js    2.54 kB       1  [emitted]  app
     index.html  255 bytes          [emitted]
   [0] ./src/index.js 70 bytes {1} [built]
   [1] ./src/print.js 83 bytes {0} [built]
Child html-webpack-plugin for "index.html":
     1 asset
       [2] (webpack)/buildin/global.js 509 bytes {0} [built]
       [3] (webpack)/buildin/module.js 517 bytes {0} [built]
        + 2 hidden modules
one in 1.13s.

```
查看dist下的index.html

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>html from template</title>
  </head>
  <body>
  <script type="text/javascript" src="print.bundle.js"></script>
  <script type="text/javascript" src="app.bundle.js"></script></body>
</html>
```
发现title也改了，入口的两个js也自动引入了。

下期带来：一步步了解webpack（二）：关于css，图片以及其他字体的引入