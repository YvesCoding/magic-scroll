export const isArray = (_) => Array.isArray(_);
export const isPlainObj = (_) =>
  Object.prototype.toString.call(_) == '[object Object]';
export const isUndef = (_) => typeof _ === 'undefined';
export const isFunc = (_) => typeof _ === 'function';
