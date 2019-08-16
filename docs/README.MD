---
actionText: Get Started →
actionLink: /guide/
home: true
showStar: true
features:
  - title: Rich Function
    details: You can customize scrollbar, rail, scroll container, etc. Rich APIs and Events
  - title: Easy To Use
    details: Just wrap content by &lt;magic-scroll>, a custom scrollbar will show
  - title: Good compatibility
    details: Compatible with TypeSciprt, SSR, PC, mobile phone, touch screen
---

## Quick Start

Install via yarn or npm

```bash
npm i magic-scroll -S
```

Import magic-scroll in project and wrap the content

```css
.parent {
  height: 100px;
}

.child {
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

A custom scrollbar will show up

import Demo from '@demo/indexPage'

<Demo />
