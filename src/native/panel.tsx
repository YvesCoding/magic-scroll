import * as React from 'react';
import BasePanel from '../base/panel';
import { BarState } from '../base/Bar';
import {
  getNativeScrollbarSize,
  getComplitableStyle,
  isIos
} from '../utils/compitable';
import detectResize from '../vender/resize-detector';
import { getDom, eventOnOff, createHideBarStyle } from '../utils/dom';
import { Subscription } from '../utils/subscription';
import { capitalize } from '../utils/object';

interface Props {
  barsState: {
    vBar?: BarState;
    hBar?: BarState;
  };
  resize: boolean;
  barPos: 'right' | 'left';
  scrollingX: boolean;
  scrollingY: boolean;
  wheelSpeed: number;

  handleScroll(event: React.SyntheticEvent): void;
  // For mouse wheel scroling
  scrollBy({ x, y }: any, speed?): void;
  handleResize(event: string): void;
  renderView?(props?: any): React.ReactElement<any>;
  renderPanel?(props?: any): React.ReactElement<any>;
}

export default class NativePanel extends React.PureComponent<Props> {
  static displayName = 'magic-scroll-panel-native';

  /** trigger beofore component will unmount */
  static unmount_key = 'UNMOUNT_SUBSCRIBE';

  /** Subscription */
  subscription: Subscription;

  constructor(props) {
    super(props);

    // bind internal methods
    this._handleScroll = this._handleScroll.bind(this);
    this._handleWheel = this._handleWheel.bind(this);

    this.subscription = new Subscription();
  }
  render() {
    const {
      children,
      barsState,
      renderView,
      renderPanel,
      barPos,
      scrollingX,
      scrollingY
    } = this.props;

    const style: any = {
      height: '100%'
    };
    const className = ['__native'];
    style.overflowY = !scrollingY
      ? 'hidden'
      : barsState.vBar.size
      ? 'scroll'
      : '';
    style.overflowX = !scrollingX
      ? 'hidden'
      : barsState.hBar.size
      ? 'scroll'
      : '';

    // Add gutter for hiding native bar
    let gutter = getNativeScrollbarSize();

    if (!gutter) {
      createHideBarStyle();
      className.push('__hidebar');
      if (isIos()) {
        style['-webkit-overflow-scrolling'] = 'touch';
      }
    } else {
      if (barsState.vBar.size) {
        style[`margin${capitalize(barPos)}`] = `-${gutter}px`;
      }
      if (barsState.hBar.size) {
        style.height = `calc(100% + ${gutter}px)`;
      }
    }

    const viewStyle: any = {
      position: 'relative',
      boxSizing: 'border-box',
      minHeight: '100%',
      minWidth: '100%'
    };
    const widthStyle: any = getComplitableStyle('width', 'fit-content');
    if (widthStyle && scrollingX) {
      viewStyle.width = widthStyle;
    }
    let view;
    if (renderView) {
      view = React.cloneElement(
        renderView({
          className: '__view',
          style: viewStyle,
          ref: 'view'
        }),
        {},
        children
      );
    } else {
      view = (
        <div className="__view" ref="view" style={viewStyle}>
          {children}
        </div>
      );
    }

    return (
      <BasePanel
        className={className}
        ref="panel"
        style={style}
        renderPanel={renderPanel}
      >
        {view}
      </BasePanel>
    );
  }
  componentDidMount() {
    this._refresh();
    this._addEvent();
  }
  componentWillUnmount() {
    this.subscription.notify(NativePanel.unmount_key);
    this.subscription.unsubscribe();
  }

  componentDidUpdate() {
    this._refresh();
  }
  /** Internal Medthds */
  _handleScroll(e: any) {
    this.props.handleScroll(e);
  }
  _handleWheel(event: any) {
    let delta = 0;
    let dir;
    const { scrollingX, scrollingY, wheelSpeed } = this.props;
    if (event.wheelDelta) {
      if (event.deltaY) {
        dir = 'dy';
        delta = event.deltaY;
      } else if (event.deltaYX) {
        delta = event.deltaX;
        dir = 'dx';
      } else {
        if (event.shiftKey) {
          dir = 'dx';
        } else {
          dir = 'dy';
        }

        delta = (-1 * event.wheelDelta) / 2;
      }
    } else if (event.detail) {
      // horizontal scroll
      if (event.axis == 1) {
        dir = 'dx';
      } else if (event.axis == 2) {
        // vertical scroll
        dir = 'dy';
      }
      delta = event.detail * 16;
    }
    if (
      wheelSpeed &&
      ((scrollingX && dir == 'dx') || (scrollingY && dir == 'dy'))
    ) {
      event.stopPropagation();
      event.preventDefault();
      this.props.scrollBy({ [dir]: delta }, wheelSpeed);
    }
  }
  _detectResize(element) {
    if (element.removeResize) {
      if (!this.props.resize) {
        element.removeResize();
      }
      return;
    }

    if (this.props.resize) {
      detectResize(element, this.props.handleResize);
      this.subscription.subscribe(
        NativePanel.unmount_key,
        element.removeResize
      );
    }
  }
  _refresh() {
    // Detect dom size resize
    this._detectResize(this.refs.view);
  }
  _addEvent() {
    const panelElm = getDom(this.refs.panel);
    eventOnOff(panelElm, 'scroll', this._handleScroll);
    eventOnOff(panelElm, 'mousewheel', this._handleWheel);
    eventOnOff(panelElm, 'onMouseWheel', this._handleWheel);

    this.subscription.subscribe(NativePanel.unmount_key, () => {
      eventOnOff(panelElm, 'scroll', this._handleScroll, false, 'off');
      eventOnOff(panelElm, 'mousewheel', this._handleWheel, false, 'off');
      eventOnOff(panelElm, 'onMouseWheel', this._handleWheel, false, 'off');
    });
  }
}
