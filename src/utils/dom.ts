import * as ReactDom from 'react-dom';
/**
 * Get a html element from a component.
 */
export const getDom = (ref: React.ReactInstance): Element | null => {
  if (!ref) {
    /* istanbul ignore next */
    return null;
  }

  const _realDom = ReactDom.findDOMNode(ref) as Element;
  return _realDom;
};

/**
 * Deep merge from tow objects
 */

// export function merge(source: any, dest: any) {}

/**
 * Add or remove a event listener
 */

export const eventOnOff = (
  dom: Element | Document,
  eventName: string,
  hander,
  capture?,
  type: 'on' | 'off' = 'on'
) => {
  type == 'on'
    ? dom.addEventListener(eventName, hander, capture)
    : dom.removeEventListener(eventName, hander, capture);
};

/**
 * If value is a percent, convert it to a numeric one.
 * such as:
 * 85% -> size * 0.85
 */
export function normalizeSize(size: number | string, amount: number) {
  let number: any = /(-?\d+(?:\.\d+?)?)%$/.exec(size + '');
  if (!number) {
    number = (size as number) - 0;
  } /* istanbul ignore next */ else {
    number = number[1] - 0;
    number = ((amount as number) * number) / 100;
  }
  return number;
}

// Hide the ios native scrollbar.
export function createHideBarStyle() {
  /* istanbul ignore next */
  {
    const cssText = `.__hidebar::-webkit-scrollbar {
      width: 0;
      height: 0;
    }`;

    createStyle('magic-scroll-hide-bar', cssText);
  }
}

declare global {
  interface HTMLStyleElement {
    styleSheet: any;
  }
}

export function createStyle(styleId, cssText) {
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
