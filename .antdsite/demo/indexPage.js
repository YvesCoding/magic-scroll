import Scrollbar from '../../dist/magic-scroll';
import React from 'react';
import styles from './indexPage.module.less';

export default class BasicDemo extends React.Component {
  render() {
    return (
      <div className={styles.parent}>
        <Scrollbar keepBarShow>
          <div className={styles.child}>
            <div className={styles.logo}>
              <img src="/logo.png" /> MagicScroll.js
            </div>
          </div>
        </Scrollbar>
      </div>
    );
  }
}
