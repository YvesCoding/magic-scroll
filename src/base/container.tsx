import * as React from 'react';
import { normalizeClass } from '../utils/class';
import { isMobile } from '../utils/compitable';

/* ---------------- Type Definations -------------------- */

interface Props {
  /** Inline style of container */
  style: React.CSSProperties;

  /** ClassName of container */
  className?: string | string[];

  /** Render Functions */
  renderContainer?(props?: any): React.ReactElement<any>;
  onMove(): void;
  onEnter(): void;
  onLeave(): void;
}

/* ---------------- Type End -------------------- */

export default class BaseScroll extends React.PureComponent<Props> {
  static displayName = 'BasePScroll';
  constructor(props) {
    super(props);
  }

  // Render
  render() {
    const {
      renderContainer,
      className: cn,
      children,

      onEnter,
      onLeave,
      onMove,
      style = {},
      ...others
    } = this.props;

    const className = normalizeClass(cn, '__magic-scroll');

    const ch = <>{children}</>;

    style.position = 'relative';
    style.overflow = 'hidden';

    let eventObj: any = {};

    if (!isMobile()) {
      eventObj = {
        onMouseEnter: onEnter,
        onMouseLeave: onLeave,
        onMouseMove: onMove
      };
    } else {
      eventObj = {
        onTouchStart: onEnter,
        onTouchEnd: onLeave,
        onTouchMove: onMove
      };
    }

    if (renderContainer) {
      // React the cloned element
      return React.cloneElement(
        renderContainer({
          ref: 'container',
          className,
          ...eventObj,
          ...others,
          style
        }),
        ch
      );
    } else {
      return (
        <div
          ref="container"
          {...eventObj}
          className={className}
          {...others}
          style={style}
        >
          {ch}
        </div>
      );
    }
  }

  /* ---------------- Methods -------------------- */
}
