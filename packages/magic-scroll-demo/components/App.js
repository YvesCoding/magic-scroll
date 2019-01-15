import React from 'react';
import Footer from './Footer';
import AddTodo from '../containers/AddTodo';
import VisibleTodoList from '../containers/VisibleTodoList';
import ScrollBar from 'magic-scroll-native';
import 'magic-scroll-native/dist/magic-scroll.css';

class Test extends React.PureComponent {
  render() {
    return (
      <div style={{ height: '100px', width: '100px' }}>
        <ScrollBar ref="sss" showBarWhenMove={true}>
          <div style={{ height: '200px', width: '200px' }} />
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
