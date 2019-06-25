import * as React from 'react';
import { normalizeClass } from '../utils/class';
import { isMobile } from '../utils/compitable';
import { getDom, eventOnOff } from '../utils/dom';
import TouchManager from '../utils/touchManager';

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

  container: React.RefObject<any>;
  touch: TouchManager;

  constructor(props) {
    super(props);

    this.container = React.createRef();
    this.touch = new TouchManager();
  }

  // Render
  render() {
    const {
      renderContainer,
      className: cn,
      children,
      style = {},
      onEnter,
      onLeave,
      onMove,
      ...others
    } = this.props;

    const className = normalizeClass(cn, '__magic-scroll');

    const ch = <>{children}</>;

    style.position = 'relative';
    style.overflow = 'hidden';

    let eventObj: any = {};

    if (renderContainer) {
      // React the cloned element
      return React.cloneElement(
        renderContainer({
          ref: this.container,
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
          ref={this.container}
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

  _getDomByRef(refName) {
    return getDom(this[refName].current);
  }

  componentDidMount() {
    const container = this._getDomByRef('container');
    const { onEnter, onLeave, onMove } = this.props;

    eventOnOff(container, this.touch.touchObject.touchenter, onEnter, false);
    eventOnOff(container, this.touch.touchObject.touchleave, onLeave, false);
    eventOnOff(container, this.touch.touchObject.touchmove, onMove, false);
  }

  componentWillUnmount() {
    const container = this._getDomByRef('container');
    const { onEnter, onLeave, onMove } = this.props;

    eventOnOff(
      container,
      this.touch.touchObject.touchenter,
      onEnter,
      false,
      'off'
    );
    eventOnOff(
      container,
      this.touch.touchObject.touchleave,
      onLeave,
      false,
      'off'
    );
    eventOnOff(
      container,
      this.touch.touchObject.touchmove,
      onMove,
      false,
      'off'
    );
  }

  /* ---------------- Methods -------------------- */
}
