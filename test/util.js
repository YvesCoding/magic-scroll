import * as React from 'react';
import * as ReactDom from 'react-dom';

export function mockSize(width, height, sizeType = 'client') {
  Object.defineProperty(HTMLElement.prototype, `${sizeType}Height`, {
    configurable: true,
    value: height
  });
  Object.defineProperty(HTMLElement.prototype, `${sizeType}Width`, {
    configurable: true,
    value: width
  });
}

export function createbar(
  Scrollbar,
  {
    props = {},
    childWid = 200,
    childHei = 200,
    parentHei = 100,
    parentWid = 100
  } = {}
) {
  class TestComponent extends React.Component {
    constructor(props) {
      super(props);
      mockSize(parentWid, parentHei);
      mockSize(parentWid, parentHei, 'offset');
      mockSize(childWid, childHei, 'scroll');

      this.setBarRef = this.setBarRef.bind(this);
    }
    render() {
      const { setBarRef } = this;

      return (
        <div
          ref="parent"
          style={{ width: parentWid + 'px', height: parentHei + 'px' }}
        >
          {React.createElement(
            Scrollbar,
            {
              ...props,
              ref: setBarRef
            },
            <div style={{ width: childWid + 'px', height: childHei + 'px' }} />
          )}
        </div>
      );
    }

    componentDidMount() {}

    setBarRef(bar) {
      this.scrollbar = bar;
    }
  }

  return <TestComponent />;
}
