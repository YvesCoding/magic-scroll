import * as React from 'react';
import detectResize from '../vender/resize-detector';
import {
  createEasingFunction,
  easingPattern,
  Animate
} from '../vender/easingPattern/index';

import { normalizeSize, getDom } from '../utils/dom';
import { Subscription } from '../utils/subscription';

import Panel from './panel';
import { enhance, GlobarBarOptionsContext } from '../base';

interface Dest {
  x?: string | number;
  y?: string | number;
  dx?: string | number;
  dy?: string | number;
}
type EasingPatterns =
  | 'easeInQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint';

interface Props {
  /** smooth scroll time */
  speed?: number;

  /**
   * smooth scroll animation
   */
  easing?: EasingPatterns | undefined;

  /**
   * Whether to enable the scrolling in X direction
   */
  scrollingX?: boolean;

  /**
   * Whether to enable the scrolling in Ydirection
   */
  scrollingY?: boolean;

  /**
   * Vertial native bar position, suitable for RTL environment.
   */
  verticalNativeBarPos?: 'right' | 'left';

  /**
   * The scrolling speed while using mouse wheel.
   */
  wheelSpeed: number;

  /** ---------- Customizable render function ----------------- */

  renderPanel?(props?: any): React.ReactElement<any>;
  renderView?(props?: any): React.ReactElement<any>;
}

interface PropsFromHOC {
  onContainerRefresh(): void;
  onScrollComplete(): void;
  onScroll(): void;
}

interface OneBarState {
  move: number;
  size: number;
  disable: boolean;
}
interface BarStates {
  /** Vertical bar state */
  vBar?: OneBarState;
  /** Horizontal bar state */
  hBar?: OneBarState;
  opacity?: number;
}

interface State {
  barState: BarStates;
}

class MagicScrollNative extends React.PureComponent<
  Props & PropsFromHOC,
  State
> {
  static defaultProps = {
    scrollingX: true,
    scrollingY: true,
    speed: 300,
    easing: undefined,
    wheelSpeed: 0,
    verticalNativeBarPos: 'right'
  };
  static displayName = 'magic-scroll-native';

  /** trigger beofore component will unmount */
  static unmount_key = 'UNMOUNT_SUBSCRIBE';

  panel: React.RefObject<Panel>;

  /** Subscription */
  subscription: Subscription;

  scrollX: any;
  scrollY: any;

  /* --------------------- Lifecycle Methods ------------------------ */
  constructor(props) {
    super(props);

    this.panel = React.createRef<Panel>();
    /**
     *  This state is to control style of container and panel
     *  vBar --> vertical bar
     *  hBar --> horizontal bar
     */
    this.state = {
      barState: {
        vBar: {
          move: 0,
          size: 0,
          disable: false
        },
        hBar: {
          move: 0,
          size: 0,
          disable: false
        },
        opacity: 0
      }
    };

    // Bind `this` context
    this._handleResize = this._handleResize.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this.scrollBy = this.scrollBy.bind(this);

    this.subscription = new Subscription();
    this.scrollX = new Animate();
    this.scrollY = new Animate();
  }
  render() {
    const {
      children,
      renderPanel,
      renderView,
      wheelSpeed,
      scrollingX,
      scrollingY
    } = this.props;
    const { verticalNativeBarPos } = this.props;
    const barState = this.state.barState;

    return (
      <Panel
        resize={detectResize}
        barPos={verticalNativeBarPos}
        barsState={barState}
        renderPanel={renderPanel}
        renderView={renderView}
        wheelSpeed={wheelSpeed}
        ref={this.panel}
        scrollingX={scrollingX}
        scrollingY={scrollingY}
        scrollBy={this.scrollBy}
        handleResize={this._handleResize}
        handleScroll={this._handleScroll}
      >
        {children}
      </Panel>
    );
  }

  componentDidMount() {
    this._refresh();
  }
  componentWillUnmount() {
    this.subscription.notify(MagicScrollNative.unmount_key);
    this.subscription.unsubscribe();
  }

  /* ---------------------  Component Methods ------------------------ */

  /** ---------  private methods  --------- */

  _getDomByRef(refName: 'panel') {
    return getDom(this[refName].current);
  }

  _getBarState() {
    const container = this._getDomByRef('panel') as Element;
    const barState: BarStates = {
      vBar: { move: 0, size: 0, disable: false },
      hBar: { move: 0, size: 0, disable: false }
    };

    if (!container) {
      return barState;
    }

    const { scrollingX, scrollingY } = this.props;
    const clientWidth = container.clientWidth;
    const clientHeight = container.clientHeight;

    let heightPercentage = (clientHeight * 100) / container.scrollHeight;
    let widthPercentage = (clientWidth * 100) / container.scrollWidth;

    barState.vBar.move = (container.scrollTop * 100) / clientHeight;
    barState.hBar.move = (container.scrollLeft * 100) / clientWidth;

    barState.vBar.size = heightPercentage < 100 ? heightPercentage : 0;
    barState.hBar.size = widthPercentage < 100 ? widthPercentage : 0;

    barState.vBar.disable = !scrollingY;
    barState.hBar.disable = !scrollingX;

    this.setState({
      barState
    });

    return barState;
  }

  _scrollTo(x, y, speed?: number, easing?: EasingPatterns) {
    const panelElm = this._getDomByRef('panel') as Element;
    const {
      scrollLeft,
      scrollTop,
      scrollHeight,
      scrollWidth,
      clientWidth,
      clientHeight
    } = panelElm;
    // Normalize...
    if (typeof x === 'undefined') {
      x = panelElm.scrollLeft;
    } else {
      x = normalizeSize(x, scrollWidth - clientWidth);
    }
    if (typeof y === 'undefined') {
      y = panelElm.scrollTop;
    } else {
      y = normalizeSize(y, scrollHeight - clientHeight);
    }

    // hadnle for scroll complete
    const scrollingComplete = this._scrollComptelte.bind(this);
    // options
    const { easing: optionEasing, speed: optionSpeed } = this.props;
    const easingMethod = createEasingFunction(
      easing || optionEasing,
      easingPattern
    );

    if (x - scrollLeft) {
      // move x
      this.scrollX.startScroll(
        scrollLeft,
        x,
        speed || optionSpeed,
        (dx) => {
          panelElm.scrollLeft = dx;
        },
        scrollingComplete,
        undefined,
        easingMethod
      );
    }

    if (y - scrollTop) {
      // move Y
      this.scrollY.startScroll(
        scrollTop,
        y,
        speed,
        (dy) => {
          panelElm.scrollTop = dy;
        },
        scrollingComplete,
        undefined,
        easingMethod
      );
    }
  }
  _refresh() {
    // refresh panel
    this.panel.current._refresh();
  }

  /** --------- react to events ----------------*/
  _handleScroll() {
    this.props.onScroll();
  }

  _handleResize() {
    this.refresh();
  }

  _scrollComptelte() {
    if (this.props.onScrollComplete) {
      this.props.onScrollComplete();
    }
  }

  _onBarDrag(direction: 'x' | 'y', percent) {
    const elm = this._getDomByRef('panel');
    const dest =
      elm[direction == 'x' ? 'scrollWidth' : 'scrollHeight'] * percent;

    this.scrollTo(
      {
        [direction]: dest
      },
      0
    );
  }

  _getPosition() {
    const { scrollTop, scrollLeft } = this._getDomByRef('panel') as Element;
    return {
      scrollTop,
      scrollLeft
    };
  }

  /** Public methods */

  scrollTo({ x, y }: Dest, speed?: number, easing?: EasingPatterns) {
    this._scrollTo(x, y, speed, easing);
  }
  scrollBy({ dx, dy }: Dest, speed?: number, easing?: EasingPatterns) {
    const {
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight
    } = this._getDomByRef('panel') as Element;
    let { scrollLeft, scrollTop } = this._getPosition();
    if (dx) {
      scrollLeft += normalizeSize(dx, scrollWidth - clientWidth);
    }
    if (dy) {
      scrollTop += normalizeSize(dy, scrollHeight - clientHeight);
    }

    this._scrollTo(scrollLeft, scrollTop, speed, easing);
  }
  refresh() {
    this._refresh();
    // Call HOC's refresh method
    this.props.onContainerRefresh();
  }
}

export default enhance<Props>(MagicScrollNative);

export { GlobarBarOptionsContext };
