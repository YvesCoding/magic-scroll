import * as React from 'react';
import detectResize from 'third-party/resize-detector';
import { normalizeSize, getDom } from 'shared/Util/dom';
import { Subscription } from 'shared/Util/subscription';

import View from './view';
import { smoothScroll } from 'third-party/easingPattern/smoothScroll';
import { enhance } from 'magic-scroll-base';

interface Dest {
  x?: string | number;
  y?: string | number;
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

    verticalNativeBarPos: 'right'
  };
  static displayName = 'magic-scroll-native';

  /** trigger beofore component will unmount */
  static unmount_key = 'UNMOUNT_SUBSCRIBE';

  panel: React.RefObject<View>;

  /** Subscription */
  subscription: Subscription;

  /* --------------------- Lifecycle Methods ------------------------ */
  constructor(props) {
    super(props);

    this.panel = React.createRef<View>();
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
    // api binds
    this.scrollTo = this.scrollTo.bind(this);
    this._handleScroll = this._handleScroll.bind(this);

    this.subscription = new Subscription();
  }
  render() {
    const {
      children,
      renderPanel,
      renderView,
      scrollingX,
      scrollingY
    } = this.props;
    const { verticalNativeBarPos } = this.props;
    const barState = this.state.barState;
    return (
      <View
        resize={detectResize}
        barPos={verticalNativeBarPos}
        handleResize={this._handleResize}
        barsState={barState}
        handleScroll={this._handleScroll}
        renderPanel={renderPanel}
        renderView={renderView}
        ref={this.panel}
        scrollingX={scrollingX}
        scrollingY={scrollingY}
      >
        {children}
      </View>
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

  _scrollTo(x, y, animate = true) {
    const panelElm = this._getDomByRef('panel') as Element;
    // Normalize...
    if (typeof x === 'undefined') {
      x = panelElm.scrollLeft;
    } else {
      x = normalizeSize(x, panelElm.scrollWidth - panelElm.clientWidth);
    }
    if (typeof y === 'undefined') {
      y = panelElm.scrollTop;
    } else {
      y = normalizeSize(y, panelElm.scrollHeight - panelElm.clientHeight);
    }

    if (animate) {
      // hadnle for scroll complete
      const scrollingComplete = this._scrollComptelte.bind(this);
      // options
      const { easing, speed } = this.props;
      smoothScroll(
        panelElm,
        x - panelElm.scrollLeft,
        y - panelElm.scrollTop,
        speed,
        easing,
        scrollingComplete
      );
    } else {
      panelElm.scrollTop = y;
      panelElm.scrollLeft = x;
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
    console.log('scroll complelte...');
  }

  _onDragBar(percent, type, scrollSize) {
    const pos = type == 'vertical' ? 'y' : 'x';
    const panelElm = this._getDomByRef('panel');
    this.scrollTo(
      {
        [pos]: percent * panelElm[scrollSize]
      },
      false /* animate */
    );
  }

  _onBarDrag({ direction, percent, size }) {
    const elm = this._getDomByRef('panel');
    const dest = elm[size] * percent;

    this.scrollTo(
      {
        [direction]: dest
      },
      false
    );
  }

  /** Public methods */

  scrollTo({ x, y }: Dest, animate: boolean = true) {
    this._scrollTo(x, y, animate);
  }
  refresh() {
    this._refresh();
    // Call HOC's refresh method
    this.props.onContainerRefresh();
  }
}

export default enhance<Props>(MagicScrollNative);
