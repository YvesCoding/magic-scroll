import Container from './presentation/Container';
import * as React from 'react';
import { debounce, throttle } from 'shared/Util/limit';
import { getDom } from 'shared/Util/dom';
import { warn } from 'shared/Util/warn';
import { Subscription } from 'shared/Util/subscription';
import detectResize from 'third-party/resize-detector';
import createBar from './presentation/Bar';

interface Props {
  /**
   * Ues for forward ref in HOC
   */
  wrappedComp: any;

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
   * Give a padding to  Prevent scrollbar from sheltering the content
   */
  padding?: boolean;

  /**
   * The distance of scrollbar away from the two ends of the X axis and Y axis.
   */
  gutterOfEnds?: string;

  /**
   * The distance of scrollbar away from the side of container.
   */
  gutterOfSide?: string;

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

  /**
   * Rail's background .
   */
  railBg?: string;

  /**
   * Rail's opacity.
   */
  railOp?: number;

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

  /*
   * The duration of bar's disappearence.
   */
  barDisappearDuration?: number;

  /**
   * keep bar show.
   */
  keepBarShow?: boolean;

  /**
   * Whether to showbar when mouse is moving on content.
   */
  showBarWhenMove?: boolean;

  /**
   * Bar's background.
   */
  barBg?: string;

  /**
   * Bar's opacity.
   */
  barOp?: number;

  /**
   * Bar's class.
   */
  barCls?: number;

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
}

export function enhance<wrappedCompProps>(
  WrapperComponent: React.ComponentClass<any>
) {
  class MagicScrollBase extends React.PureComponent<Props, States> {
    /** Default props */
    static defaultProps = {
      sizeStrategy: 'percent',
      detectResize: true,
      initialScrollY: false,
      initialScrollX: false
    };

    static displayName = 'magic-scroll-base';

    /** trigger beofore component will unmount */
    static unmount_key = 'UNMOUNT_SUBSCRIBE';

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
        }
      };

      // Bind `this` context
      this._handleScroll = this._handleScroll.bind(this);
      this._onDragBar = this._onDragBar.bind(this);
      this._handleResize = this._handleResize.bind(this);
      this._onRailClick = this._onRailClick.bind(this);
      this._setBarDrag = this._setBarDrag.bind(this);
      this._onContainerEnter = this._onContainerEnter.bind(this);
      this._onContainerMove = this._onContainerMove.bind(this);
      this._onContainerLeave = this._onContainerLeave.bind(this);

      // // Debounce and throttle  methods
      this._hideBar = debounce(this._hideBar, this.props.barDisappearDuration);
      this._onContainerMove = throttle(this._onContainerMove, 500);

      this.subscription = new Subscription();
    }

    render() {
      const {
        children,
        style,
        className,
        renderContainer,
        barBorderRadius,
        barSize,
        gutterOfEnds,
        gutterOfSide,
        railBg,
        railCls,
        barBg,
        barCls,
        barOp,
        barMinSize,
        railOp,
        railSize,
        railBorderRadius,
        railBorder,
        keepRailShow,
        scrollButtonBg,
        scrollButtonClickStep,
        scrollButtonEnable,
        scrollButtonPressingStep,
        wrappedComp,
        ...otherProps
      } = this.props;
      const { barState } = this.state;

      const barProps = {
        railBg,
        railCls,
        keepRailShow,
        railOp,
        railSize,
        railBorder,
        railBorderRadius,

        barSize,
        barBg,
        barCls,
        barOp,
        barMinSize,
        barBorderRadius,

        scrollButtonBg,
        scrollButtonClickStep,
        scrollButtonEnable,
        scrollButtonPressingStep,

        gutterOfEnds,
        gutterOfSide,

        setDrag: this._setBarDrag,
        onDrag: this._onDragBar,
        onRailClick: this._onRailClick
      };

      return (
        <>
          <Container
            ref={this.container}
            /** Styles and classNames */
            className={className}
            style={{ ...style }}
            /** Render functions */
            renderContainer={renderContainer}
            onEnter={this._onContainerEnter}
            onLeave={this._onContainerLeave}
            onMove={this._onContainerMove}
          >
            {createBar(
              barProps,
              barState.vBar,
              barState.hBar,
              barState.opacity
            )}

            <WrapperComponent
              {...otherProps}
              ref={(value: any) => {
                // wrappedComp(value);
                this.wrappedComp = value;
              }}
              onContainerRefresh={this._refresh.bind(this)}
              onScrollComplete={this._scrollComptelte.bind(this)}
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

      if (this._destroyContainerResize) {
        this._destroyContainerResize();
        this._destroyContainerResize = null;
      }

      if (strat == 'percent') {
        if (this._destroyContainerResize) {
          this._destroyContainerResize();
          this._destroyContainerResize = null;
        }
        this._setPercentSize(container);
      } else if (strat == 'number') {
        if (!this._destroyContainerResize) {
          this.subscription.subscribe(
            MagicScrollBase.unmount_key,
            (this._destroyContainerResize = this._setNumberSize(container))
          );
        }
      } else {
        warn(
          false,
          `Unexpected strategy: ${strat}, except 'percent' or 'number'.`
        );
        // fallback to percent.
        this._setContainerSizeStrategy('percent');
      }
    }
    _setPercentSize(elm) {
      elm.style.height = '100%';
      elm.style.width = '100%';
    }
    _setNumberSize(elm) {
      const parent = elm.parentNode;
      const setConainerSize = () => {
        elm.style.height = parent.offsetHeight + 'px';
        elm.style.width = parent.offsetWidth + 'px';
        this._updateBar();
      };
      detectResize(parent, setConainerSize);

      setConainerSize(); // fire an once!;

      return elm.removeResize;
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

    /** --------- react to events ----------------*/
    _handleScroll() {
      this._updateBar();
    }

    _handleResize() {
      this._updateBar();
    }

    _onRailClick(percent, pos) {
      this.wrappedComp.scrollTo({
        [pos]: percent
      });
    }

    _scrollComptelte(...args) {
      if (this.props.handleScrollComplete) {
        this.props.handleScrollComplete.apply(this.props.wrappedComp, args);
      }
    }

    _onDragBar(percent, type) {
      const pos = type == 'vertical' ? 'y' : 'x';
      const size = type == 'vertical' ? 'scrollHeight' : 'scrollWidth';
      this.wrappedComp._onBarDrag({
        direction: pos,
        percent,
        size
      });
    }

    _setBarDrag(isDragging) {
      this._isBarDragging = isDragging;
      this._hideBar();
    }

    _onContainerLeave() {
      this._isLeaveContainer = true;
      this._hideBar();
    }
    _onContainerEnter() {
      this._isLeaveContainer = false;
      if (this.props.showBarWhenMove) {
        this._updateBar();
        this._showBar();
      }
    }
    _onContainerMove() {
      this._updateBar();
      if (this.props.showBarWhenMove && !this._isLeaveContainer) {
        this._showBar();
      }
    }
  }

  return React.forwardRef((props: Props & wrappedCompProps, ref) => {
    return <MagicScrollBase {...props} wrappedComp={ref} />;
  });
}
