import { isPlainObj, isArray, isUndef } from './type';

export function deepCopy(from, to, shallow = false) {
  if (shallow && isUndef(to)) {
    return from;
  }

  if (isArray(from)) {
    to = [];
    from.forEach((item, index) => {
      to[index] = deepCopy(item, to[index]);
    });
  } else if (from) {
    if (!isPlainObj(from)) {
      return from;
    }
    to = {};
    for (let key in from) {
      to[key] =
        typeof from[key] === 'object'
          ? deepCopy(from[key], to[key])
          : from[key];
    }
  }
  return to;
}

export function mergeObject(from, to, force = false, shallow = false) {
  if (shallow && isUndef(to)) {
    return from;
  }

  to = to || {};

  if (isArray(from)) {
    if (!isArray(to) && force) {
      to = [];
    }
    if (isArray(to)) {
      from.forEach((item, index) => {
        to[index] = mergeObject(item, to[index], force, shallow);
      });
    }
  } else if (from) {
    if (!isPlainObj(from)) {
      if (force) {
        to = from;
      }
    } else {
      for (let key in from) {
        if (typeof from[key] === 'object') {
          if (isUndef(to[key])) {
            to[key] = deepCopy(from[key], to[key], shallow);
          } else {
            mergeObject(from[key], to[key], force, shallow);
          }
        } else {
          if (isUndef(to[key]) || force) {
            to[key] = from[key];
          }
        }
      }
    }
  }

  return to;
}

export function defineReactive(target, key, source, souceKey?) {
  /* istanbul ignore if */
  if (!source[key] && typeof source !== 'function') {
    return;
  }
  souceKey = souceKey || key;
  Object.defineProperty(target, key, {
    get() {
      return source[souceKey];
    },
    configurable: true
  });
}

export function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str: string) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

export const capitalize = cached(
  (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
);
