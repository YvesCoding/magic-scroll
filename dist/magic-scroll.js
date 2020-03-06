/**
 * magic-scroll v0.0.11
 * (c) 2018-2020 WangYi7099
 * Released under the MIT License
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react-dom'), require('react')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react-dom', 'react'], factory) :
	(factory((global['magic-scroll'] = {}),global.ReactDOM,global.react));
}(this, (function (exports,ReactDom,React) { 'use strict';

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

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

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
    if (getComputedStyle(element).position === "static") {
        element.style.position = "relative"; // 将static改为relative
    }
    element.__resizeListener__ = function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        callback();
        resetTrigger(element);
    };
    var resizeTrigger = element.__resizeTrigger__ = document.createElement("div");
    resizeTrigger.innerHTML = " \n  <div class=\"expand-trigger\">\n    <div></div>\n  </div>\n  <div class=\"contract-trigger\"></div> ";
    resizeTrigger.className = "resize-triggers";
    element.appendChild(resizeTrigger);
    resetTrigger(element);
    var expand = getExpand(resizeTrigger);
    var contract = getContract(resizeTrigger);
    expand.addEventListener("scroll", element.__resizeListener__, true);
    contract.addEventListener("scroll", element.__resizeListener__, true);
    return (element.removeResize = function () {
        // Remove
        element.removeEventListener("scroll", element.__resizeListener__, true);
        element.removeChild(element.__resizeTrigger__);
        element.__resizeListener__ = element.__resizeTrigger__ = null;
        delete element.removeResize;
    }) && element;
}
var resetTrigger = function (element) {
    var trigger = element.__resizeTrigger__;
    if (!trigger) {
        return;
    }
    var expand = getExpand(trigger);
    var contract = getContract(trigger);
    var expandChild = expand.firstElementChild;
    contract.scrollLeft = contract.scrollWidth;
    contract.scrollTop = contract.scrollHeight;
    expandChild.style.width = expand.offsetWidth + 1 + "px";
    expandChild.style.height = expand.offsetHeight + 1 + "px";
    expand.scrollLeft = expand.scrollWidth;
    expand.scrollTop = expand.scrollHeight;
};
var getExpand = function (elm) {
    return elm.firstElementChild;
};
var getContract = function (elm) {
    return elm.lastElementChild;
};
var createStyles = function (doc) {
    if (!doc.getElementById("detectElementResize")) {
        //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
        var css = ".resize-triggers { " + "visibility: hidden; opacity: 0; } " + '.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
            head = doc.head || doc.getElementsByTagName("head")[0],
            style = doc.createElement("style");
        style.id = "detectElementResize";
        style.type = "text/css";
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
var now = Date.now || function () {
    return new Date().getTime();
};
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var Animate =
/*#__PURE__*/
function () {
    function Animate() {
        _classCallCheck(this, Animate);
        this.init();
        this.isRunning = false;
    }
    _createClass(Animate, [{
        key: "startScroll",
        value: function startScroll(st, ed, spd) {
            var stepCb = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : noop;
            var completeCb = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : noop;
            var vertifyCb = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : noop;
            var easingMethod = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : noop;
            var df = ed - st;
            var dir = df > 0 ? -1 : 1;
            var nt = now();
            if (!this.isRunning) {
                this.init();
            }
            if (dir != this.dir || nt - this.ts > 200) {
                this.ts = nt;
                this.dir = dir;
                this.st = st;
                this.ed = ed;
                this.df = df;
            } else {
                /* istanbul ignore next */
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
    }, {
        key: "execScroll",
        value: function execScroll() {
            var _this = this;
            var percent = 0;
            this.isRunning = true;
            var loop = function loop() {
                /* istanbul ignore if */
                if (!_this.isRunning || !_this.vertifyCb(percent)) {
                    _this.isRunning = false;
                    return;
                }
                percent = (now() - _this.ts) / _this.spd;
                if (percent < 1) {
                    var value = _this.st + _this.df * _this.easingMethod(percent);
                    _this.stepCb(value);
                    _this.ref(loop);
                } else {
                    // trigger complete
                    _this.stepCb(_this.st + _this.df);
                    _this.completeCb();
                    _this.isRunning = false;
                }
            };
            this.ref(loop);
        }
    }, {
        key: "init",
        value: function init() {
            this.st = 0;
            this.ed = 0;
            this.df = 0;
            this.spd = 0;
            this.ts = 0;
            this.dir = 0;
        }
    }]);
    return Animate;
}();

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
    var pattern = null;
    /* istanbul ignore next */
    {
        // Default Easing Patterns
        if (easing === "easeInQuad") pattern = time * time; // accelerating from zero velocity
        if (easing === "easeOutQuad") pattern = time * (2 - time); // decelerating to zero velocity
        if (easing === "easeInOutQuad") pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
        if (easing === "easeInCubic") pattern = time * time * time; // accelerating from zero velocity
        if (easing === "easeOutCubic") pattern = --time * time * time + 1; // decelerating to zero velocity
        if (easing === "easeInOutCubic") pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
        if (easing === "easeInQuart") pattern = time * time * time * time; // accelerating from zero velocity
        if (easing === "easeOutQuart") pattern = 1 - --time * time * time * time; // decelerating to zero velocity
        if (easing === "easeInOutQuart") pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * --time * time * time * time; // acceleration until halfway, then deceleration
        if (easing === "easeInQuint") pattern = time * time * time * time * time; // accelerating from zero velocity
        if (easing === "easeOutQuint") pattern = 1 + --time * time * time * time * time; // decelerating to zero velocity
        if (easing === "easeInOutQuint") pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * --time * time * time * time * time; // acceleration until halfway, then deceleration
    }
    return pattern || time; // no easing, no acceleration
}

/**
 * Get a html element from a component.
 */
var getDom = function (ref) {
    if (!ref) {
        /* istanbul ignore next */
        return null;
    }
    var _realDom = ReactDom.findDOMNode(ref);
    return _realDom;
};
/**
 * Deep merge from tow objects
 */
// export function merge(source: any, dest: any) {}
/**
 * Add or remove a event listener
 */
var eventOnOff = function (dom, eventName, hander, capture, type) {
    if (type === void 0) {
        type = 'on';
    }
    type == 'on' ? dom.addEventListener(eventName, hander, capture) : dom.removeEventListener(eventName, hander, capture);
};
/**
 * If value is a percent, convert it to a numeric one.
 * such as:
 * 85% -> size * 0.85
 */
function normalizeSize(size, amount) {
    var number = /(-?\d+(?:\.\d+?)?)%$/.exec(size + '');
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
        var cssText = ".__hidebar::-webkit-scrollbar {\n      width: 0;\n      height: 0;\n    }";
        createStyle('magic-scroll-hide-bar', cssText);
    }
}
function createStyle(styleId, cssText) {
    /* istanbul ignore if */
    if (typeof window === 'undefined' || document.getElementById(styleId)) {
        return;
    }
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
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
var noop$1 = function () {};
var Watcher = /** @class */function () {
    function Watcher(name, getter) {
        if (name === void 0) {
            name = '';
        }
        if (getter === void 0) {
            getter = noop$1;
        }
        this.name = name;
        this.getter = getter;
    }
    Watcher.prototype.run = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var rtn = this.getter.apply(this, args);
        if (!(rtn instanceof Promise)) {
            rtn = Promise.resolve(rtn);
        }
        return rtn;
    };
    return Watcher;
}();
var Subscription = /** @class */function () {
    function Subscription() {
        this.watchers = [];
    }
    Subscription.prototype.subscribe = function (eventName, getter) {
        if (eventName === void 0) {
            eventName = null;
        }
        this.watchers.push(new Watcher(eventName, getter));
    };
    Subscription.prototype.notify = function (name) {
        if (name === void 0) {
            name = null;
        }
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var resArray = [];
        // tslint:disable-next-line
        for (var index = 0; index < this.watchers.length; index++) {
            var watcher = this.watchers[index];
            if (name === Subscription.All_WATCHERS || name === watcher.name) {
                resArray.push(watcher.run.apply(watcher, params));
            }
        }
        return Promise.all(resArray);
    };
    Subscription.prototype.unsubscribe = function () {
        this.watchers = [];
    };
    Subscription.All_WATCHERS = 'ALL_WATCHERS';
    return Subscription;
}();

/**
 * Normalize class name.
 */
var normalizeClass = function (classOne, classTwo) {
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
var Panel = /** @class */function (_super) {
    __extends(Panel, _super);
    function Panel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Panel.prototype.render = function () {
        var _a = this.props,
            renderPanel = _a.renderPanel,
            children = _a.children,
            cn = _a.className,
            others = __rest(_a, ["renderPanel", "children", "className"]);
        var className = normalizeClass('__panel', cn);
        var style = {
            boxSizing: 'border-box',
            position: 'relative'
        };
        if (renderPanel) {
            return React.cloneElement(renderPanel(__assign({ className: className,
                style: style }, others)), {}, children);
        } else {
            return React.createElement("div", __assign({ className: className, style: style }, others), children);
        }
    };
    Panel.displayName = 'BasePanel';
    return Panel;
}(React.PureComponent);

var isIos = function () {
    /* istanbul ignore if */
    if (typeof window === 'undefined') {
        return false;
    }
    var u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
};
function getPrefix(global) {
    var docStyle = document.documentElement.style;
    var engine;
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
    var vendorPrefix = {
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
    var compatibleValue = "-" + getPrefix(window) + "-" + value;
    var testElm = document.createElement('div');
    testElm.style[property] = compatibleValue;
    if (testElm.style[property] == compatibleValue) {
        /* istanbul ignore next */
        return compatibleValue;
    }
    /* istanbul ignore next */
    return false;
}
// Computed the bowser scrollbar gutter
var scrollBarWidth;
function getNativeScrollbarSize() {
    if (typeof window === 'undefined') {
        return 0;
    }
    if (scrollBarWidth !== undefined) {
        return scrollBarWidth;
    }
    var outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    var offsetWidth = outer.offsetWidth,
        clientWidth = outer.clientWidth;
    scrollBarWidth = offsetWidth - clientWidth;
    document.body.removeChild(outer);
    return scrollBarWidth;
}

function cached(fn) {
    var cache = Object.create(null);
    return function cachedFn(str) {
        var hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
}
var capitalize = cached(
/* istanbul ignore next */
function (str) {
    /* istanbul ignore next */
    return str.charAt(0).toUpperCase() + str.slice(1);
});

var NativePanel = /** @class */function (_super) {
    __extends(NativePanel, _super);
    function NativePanel(props) {
        var _this = _super.call(this, props) || this;
        // bind internal methods
        _this._handleScroll = _this._handleScroll.bind(_this);
        _this._handleWheel = _this._handleWheel.bind(_this);
        _this.subscription = new Subscription();
        return _this;
    }
    NativePanel.prototype.render = function () {
        var _a = this.props,
            children = _a.children,
            barsState = _a.barsState,
            renderView = _a.renderView,
            renderPanel = _a.renderPanel,
            barPos = _a.barPos,
            scrollingX = _a.scrollingX,
            scrollingY = _a.scrollingY;
        var style = {
            height: '100%'
        };
        var className = ['__native'];
        style.overflowY = !scrollingY ? 'hidden' : barsState.vBar.size ? 'scroll' : '';
        style.overflowX = !scrollingX ? 'hidden' : barsState.hBar.size ? 'scroll' : '';
        // Add gutter for hiding native bar
        var gutter = getNativeScrollbarSize();
        if (!gutter) {
            createHideBarStyle();
            className.push('__hidebar');
            if (isIos()) {
                style.WebkitOverflowScrolling = 'touch';
            }
        } else {
            if (barsState.vBar.size) {
                style["margin" + capitalize(barPos)] = "-" + gutter + "px";
            }
            if (barsState.hBar.size) {
                style.height = "calc(100% + " + gutter + "px)";
            }
        }
        var viewStyle = {
            position: 'relative',
            boxSizing: 'border-box',
            minHeight: '100%',
            minWidth: '100%'
        };
        var widthStyle = getComplitableStyle('width', 'fit-content');
        if (widthStyle && scrollingX) {
            viewStyle.width = widthStyle;
        }
        var view;
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
    };
    NativePanel.prototype.componentDidMount = function () {
        this._refresh();
        this._addEvent();
    };
    NativePanel.prototype.componentWillUnmount = function () {
        this.subscription.notify(NativePanel.unmount_key);
        this.subscription.unsubscribe();
    };
    NativePanel.prototype.componentDidUpdate = function () {
        this._refresh();
    };
    /** Internal Medthds */
    NativePanel.prototype._handleScroll = function (e) {
        this.props.handleScroll(e);
    };
    NativePanel.prototype._handleWheel = function (event) {
        var _a;
        var delta = 0;
        var dir;
        var _b = this.props,
            scrollingX = _b.scrollingX,
            scrollingY = _b.scrollingY,
            wheelSpeed = _b.wheelSpeed;
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
            this.props.scrollBy((_a = {}, _a[dir] = delta, _a), wheelSpeed);
        }
    };
    NativePanel.prototype._detectResize = function (element) {
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
    };
    NativePanel.prototype._refresh = function () {
        // Detect dom size resize
        this._detectResize(this.refs.view);
    };
    NativePanel.prototype._addEvent = function () {
        var _this = this;
        var panelElm = getDom(this.refs.panel);
        eventOnOff(panelElm, 'scroll', this._handleScroll);
        eventOnOff(panelElm, 'mousewheel', this._handleWheel);
        eventOnOff(panelElm, 'onMouseWheel', this._handleWheel);
        this.subscription.subscribe(NativePanel.unmount_key, function () {
            eventOnOff(panelElm, 'scroll', _this._handleScroll, false, 'off');
            eventOnOff(panelElm, 'mousewheel', _this._handleWheel, false, 'off');
            eventOnOff(panelElm, 'onMouseWheel', _this._handleWheel, false, 'off');
        });
    };
    NativePanel.displayName = 'magic-scroll-panel-native';
    /** trigger beofore component will unmount */
    NativePanel.unmount_key = 'UNMOUNT_SUBSCRIBE';
    return NativePanel;
}(React.PureComponent);

var map = {
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

var TouchManager = /** @class */function () {
    function TouchManager() {
        this.getTouchObject();
    }
    TouchManager.prototype.getEventObject = function (originEvent) {
        return this.touchObject ? this.isTouch ? originEvent.touches : [originEvent] : null;
    };
    TouchManager.prototype.getTouchObject = function () {
        /* istanbul ignore if */
        if (typeof window === 'undefined') {
            return null;
        }
        this.isTouch = false;
        var navigator = window.navigator;
        var agent = navigator.userAgent;
        var platform = navigator.platform;
        var touchObject = this.touchObject = {};
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
    };
    return TouchManager;
}();

/* --------------- Type End ---------------- */
var rgbReg = /rgb\(/;
var extractRgbColor = /rgb\((.*)\)/;
// Transform a common color int oa `rgbA` color
var getRgbAColor = cached(function (identity) {
    var _a = identity.split('-'),
        color = _a[0],
        opacity = _a[1];
    var div = document.createElement('div');
    div.style.background = color;
    document.body.appendChild(div);
    var computedColor = window.getComputedStyle(div).backgroundColor;
    document.body.removeChild(div);
    /* istanbul ignore if */
    if (!rgbReg.test(computedColor)) {
        return color;
    }
    return "rgba(" + extractRgbColor.exec(computedColor)[1] + ", " + opacity + ")";
});
var Bar = /** @class */function (_super) {
    __extends(Bar, _super);
    function Bar(props) {
        var _this = _super.call(this, props) || this;
        var type = _this.props.horizontal ? 'horizontal' : 'vertical';
        _this.bar = map[type];
        _this._createDragEvent = _this._createDragEvent.bind(_this);
        _this._handleRailClick = _this._handleRailClick.bind(_this);
        _this.touch = new TouchManager();
        _this.events = {
            bar: null,
            rail: null,
            scrollButton: {
                start: null,
                end: null
            }
        };
        return _this;
    }
    Bar.prototype.render = function () {
        var _a, _b, _c;
        var _d = this.props,
            hideBar = _d.hideBar,
            otherBarHide = _d.otherBarHide,
            opacity = _d.opacity,
            railBg = _d.railBg,
            railCls = _d.railCls,
            railBorder = _d.railBorder,
            railOpacity = _d.railOpacity,
            railSize = _d.railSize,
            railBorderRadius = _d.railBorderRadius,
            barBg = _d.barBg,
            barCls = _d.barCls,
            barBorderRadius = _d.barBorderRadius,
            barSize = _d.barSize,
            barOpacity = _d.barOpacity,

        //  scrollButtonBg,
        //  scrollButtonClickStep,
        scrollButtonEnable = _d.scrollButtonEnable;
        var barType = this._getType();
        var classNameOfType = '__is-' + barType;
        // Rail props
        /** Get rgbA format background color */
        var railBackgroundColor = getRgbAColor(railBg + '-' + railOpacity);
        var endPos = otherBarHide ? 0 : railSize;
        var railStyle = (_a = {
            position: 'absolute',
            zIndex: 1,
            borderRadius: railBorderRadius !== 'auto' && railBorderRadius || barSize
        }, _a[this.bar.opsSize] = railSize, _a[this.bar.posName] = 0, _a[this.bar.opposName] = endPos, _a[this.bar.sidePosName] = 0, _a.background = railBackgroundColor, _a.border = railBorder, _a);
        // Bar wrapper props
        var buttonSize = scrollButtonEnable ? railSize : 0;
        var barWrapStyle = (_b = {
            position: 'absolute',
            borderRadius: barBorderRadius !== 'auto' && barBorderRadius || barSize
        }, _b[this.bar.posName] = buttonSize, _b[this.bar.opsSize] = barSize, _b[this.bar.opposName] = buttonSize, _b);
        // Bar props
        var barStyle = (_c = {
            cursor: 'pointer',
            position: 'absolute',
            margin: 'auto',
            transition: 'opacity 0.5s',
            userSelect: 'none',
            borderRadius: 'inherit',
            backgroundColor: barBg
        }, _c[this.bar.size] = this._getBarSize() + '%', _c.opacity = opacity == 0 ? 0 : barOpacity, _c[this.bar.opsSize] = barSize, _c.transform = "translate" + this.bar.axis.toUpperCase() + "(" + this._getBarPos() + "%)", _c);
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
        return React.createElement("div", { ref: "rail", className: "__rail " + classNameOfType + " " + railCls, style: railStyle }, this._createScrollbarButton('start'), hideBar ? null : React.createElement("div", { ref: "barWrap", className: "__bar-wrap " + classNameOfType, style: barWrapStyle }, React.createElement("div", { ref: "bar", className: "__bar " + classNameOfType + " " + barCls + " " + (opacity == 0 ? '__is-hide' : '__is-show'), style: barStyle })), this._createScrollbarButton('end'));
    };
    Bar.prototype.componentDidMount = function () {
        this._setAllListeners();
    };
    Bar.prototype.componentWillUnmount = function () {
        this._setAllListeners('off');
    };
    // Internal methods
    /**
     * Create a drag event according to current platform
     */
    Bar.prototype._getBarSize = function () {
        return Math.max(this.props.barMinSize * 100, this.props.barsState.size);
    };
    Bar.prototype._getBarPos = function () {
        var scrollDistance = this.props.barsState.move * this.props.barsState.size;
        var pos = scrollDistance * this._getBarRatio() / this._getBarSize();
        return pos;
    };
    Bar.prototype._getBarRatio = function () {
        return (100 - this._getBarSize()) / (100 - this.props.barsState.size);
    };
    Bar.prototype._createDragEvent = function (touch) {
        var _this = this;
        var bar = this.refs.bar;
        var rail = this.refs.barWrap;
        var moveEvent = touch.touchObject.touchmove;
        var endEvent = touch.touchObject.touchend;
        var barType = this.bar.axis.toLowerCase();
        var dragStart = function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            document.onselectstart = function () {
                return false;
            };
            var event = touch.getEventObject(e)[0];
            var dragPos = event[_this.bar.client];
            _this.startPosition = dragPos - bar.getBoundingClientRect()[_this.bar.posName];
            eventOnOff(document, moveEvent, onDragging);
            eventOnOff(document, endEvent, dragEnd);
            _this.props.setDrag(true, barType);
        };
        var onDragging = function (e) {
            var event = touch.getEventObject(e)[0];
            var dragPos = event[_this.bar.client];
            var delta = (dragPos - rail.getBoundingClientRect()[_this.bar.posName]) / _this._getBarRatio();
            var percent = (delta - _this.startPosition) / rail[_this.bar.offset];
            _this.props.onBarDrag(percent, barType);
        };
        var dragEnd = function () {
            document.onselectstart = null;
            _this.startPosition = 0;
            eventOnOff(document, moveEvent, onDragging, false, 'off');
            eventOnOff(document, endEvent, dragEnd, false, 'off');
            _this.props.setDrag(false, barType);
        };
        return dragStart;
    };
    Bar.prototype._createScrollbarButton = function (type) {
        var _a;
        if (!this.props.scrollButtonEnable) {
            return null;
        }
        var size = this.props.railSize;
        var borderColor = this.props.scrollButtonBg;
        var wrapperProps = {
            className: normalizeClass('__bar-button', '__bar-button-is-' + this._getType() + '-' + type),
            style: (_a = {
                position: 'absolute',
                cursor: 'pointer'
            }, _a[map[this._getType()].scrollButton[type]] = 0, _a.width = size, _a.height = size, _a),
            ref: type
        };
        var innerStyle = {
            border: "calc(" + size + " / 2.5) solid transparent",
            width: '0',
            height: '0',
            margin: 'auto',
            position: 'absolute',
            top: '0',
            bottom: '0',
            right: '0',
            left: '0'
        };
        var innerProps = {
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
        return React.createElement("div", __assign({}, wrapperProps), React.createElement("div", __assign({}, innerProps, { ref: type })));
    };
    Bar.prototype._createScrollButtonEvent = function (type, touch) {
        var _this = this;
        var endEventName = touch.touchObject.touchend;
        var _a = this.props,
            scrollButtonClickStep = _a.scrollButtonClickStep,
            scrollButtonPressingStep = _a.scrollButtonPressingStep;
        var stepWithDirection = type == 'start' ? -scrollButtonClickStep : scrollButtonClickStep;
        var mousedownStepWithDirection = type == 'start' ? -scrollButtonPressingStep : scrollButtonPressingStep;
        var ref = requestAnimationFrame(window);
        var isMouseDown = false;
        var isMouseout = true;
        var timeoutId;
        var start = function (e) {
            /* istanbul ignore if */
            if (3 == e.which) {
                return;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
            isMouseout = false;
            _this.props.onScrollButtonClick(stepWithDirection, 'd' + _this.bar.axis);
            eventOnOff(document, endEventName, endPress, false);
            if (/mouse/.test(touch.touchObject.touchstart)) {
                var elm = _this.refs[type];
                eventOnOff(elm, 'mouseenter', enter, false);
                eventOnOff(elm, 'mouseleave', leave, false);
            }
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                isMouseDown = true;
                ref(pressingButton, window);
            }, 500);
        };
        var pressingButton = function () {
            if (isMouseDown && !isMouseout) {
                _this.props.onScrollButtonClick(mousedownStepWithDirection, 'd' + _this.bar.axis, false);
                ref(pressingButton, window);
            }
        };
        var endPress = function () {
            clearTimeout(timeoutId);
            isMouseDown = false;
            eventOnOff(document, endEventName, endPress, false, 'off');
            if (/mouse/.test(touch.touchObject.touchstart)) {
                var elm = _this.refs[type];
                eventOnOff(elm, 'mouseenter', enter, false, 'off');
                eventOnOff(elm, 'mouseleave', leave, false, 'off');
            }
        };
        var enter = function () {
            isMouseout = false;
            pressingButton();
        };
        var leave = function () {
            isMouseout = true;
        };
        return start;
    };
    Bar.prototype._setAllListeners = function (type) {
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
    };
    Bar.prototype._setBarListener = function (type) {
        var barEvent = this.events.bar;
        if (barEvent && type == 'on') {
            return;
        }
        if (!barEvent && type == 'off') {
            return;
        }
        // Not registry listener on props because there is a passive
        // issue on `touchstart` event, see:
        // https://github.com/facebook/react/issues/9809#issuecomment-414072263
        var bar = this.refs.bar;
        this.events.bar = barEvent = this._createDragEvent(this.touch);
        eventOnOff(bar, this.touch.touchObject.touchstart, barEvent, {
            passive: false
        }, type);
    };
    Bar.prototype._setRailListener = function (type) {
        var _this = this;
        var railEvent = this.events.rail;
        if (railEvent && type == 'on') {
            return;
        }
        if (!railEvent && type == 'off') {
            return;
        }
        var rail = this.refs.barWrap;
        this.events.rail = railEvent = this.touch.touchObject.touchstart;
        eventOnOff(rail, railEvent, function (e) {
            return _this._handleRailClick(e, _this.touch);
        }, false, type);
    };
    Bar.prototype._setScrollButtonListener = function (position, type) {
        var scrollButtonEvent = this.events.scrollButton[type];
        var dom = this.refs[position];
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
    };
    Bar.prototype._handleRailClick = function (e, touch) {
        // Scroll to the place of rail where click event triggers.
        var _a = this.bar,
            client = _a.client,
            offset = _a.offset,
            posName = _a.posName,
            axis = _a.axis;
        var bar = this.refs.bar;
        if (!bar) {
            return;
        }
        var barOffset = bar[offset];
        var event = touch.getEventObject(e)[0];
        var percent = (event[client] - e.currentTarget.getBoundingClientRect()[posName] - barOffset / 2) / (e.currentTarget[offset] - barOffset);
        this.props.onRailClick(percent * 100 + '%', axis);
    };
    Bar.prototype._getType = function () {
        return this.props.horizontal ? 'horizontal' : 'vertical';
    };
    Bar.defaultProps = {
        barSize: '6px',
        barBorderRadius: 'auto',
        barMinSize: 0,
        railBg: '#e6f7ff',
        railOpacity: 0,
        railCls: '',
        railSize: '6px',
        railBorder: null,
        railBorderRadius: 'auto',
        keepRailShow: false,
        onlyShowBarOnScroll: true,
        barKeepShowTime: 300,
        keepBarShow: false,
        barBg: '#1890ff',
        barCls: '',
        barOpacity: 1,
        scrollButtonEnable: false,
        scrollButtonBg: '#cecece',
        scrollButtonClickStep: 80,
        scrollButtonPressingStep: 30
    };
    return Bar;
}(React.PureComponent);
function createBar(barProps, vBarState, hBarState, opacity) {
    var isVBarHide = !vBarState.size;
    var isHBarHide = !hBarState.size;
    var vBar = (vBarState.size || barProps.keepRailShow) && !vBarState.disable ? React.createElement(Bar, __assign({}, __assign({}, barProps, {
        barsState: vBarState,
        horizontal: false,
        hideBar: isVBarHide,
        otherBarHide: isHBarHide,
        opacity: opacity
    }), { key: "vBar" })) : null;
    var hBar = (hBarState.size || barProps.keepRailShow) && !hBarState.disable ? React.createElement(Bar, __assign({}, __assign({}, barProps, {
        barsState: hBarState,
        horizontal: true,
        hideBar: isHBarHide,
        otherBarHide: isVBarHide,
        opacity: opacity
    }), { key: "hBar" })) : null;
    return [vBar, hBar];
}

/* ---------------- Type End -------------------- */
var BaseScroll = /** @class */function (_super) {
    __extends(BaseScroll, _super);
    function BaseScroll(props) {
        var _this = _super.call(this, props) || this;
        _this.container = React.createRef();
        _this.touch = new TouchManager();
        return _this;
    }
    // Render
    BaseScroll.prototype.render = function () {
        var _a = this.props,
            renderContainer = _a.renderContainer,
            cn = _a.className,
            children = _a.children,
            _b = _a.style,
            style = _b === void 0 ? {} : _b,
            onEnter = _a.onEnter,
            onLeave = _a.onLeave,
            onMove = _a.onMove,
            others = __rest(_a, ["renderContainer", "className", "children", "style", "onEnter", "onLeave", "onMove"]);
        var className = normalizeClass(cn, '__magic-scroll');
        var ch = React.createElement(React.Fragment, null, children);
        style.position = 'relative';
        style.overflow = 'hidden';
        var eventObj = {};
        if (renderContainer) {
            // React the cloned element
            return React.cloneElement(renderContainer(__assign({ ref: this.container, className: className }, eventObj, others, { style: style })), ch);
        } else {
            return React.createElement("div", __assign({ ref: this.container }, eventObj, { className: className }, others, { style: style }), ch);
        }
    };
    BaseScroll.prototype._getDomByRef = function (refName) {
        return getDom(this[refName].current);
    };
    BaseScroll.prototype.componentDidMount = function () {
        var container = this._getDomByRef('container');
        var _a = this.props,
            onEnter = _a.onEnter,
            onLeave = _a.onLeave,
            onMove = _a.onMove;
        eventOnOff(container, this.touch.touchObject.touchenter, onEnter, false);
        eventOnOff(container, this.touch.touchObject.touchleave, onLeave, false);
        eventOnOff(container, this.touch.touchObject.touchmove, onMove, false);
    };
    BaseScroll.prototype.componentWillUnmount = function () {
        var container = this._getDomByRef('container');
        var _a = this.props,
            onEnter = _a.onEnter,
            onLeave = _a.onLeave,
            onMove = _a.onMove;
        eventOnOff(container, this.touch.touchObject.touchenter, onEnter, false, 'off');
        eventOnOff(container, this.touch.touchObject.touchleave, onLeave, false, 'off');
        eventOnOff(container, this.touch.touchObject.touchmove, onMove, false, 'off');
    };
    BaseScroll.displayName = 'BasePScroll';
    return BaseScroll;
}(React.PureComponent);

function debounce(func, waitTime) {
    var _this = this;
    var timeId;
    var _args;
    var context;
    var deb = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        context = _this;
        _args = args;
        return readyToExecute();
    };
    function readyToExecute() {
        clearTimeout(timeId);
        var res;
        timeId = setTimeout(function () {
            res = func.apply(context, _args);
        }, waitTime);
        return res;
    }
    deb.cancel = function () {
        clearTimeout(timeId);
    };
    return deb;
}
/**
 * Simple throttle
 */
function throttle(func, waitTime) {
    var _this = this;
    var timeId;
    var _args;
    var context;
    var deb = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        context = _this;
        _args = args;
        return readyToExecute();
    };
    function readyToExecute() {
        if (timeId) {
            return;
        }
        var res;
        timeId = setTimeout(function () {
            res = func.apply(context, _args);
            timeId = null;
        }, waitTime);
        return res;
    }
    deb.cancel = function () {
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
        typeof console !== 'undefined' && console.warn("[magic-scroll] " + message);
    }
}

var GlobarBarOptionsContext = React.createContext({});
function enhance(WrapperComponent) {
    var MagicScrollBase = /** @class */function (_super) {
        __extends(MagicScrollBase, _super);
        /* --------------------- Lifecycle Methods ------------------------ */
        function MagicScrollBase(props) {
            var _this = _super.call(this, props) || this;
            _this._isLeaveContainer = true;
            _this.container = React.createRef();
            /**
             *  This state is to control style of container
             *  vBar --> vertical bar
             *  hBar --> horizontal bar
             */
            _this.state = {
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
            _this._handleScroll = _this._handleScroll.bind(_this);
            _this._handleResize = _this._handleResize.bind(_this);
            _this._onRailClick = _this._onRailClick.bind(_this);
            _this._setBarDrag = _this._setBarDrag.bind(_this);
            _this._onContainerEnter = _this._onContainerEnter.bind(_this);
            _this._onContainerLeave = _this._onContainerLeave.bind(_this);
            _this._onBarDrag = _this._onBarDrag.bind(_this);
            _this._onScrollButtonClick = _this._onScrollButtonClick.bind(_this);
            _this.subscription = new Subscription();
            // // Debounce and throttle  methods
            _this._hideBar = debounce(function () {
                // Hide bar
                if (_this._canHideBar()) {
                    _this.setState(function (prevState) {
                        return {
                            barState: __assign({}, prevState.barState, { opacity: 0 }),
                            classHooks: __assign({}, prevState.classHooks, { barVisible: false })
                        };
                    });
                }
            }, _this.props.barKeepShowTime);
            _this._onContainerMove = throttle(function () {
                _this._updateBar();
                if (!_this.props.onlyShowBarOnScroll && !_this._isLeaveContainer) {
                    _this._showBar();
                }
            }, 500);
            _this.subscription.subscribe(MagicScrollBase.unmount_key, function () {
                _this._hideBar.cancel();
            });
            _this.subscription.subscribe(MagicScrollBase.unmount_key, function () {
                _this._onContainerMove.cancel();
            });
            return _this;
        }
        MagicScrollBase.prototype.render = function () {
            var _this = this;
            var mergedProps = __assign({}, this.context, this.props);
            var wrappedCompRef = mergedProps.wrappedCompRef,
                children = mergedProps.children,
                style = mergedProps.style,
                className = mergedProps.className,
                renderContainer = mergedProps.renderContainer,
                barBorderRadius = mergedProps.barBorderRadius,
                barSize = mergedProps.barSize,
                railBg = mergedProps.railBg,
                railCls = mergedProps.railCls,
                barBg = mergedProps.barBg,
                barCls = mergedProps.barCls,
                barOpacity = mergedProps.barOpacity,
                barMinSize = mergedProps.barMinSize,
                railOpacity = mergedProps.railOpacity,
                railSize = mergedProps.railSize,
                railBorderRadius = mergedProps.railBorderRadius,
                railBorder = mergedProps.railBorder,
                keepRailShow = mergedProps.keepRailShow,
                scrollButtonBg = mergedProps.scrollButtonBg,
                scrollButtonClickStep = mergedProps.scrollButtonClickStep,
                scrollButtonEnable = mergedProps.scrollButtonEnable,
                scrollButtonPressingStep = mergedProps.scrollButtonPressingStep,
                otherProps = __rest(mergedProps, ["wrappedCompRef", "children", "style", "className", "renderContainer", "barBorderRadius", "barSize", "railBg", "railCls", "barBg", "barCls", "barOpacity", "barMinSize", "railOpacity", "railSize", "railBorderRadius", "railBorder", "keepRailShow", "scrollButtonBg", "scrollButtonClickStep", "scrollButtonEnable", "scrollButtonPressingStep"]);
            var _a = this.state,
                barState = _a.barState,
                classHooks = _a.classHooks;
            var barProps = {
                railBg: railBg,
                railCls: railCls,
                keepRailShow: keepRailShow,
                railOpacity: railOpacity,
                railSize: railSize,
                railBorder: railBorder,
                railBorderRadius: railBorderRadius,
                barSize: barSize,
                barBg: barBg,
                barCls: barCls,
                barOpacity: barOpacity,
                barMinSize: barMinSize,
                barBorderRadius: barBorderRadius,
                scrollButtonBg: scrollButtonBg,
                scrollButtonClickStep: scrollButtonClickStep,
                scrollButtonEnable: scrollButtonEnable,
                scrollButtonPressingStep: scrollButtonPressingStep,
                setDrag: this._setBarDrag,
                onBarDrag: this._onBarDrag,
                onScrollButtonClick: this._onScrollButtonClick,
                onRailClick: this._onRailClick
            };
            var bars = createBar(barProps, barState.vBar, barState.hBar, barState.opacity);
            var vBar = bars[0],
                hBar = bars[1];
            var mergeClasses = [].concat(className);
            for (var key in classHooks) {
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
                className: mergeClasses, style: __assign({}, style),
                /** Render functions */
                renderContainer: renderContainer, onEnter: this._onContainerEnter, onLeave: this._onContainerLeave, onMove: this._onContainerMove }, bars, React.createElement(WrapperComponent, __assign({}, otherProps, { ref: function (value) {
                    // wrappedComp(value);
                    _this.wrappedComp = value;
                    if (wrappedCompRef) {
                        wrappedCompRef(value);
                    }
                }, onContainerRefresh: this._refresh.bind(this), onScrollComplete: this._scrollComplete.bind(this), onScroll: this._handleScroll.bind(this) }), children)));
        };
        MagicScrollBase.prototype.componentDidMount = function () {
            // linsten window resize.
            this._addAllEventListeners();
            // refresh state of each components
            this._refresh();
            // initial scroll
            this._triggerInitialScroll();
            // detect container resize
            this._detectContainerResize();
        };
        MagicScrollBase.prototype.componentWillUnmount = function () {
            this.subscription.notify(MagicScrollBase.unmount_key);
            this.subscription.unsubscribe();
        };
        /* ---------------------  Component Methods ------------------------ */
        /** ---------  private methods  --------- */
        MagicScrollBase.prototype._getDomByRef = function (refName) {
            return getDom(this[refName].current);
        };
        /** Add all necessary listeners */
        MagicScrollBase.prototype._addAllEventListeners = function () {
            var _this = this;
            window.addEventListener('resize', this._handleResize);
            this.subscription.subscribe(MagicScrollBase.unmount_key, function () {
                window.removeEventListener('resize', _this._handleResize);
            });
        };
        MagicScrollBase.prototype._updateBar = function () {
            if (!this.wrappedComp) {
                return;
            }
            var barState = this.wrappedComp._getBarState();
            if (barState) {
                this.setState(function (pre) {
                    return {
                        barState: __assign({}, barState, { opacity: pre.barState.opacity })
                    };
                });
            }
        };
        MagicScrollBase.prototype._showBar = function () {
            // Show bar
            this.setState(function (prevState) {
                return {
                    barState: __assign({}, prevState.barState, { opacity: 1 }),
                    classHooks: __assign({}, prevState.classHooks, { barVisible: true })
                };
            });
        };
        MagicScrollBase.prototype._showHideBar = function () {
            this._showBar();
            this._hideBar();
        };
        MagicScrollBase.prototype._refresh = function () {
            // set container size strategy
            var strat = this.props.sizeStrategy;
            var container = this._setContainerSizeStrategy(strat);
            if (!container) {
                return;
            }
            this._updateBar();
            this._showHideBar();
        };
        /**
         * Set size strategy according to
         * this.mergeOps.container.sizeStrategy
         */
        MagicScrollBase.prototype._setContainerSizeStrategy = function (strat) {
            var container = this._getDomByRef('container');
            if (!container) {
                return;
            }
            if (strat == 'percent') {
                this._setPercentSize(container);
            } else if (strat == 'number') {
                this._setNumberSize(container);
            } else {
                warn(false, "Unexpected strategy: " + strat + ", except 'percent' or 'number'.");
                // fallback to percent.
                this._setContainerSizeStrategy('percent');
            }
            return container;
        };
        MagicScrollBase.prototype._detectContainerResize = function () {
            var _this = this;
            if (!this._destroyContainerResize) {
                this.subscription.subscribe(MagicScrollBase.unmount_key, this._destroyContainerResize = listenResize(this._getDomByRef('container'), function () {
                    _this._refresh();
                }).removeResize);
            }
        };
        MagicScrollBase.prototype._setPercentSize = function (elm) {
            elm.style.height = this.props.style.height || '100%';
            elm.style.width = this.props.style.width || '100%';
        };
        MagicScrollBase.prototype._setNumberSize = function (elm) {
            var _this = this;
            var parent = elm.parentNode;
            var setConainerSize = function () {
                elm.style.height = _this.props.style.height || parent.offsetHeight + 'px';
                elm.style.width = _this.props.style.width || parent.offsetWidth + 'px';
                _this._updateBar();
            };
            setConainerSize(); // fire an once!;
        };
        MagicScrollBase.prototype._triggerInitialScroll = function () {
            if (!this.wrappedComp) {
                return;
            }
            var _a = this.props,
                x = _a.initialScrollX,
                y = _a.initialScrollY;
            this.wrappedComp.scrollTo({ x: x, y: y });
        };
        MagicScrollBase.prototype._canHideBar = function () {
            return !this.props.keepBarShow && !this._isBarDragging && this._isLeaveContainer;
        };
        /** --------- events ----------------*/
        MagicScrollBase.prototype._handleScroll = function () {
            this._updateBar();
            this._showHideBar();
        };
        MagicScrollBase.prototype._handleResize = function () {
            this._updateBar();
        };
        MagicScrollBase.prototype._onRailClick = function (percent, pos) {
            var _a;
            if (!this.wrappedComp) {
                return;
            }
            this.wrappedComp.scrollTo((_a = {}, _a[pos] = percent, _a));
        };
        MagicScrollBase.prototype._onBarDrag = function (move, type) {
            if (!this.wrappedComp) {
                return;
            }
            this.wrappedComp._onBarDrag(type, move);
        };
        MagicScrollBase.prototype._onScrollButtonClick = function (move, type, animate) {
            if (animate === void 0) {
                animate = true;
            }
            var _a;
            this.wrappedComp.scrollBy((_a = {}, _a[type] = move, _a), 0);
        };
        MagicScrollBase.prototype._scrollComplete = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!this.wrappedComp) {
                return;
            }
            if (this.props.handleScrollComplete) {
                this.props.handleScrollComplete.apply(this.wrappedComp, args);
            }
        };
        MagicScrollBase.prototype._setBarDrag = function (isDragging, type) {
            this._isBarDragging = isDragging;
            this.setState(function (preState) {
                return __assign({}, preState, {
                    classHooks: __assign({}, preState.classHooks, { vBarDragging: isDragging && type == 'y', hBarDragging: isDragging && type == 'x' })
                });
            });
            if (!isDragging) {
                this._hideBar();
            }
        };
        MagicScrollBase.prototype._onContainerLeave = function () {
            this._isLeaveContainer = true;
            this._hideBar();
            this.setState(function (preState) {
                return __assign({}, preState, {
                    classHooks: __assign({}, preState.classHooks, { mouseEnter: false })
                });
            });
        };
        MagicScrollBase.prototype._onContainerEnter = function () {
            this._isLeaveContainer = false;
            if (!this.props.onlyShowBarOnScroll) {
                this._updateBar();
                this._showBar();
            }
            this.setState(function (preState) {
                return __assign({}, preState, {
                    classHooks: __assign({}, preState.classHooks, { mouseEnter: true })
                });
            });
        };
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
        return MagicScrollBase;
    }(React.PureComponent);
    return React.forwardRef(function (props, ref) {
        return React.createElement(MagicScrollBase, __assign({}, props, { wrappedCompRef: ref }));
    });
}

var MagicScrollNative = /** @class */function (_super) {
    __extends(MagicScrollNative, _super);
    /* --------------------- Lifecycle Methods ------------------------ */
    function MagicScrollNative(props) {
        var _this = _super.call(this, props) || this;
        _this.panel = React.createRef();
        /**
         *  This state is to control style of container and panel
         *  vBar --> vertical bar
         *  hBar --> horizontal bar
         */
        _this.state = {
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
        _this._handleResize = _this._handleResize.bind(_this);
        _this.scrollTo = _this.scrollTo.bind(_this);
        _this._handleScroll = _this._handleScroll.bind(_this);
        _this.scrollBy = _this.scrollBy.bind(_this);
        _this.subscription = new Subscription();
        _this.scrollX = new Animate();
        _this.scrollY = new Animate();
        return _this;
    }
    MagicScrollNative.prototype.render = function () {
        var _a = this.props,
            children = _a.children,
            renderPanel = _a.renderPanel,
            renderView = _a.renderView,
            wheelSpeed = _a.wheelSpeed,
            scrollingX = _a.scrollingX,
            scrollingY = _a.scrollingY;
        var verticalNativeBarPos = this.props.verticalNativeBarPos;
        var barState = this.state.barState;
        return React.createElement(NativePanel, { resize: listenResize, barPos: verticalNativeBarPos, barsState: barState, renderPanel: renderPanel, renderView: renderView, wheelSpeed: wheelSpeed, ref: this.panel, scrollingX: scrollingX, scrollingY: scrollingY, scrollBy: this.scrollBy, handleResize: this._handleResize, handleScroll: this._handleScroll }, children);
    };
    MagicScrollNative.prototype.componentDidMount = function () {
        this._refresh();
    };
    MagicScrollNative.prototype.componentWillUnmount = function () {
        this.subscription.notify(MagicScrollNative.unmount_key);
        this.subscription.unsubscribe();
    };
    /* ---------------------  Component Methods ------------------------ */
    /** ---------  private methods  --------- */
    MagicScrollNative.prototype._getDomByRef = function (refName) {
        return getDom(this[refName].current);
    };
    MagicScrollNative.prototype._getBarState = function () {
        var container = this._getDomByRef('panel');
        var barState = {
            vBar: { move: 0, size: 0, disable: false },
            hBar: { move: 0, size: 0, disable: false }
        };
        if (!container) {
            return barState;
        }
        var _a = this.props,
            scrollingX = _a.scrollingX,
            scrollingY = _a.scrollingY;
        var clientWidth = container.clientWidth;
        var clientHeight = container.clientHeight;
        var heightPercentage = clientHeight * 100 / container.scrollHeight;
        var widthPercentage = clientWidth * 100 / container.scrollWidth;
        barState.vBar.move = container.scrollTop * 100 / clientHeight;
        barState.hBar.move = container.scrollLeft * 100 / clientWidth;
        barState.vBar.size = heightPercentage < 100 ? heightPercentage : 0;
        barState.hBar.size = widthPercentage < 100 ? widthPercentage : 0;
        barState.vBar.disable = !scrollingY;
        barState.hBar.disable = !scrollingX;
        this.setState({
            barState: barState
        });
        return barState;
    };
    MagicScrollNative.prototype._scrollTo = function (x, y, speed, easing) {
        var panelElm = this._getDomByRef('panel');
        var scrollLeft = panelElm.scrollLeft,
            scrollTop = panelElm.scrollTop,
            scrollHeight = panelElm.scrollHeight,
            scrollWidth = panelElm.scrollWidth,
            clientWidth = panelElm.clientWidth,
            clientHeight = panelElm.clientHeight;
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
            var scrollingComplete = this._scrollComplete.bind(this);
            // options
            var _a = this.props,
                optionEasing = _a.easing,
                optionSpeed = _a.speed;
            var easingMethod = createEasingFunction(easing || optionEasing, easingPattern);
            if (x - scrollLeft) {
                // move x
                this.scrollX.startScroll(scrollLeft, x, speed || optionSpeed, function (dx) {
                    panelElm.scrollLeft = dx;
                }, scrollingComplete, undefined, easingMethod);
            }
            if (y - scrollTop) {
                // move Y
                this.scrollY.startScroll(scrollTop, y, speed, function (dy) {
                    panelElm.scrollTop = dy;
                }, scrollingComplete, undefined, easingMethod);
            }
        } else {
            panelElm.scrollTop = y;
            panelElm.scrollLeft = x;
        }
    };
    MagicScrollNative.prototype._refresh = function () {
        if (!this.panel.current) {
            return;
        }
        // refresh panel
        this.panel.current._refresh();
    };
    /** --------- react to events ----------------*/
    MagicScrollNative.prototype._invokeEventHandle = function (eventHandleName, event) {
        if (event === void 0) {
            event = null;
        }
        var panelDomInfo = this._getPanelStatus();
        if (!panelDomInfo) {
            return;
        }
        var scrollLeft = panelDomInfo.scrollLeft,
            scrollTop = panelDomInfo.scrollTop,
            scrollHeight = panelDomInfo.scrollHeight,
            scrollWidth = panelDomInfo.scrollWidth,
            clientHeight = panelDomInfo.clientHeight,
            clientWidth = panelDomInfo.clientWidth;
        var vertical = {
            type: 'vertical'
        };
        var horizontal = {
            type: 'horizontal'
        };
        vertical.process = Math.min(scrollTop / (scrollHeight - clientHeight || 1), 1);
        horizontal.process = Math.min(scrollLeft / (scrollWidth - clientWidth || 1), 1);
        vertical.scrolledDistance = scrollTop;
        horizontal.scrolledDistance = scrollLeft;
        var eventHandle = this.props[eventHandleName];
        if (eventHandle && eventHandle instanceof Function) {
            eventHandle({
                name: eventHandleName,
                event: event,
                vertical: vertical,
                horizontal: horizontal
            });
        }
    };
    MagicScrollNative.prototype._handleScroll = function (e) {
        this.props.onScroll();
        this._invokeEventHandle('handleScroll', e);
    };
    MagicScrollNative.prototype._handleResize = function () {
        this.refresh();
        this._invokeEventHandle('hanldeResize');
    };
    MagicScrollNative.prototype._scrollComplete = function () {
        this._invokeEventHandle('hanldeScrollComplete');
    };
    MagicScrollNative.prototype._onBarDrag = function (direction, percent) {
        var _a;
        var elm = this._getDomByRef('panel');
        var dest = elm[direction == 'x' ? 'scrollWidth' : 'scrollHeight'] * percent;
        this.scrollTo((_a = {}, _a[direction] = dest, _a), 0);
    };
    MagicScrollNative.prototype._getPanelStatus = function () {
        var panelElm = this._getDomByRef('panel');
        if (!panelElm) {
            return;
        }
        var _a = panelElm,
            scrollTop = _a.scrollTop,
            scrollLeft = _a.scrollLeft,
            scrollHeight = _a.scrollHeight,
            scrollWidth = _a.scrollWidth,
            clientHeight = _a.clientHeight,
            clientWidth = _a.clientWidth;
        return {
            scrollTop: scrollTop,
            scrollLeft: scrollLeft,
            scrollHeight: scrollHeight,
            scrollWidth: scrollWidth,
            clientHeight: clientHeight,
            clientWidth: clientWidth
        };
    };
    /** Public methods */
    MagicScrollNative.prototype.scrollTo = function (_a, speed, easing) {
        var x = _a.x,
            y = _a.y;
        this._scrollTo(x, y, speed, easing);
    };
    MagicScrollNative.prototype.scrollBy = function (_a, speed, easing) {
        var dx = _a.dx,
            dy = _a.dy;
        var _b = this._getDomByRef('panel'),
            scrollWidth = _b.scrollWidth,
            scrollHeight = _b.scrollHeight,
            clientWidth = _b.clientWidth,
            clientHeight = _b.clientHeight;
        var _c = this._getPanelStatus(),
            scrollLeft = _c.scrollLeft,
            scrollTop = _c.scrollTop;
        if (dx) {
            scrollLeft += normalizeSize(dx, scrollWidth - clientWidth);
        }
        if (dy) {
            scrollTop += normalizeSize(dy, scrollHeight - clientHeight);
        }
        this._scrollTo(scrollLeft, scrollTop, speed, easing);
    };
    MagicScrollNative.prototype.refresh = function () {
        this._refresh();
        // Call HOC's refresh method
        this.props.onContainerRefresh();
    };
    MagicScrollNative.prototype.getPosition = function () {
        var _a = this._getPanelStatus(),
            scrollTop = _a.scrollTop,
            scrollLeft = _a.scrollLeft;
        return {
            scrollTop: scrollTop,
            scrollLeft: scrollLeft
        };
    };
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
    return MagicScrollNative;
}(React.PureComponent);
var index = enhance(MagicScrollNative);

exports.default = index;
exports.GlobarBarOptionsContext = GlobarBarOptionsContext;

Object.defineProperty(exports, '__esModule', { value: true });

})));
