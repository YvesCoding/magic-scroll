/**
 * copyed from vue-router!
 */

export function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`[magic-scroll] ${message}`);
  }
}

export function warn(condition: any, message: string) {
  if (process.env.NODE_ENV !== 'production' && !condition) {
    // tslint:disable-next-line
    typeof console !== 'undefined' && console.warn(`[magic-scroll] ${message}`);
  }
}
