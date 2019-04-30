import map from './bar-map';
import * as React from 'react';
import { eventOnOff } from '../utils/dom';
import { isMobile } from '../utils/compitable';
import { cached } from '../utils/object';
import { normalizeClass } from '../utils/class';
import { requestAnimationFrame } from '../vender/scroller/requestAnimationFrame';

/* --------------- Type Definations ---------------- */

export interface BarState {
  move: number;
  size: number;
  disable: boolean;
}

export interface InternalProps {
  horizontal: boolean;
  barsState: BarState;
  opacity: number;
}

export interface FunctionalProps {
  setDrag(isDrag: boolean): void;
  onBarDrag(move, type: 'x' | 'y');
  onScrollButtonClick(move, type: 'x' | 'y', animate?: boolean);
  onRailClick(movedPercent, pos: 'y' | 'x'): void;
}

export interface OtherProps {
  hideBar: boolean;
  otherBarHide: boolean;
}

export interface UserPassedProps {
  /**
   * scrollbar's size(Height/Width).
   */
  barSize: string;

  /**
   * Min bar size
   */
  barMinSize: number;

  /*
   *  scrollbar's border-radius.
   */
  barBorderRadius: string | 'auto';

  /**
   * Rail's background .
   */
  railBg: string;

  /**
   * Rail's opacity.
   */
  railOpacity: number;

  /**
   * Rail's calss.
   */
  railCls: string;

  /**
   * rail border
   */
  railBorder: null;

  /*
   *  scrollbar's border-radius.
   */
  railBorderRadius?: string | 'auto';

  /**
   * rail size
   */
  railSize: string;

  /**
   * Whether to keep rail show or not, event content height is not overflow.
   */
  keepRailShow: boolean;

  /**
   * Bar's background.
   */
  barBg: string;

  /**
   * Bar's class.
   */
  barCls: number;

  /**
   * Bar's opacity.
   */
  barOpacity: number;

  /*
   * scroll button enable or not
   */
  scrollButtonEnable: boolean;

  /**
   * scrollButton background
   */
  scrollButtonBg: string;

  /**
   * the distance when you click scrollButton once.
   */
  scrollButtonClickStep: number;

  /**
   * the distance when you keep pressing scrollButton.
   */
  scrollButtonPressingStep: number;
}

/* --------------- Type End ---------------- */
const rgbReg = /rgb\(/;
const extractRgbColor = /rgb\((.*)\)/;

// Transform a common color int oa `rgbA` color
const getRgbAColor = cached((identity) => {
  const [color, opacity] = identity.split('-');

  const div = document.createElement('div');
  div.style.background = color;
  document.body.appendChild(div);
  const computedColor = window.getComputedStyle(div).backgroundColor;
  document.body.removeChild(div);

  /* istanbul ignore if */
  if (!rgbReg.test(computedColor)) {
    return color;
  }

  return `rgba(${extractRgbColor.exec(computedColor)[1]}, ${opacity})`;
});

export class Bar extends React.PureComponent<
  UserPassedProps & InternalProps & FunctionalProps & OtherProps
> {
  static defaultProps = {
    barSize: '6px',
    barBorderRadius: 'auto',
    barMinSize: 0,

    railBg: '#01a99a',
    railOpacity: 0,
    railCls: '',
    railSize: '6px',
    railBorder: null,
    railBorderRadius: 'auto',

    keepRailShow: false,
    onlyShowBarOnScroll: true,

    barKeepShowTime: 300,
    keepBarShow: false,
    barBg: 'rgb(3, 185, 118)',
    barCls: '',
    barOpacity: 1,

    scrollButtonEnable: false,
    scrollButtonBg: '#cecece',
    scrollButtonClickStep: 80,
    scrollButtonPressingStep: 30
  };

  bar;
  startPosition: number;
  constructor(props) {
    super(props);

    const type = this.props.horizontal ? 'horizontal' : 'vertical';
    this.bar = map[type];
    this._createDragEvent = this._createDragEvent.bind(this);
    this._handleRailClick = this._handleRailClick.bind(this);
  }
  render() {
    const {
      hideBar,
      otherBarHide,
      opacity,

      railBg,
      railCls,
      railBorder,
      railOpacity,
      railSize,
      railBorderRadius,

      barBg,
      barCls,
      barBorderRadius,
      barSize,
      barOpacity,

      //  scrollButtonBg,
      //  scrollButtonClickStep,
      scrollButtonEnable
      //  scrollButtonPressingStep
    } = this.props;

    const barType = this._getType();
    const BAR_MAP = map[barType];
    const classNameOfType = '__is-' + barType;

    // Rail props
    /** Get rgbA format background color */
    const railBackgroundColor = getRgbAColor(railBg + '-' + railOpacity);
    const endPos = otherBarHide ? 0 : railSize;
    const railStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1,

      borderRadius:
        (railBorderRadius !== 'auto' && railBorderRadius) || barSize,
      // backgroundColor: 'blue',
      [BAR_MAP.opsSize]: railSize,
      [BAR_MAP.posName]: 0,
      [BAR_MAP.opposName]: endPos,
      [BAR_MAP.sidePosName]: 0,
      background: railBackgroundColor,
      border: railBorder
    };

    // Bar wrapper props
    const buttonSize = scrollButtonEnable ? railSize : 0;
    const barWrapStyle: React.CSSProperties = {
      position: 'absolute',
      borderRadius: (barBorderRadius !== 'auto' && barBorderRadius) || barSize,
      [BAR_MAP.posName]: buttonSize,
      [BAR_MAP.opsSize]: barSize,
      [BAR_MAP.opposName]: buttonSize
    };

    // Bar props
    const barStyle: React.CSSProperties = {
      cursor: 'pointer',
      position: 'absolute',
      margin: 'auto',
      transition: 'opacity 0.5s',
      userSelect: 'none',
      borderRadius: 'inherit',

      backgroundColor: barBg,
      [BAR_MAP.size]: this._getBarSize() + '%',
      opacity: opacity == 0 ? 0 : barOpacity,
      [BAR_MAP.opsSize]: barSize,
      transform: `translate${BAR_MAP.axis}(${this._getBarPos()}%)`
    };

    if (barType == 'vertical') {
      barWrapStyle.width = '100%';
      // Let bar to be on the center.
      barStyle.left = 0;
      barStyle.right = 0;
    } else {
      barWrapStyle.height = '100%';
      barStyle.top = 0;
      barStyle.bottom = 0;
    }

    return (
      <div
        ref="rail"
        className={`__rail ${classNameOfType} ${railCls}`}
        style={railStyle}
      >
        {createScrollbarButton(this, 'start')}
        {hideBar ? null : (
          <div
            ref="barWrap"
            className={`__bar-wrap ${classNameOfType}`}
            style={barWrapStyle}
          >
            <div
              ref="bar"
              className={`__bar ${classNameOfType} ${barCls} ${
                opacity == 0 ? '__is-hide' : '__is-show'
              }`}
              style={barStyle}
            />
          </div>
        )}
        {createScrollbarButton(this, 'end')}
      </div>
    );
  }
  componentDidMount() {
    this._addAllListeners();
  }
  // Internal methods
  /**
   * Create a drag event according to current platform
   */
  _getBarSize() {
    return Math.max(this.props.barMinSize * 100, this.props.barsState.size);
  }
  _getBarPos() {
    const scrollDistance =
      this.props.barsState.move * this.props.barsState.size;
    const pos = (scrollDistance * this._getBarRatio()) / this._getBarSize();

    return pos;
  }
  _getBarRatio() {
    return (100 - this._getBarSize()) / (100 - this.props.barsState.size);
  }
  _createDragEvent(type: 'touch' | 'mouse'): any {
    const bar = this.refs.bar as Element;
    const rail = this.refs.barWrap as Element;
    const moveEvent = type == 'touch' ? 'touchmove' : 'mousemove';
    const endEvent = type == 'touch' ? 'touchend' : 'mouseup';

    const dragStart = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      document.onselectstart = () => false;

      const event = type == 'touch' ? e.touches[0] : e;
      const dragPos = event[this.bar.client];

      this.startPosition =
        dragPos - bar.getBoundingClientRect()[this.bar.posName];

      eventOnOff(document, moveEvent, onDragging);
      eventOnOff(document, endEvent, dragEnd);

      this.props.setDrag(true);
    };
    const onDragging = (e) => {
      const event = type == 'touch' ? e.touches[0] : e;
      const dragPos = event[this.bar.client];
      const delta =
        (dragPos - rail.getBoundingClientRect()[this.bar.posName]) /
        this._getBarRatio();
      const percent = (delta - this.startPosition) / rail[this.bar.offset];

      this.props.onBarDrag(percent, this.bar.axis.toLowerCase());
    };
    const dragEnd = () => {
      document.onselectstart = null;
      this.startPosition = 0;

      eventOnOff(document, moveEvent, onDragging, false, 'off');
      eventOnOff(document, endEvent, dragEnd, false, 'off');

      this.props.setDrag(false);
    };

    return dragStart;
  }
  _addAllListeners() {
    if (this.refs.bar) {
      this._addBarListener();
    }
    if (this.refs.barWrap) {
      this._addRailListener();
    }
  }
  _addBarListener() {
    // Not registry listener on props because there is a passive
    // issue on `touchstart` event, see:
    // https://github.com/facebook/react/issues/9809#issuecomment-414072263
    const bar = this.refs.bar as Element;
    const type = isMobile() ? 'touchstart' : 'mousedown';
    let event: any = isMobile()
      ? this._createDragEvent('touch')
      : this._createDragEvent('mouse');

    eventOnOff(bar, type, event, { passive: false });
  }
  _addRailListener() {
    const rail = this.refs.barWrap as Element;
    const type = isMobile() ? 'touchstart' : 'mousedown';

    eventOnOff(rail, type, (e) => this._handleRailClick(e, type));
  }
  _handleRailClick(e, type: 'touchstart' | 'mousedown') {
    // Scroll to the place of rail where click event triggers.
    const { client, offset, posName, axis } = this.bar;
    const bar = this.refs.bar;

    if (!bar) {
      return;
    }

    const barOffset = bar[offset];
    const event = type == 'touchstart' ? e.touches[0] : e;

    const percent =
      (event[client] -
        e.currentTarget.getBoundingClientRect()[posName] -
        barOffset / 2) /
      (e.currentTarget[offset] - barOffset);

    this.props.onRailClick(percent * 100 + '%', axis.toLowerCase() as
      | 'x'
      | 'y');
  }

  _getType() {
    return this.props.horizontal ? 'horizontal' : 'vertical';
  }
}

/**
 *
 * @param context bar instance
 * @param type bar type (vertical | horizontal)
 * @param env mouse means component is running on PC , or running on moblie
 * phone.
 */
function createScrollButtonEvent(
  context: Bar,
  type: 'start' | 'end',
  env: 'mouse' | 'touch' = 'mouse'
) {
  const endEventName = env == 'mouse' ? 'mouseup' : 'touchend';
  const { scrollButtonClickStep, scrollButtonPressingStep } = context.props;
  const stepWithDirection =
    type == 'start' ? -scrollButtonClickStep : scrollButtonClickStep;
  const mousedownStepWithDirection =
    type == 'start' ? -scrollButtonPressingStep : scrollButtonPressingStep;
  const ref = requestAnimationFrame(window);

  let isMouseDown = false;
  let isMouseout = true;
  let timeoutId;

  const start = (e) => {
    /* istanbul ignore if */

    if (3 == e.which) {
      return;
    }

    e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();

    isMouseout = false;

    context.props.onScrollButtonClick(
      stepWithDirection,
      context.bar.axis.toLowerCase()
    );

    eventOnOff(document, endEventName, endPress, false);

    if (env == 'mouse') {
      const elm = context.refs[type] as Element;
      eventOnOff(elm, 'mouseenter', enter, false);
      eventOnOff(elm, 'mouseleave', leave, false);
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      isMouseDown = true;
      ref(pressingButton, window);
    }, 500);
  };

  const pressingButton = () => {
    if (isMouseDown && !isMouseout) {
      context.props.onScrollButtonClick(
        mousedownStepWithDirection,
        context.bar.axis.toLowerCase(),
        false
      );
      ref(pressingButton, window);
    }
  };

  const endPress = () => {
    clearTimeout(timeoutId);
    isMouseDown = false;
    eventOnOff(document, endEventName, endPress, false, 'off');
    if (env == 'mouse') {
      const elm = context.refs[type] as Element;
      eventOnOff(elm, 'mouseenter', enter, false, 'off');
      eventOnOff(elm, 'mouseleave', leave, false, 'off');
    }
  };

  const enter = () => {
    isMouseout = false;
    pressingButton();
  };

  const leave = () => {
    isMouseout = true;
  };

  return start;
}

/**
 * create two scroll butons on one rail.
 * @param context bar instance
 * @param type bar type (vertical | horizontal)
 */
function createScrollbarButton(context: Bar, type) {
  if (!context.props.scrollButtonEnable) {
    return null;
  }

  const size = context.props.railSize;
  const borderColor = context.props.scrollButtonBg;
  const wrapperProps = {
    className: normalizeClass(
      '__bar-button',
      '__bar-button-is-' + context._getType() + '-' + type
    ),
    style: {
      position: 'absolute' as 'absolute',
      cursor: 'pointer',
      [map[context._getType()].scrollButton[type]]: 0,
      width: size,
      height: size
    },
    ref: type
  };
  const innerStyle: React.CSSProperties = {
    border: `calc(${size} / 2.5) solid transparent`,
    width: '0',
    height: '0',
    margin: 'auto',
    position: 'absolute',
    top: '0',
    bottom: '0',
    right: '0',
    left: '0'
  };
  const innerProps: any = {
    className: '__bar-button-inner',
    style: innerStyle
  };

  if (!context.props.horizontal) {
    if (type == 'start') {
      innerProps.style.borderBottomColor = borderColor;
      innerProps.style.transform = 'translateY(-25%)';
    } else {
      innerProps.style.borderTopColor = borderColor;
      innerProps.style.transform = 'translateY(25%)';
    }
  } else {
    if (type == 'start') {
      innerProps.style.borderRightColor = borderColor;
      innerProps.style.transform = 'translateX(-25%)';
    } else {
      innerProps.style.borderLeftColor = borderColor;
      innerProps.style.transform = 'translateX(25%)';
    }
  }

  if (isMobile()) {
    innerProps.onTouchstart = createScrollButtonEvent(context, type, 'touch');
  } else {
    innerProps.onMouseDown = createScrollButtonEvent(context, type);
  }

  return (
    <div {...wrapperProps}>
      <div {...innerProps} ref={type} />
    </div>
  );
}

export default function createBar(
  barProps: UserPassedProps & FunctionalProps,
  vBarState: BarState,
  hBarState: BarState,
  opacity: number
) {
  const isVBarHide = !vBarState.size;
  const isHBarHide = !hBarState.size;
  const vBar =
    (vBarState.size || barProps.keepRailShow) && !vBarState.disable ? (
      <Bar
        {...{
          ...barProps,
          ...{
            barsState: vBarState,
            horizontal: false,
            hideBar: isVBarHide,
            otherBarHide: isHBarHide,
            opacity
          }
        }}
        key="vBar"
      />
    ) : null;

  const hBar =
    (vBarState.size || barProps.keepRailShow) && !hBarState.disable ? (
      <Bar
        {...{
          ...barProps,
          ...{
            barsState: hBarState,
            horizontal: true,
            hideBar: isHBarHide,
            otherBarHide: isVBarHide,
            opacity
          }
        }}
        key="hBar"
      />
    ) : null;

  return [vBar, hBar];
}
