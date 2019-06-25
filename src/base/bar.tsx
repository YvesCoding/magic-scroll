import map, { MapInterface } from './bar-map';
import * as React from 'react';
import { eventOnOff } from '../utils/dom';
import TouchManager from '../utils/touchManager';

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
  setDrag(isDrag: boolean, type: 'x' | 'y'): void;
  onBarDrag(move, type: 'x' | 'y');
  onScrollButtonClick(move, type: 'dx' | 'dy', animate?: boolean);
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

  bar: MapInterface;
  startPosition: number;
  touch: TouchManager;
  events: {
    bar: any;
    rail: any;
    scrollButton: {
      start: any;
      end: any;
    };
  };

  constructor(props) {
    super(props);

    const type = this.props.horizontal ? 'horizontal' : 'vertical';
    this.bar = map[type];
    this._createDragEvent = this._createDragEvent.bind(this);
    this._handleRailClick = this._handleRailClick.bind(this);
    this.touch = new TouchManager();
    this.events = {
      bar: null,
      rail: null,
      scrollButton: {
        start: null,
        end: null
      }
    };
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
      [this.bar.opsSize]: railSize,
      [this.bar.posName]: 0,
      [this.bar.opposName]: endPos,
      [this.bar.sidePosName]: 0,
      background: railBackgroundColor,
      border: railBorder
    };

    // Bar wrapper props
    const buttonSize = scrollButtonEnable ? railSize : 0;
    const barWrapStyle: React.CSSProperties = {
      position: 'absolute',
      borderRadius: (barBorderRadius !== 'auto' && barBorderRadius) || barSize,
      [this.bar.posName]: buttonSize,
      [this.bar.opsSize]: barSize,
      [this.bar.opposName]: buttonSize
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
      [this.bar.size]: this._getBarSize() + '%',
      opacity: opacity == 0 ? 0 : barOpacity,
      [this.bar.opsSize]: barSize,
      transform: `translate${this.bar.axis.toUpperCase()}(${this._getBarPos()}%)`
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
        {this._createScrollbarButton('start')}
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
        {this._createScrollbarButton('end')}
      </div>
    );
  }
  componentDidMount() {
    this._setAllListeners();
  }

  componentWillUnmount() {
    this._setAllListeners('off');
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
  _createDragEvent(touch: TouchManager): any {
    const bar = this.refs.bar as Element;
    const rail = this.refs.barWrap as Element;
    const moveEvent = touch.touchObject.touchmove;
    const endEvent = touch.touchObject.touchend;
    const barType = this.bar.axis.toLowerCase() as 'x' | 'y';

    const dragStart = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      document.onselectstart = () => false;

      const event = touch.getEventObject(e)[0];
      const dragPos = event[this.bar.client];

      this.startPosition =
        dragPos - bar.getBoundingClientRect()[this.bar.posName];

      eventOnOff(document, moveEvent, onDragging);
      eventOnOff(document, endEvent, dragEnd);

      this.props.setDrag(true, barType);
    };
    const onDragging = (e) => {
      const event = touch.getEventObject(e)[0];
      const dragPos = event[this.bar.client];
      const delta =
        (dragPos - rail.getBoundingClientRect()[this.bar.posName]) /
        this._getBarRatio();
      const percent = (delta - this.startPosition) / rail[this.bar.offset];

      this.props.onBarDrag(percent, barType);
    };
    const dragEnd = () => {
      document.onselectstart = null;
      this.startPosition = 0;

      eventOnOff(document, moveEvent, onDragging, false, 'off');
      eventOnOff(document, endEvent, dragEnd, false, 'off');

      this.props.setDrag(false, barType);
    };

    return dragStart;
  }
  _createScrollbarButton(type) {
    if (!this.props.scrollButtonEnable) {
      return null;
    }

    const size = this.props.railSize;
    const borderColor = this.props.scrollButtonBg;
    const wrapperProps = {
      className: normalizeClass(
        '__bar-button',
        '__bar-button-is-' + this._getType() + '-' + type
      ),
      style: {
        position: 'absolute' as 'absolute',
        cursor: 'pointer',
        [map[this._getType()].scrollButton[type]]: 0,
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

    if (!this.props.horizontal) {
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

    return (
      <div {...wrapperProps}>
        <div {...innerProps} ref={type} />
      </div>
    );
  }

  _createScrollButtonEvent(type: 'start' | 'end', touch: TouchManager) {
    const endEventName = touch.touchObject.touchend;
    const { scrollButtonClickStep, scrollButtonPressingStep } = this.props;
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

      e.stopImmediatePropagation();
      e.preventDefault();

      isMouseout = false;

      this.props.onScrollButtonClick(stepWithDirection, ('d' +
        this.bar.axis) as 'dx' | 'dy');

      eventOnOff(document, endEventName, endPress, false);

      if (/mouse/.test(touch.touchObject.touchstart)) {
        const elm = this.refs[type] as Element;
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
        this.props.onScrollButtonClick(
          mousedownStepWithDirection,
          ('d' + this.bar.axis) as 'dx' | 'dy',
          false
        );
        ref(pressingButton, window);
      }
    };

    const endPress = () => {
      clearTimeout(timeoutId);
      isMouseDown = false;
      eventOnOff(document, endEventName, endPress, false, 'off');
      if (/mouse/.test(touch.touchObject.touchstart)) {
        const elm = this.refs[type] as Element;
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

  _setAllListeners(type?: 'on' | 'off') {
    if (this.refs.bar) {
      this._setBarListener(type);
    }
    if (this.refs.barWrap) {
      this._setRailListener(type);
    }

    // add evemts for scrollButton
    this._setScrollButtonListener('start', type);
    this._setScrollButtonListener('end', type);

    if (type == 'off') {
      this.events = {
        bar: null,
        rail: null,
        scrollButton: {
          start: null,
          end: null
        }
      };
    }
  }

  _setBarListener(type?: 'on' | 'off') {
    let barEvent = this.events.bar;

    if (barEvent && type == 'on') {
      return;
    }

    if (!barEvent && type == 'off') {
      return;
    }

    // Not registry listener on props because there is a passive
    // issue on `touchstart` event, see:
    // https://github.com/facebook/react/issues/9809#issuecomment-414072263
    const bar = this.refs.bar as Element;
    this.events.bar = barEvent = this._createDragEvent(this.touch);

    eventOnOff(
      bar,
      this.touch.touchObject.touchstart,
      barEvent,
      {
        passive: false
      },
      type
    );
  }
  _setRailListener(type?: 'on' | 'off') {
    let railEvent = this.events.rail;

    if (railEvent && type == 'on') {
      return;
    }

    if (!railEvent && type == 'off') {
      return;
    }

    const rail = this.refs.barWrap as Element;
    this.events.rail = railEvent = this.touch.touchObject.touchstart;
    eventOnOff(
      rail,
      railEvent,
      (e) => this._handleRailClick(e, this.touch),
      false,
      type
    );
  }

  _setScrollButtonListener(position, type?: 'on' | 'off') {
    let scrollButtonEvent = this.events.scrollButton[type];
    let dom = this.refs[position] as Element;
    if (!dom) {
      return;
    }

    if (scrollButtonEvent && type == 'on') {
      return;
    }

    if (!scrollButtonEvent && type == 'off') {
      return;
    }

    this.events.scrollButton[type] = scrollButtonEvent = this.touch.touchObject
      .touchstart;
    eventOnOff(
      dom,
      scrollButtonEvent,
      this._createScrollButtonEvent(position, this.touch),
      false,
      type
    );
  }

  _handleRailClick(e, touch: TouchManager) {
    // Scroll to the place of rail where click event triggers.
    const { client, offset, posName, axis } = this.bar;
    const bar = this.refs.bar;

    if (!bar) {
      return;
    }

    const barOffset = bar[offset];
    const event = touch.getEventObject(e)[0];

    const percent =
      (event[client] -
        e.currentTarget.getBoundingClientRect()[posName] -
        barOffset / 2) /
      (e.currentTarget[offset] - barOffset);

    this.props.onRailClick(percent * 100 + '%', axis);
  }

  _getType() {
    return this.props.horizontal ? 'horizontal' : 'vertical';
  }
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
    (hBarState.size || barProps.keepRailShow) && !hBarState.disable ? (
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
