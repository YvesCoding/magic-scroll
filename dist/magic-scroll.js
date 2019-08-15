/**
 * magic-scroll v0.0.6
 * (c) 2018-2019 WangYi7099
 * Released under the MIT License
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react-dom'), require('react')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react-dom', 'react'], factory) :
	(factory((global['magic-scroll'] = {}),global.ReactDOM,global.react));
}(this, (function (exports,ReactDom,React) { 'use strict';

// detect content size change
function listenResize(element, callback) {
  if (!element) {
    return false;
  }

  return injectObject(element, callback);
}

function injectObject(element, callback) {
  if (element.__resizeTrigger__) {
    return;
  }

  createStyles(element.ownerDocument);

  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative'; // 将static改为relative
  }
  element.__resizeListener__ = e => {
    e.stopImmediatePropagation();
    e.preventDefault();
    callback();
    resetTrigger(element);
  };

  const resizeTrigger = element.__resizeTrigger__ = document.createElement('div');
  resizeTrigger.innerHTML = ` 
  <div class="expand-trigger">
    <div></div>
  </div>
  <div class="contract-trigger"></div> `;
  resizeTrigger.className = 'resize-triggers';
  element.appendChild(resizeTrigger);

  resetTrigger(element);
  const expand = getExpand(resizeTrigger);
  const contract = getContract(resizeTrigger);
  expand.addEventListener('scroll', element.__resizeListener__, true);
  contract.addEventListener('scroll', element.__resizeListener__, true);

  return (element.removeResize = () => {
    // Remove
    element.removeEventListener('scroll', element.__resizeListener__, true);
    element.removeChild(element.__resizeTrigger__);
    element.__resizeListener__ = element.__resizeTrigger__ = null;
    delete element.removeResize;
  }) && element;
}

const resetTrigger = element => {
  const trigger = element.__resizeTrigger__;
  if (!trigger) {
    return;
  }
  const expand = getExpand(trigger);
  const contract = getContract(trigger);
  const expandChild = expand.firstElementChild;
  contract.scrollLeft = contract.scrollWidth;
  contract.scrollTop = contract.scrollHeight;
  expandChild.style.width = expand.offsetWidth + 1 + 'px';
  expandChild.style.height = expand.offsetHeight + 1 + 'px';
  expand.scrollLeft = expand.scrollWidth;
  expand.scrollTop = expand.scrollHeight;
};

const getExpand = elm => {
  return elm.firstElementChild;
};
const getContract = elm => {
  return elm.lastElementChild;
};

var createStyles = function (doc) {
  if (!doc.getElementById('detectElementResize')) {
    //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
    var css = '.resize-triggers { ' + 'visibility: hidden; opacity: 0; } ' + '.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
        head = doc.head || doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.id = 'detectElementResize';
    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
  }
};

function requestAnimationFrame(global) {
  // Check for request animation Frame support
  var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
  var isNative = !!requestFrame;

  if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
    isNative = false;
  }

  if (isNative) {
    return function (callback, root) {
      requestFrame(callback, root);
    };
  }

  var TARGET_FPS = 60;
  var requests = {};
  var rafHandle = 1;
  var intervalHandle = null;
  var lastActive = +new Date();

  return function (callback) {
    var callbackHandle = rafHandle++;

    // Store callback
    requests[callbackHandle] = callback;

    // Create timeout at first request
    if (intervalHandle === null) {
      intervalHandle = setInterval(function () {
        var time = +new Date();
        var currentRequests = requests;

        // Reset data structure before executing callbacks
        requests = {};

        for (var key in currentRequests) {
          if (currentRequests.hasOwnProperty(key)) {
            currentRequests[key](time);
            lastActive = time;
          }
        }

        // Disable the timeout when nothing happens for a certain
        // period of time
        if (time - lastActive > 2500) {
          clearInterval(intervalHandle);
          intervalHandle = null;
        }
      }, 1000 / TARGET_FPS);
    }

    return callbackHandle;
  };
}

function noop() {
  return true;
}

/* istanbul ignore next */
const now = Date.now || (() => {
  return new Date().getTime();
});

class Animate {
  constructor() {
    this.init();

    this.isRunning = false;
  }

  startScroll(st, ed, spd, stepCb = noop, completeCb = noop, vertifyCb = noop, easingMethod = noop) {
    const df = ed - st;
    const dir = df > 0 ? -1 : 1;
    const nt = now();

    if (!this.isRunning) {
      this.init();
    }

    if (dir != this.dir || nt - this.ts > 200) {
      this.ts = nt;

      this.dir = dir;
      this.st = st;
      this.ed = ed;
      this.df = df;
    } /* istanbul ignore next */else {
        this.df += df;
      }

    this.spd = spd;

    this.completeCb = completeCb;
    this.vertifyCb = vertifyCb;
    this.stepCb = stepCb;
    this.easingMethod = easingMethod;

    this.ref = requestAnimationFrame(window);

    if (!this.isRunning) {
      this.execScroll();
    }
  }

  execScroll() {
    let percent = 0;
    this.isRunning = true;

    const loop = () => {
      /* istanbul ignore if */
      if (!this.isRunning || !this.vertifyCb(percent)) {
        this.isRunning = false;
        return;
      }

      percent = (now() - this.ts) / this.spd;
      if (percent < 1) {
        const value = this.st + this.df * this.easingMethod(percent);
        this.stepCb(value);
        this.ref(loop);
      } else {
        // trigger complete
        this.stepCb(this.st + this.df);
        this.completeCb();

        this.isRunning = false;
      }
    };

    this.ref(loop);
  }

  init() {
    this.st = 0;
    this.ed = 0;
    this.df = 0;
    this.spd = 0;
    this.ts = 0;
    this.dir = 0;
  }
}

/**
 *  Compatible to scroller's animation function
 */
function createEasingFunction(easing, easingPattern) {
  return function (time) {
    return easingPattern(easing, time);
  };
}

/**
 * Calculate the easing pattern
 * @link https://github.com/cferdinandi/smooth-scroll/blob/master/src/js/smooth-scroll.js
 * modified by wangyi7099
 * @param {String} type Easing pattern
 * @param {Number} time Time animation should take to complete
 * @returns {Number}
 */
function easingPattern(easing, time) {
  let pattern = null;
  /* istanbul ignore next */
  {
    // Default Easing Patterns
    if (easing === 'easeInQuad') pattern = time * time; // accelerating from zero velocity
    if (easing === 'easeOutQuad') pattern = time * (2 - time); // decelerating to zero velocity
    if (easing === 'easeInOutQuad') pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
    if (easing === 'easeInCubic') pattern = time * time * time; // accelerating from zero velocity
    if (easing === 'easeOutCubic') pattern = --time * time * time + 1; // decelerating to zero velocity
    if (easing === 'easeInOutCubic') pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
    if (easing === 'easeInQuart') pattern = time * time * time * time; // accelerating from zero velocity
    if (easing === 'easeOutQuart') pattern = 1 - --time * time * time * time; // decelerating to zero velocity
    if (easing === 'easeInOutQuart') pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * --time * time * time * time; // acceleration until halfway, then deceleration
    if (easing === 'easeInQuint') pattern = time * time * time * time * time; // accelerating from zero velocity
    if (easing === 'easeOutQuint') pattern = 1 + --time * time * time * time * time; // decelerating to zero velocity
    if (easing === 'easeInOutQuint') pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * --time * time * time * time * time; // acceleration until halfway, then deceleration
  }
  return pattern || time; // no easing, no acceleration
}

/**
 * Get a html element from a component.
 */
const getDom = ref => {
    if (!ref) {
        /* istanbul ignore next */
        return null;
    }
    const _realDom = ReactDom.findDOMNode(ref);
    return _realDom;
};
/**
 * Deep merge from tow objects
 */
// export function merge(source: any, dest: any) {}
/**
 * Add or remove a event listener
 */
const eventOnOff = (dom, eventName, hander, capture, type = 'on') => {
    type == 'on' ? dom.addEventListener(eventName, hander, capture) : dom.removeEventListener(eventName, hander, capture);
};
/**
 * If value is a percent, convert it to a numeric one.
 * such as:
 * 85% -> size * 0.85
 */
function normalizeSize(size, amount) {
    let number = /(-?\d+(?:\.\d+?)?)%$/.exec(size + '');
    if (!number) {
        number = size - 0;
    } /* istanbul ignore next */
    else {
            number = number[1] - 0;
            number = amount * number / 100;
        }
    return number;
}
// Hide the ios native scrollbar.
function createHideBarStyle() {
    /* istanbul ignore next */
    {
        const cssText = `.__hidebar::-webkit-scrollbar {
      width: 0;
      height: 0;
    }`;
        createStyle('magic-scroll-hide-bar', cssText);
    }
}
function createStyle(styleId, cssText) {
    /* istanbul ignore if */
    if (typeof window === 'undefined' || document.getElementById(styleId)) {
        return;
    }
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    /* istanbul ignore if */
    if (style.styleSheet) {
        style.styleSheet.cssText = cssText;
    } else {
        style.appendChild(document.createTextNode(cssText));
    }
    head.appendChild(style);
}

/**
 * It is used to communication between HOC and wrapped component.
 */
// tslint:disable-next-line
const noop$1 = () => {};
class Watcher {
    constructor(name = '', getter = noop$1) {
        this.name = name;
        this.getter = getter;
    }
    run(...args) {
        let rtn = this.getter.apply(this, args);
        if (!(rtn instanceof Promise)) {
            rtn = Promise.resolve(rtn);
        }
        return rtn;
    }
}
class Subscription {
    constructor() {
        this.watchers = [];
    }
    subscribe(eventName = null, getter) {
        this.watchers.push(new Watcher(eventName, getter));
    }
    notify(name = null, ...params) {
        const resArray = [];
        // tslint:disable-next-line
        for (let index = 0; index < this.watchers.length; index++) {
            const watcher = this.watchers[index];
            if (name === Subscription.All_WATCHERS || name === watcher.name) {
                resArray.push(watcher.run.apply(watcher, params));
            }
        }
        return Promise.all(resArray);
    }
    unsubscribe() {
        this.watchers = [];
    }
}
Subscription.All_WATCHERS = 'ALL_WATCHERS';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */





function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

/**
 * Normalize class name.
 */
const normalizeClass = (classOne, classTwo) => {
    classOne = classOne || [];
    classTwo = classTwo || [];
    if (!Array.isArray(classOne)) {
        classOne = classOne.replace(/\s+/g, ' ').split(' ');
    }
    if (!Array.isArray(classTwo)) {
        classTwo = classTwo.replace(/\s+/g, ' ').split(' ');
    }
    return classOne.concat(classTwo).join(' ');
};

/* ----------------- Type End -------------------------- */
class Panel extends React.PureComponent {
    render() {
        const _a = this.props,
              { renderPanel, children, className: cn } = _a,
              others = __rest(_a, ["renderPanel", "children", "className"]);
        const className = normalizeClass('__panel', cn);
        const style = {
            boxSizing: 'border-box',
            position: 'relative'
        };
        if (renderPanel) {
            return React.cloneElement(renderPanel(Object.assign({ className,
                style }, others)), {}, children);
        } else {
            return React.createElement("div", Object.assign({ className: className, style: style }, others), children);
        }
    }
}
Panel.displayName = 'BasePanel';

const isIos = () => {
    /* istanbul ignore if */
    if (typeof window === 'undefined') {
        return false;
    }
    let u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
};
function getPrefix(global) {
    let docStyle = document.documentElement.style;
    let engine;
    /* istanbul ignore if */
    if (global.opera && Object.prototype.toString.call(global.opera) === '[object Opera]') {
        engine = 'presto';
    } /* istanbul ignore next */
    else if ('MozAppearance' in docStyle) {
            engine = 'gecko';
        } else if ('WebkitAppearance' in docStyle) {
            engine = 'webkit';
        } /* istanbul ignore next */
        else if (typeof global.navigator.cpuClass === 'string') {
                engine = 'trident';
            }
    let vendorPrefix = {
        trident: 'ms',
        gecko: 'moz',
        webkit: 'webkit',
        presto: 'O'
    }[engine];
    return vendorPrefix;
}
/**
 * Get a style with a browser prefix
 */
function getComplitableStyle(property, value) {
    if (typeof window === 'undefined') {
        return value;
    }
    const compatibleValue = `-${getPrefix(window)}-${value}`;
    const testElm = document.createElement('div');
    testElm.style[property] = compatibleValue;
    if (testElm.style[property] == compatibleValue) {
        /* istanbul ignore next */
        return compatibleValue;
    }
    /* istanbul ignore next */
    return false;
}
// Computed the bowser scrollbar gutter
let scrollBarWidth;
function getNativeScrollbarSize() {
    if (typeof window === 'undefined') {
        return 0;
    }
    if (scrollBarWidth !== undefined) {
        return scrollBarWidth;
    }
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    const { offsetWidth, clientWidth } = outer;
    scrollBarWidth = offsetWidth - clientWidth;
    document.body.removeChild(outer);
    return scrollBarWidth;
}

function cached(fn) {
    const cache = Object.create(null);
    return function cachedFn(str) {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
}
const capitalize = cached(
/* istanbul ignore next */
str => {
    /* istanbul ignore next */
    return str.charAt(0).toUpperCase() + str.slice(1);
});

class NativePanel extends React.PureComponent {
    constructor(props) {
        super(props);
        // bind internal methods
        this._handleScroll = this._handleScroll.bind(this);
        this._handleWheel = this._handleWheel.bind(this);
        this.subscription = new Subscription();
    }
    render() {
        const { children, barsState, renderView, renderPanel, barPos, scrollingX, scrollingY } = this.props;
        const style = {
            height: '100%'
        };
        const className = ['__native'];
        style.overflowY = !scrollingY ? 'hidden' : barsState.vBar.size ? 'scroll' : '';
        style.overflowX = !scrollingX ? 'hidden' : barsState.hBar.size ? 'scroll' : '';
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
        const viewStyle = {
            position: 'relative',
            boxSizing: 'border-box',
            minHeight: '100%',
            minWidth: '100%'
        };
        const widthStyle = getComplitableStyle('width', 'fit-content');
        if (widthStyle && scrollingX) {
            viewStyle.width = widthStyle;
        }
        let view;
        if (renderView) {
            view = React.cloneElement(renderView({
                className: '__view',
                style: viewStyle,
                ref: 'view'
            }), {}, children);
        } else {
            view = React.createElement("div", { className: "__view", ref: "view", style: viewStyle }, children);
        }
        return React.createElement(Panel, { className: className, ref: "panel", style: style, renderPanel: renderPanel }, view);
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
    _handleScroll(e) {
        this.props.handleScroll(e);
    }
    _handleWheel(event) {
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
                delta = -1 * event.wheelDelta / 2;
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
        if (wheelSpeed && (scrollingX && dir == 'dx' || scrollingY && dir == 'dy')) {
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
            listenResize(element, this.props.handleResize);
            this.subscription.subscribe(NativePanel.unmount_key, element.removeResize);
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
NativePanel.displayName = 'magic-scroll-panel-native';
/** trigger beofore component will unmount */
NativePanel.unmount_key = 'UNMOUNT_SUBSCRIBE';

const map = {
    vertical: {
        size: 'height',
        opsSize: 'width',
        posName: 'top',
        opposName: 'bottom',
        sidePosName: 'right',
        page: 'pageY',
        scroll: 'scrollTop',
        scrollSize: 'scrollHeight',
        offset: 'offsetHeight',
        client: 'clientY',
        axis: 'y',
        scrollButton: {
            start: 'top',
            end: 'bottom'
        }
    },
    horizontal: {
        size: 'width',
        opsSize: 'height',
        posName: 'left',
        opposName: 'right',
        sidePosName: 'bottom',
        page: 'pageX',
        scroll: 'scrollLeft',
        scrollSize: 'scrollWidth',
        offset: 'offsetWidth',
        client: 'clientX',
        axis: 'x',
        scrollButton: {
            start: 'left',
            end: 'right'
        }
    }
};

class TouchManager {
    constructor() {
        this.getTouchObject();
    }
    getEventObject(originEvent) {
        return this.touchObject ? this.isTouch ? originEvent.touches : [originEvent] : null;
    }
    getTouchObject() {
        /* istanbul ignore if */
        if (typeof window === 'undefined') {
            return null;
        }
        this.isTouch = false;
        const navigator = window.navigator;
        const agent = navigator.userAgent;
        const platform = navigator.platform;
        const touchObject = this.touchObject = {};
        touchObject.touch = !!('ontouchstart' in window && !window.opera || 'msmaxtouchpoints' in window.navigator || 'maxtouchpoints' in window.navigator || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
        touchObject.nonDeskTouch = touchObject.touch && !/win32/i.test(platform) || touchObject.touch && /win32/i.test(platform) && /mobile/i.test(agent);
        touchObject.eventType = 'onmousedown' in window && !touchObject.nonDeskTouch ? 'mouse' : 'ontouchstart' in window ? 'touch' : 'msmaxtouchpoints' in navigator || navigator.msMaxTouchPoints > 0 ? 'mstouchpoints' : 'maxtouchpoints' in navigator || navigator.maxTouchPoints > 0 ? 'touchpoints' : 'mouse';
        switch (touchObject.eventType) {
            case 'mouse':
                touchObject.touchstart = 'mousedown';
                touchObject.touchend = 'mouseup';
                touchObject.touchmove = 'mousemove';
                touchObject.touchenter = 'mouseenter';
                touchObject.touchmove = 'mousemove';
                touchObject.touchleave = 'mouseleave';
                break;
            case 'touch':
                touchObject.touchstart = 'touchstart';
                touchObject.touchend = 'touchend';
                touchObject.touchmove = 'touchmove';
                touchObject.touchcancel = 'touchcancel';
                touchObject.touchenter = 'touchstart';
                touchObject.touchmove = 'touchmove';
                touchObject.touchleave = 'touchend';
                this.isTouch = true;
                break;
            case 'mstouchpoints':
                touchObject.touchstart = 'MSPointerDown';
                touchObject.touchend = 'MSPointerUp';
                touchObject.touchmove = 'MSPointerMove';
                touchObject.touchcancel = 'MSPointerCancel';
                touchObject.touchenter = 'MSPointerDown';
                touchObject.touchleave = 'MSPointerUp';
                break;
            case 'touchpoints':
                touchObject.touchstart = 'pointerdown';
                touchObject.touchend = 'pointerup';
                touchObject.touchmove = 'pointermove';
                touchObject.touchcancel = 'pointercancel';
                touchObject.touchenter = 'pointerdown';
                touchObject.touchmove = 'pointermove';
                touchObject.touchleave = 'pointerup';
                break;
        }
        return this.touchObject;
    }
}

/* --------------- Type End ---------------- */
const rgbReg = /rgb\(/;
const extractRgbColor = /rgb\((.*)\)/;
// Transform a common color int oa `rgbA` color
const getRgbAColor = cached(identity => {
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
class Bar extends React.PureComponent {
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
        const { hideBar, otherBarHide, opacity, railBg, railCls, railBorder, railOpacity, railSize, railBorderRadius, barBg, barCls, barBorderRadius, barSize, barOpacity,
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
        const railStyle = {
            position: 'absolute',
            zIndex: 1,
            borderRadius: railBorderRadius !== 'auto' && railBorderRadius || barSize,
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
        const barWrapStyle = {
            position: 'absolute',
            borderRadius: barBorderRadius !== 'auto' && barBorderRadius || barSize,
            [this.bar.posName]: buttonSize,
            [this.bar.opsSize]: barSize,
            [this.bar.opposName]: buttonSize
        };
        // Bar props
        const barStyle = {
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
        return React.createElement("div", { ref: "rail", className: `__rail ${classNameOfType} ${railCls}`, style: railStyle }, this._createScrollbarButton('start'), hideBar ? null : React.createElement("div", { ref: "barWrap", className: `__bar-wrap ${classNameOfType}`, style: barWrapStyle }, React.createElement("div", { ref: "bar", className: `__bar ${classNameOfType} ${barCls} ${opacity == 0 ? '__is-hide' : '__is-show'}`, style: barStyle })), this._createScrollbarButton('end'));
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
        const scrollDistance = this.props.barsState.move * this.props.barsState.size;
        const pos = scrollDistance * this._getBarRatio() / this._getBarSize();
        return pos;
    }
    _getBarRatio() {
        return (100 - this._getBarSize()) / (100 - this.props.barsState.size);
    }
    _createDragEvent(touch) {
        const bar = this.refs.bar;
        const rail = this.refs.barWrap;
        const moveEvent = touch.touchObject.touchmove;
        const endEvent = touch.touchObject.touchend;
        const barType = this.bar.axis.toLowerCase();
        const dragStart = e => {
            e.stopImmediatePropagation();
            e.preventDefault();
            document.onselectstart = () => false;
            const event = touch.getEventObject(e)[0];
            const dragPos = event[this.bar.client];
            this.startPosition = dragPos - bar.getBoundingClientRect()[this.bar.posName];
            eventOnOff(document, moveEvent, onDragging);
            eventOnOff(document, endEvent, dragEnd);
            this.props.setDrag(true, barType);
        };
        const onDragging = e => {
            const event = touch.getEventObject(e)[0];
            const dragPos = event[this.bar.client];
            const delta = (dragPos - rail.getBoundingClientRect()[this.bar.posName]) / this._getBarRatio();
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
            className: normalizeClass('__bar-button', '__bar-button-is-' + this._getType() + '-' + type),
            style: {
                position: 'absolute',
                cursor: 'pointer',
                [map[this._getType()].scrollButton[type]]: 0,
                width: size,
                height: size
            },
            ref: type
        };
        const innerStyle = {
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
        const innerProps = {
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
        return React.createElement("div", Object.assign({}, wrapperProps), React.createElement("div", Object.assign({}, innerProps, { ref: type })));
    }
    _createScrollButtonEvent(type, touch) {
        const endEventName = touch.touchObject.touchend;
        const { scrollButtonClickStep, scrollButtonPressingStep } = this.props;
        const stepWithDirection = type == 'start' ? -scrollButtonClickStep : scrollButtonClickStep;
        const mousedownStepWithDirection = type == 'start' ? -scrollButtonPressingStep : scrollButtonPressingStep;
        const ref = requestAnimationFrame(window);
        let isMouseDown = false;
        let isMouseout = true;
        let timeoutId;
        const start = e => {
            /* istanbul ignore if */
            if (3 == e.which) {
                return;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
            isMouseout = false;
            this.props.onScrollButtonClick(stepWithDirection, 'd' + this.bar.axis);
            eventOnOff(document, endEventName, endPress, false);
            if (/mouse/.test(touch.touchObject.touchstart)) {
                const elm = this.refs[type];
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
                this.props.onScrollButtonClick(mousedownStepWithDirection, 'd' + this.bar.axis, false);
                ref(pressingButton, window);
            }
        };
        const endPress = () => {
            clearTimeout(timeoutId);
            isMouseDown = false;
            eventOnOff(document, endEventName, endPress, false, 'off');
            if (/mouse/.test(touch.touchObject.touchstart)) {
                const elm = this.refs[type];
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
    _setAllListeners(type) {
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
    _setBarListener(type) {
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
        const bar = this.refs.bar;
        this.events.bar = barEvent = this._createDragEvent(this.touch);
        eventOnOff(bar, this.touch.touchObject.touchstart, barEvent, {
            passive: false
        }, type);
    }
    _setRailListener(type) {
        let railEvent = this.events.rail;
        if (railEvent && type == 'on') {
            return;
        }
        if (!railEvent && type == 'off') {
            return;
        }
        const rail = this.refs.barWrap;
        this.events.rail = railEvent = this.touch.touchObject.touchstart;
        eventOnOff(rail, railEvent, e => this._handleRailClick(e, this.touch), false, type);
    }
    _setScrollButtonListener(position, type) {
        let scrollButtonEvent = this.events.scrollButton[type];
        let dom = this.refs[position];
        if (!dom) {
            return;
        }
        if (scrollButtonEvent && type == 'on') {
            return;
        }
        if (!scrollButtonEvent && type == 'off') {
            return;
        }
        this.events.scrollButton[type] = scrollButtonEvent = this.touch.touchObject.touchstart;
        eventOnOff(dom, scrollButtonEvent, this._createScrollButtonEvent(position, this.touch), false, type);
    }
    _handleRailClick(e, touch) {
        // Scroll to the place of rail where click event triggers.
        const { client, offset, posName, axis } = this.bar;
        const bar = this.refs.bar;
        if (!bar) {
            return;
        }
        const barOffset = bar[offset];
        const event = touch.getEventObject(e)[0];
        const percent = (event[client] - e.currentTarget.getBoundingClientRect()[posName] - barOffset / 2) / (e.currentTarget[offset] - barOffset);
        this.props.onRailClick(percent * 100 + '%', axis);
    }
    _getType() {
        return this.props.horizontal ? 'horizontal' : 'vertical';
    }
}
Bar.defaultProps = {
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
function createBar(barProps, vBarState, hBarState, opacity) {
    const isVBarHide = !vBarState.size;
    const isHBarHide = !hBarState.size;
    const vBar = (vBarState.size || barProps.keepRailShow) && !vBarState.disable ? React.createElement(Bar, Object.assign({}, Object.assign({}, barProps, {
        barsState: vBarState,
        horizontal: false,
        hideBar: isVBarHide,
        otherBarHide: isHBarHide,
        opacity
    }), { key: "vBar" })) : null;
    const hBar = (hBarState.size || barProps.keepRailShow) && !hBarState.disable ? React.createElement(Bar, Object.assign({}, Object.assign({}, barProps, {
        barsState: hBarState,
        horizontal: true,
        hideBar: isHBarHide,
        otherBarHide: isVBarHide,
        opacity
    }), { key: "hBar" })) : null;
    return [vBar, hBar];
}

/* ---------------- Type End -------------------- */
class BaseScroll extends React.PureComponent {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.touch = new TouchManager();
    }
    // Render
    render() {
        const _a = this.props,
              { renderContainer, className: cn, children, style = {}, onEnter, onLeave, onMove } = _a,
              others = __rest(_a, ["renderContainer", "className", "children", "style", "onEnter", "onLeave", "onMove"]);
        const className = normalizeClass(cn, '__magic-scroll');
        const ch = React.createElement(React.Fragment, null, children);
        style.position = 'relative';
        style.overflow = 'hidden';
        let eventObj = {};
        if (renderContainer) {
            // React the cloned element
            return React.cloneElement(renderContainer(Object.assign({ ref: this.container, className }, eventObj, others, { style })), ch);
        } else {
            return React.createElement("div", Object.assign({ ref: this.container }, eventObj, { className: className }, others, { style: style }), ch);
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
        eventOnOff(container, this.touch.touchObject.touchenter, onEnter, false, 'off');
        eventOnOff(container, this.touch.touchObject.touchleave, onLeave, false, 'off');
        eventOnOff(container, this.touch.touchObject.touchmove, onMove, false, 'off');
    }
}
BaseScroll.displayName = 'BasePScroll';

function debounce(func, waitTime) {
    let timeId;
    let _args;
    let context;
    const deb = (...args) => {
        context = this;
        _args = args;
        return readyToExecute();
    };
    function readyToExecute() {
        clearTimeout(timeId);
        let res;
        timeId = setTimeout(() => {
            res = func.apply(context, _args);
        }, waitTime);
        return res;
    }
    deb.cancel = () => {
        clearTimeout(timeId);
    };
    return deb;
}
/**
 * Simple throttle
 */
function throttle(func, waitTime) {
    let timeId;
    let _args;
    let context;
    const deb = (...args) => {
        context = this;
        _args = args;
        return readyToExecute();
    };
    function readyToExecute() {
        if (timeId) {
            return;
        }
        let res;
        timeId = setTimeout(() => {
            res = func.apply(context, _args);
            timeId = null;
        }, waitTime);
        return res;
    }
    deb.cancel = () => {
        clearTimeout(timeId);
    };
    return deb;
}

/**
 * copyed from vue-router!
 */

function warn(condition, message) {
    if (process.env.NODE_ENV !== 'production' && !condition) {
        // tslint:disable-next-line
        typeof console !== 'undefined' && console.warn(`[magic-scroll] ${message}`);
    }
}

const GlobarBarOptionsContext = React.createContext({});
function enhance(WrapperComponent) {
    class MagicScrollBase extends React.PureComponent {
        /* --------------------- Lifecycle Methods ------------------------ */
        constructor(props) {
            super(props);
            this._isLeaveContainer = true;
            this.container = React.createRef();
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
            this._onContainerLeave = this._onContainerLeave.bind(this);
            this._onBarDrag = this._onBarDrag.bind(this);
            this._onScrollButtonClick = this._onScrollButtonClick.bind(this);
            this.subscription = new Subscription();
            // // Debounce and throttle  methods
            this._hideBar = debounce(() => {
                // Hide bar
                if (this._canHideBar()) {
                    this.setState(prevState => {
                        return {
                            barState: Object.assign({}, prevState.barState, { opacity: 0 }),
                            classHooks: Object.assign({}, prevState.classHooks, { barVisible: false })
                        };
                    });
                }
            }, this.props.barKeepShowTime);
            this._onContainerMove = throttle(() => {
                this._updateBar();
                if (!this.props.onlyShowBarOnScroll && !this._isLeaveContainer) {
                    this._showBar();
                }
            }, 500);
            this.subscription.subscribe(MagicScrollBase.unmount_key, () => {
                this._hideBar.cancel();
            });
            this.subscription.subscribe(MagicScrollBase.unmount_key, () => {
                this._onContainerMove.cancel();
            });
        }
        render() {
            const mergedProps = Object.assign({}, this.context, this.props);
            const { wrappedCompRef, children, style, className, renderContainer, barBorderRadius, barSize, railBg, railCls, barBg, barCls, barOpacity, barMinSize, railOpacity, railSize, railBorderRadius, railBorder, keepRailShow, scrollButtonBg, scrollButtonClickStep, scrollButtonEnable, scrollButtonPressingStep } = mergedProps,
                  otherProps = __rest(mergedProps, ["wrappedCompRef", "children", "style", "className", "renderContainer", "barBorderRadius", "barSize", "railBg", "railCls", "barBg", "barCls", "barOpacity", "barMinSize", "railOpacity", "railSize", "railBorderRadius", "railBorder", "keepRailShow", "scrollButtonBg", "scrollButtonClickStep", "scrollButtonEnable", "scrollButtonPressingStep"]);
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
            const bars = createBar(barProps, barState.vBar, barState.hBar, barState.opacity);
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
            return React.createElement(React.Fragment, null, React.createElement(BaseScroll, { ref: this.container,
                /** Styles and classNames */
                className: mergeClasses, style: Object.assign({}, style),
                /** Render functions */
                renderContainer: renderContainer, onEnter: this._onContainerEnter, onLeave: this._onContainerLeave, onMove: this._onContainerMove }, bars, React.createElement(WrapperComponent, Object.assign({}, otherProps, { ref: value => {
                    // wrappedComp(value);
                    this.wrappedComp = value;
                    if (wrappedCompRef) {
                        wrappedCompRef(value);
                    }
                }, onContainerRefresh: this._refresh.bind(this), onScrollComplete: this._scrollComplete.bind(this), onScroll: this._handleScroll.bind(this) }), children)));
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
        _getDomByRef(refName) {
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
            if (!this.wrappedComp) {
                return;
            }
            const barState = this.wrappedComp._getBarState();
            if (barState) {
                this.setState(pre => {
                    return {
                        barState: Object.assign({}, barState, { opacity: pre.barState.opacity })
                    };
                });
            }
        }
        _showBar() {
            // Show bar
            this.setState(prevState => {
                return {
                    barState: Object.assign({}, prevState.barState, { opacity: 1 }),
                    classHooks: Object.assign({}, prevState.classHooks, { barVisible: true })
                };
            });
        }
        _showHideBar() {
            this._showBar();
            this._hideBar();
        }
        _refresh() {
            // set container size strategy
            const strat = this.props.sizeStrategy;
            const container = this._setContainerSizeStrategy(strat);
            if (!container) {
                return;
            }
            this._updateBar();
            this._showHideBar();
        }
        /**
         * Set size strategy according to
         * this.mergeOps.container.sizeStrategy
         */
        _setContainerSizeStrategy(strat) {
            const container = this._getDomByRef('container');
            if (!container) {
                return;
            }
            if (strat == 'percent') {
                this._setPercentSize(container);
            } else if (strat == 'number') {
                this._setNumberSize(container);
            } else {
                warn(false, `Unexpected strategy: ${strat}, except 'percent' or 'number'.`);
                // fallback to percent.
                this._setContainerSizeStrategy('percent');
            }
            return container;
        }
        _detectContainerResize() {
            if (!this._destroyContainerResize) {
                this.subscription.subscribe(MagicScrollBase.unmount_key, this._destroyContainerResize = listenResize(this._getDomByRef('container'), () => {
                    this._refresh();
                }).removeResize);
            }
        }
        _setPercentSize(elm) {
            elm.style.height = this.props.style.height || '100%';
            elm.style.width = this.props.style.width || '100%';
        }
        _setNumberSize(elm) {
            const parent = elm.parentNode;
            const setConainerSize = () => {
                elm.style.height = this.props.style.height || parent.offsetHeight + 'px';
                elm.style.width = this.props.style.width || parent.offsetWidth + 'px';
                this._updateBar();
            };
            setConainerSize(); // fire an once!;
        }
        _triggerInitialScroll() {
            if (!this.wrappedComp) {
                return;
            }
            const { initialScrollX: x, initialScrollY: y } = this.props;
            this.wrappedComp.scrollTo({ x, y });
        }
        _canHideBar() {
            return !this.props.keepBarShow && !this._isBarDragging && this._isLeaveContainer;
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
            if (!this.wrappedComp) {
                return;
            }
            this.wrappedComp.scrollTo({
                [pos]: percent
            });
        }
        _onBarDrag(move, type) {
            if (!this.wrappedComp) {
                return;
            }
            this.wrappedComp._onBarDrag(type, move);
        }
        _onScrollButtonClick(move, type, animate = true) {
            this.wrappedComp.scrollBy({
                [type]: move
            }, 0);
        }
        _scrollComplete(...args) {
            if (!this.wrappedComp) {
                return;
            }
            if (this.props.handleScrollComplete) {
                this.props.handleScrollComplete.apply(this.wrappedComp, args);
            }
        }
        _setBarDrag(isDragging, type) {
            this._isBarDragging = isDragging;
            this.setState(preState => {
                return Object.assign({}, preState, {
                    classHooks: Object.assign({}, preState.classHooks, { vBarDragging: isDragging && type == 'y', hBarDragging: isDragging && type == 'x' })
                });
            });
            if (!isDragging) {
                this._hideBar();
            }
        }
        _onContainerLeave() {
            this._isLeaveContainer = true;
            this._hideBar();
            this.setState(preState => {
                return Object.assign({}, preState, {
                    classHooks: Object.assign({}, preState.classHooks, { mouseEnter: false })
                });
            });
        }
        _onContainerEnter() {
            this._isLeaveContainer = false;
            if (!this.props.onlyShowBarOnScroll) {
                this._updateBar();
                this._showBar();
            }
            this.setState(preState => {
                return Object.assign({}, preState, {
                    classHooks: Object.assign({}, preState.classHooks, { mouseEnter: true })
                });
            });
        }
    }
    /** Default props */
    MagicScrollBase.defaultProps = {
        sizeStrategy: 'percent',
        detectResize: true,
        initialScrollY: false,
        initialScrollX: false,
        style: {},
        barKeepShowTime: 300
    };
    MagicScrollBase.displayName = 'magic-scroll-base';
    /** trigger beofore component will unmount */
    MagicScrollBase.unmount_key = 'UNMOUNT_SUBSCRIBE';
    // global options
    MagicScrollBase.contextType = GlobarBarOptionsContext;
    return React.forwardRef((props, ref) => {
        return React.createElement(MagicScrollBase, Object.assign({}, props, { wrappedCompRef: ref }));
    });
}

class MagicScrollNative extends React.PureComponent {
    /* --------------------- Lifecycle Methods ------------------------ */
    constructor(props) {
        super(props);
        this.panel = React.createRef();
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
        const { children, renderPanel, renderView, wheelSpeed, scrollingX, scrollingY } = this.props;
        const { verticalNativeBarPos } = this.props;
        const barState = this.state.barState;
        return React.createElement(NativePanel, { resize: listenResize, barPos: verticalNativeBarPos, barsState: barState, renderPanel: renderPanel, renderView: renderView, wheelSpeed: wheelSpeed, ref: this.panel, scrollingX: scrollingX, scrollingY: scrollingY, scrollBy: this.scrollBy, handleResize: this._handleResize, handleScroll: this._handleScroll }, children);
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
    _getDomByRef(refName) {
        return getDom(this[refName].current);
    }
    _getBarState() {
        const container = this._getDomByRef('panel');
        const barState = {
            vBar: { move: 0, size: 0, disable: false },
            hBar: { move: 0, size: 0, disable: false }
        };
        if (!container) {
            return barState;
        }
        const { scrollingX, scrollingY } = this.props;
        const clientWidth = container.clientWidth;
        const clientHeight = container.clientHeight;
        let heightPercentage = clientHeight * 100 / container.scrollHeight;
        let widthPercentage = clientWidth * 100 / container.scrollWidth;
        barState.vBar.move = container.scrollTop * 100 / clientHeight;
        barState.hBar.move = container.scrollLeft * 100 / clientWidth;
        barState.vBar.size = heightPercentage < 100 ? heightPercentage : 0;
        barState.hBar.size = widthPercentage < 100 ? widthPercentage : 0;
        barState.vBar.disable = !scrollingY;
        barState.hBar.disable = !scrollingX;
        this.setState({
            barState
        });
        return barState;
    }
    _scrollTo(x, y, speed, easing) {
        const panelElm = this._getDomByRef('panel');
        const { scrollLeft, scrollTop, scrollHeight, scrollWidth, clientWidth, clientHeight } = panelElm;
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
        if (typeof speed == 'undefined') {
            speed = this.props.speed;
        }
        if (speed) {
            // hadnle for scroll complete
            const scrollingComplete = this._scrollComplete.bind(this);
            // options
            const { easing: optionEasing, speed: optionSpeed } = this.props;
            const easingMethod = createEasingFunction(easing || optionEasing, easingPattern);
            if (x - scrollLeft) {
                // move x
                this.scrollX.startScroll(scrollLeft, x, speed || optionSpeed, dx => {
                    panelElm.scrollLeft = dx;
                }, scrollingComplete, undefined, easingMethod);
            }
            if (y - scrollTop) {
                // move Y
                this.scrollY.startScroll(scrollTop, y, speed, dy => {
                    panelElm.scrollTop = dy;
                }, scrollingComplete, undefined, easingMethod);
            }
        } else {
            panelElm.scrollTop = y;
            panelElm.scrollLeft = x;
        }
    }
    _refresh() {
        if (!this.panel.current) {
            return;
        }
        // refresh panel
        this.panel.current._refresh();
    }
    /** --------- react to events ----------------*/
    _invokeEventHandle(eventHandleName, event = null) {
        const panelDomInfo = this._getPanelStatus();
        if (!panelDomInfo) {
            return;
        }
        let { scrollLeft, scrollTop, scrollHeight, scrollWidth, clientHeight, clientWidth } = panelDomInfo;
        const vertical = {
            type: 'vertical'
        };
        const horizontal = {
            type: 'horizontal'
        };
        vertical.process = Math.min(scrollTop / (scrollHeight - clientHeight || 1), 1);
        horizontal.process = Math.min(scrollLeft / (scrollWidth - clientWidth || 1), 1);
        vertical.scrolledDistance = scrollTop;
        horizontal.scrolledDistance = scrollLeft;
        const eventHandle = this.props[eventHandleName];
        if (eventHandle) {
            eventHandle({
                name: eventHandleName,
                event,
                vertical,
                horizontal
            });
        }
    }
    _handleScroll(e) {
        this.props.onScroll();
        this._invokeEventHandle('handleScroll', e);
    }
    _handleResize() {
        this.refresh();
        this._invokeEventHandle('hanldeResize');
    }
    _scrollComplete() {
        this._invokeEventHandle('hanldeScrollComplete');
    }
    _onBarDrag(direction, percent) {
        const elm = this._getDomByRef('panel');
        const dest = elm[direction == 'x' ? 'scrollWidth' : 'scrollHeight'] * percent;
        this.scrollTo({
            [direction]: dest
        }, 0);
    }
    _getPanelStatus() {
        const panelElm = this._getDomByRef('panel');
        if (!panelElm) {
            return;
        }
        const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = panelElm;
        return {
            scrollTop,
            scrollLeft,
            scrollHeight,
            scrollWidth,
            clientHeight,
            clientWidth
        };
    }
    /** Public methods */
    scrollTo({ x, y }, speed, easing) {
        this._scrollTo(x, y, speed, easing);
    }
    scrollBy({ dx, dy }, speed, easing) {
        const { scrollWidth, scrollHeight, clientWidth, clientHeight } = this._getDomByRef('panel');
        let { scrollLeft, scrollTop } = this._getPanelStatus();
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
    getPosition() {
        const { scrollTop, scrollLeft } = this._getPanelStatus();
        return {
            scrollTop,
            scrollLeft
        };
    }
}
MagicScrollNative.defaultProps = {
    scrollingX: true,
    scrollingY: true,
    speed: 300,
    easing: undefined,
    wheelSpeed: 0,
    verticalNativeBarPos: 'right'
};
MagicScrollNative.displayName = 'magic-scroll-native';
/** trigger beofore component will unmount */
MagicScrollNative.unmount_key = 'UNMOUNT_SUBSCRIBE';
var index = enhance(MagicScrollNative);

exports.default = index;
exports.GlobarBarOptionsContext = GlobarBarOptionsContext;

Object.defineProperty(exports, '__esModule', { value: true });

})));
