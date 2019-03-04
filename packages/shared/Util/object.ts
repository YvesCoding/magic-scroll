export function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str: string) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

export const capitalize = cached(
  /* istanbul ignore next */
  (str: string): string => {
    /* istanbul ignore next */
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
);
