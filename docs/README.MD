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

### Install

```bash
# Install via yarn or npm

yarn add magic-scroll
# OR
npm i magic-scroll -S
```

### Usage

```js
// Import magic-scroll in project and wrap the  over-flowing  content

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

### Rendering result

import Demo from '@demo/indexPage'

<Demo />
