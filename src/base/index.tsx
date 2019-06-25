import * as React from 'react';

import createBar from './bar';
import Container from './container';

import { debounce, throttle } from '../utils/limit';
import { getDom } from '../utils/dom';
import { warn } from '../utils/warn';
import { Subscription } from '../utils/subscription';

import detectResize from '../vender/resize-detector';

interface Props {
  // The ref passed from outside
  wrappedCompRef: any;

  /** Inline style */
  style?: React.CSSProperties;

  /** Class */
  className?: string | string[];

  /** ---------- configs ----------------- */

  /**
   * The size type of magic scroll's container
   */
  sizeStrategy?: 'percent' | 'number';

  /**
   * The automic scrolling distance after component mounted
   */
  initialScrollY?: false | string | number;
  initialScrollX?: false | string | number;

  /**
   * scrollbar's size(Height/Width).
   */
  barSize?: string;

  /**
   * Min bar size
   */
  barMinSize?: number;

  /*
   *  scrollbar's border-radius.
   */
  barBorderRadius?: string | 'auto';

  /*
   * The keep-show time of scrollbar.
   */
  barKeepShowTime?: number;

  /**
   * keep bar show.
   */
  keepBarShow?: boolean;

  /**
   * Whether to showbar when mouse is moving on content.
   */
  onlyShowBarOnScroll?: boolean;

  /**
   * Bar's background.
   */
  barBg?: string;

  /**
   * Bar's opacity.
   */
  barOpacity?: number;

  /**
   * Bar's class.
   */
  barCls?: number;

  /**
   * Rail's background .
   */
  railBg?: string;

  /**
   * Rail's opacity.
   */
  railOpacity?: number;

  /**
   * Rail's calss.
   */
  railCls?: string;

  /**
   * scrollbar's size(Height/Width).
   */
  railSize?: string;

  /*
   *  scrollbar's border-radius.
   */
  railBorderRadius?: string | 'auto';

  /**
   * rail border
   */
  railBorder: null;

  /**
   * Whether to keep rail show or not, event content height is not overflow.
   */
  keepRailShow?: boolean;

  /**
   * scroll button enable or not
   */
  scrollButtonEnable?: boolean;

  /**
   * scrollButton background
   */
  scrollButtonBg?: string;

  /**
   * the distance when you click scrollButton once.
   */
  scrollButtonClickStep?: number;

  /**
   * the distance when you keep pressing scrollButton.
   */
  scrollButtonPressingStep?: number;

  /**
   * handle for scrolling complete
   */
  handleScrollComplete(): void;

  /** ---------- Customizable render function ----------------- */

  renderContainer?(props?: any): React.ReactElement<any>;
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

interface States {
  barState: BarStates;
  classHooks: {
    barVisible: boolean;

    vBarDragging: boolean;
    hBarDragging: boolean;

    mouseEnter: boolean;
  };
}

const GlobarBarOptionsContext = React.createContext({});

export { GlobarBarOptionsContext };

export function enhance<wrappedCompProps>(
  WrapperComponent: React.ComponentClass<any>
) {
  class MagicScrollBase extends React.PureComponent<Props, States> {
    /** Default props */
    static defaultProps = {
      sizeStrategy: 'percent',
      detectResize: true,
      initialScrollY: false,
      initialScrollX: false,
      style: {},
      barKeepShowTime: 300
    };

    static displayName = 'magic-scroll-base';

    /** trigger beofore component will unmount */
    static unmount_key = 'UNMOUNT_SUBSCRIBE';

    // global options
    static contextType = GlobarBarOptionsContext;

    /** Subscription */
    subscription: Subscription;

    container: React.RefObject<Container>;

    _isLeaveContainer: boolean = true;
    _isBarDragging: boolean;

    // The callback that can destroy container resize.
    _destroyContainerResize: any;

    wrappedComp: any;

    /* --------------------- Lifecycle Methods ------------------------ */
    constructor(props) {
      super(props);

      this.container = React.createRef<Container>();
      /**
       *  This state is to control style of container
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
            disable: false,
            size: 0
          },
          opacity: 0
        },
        classHooks: {
          barVisible: false,

          vBarDragging: false,
          hBarDragging: false,

          mouseEnter: false
        }
      };

      // Bind `this` context
      this._handleScroll = this._handleScroll.bind(this);
      this._handleResize = this._handleResize.bind(this);
      this._onRailClick = this._onRailClick.bind(this);
      this._setBarDrag = this._setBarDrag.bind(this);
      this._onContainerEnter = this._onContainerEnter.bind(this);
      this._onContainerMove = this._onContainerMove.bind(this);
      this._onContainerLeave = this._onContainerLeave.bind(this);
      this._onBarDrag = this._onBarDrag.bind(this);
      this._onScrollButtonClick = this._onScrollButtonClick.bind(this);

      // // Debounce and throttle  methods
      this._hideBar = debounce(this._hideBar, this.props.barKeepShowTime);
      this._onContainerMove = throttle(this._onContainerMove, 500);

      this.subscription = new Subscription();
    }

    render() {
      const mergedProps = { ...{}, ...this.context, ...this.props };

      const {
        wrappedCompRef,
        children,
        style,
        className,
        renderContainer,
        barBorderRadius,
        barSize,
        railBg,
        railCls,
        barBg,
        barCls,
        barOpacity,
        barMinSize,
        railOpacity,
        railSize,
        railBorderRadius,
        railBorder,
        keepRailShow,
        scrollButtonBg,
        scrollButtonClickStep,
        scrollButtonEnable,
        scrollButtonPressingStep,
        ...otherProps
      } = mergedProps;

      const { barState, classHooks } = this.state;

      const barProps = {
        railBg,
        railCls,
        keepRailShow,
        railOpacity,
        railSize,
        railBorder,
        railBorderRadius,

        barSize,
        barBg,
        barCls,
        barOpacity,
        barMinSize,
        barBorderRadius,

        scrollButtonBg,
        scrollButtonClickStep,
        scrollButtonEnable,
        scrollButtonPressingStep,

        setDrag: this._setBarDrag,
        onBarDrag: this._onBarDrag,
        onScrollButtonClick: this._onScrollButtonClick,
        onRailClick: this._onRailClick
      };

      const bars = createBar(
        barProps,
        barState.vBar,
        barState.hBar,
        barState.opacity
      );

      const [vBar, hBar] = bars;

      const mergeClasses = [].concat(className);
      for (const key in classHooks) {
        if (classHooks[key]) {
          mergeClasses.push(key);
        }
      }

      if (vBar) {
        mergeClasses.push('hasVBar');
      }

      if (hBar) {
        mergeClasses.push('hasHBar');
      }

      return (
        <>
          <Container
            ref={this.container}
            /** Styles and classNames */
            className={mergeClasses}
            style={{ ...style }}
            /** Render functions */
            renderContainer={renderContainer}
            onEnter={this._onContainerEnter}
            onLeave={this._onContainerLeave}
            onMove={this._onContainerMove}
          >
            {bars}

            <WrapperComponent
              {...otherProps}
              ref={(value: any) => {
                // wrappedComp(value);
                this.wrappedComp = value;

                if (wrappedCompRef) {
                  wrappedCompRef(value);
                }
              }}
              onContainerRefresh={this._refresh.bind(this)}
              onScrollComplete={this._scrollComplete.bind(this)}
              onScroll={this._handleScroll.bind(this)}
            >
              {children}
            </WrapperComponent>
          </Container>
        </>
      );
    }

    componentDidMount() {
      // linsten window resize.
      this._addAllEventListeners();
      // refresh state of each components
      this._refresh();
      // initial scroll
      this._triggerInitialScroll();
      // detect container resize
      this._detectContainerResize();
    }
    componentWillUnmount() {
      this.subscription.notify(MagicScrollBase.unmount_key);
      this.subscription.unsubscribe();
    }
    /* ---------------------  Component Methods ------------------------ */

    /** ---------  private methods  --------- */

    _getDomByRef(refName: 'container') {
      return getDom(this[refName].current);
    }

    /** Add all necessary listeners */
    _addAllEventListeners() {
      window.addEventListener('resize', this._handleResize);
      this.subscription.subscribe(MagicScrollBase.unmount_key, () => {
        window.removeEventListener('resize', this._handleResize);
      });
    }

    _updateBar() {
      const barState = this.wrappedComp._getBarState();
      if (barState) {
        this.setState((pre) => {
          return {
            barState: {
              ...barState,
              opacity: pre.barState.opacity
            }
          };
        });
      }
    }
    _showBar() {
      // Show bar
      this.setState((prevState) => {
        return {
          barState: {
            ...prevState.barState,
            opacity: 1
          },
          classHooks: {
            ...prevState.classHooks,
            barVisible: true
          }
        };
      });
    }
    _hideBar() {
      // Hide bar
      if (this._canHideBar()) {
        this.setState((prevState) => {
          return {
            barState: {
              ...prevState.barState,
              opacity: 0
            },
            classHooks: {
              ...prevState.classHooks,
              barVisible: false
            }
          };
        });
      }
    }
    _showHideBar() {
      this._showBar();
      this._hideBar();
    }
    _refresh() {
      // set container size strategy
      const strat = this.props.sizeStrategy;
      this._setContainerSizeStrategy(strat);

      this._updateBar();
      this._showHideBar();
    }
    /**
     * Set size strategy according to
     * this.mergeOps.container.sizeStrategy
     */
    _setContainerSizeStrategy(strat) {
      const container = this._getDomByRef('container');

      if (strat == 'percent') {
        this._setPercentSize(container);
      } else if (strat == 'number') {
        this._setNumberSize(container);
      } else {
        warn(
          false,
          `Unexpected strategy: ${strat}, except 'percent' or 'number'.`
        );
        // fallback to percent.
        this._setContainerSizeStrategy('percent');
      }
    }
    _detectContainerResize() {
      if (!this._destroyContainerResize) {
        this.subscription.subscribe(
          MagicScrollBase.unmount_key,
          (this._destroyContainerResize = detectResize(
            this._getDomByRef('container'),
            () => {
              this._refresh();
            }
          ).removeResize)
        );
      }
    }
    _setPercentSize(elm) {
      elm.style.height = this.props.style.height || '100%';
      elm.style.width = this.props.style.width || '100%';
    }
    _setNumberSize(elm) {
      const parent = elm.parentNode;

      const setConainerSize = () => {
        elm.style.height =
          this.props.style.height || parent.offsetHeight + 'px';
        elm.style.width = this.props.style.width || parent.offsetWidth + 'px';
        this._updateBar();
      };

      setConainerSize(); // fire an once!;
    }
    _triggerInitialScroll() {
      const { initialScrollX: x, initialScrollY: y } = this.props;
      this.wrappedComp.scrollTo({ x, y });
    }
    _canHideBar() {
      return (
        !this.props.keepBarShow &&
        !this._isBarDragging &&
        this._isLeaveContainer
      );
    }

    /** --------- events ----------------*/

    _handleScroll() {
      this._updateBar();
      this._showHideBar();
    }

    _handleResize() {
      this._updateBar();
    }

    _onRailClick(percent, pos) {
      this.wrappedComp.scrollTo({
        [pos]: percent
      });
    }

    _onBarDrag(move, type: 'x' | 'y') {
      this.wrappedComp._onBarDrag(type, move);
    }
    _onScrollButtonClick(move, type: 'dx' | 'dy', animate = true) {
      this.wrappedComp.scrollBy(
        {
          [type]: move
        },
        0
      );
    }

    _scrollComplete(...args) {
      if (this.props.handleScrollComplete) {
        this.props.handleScrollComplete.apply(this.wrappedComp, args);
      }
    }

    _setBarDrag(isDragging, type: 'x' | 'y') {
      this._isBarDragging = isDragging;

      this.setState((preState) => {
        return {
          ...preState,
          ...{
            classHooks: {
              ...preState.classHooks,
              vBarDragging: isDragging && type == 'y',
              hBarDragging: isDragging && type == 'x'
            }
          }
        };
      });

      if (!isDragging) {
        this._hideBar();
      }
    }

    _onContainerLeave() {
      this._isLeaveContainer = true;
      this._hideBar();

      this.setState((preState) => {
        return {
          ...preState,
          ...{
            classHooks: {
              ...preState.classHooks,
              mouseEnter: false
            }
          }
        };
      });
    }
    _onContainerEnter() {
      this._isLeaveContainer = false;
      if (!this.props.onlyShowBarOnScroll) {
        this._updateBar();
        this._showBar();
      }

      this.setState((preState) => {
        return {
          ...preState,
          ...{
            classHooks: {
              ...preState.classHooks,
              mouseEnter: true
            }
          }
        };
      });
    }
    _onContainerMove() {
      this._updateBar();
      if (!this.props.onlyShowBarOnScroll && !this._isLeaveContainer) {
        this._showBar();
      }
    }
  }

  return React.forwardRef((props: Props & wrappedCompProps, ref) => {
    return <MagicScrollBase {...props} wrappedCompRef={ref} />;
  });
}
