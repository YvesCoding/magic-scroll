import * as ReactDom from 'react-dom';
/**
 * Get a html element from a component.
 */
export const getDom = (ref: React.ReactInstance): Element | null => {
  if (!ref) {
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
 * Nomalize the size of a dom
 * such as:
 * 85% -> size * 0.85
 */
export function normalizeSize(size: number | string, amount: number) {
  let number: any = /(-?\d+(?:\.\d+?)?)%$/.exec(size + '');
  if (!number) {
    number = (size as number) - 0;
  } else {
    number = number[1] - 0;
    number = ((amount as number) * number) / 100;
  }
  return number;
}

export function _normalizecoordinate(x, y, elm) {
  // Normalize...
  if (typeof x === 'undefined') {
    x = elm.scrollLeft;
  } else {
    x = normalizeSize(x, elm.scrollWidth - elm.clientWidth);
  }
  if (typeof y === 'undefined') {
    y = elm.scrollTop;
  } else {
    y = normalizeSize(y, elm.scrollHeight - elm.clientHeight);
  }

  return {
    x,
    y
  };
}
