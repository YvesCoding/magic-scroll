import map from 'shared/Map';
import * as React from 'react';
import { eventOnOff } from 'shared/Util/dom';
import { isMobile } from 'shared/Util/compitable';
import { cached } from 'shared/Util/object';
import { normalizeClass } from 'shared/Util/class';

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
  onDrag(movedPercent, type: 'vertical' | 'horizontal', scrollSize): void;
  onRailClick(movedPercent, pos: 'y' | 'x'): void;
}

export interface OtherProps {
  hideBar: boolean;
  otherBarHide: boolean;
}

export interface UserPassedProps {
  /**
   * The distance of scrollbar away from the two ends of the X axis and Y axis.
   */
  gutterOfEnds: string;

  /**
   * The distance of scrollbar away from the side of container.
   */
  gutterOfSide: string;

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
  railOp: number;

  /**
   * Rail's calss.
   */
  railCls: string;

  /**
   * rail border
   */
  railBorder: null;
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
    gutterOfEnds: null,
    gutterOfSide: null,
    barMinSize: 0.1,

    railBg: '#01a99a',
    railOp: 0,
    railCls: '',
    railSize: '6px',
    railBorder: null,
    railBorderRadius: 'auto',

    keepRailShow: false,
    showBarWhenMove: false,

    barDisappearDuration: 300,
    keepBarShow: false,
    barBg: 'rgb(3, 185, 118)',
    barCls: '',
    barOp: 1,

    scrollButtonEnable: false,
    scrollButtonBg: '#cecece',
    scrollButtonClickStep: 180,
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
      barsState,
      hideBar,
      otherBarHide,
      opacity,

      gutterOfEnds,
      gutterOfSide,
      railBg,
      railCls,
      railBorder,
      railOp,
      railSize,

      barBg,
      barCls,
      barBorderRadius,
      barSize,
      // barMinSize,

      //  scrollButtonBg,
      //  scrollButtonClickStep,
      scrollButtonEnable
      //  scrollButtonPressingStep
    } = this.props;

    const barType = this._getType();
    const BAR_MAP = map[barType];
    const classNameOfType = '__is-' + barType;

    /** Get rgbA format background color */
    const railBackgroundColor = getRgbAColor(railBg + '-' + railOp);
    const endPos = otherBarHide ? 0 : railSize;
    const railStyle: React.CSSProperties = {
      borderRadius: (barBorderRadius !== 'auto' && barBorderRadius) || barSize,
      // backgroundColor: 'blue',
      [BAR_MAP.opsSize]: railSize,
      [BAR_MAP.posName]: gutterOfEnds || 0,
      [BAR_MAP.opposName]: gutterOfEnds || endPos,
      [BAR_MAP.sidePosName]: gutterOfSide || 0,
      background: railBackgroundColor,
      border: railBorder
    };

    const barStyle: React.CSSProperties = {
      backgroundColor: barBg,
      [BAR_MAP.size]: barsState.size + '%',
      opacity,
      [BAR_MAP.opsSize]: barSize,
      transform: `translate${BAR_MAP.axis}(${barsState.move}%)`
    };

    const buttonSize = scrollButtonEnable ? barSize : 0;
    const barWrapStyle: React.CSSProperties = {
      borderRadius: barBorderRadius || buttonSize,
      [BAR_MAP.posName]: buttonSize,
      [BAR_MAP.opsSize]: barSize,
      [BAR_MAP.opposName]: buttonSize
    };

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
              className={`__bar ${classNameOfType} ${barCls}`}
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
  _createDragEvent(type: 'touch' | 'mouse'): any {
    const _this = this;
    const bar = _this.refs.bar as Element;
    const rail = _this.refs.rail as Element;
    const moveEvent = type == 'touch' ? 'touchmove' : 'mousemove';
    const endEvent = type == 'touch' ? 'touchend' : 'mouseup';

    function dragStart(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      document.onselectstart = () => false;

      const event = type == 'touch' ? e.touches[0] : e;
      const dragPos = event[_this.bar.client];

      _this.startPosition =
        dragPos - bar.getBoundingClientRect()[_this.bar.posName];

      eventOnOff(document, moveEvent, onDragging);
      eventOnOff(document, endEvent, dragEnd);

      _this.props.setDrag(true);
    }
    function onDragging(e) {
      const event = type == 'touch' ? e.touches[0] : e;
      const dragPos = event[_this.bar.client];
      const delta = dragPos - rail.getBoundingClientRect()[_this.bar.posName];
      const percent = (delta - _this.startPosition) / rail[_this.bar.offset];
      _this.props.onDrag(
        percent,
        _this.props.horizontal ? 'horizontal' : 'vertical',
        _this.bar.scrollSize
      );
    }
    function dragEnd() {
      document.onselectstart = null;
      _this.startPosition = 0;

      eventOnOff(document, moveEvent, onDragging, false, 'off');
      eventOnOff(document, endEvent, dragEnd, false, 'off');

      _this.props.setDrag(false);
    }

    return dragStart;
  }
  _addAllListeners() {
    if (this.refs.bar) {
      this._addBarListener();
    }
    if (this.refs.rail) {
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
    const rail = this.refs.rail as Element;
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

function createScrollbarButton(context: Bar, type) {
  if (!context.props.scrollButtonEnable) {
    return null;
  }

  const size = context.props.barSize;
  const borderColor = context.props.scrollButtonBg;
  const wrapperProps = {
    className: normalizeClass(
      '__bar-button',
      '__bar-button-is-' + this._getType() + '-' + type
    ),
    style: {
      [map[this._getType()].scrollButton[type]]: 0,
      width: size,
      height: size
    },
    ref: type
  };

  const innerProps = {
    className: '__bar-button-inner',
    style: {
      border: `calc(${size} / 2.5) solid ${borderColor}`
    }
  };

  return (
    <div {...wrapperProps}>
      <div {...innerProps} />
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
    vBarState.size && !barProps.keepRailShow ? (
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
    vBarState.size && !barProps.keepRailShow ? (
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
