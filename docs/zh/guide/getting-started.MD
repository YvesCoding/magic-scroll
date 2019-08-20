# 开始上手

## 安装

```bash
# 通过yarn或者npm安装

yarn add magic-scroll
# 或者
npm i magic-scroll -S
```

## 用法

```js
// 导入magic-scroll并包裹溢出的内容

import Scrollbar from 'magic-scroll';
import React from 'react';

class BasicDemo extends React.Component {
  render() {
    return (
      <div className="parent">
        <Scrollbar keepBarShow>
          <div className="child" />
        </Scrollbar>
      </div>
    );
  }
}
```

```css
/* css */

.parent {
  height: 100px;
}

.child {
  height: 400px;
  background: linear-gradient(180deg, #abdcff, #0396ff);
  position: relative;

  .logo {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    width: 120px;
    color: #fff;
    margin: auto;
    img {
      width: 20px;
    }
  }
}
```

## 渲染结果

import Demo from '@demo/indexPage'

<Demo />
