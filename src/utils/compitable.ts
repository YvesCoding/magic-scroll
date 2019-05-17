export function isMobile() {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'ontouchstart' in window;
}

export function getPrefix(global: any) {
  let docStyle = document.documentElement.style;
  let engine;
  /* istanbul ignore if */
  if (
    global.opera &&
    Object.prototype.toString.call(global.opera) === '[object Opera]'
  ) {
    engine = 'presto';
  } /* istanbul ignore next */ else if ('MozAppearance' in docStyle) {
    engine = 'gecko';
  } else if ('WebkitAppearance' in docStyle) {
    engine = 'webkit';
  } /* istanbul ignore next */ else if (
    typeof global.navigator.cpuClass === 'string'
  ) {
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
export function getComplitableStyle(property, value) {
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
export function getNativeScrollbarSize() {
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
