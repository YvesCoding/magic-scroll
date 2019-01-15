import * as React from 'react';
import { normalizeClass } from 'shared/Util/class';
import { isMobile } from 'shared/Util/compitable';

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
      ...others
    } = this.props;

    const className = normalizeClass(cn, '__magic-scroll');

    const ch = <>{children}</>;

    const style = { position: 'relative', overflow: 'hidden' };

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
        renderContainer(),
        {
          ref: 'container',
          className,
          style,
          ...eventObj,
          ...others
        },
        ch
      );
    } else {
      return (
        <div
          ref="container"
          {...eventObj}
          style={style}
          className={className}
          {...others}
        >
          {ch}
        </div>
      );
    }
  }

  componentDidMount() {
    console.log('mounted...');
  }

  /* ---------------- Methods -------------------- */
}
