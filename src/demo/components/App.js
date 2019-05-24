import React from 'react';
import ScrollBar from '../../../dist/magic-scroll';

class Test extends React.PureComponent {
  render() {
    return (
      <div style={{ height: '400px', width: '400px' }}>
        <ScrollBar
          ref="sss"
          scrollButtonEnable={true}
          onlyShowBarOnScroll={true}
          //  keepBarShow={true}
          railSize="20px"
          barSize="20px"
          wheelSpeed={500}
        >
          <div style={{ height: '1000px', width: '1000px' }} />
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
