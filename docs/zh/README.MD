---
actionText: 开始上手 →
actionLink: /guide/
home: true
showStar: true
features:
  - title: 功能丰富
    details: 可以自定义滚动条，滚动轨道，滚动容器等。有丰富的API和事件
  - title: 使用简单
    details: 每个属性都是可选的，只需要用&lt;magic-scroll>包裹内容即可出现自定义滚动条
  - title: 兼容性良好
    details: 兼容TypeSciprt、 SSR、 PC、移动端、触屏
---

## 快速开始

使用 npm 或者 yarn 安装

```bash
npm i magic-scroll -S
```

在项目中导入并包裹内容

```css
.parent {
  width: 100px;
  height: 100px;
}

.child {
  width: 200px;
  height: 200px;
}
```

```js
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

一个自定义滚动条就会出现

import Demo from '@demo/indexPage'

<Demo />
