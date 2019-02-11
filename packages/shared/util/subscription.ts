import { resolve } from 'path';

/**
 * It is used to communication between HOC and wrapped component.
 */

// tslint:disable-next-line
const noop = () => {};

class Watcher {
  name: string;
  getter: (...args: any[]) => any;

  constructor(name = '', getter = noop) {
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

export class Subscription {
  static All_WATCHERS = 'ALL_WATCHERS';
  watchers: Watcher[] = [];

  subscribe(eventName = null, getter?) {
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
