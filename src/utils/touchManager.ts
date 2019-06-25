interface TouchObj {
  touchstart?: string;
  touchend?: string;
  touchcancel?: string;
  touchenter?: string;
  touchmove?: string;
  touchleave?: string;

  nonDeskTouch?: boolean;
  touch?: boolean;

  eventType?: string;
}

declare global {
  interface Window {
    opera: string;
  }
}

export default class TouchManager {
  isTouch: boolean;
  touchObject: TouchObj;

  constructor() {
    this.getTouchObject();
  }

  getEventObject(originEvent) {
    return this.touchObject
      ? this.isTouch
        ? originEvent.touches
        : [originEvent]
      : null;
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
    const touchObject = (this.touchObject = {}) as TouchObj;
    touchObject.touch = !!(
      ('ontouchstart' in window && !window.opera) ||
      'msmaxtouchpoints' in window.navigator ||
      'maxtouchpoints' in window.navigator ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
    touchObject.nonDeskTouch =
      (touchObject.touch && !/win32/i.test(platform)) ||
      (touchObject.touch && /win32/i.test(platform) && /mobile/i.test(agent));

    touchObject.eventType =
      'onmousedown' in window && !touchObject.nonDeskTouch
        ? 'mouse'
        : 'ontouchstart' in window
        ? 'touch'
        : 'msmaxtouchpoints' in navigator || navigator.msMaxTouchPoints > 0
        ? 'mstouchpoints'
        : 'maxtouchpoints' in navigator || navigator.maxTouchPoints > 0
        ? 'touchpoints'
        : 'mouse';
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
