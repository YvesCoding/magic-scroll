import React from 'react';
import Footer from './Footer';
import AddTodo from '../containers/AddTodo';
import VisibleTodoList from '../containers/VisibleTodoList';
import ScrollBar from 'magic-scroll-native';
import 'magic-scroll-native/dist/magic-scroll.css';

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
          wheelScrollDuration={500}
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
