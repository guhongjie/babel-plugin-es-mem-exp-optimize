# babel-plugin-es-mem-exp-optimize
一个es6引用优化babel插件

## Install
Using npm:

```sh
npm install --save-dev babel-plugin-es-mem-exp-optimize
```

## Options

```
{
	[esModule]: {
		[esSubModule]: {
			import: Boolean,
			bind: Boolean
		}
	}
}
```

### esModule
esModule为要引用的es6模块

### esSubModule
esSubModule为esModule的子模块

### import
是否以import重新导入依赖

### bind
是否调用bind来绑定this对象

### 例：对react.createElement进行优化
Source:
```
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
```

经过babel编译后
```
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _logo = _interopRequireDefault(require("./logo.svg"));

require("./App.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function App() {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "App"
  }, /*#__PURE__*/_react.default.createElement("header", {
    className: "App-header"
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: _logo.default,
    className: "App-logo",
    alt: "logo"
  }), /*#__PURE__*/_react.default.createElement("p", null, "Edit ", /*#__PURE__*/_react.default.createElement("code", null, "src/App.js"), " and save to reload."), /*#__PURE__*/_react.default.createElement("a", {
    className: "App-link",
    href: "https://reactjs.org",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Learn React")));
}

var _default = App;
exports.default = _default;
```

使用以下配置再进行babel编译后：
```
[
	'babel-plugin-es-mem-exp-optimize',
	{
		"react": {
			"createElement": {
				import: true,
				bind: true
			}
		}
	}
]
```
编译后：
```
import React, { createElement as _es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement_ } from 'react';
import logo from "./logo.svg";
import './App.css';

const _es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement = _es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement_.bind(React);

function App() {
  return /*#__PURE__*/_es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement("div", {
    className: "App"
  }, /*#__PURE__*/_es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement("header", {
    className: "App-header"
  }, /*#__PURE__*/_es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement("img", {
    src: logo,
    className: "App-logo",
    alt: "logo"
  }), /*#__PURE__*/_es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement("p", null, "Edit ", /*#__PURE__*/_es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement("code", null, "src/App.js"), " and save to reload."), /*#__PURE__*/_es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement("a", {
    className: "App-link",
    href: "https://reactjs.org",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Learn React")));
}

export default App;
```

设置bind参数false时
```
const _es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement = _es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement_;
```

设置import为false时
```
import React from 'react';
const _es_mem_exp_0780a6ab5726cefdb80d5b7dff54b9db_react_createElement = React.createElement.bind(React);
```

结合webpack打包混淆后，可以解决createElement这类二级访问无法混淆的问题