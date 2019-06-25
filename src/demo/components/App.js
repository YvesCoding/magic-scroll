import React from 'react';
import ScrollBar from '../../../dist/magic-scroll';

class Test extends React.PureComponent {
  handleScroll() {
    console.log(arguments);
  }
  render() {
    return (
      <div style={{ height: '400px', width: '400px' }}>
        <ScrollBar
          ref="sss"
          scrollButtonEnable={true}
          keepBarShow={true}
          railSize="20px"
          barSize="20px"
          hanldeScrollComplete={this.handleScroll}
          wheelSpeed={500}
        >
          {Array(100)
            .fill(null)
            .map((i, index) => {
              return <div style={{ height: '30px' }}>{index}</div>;
            })}
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
