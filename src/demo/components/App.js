import React from 'react';
import ScrollBar from '../../../dist/magic-scroll';

class Test extends React.PureComponent {
  render() {
    return (
      <div style={{ height: '200px', width: '200px' }}>
        <ScrollBar
          ref="sss"
          scrollButtonEnable={true}
          onlyShowBarOnScroll={true}
          keepRailShow={true}
          //  keepBarShow={true}
          railSize="20px"
          barKeepShowTime={500}
          sizeStrategy="foo"
          wheelSpeed={500}
        >
          <div style={{ height: '1400px', width: '1400px' }} />
        </ScrollBar>
      </div>
    );
  }
}

export default class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Test />
      </div>
    );
  }
}
