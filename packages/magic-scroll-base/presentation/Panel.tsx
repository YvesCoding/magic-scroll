import * as React from 'react';
import { normalizeClass } from 'shared/Util/class';

/* ----------------- Type End -------------------------- */

export default class Panel extends React.PureComponent<any> {
  static displayName = 'BasePanel';
  render() {
    const { renderPanel, children, className: cn, ...others } = this.props;
    const className = normalizeClass('__panel', cn);
    const style: any = {
      boxSizing: 'border-box',
      position: 'relative'
    };
    if (renderPanel) {
      return React.cloneElement(
        renderPanel(),
        {
          className,
          style,
          ...others
        },
        children
      );
    } else {
      return (
        <div className={className} style={style} {...others}>
          {children}
        </div>
      );
    }
  }
}
