/**
 * Simple debounce
 */
export function debounce(func, waitTime) {
  let timeId;
  let _args;
  let context;
  function deb(...args) {
    context = this;
    _args = args;
    return readyToExecute();
  }

  function readyToExecute() {
    clearTimeout(timeId);
    let res;
    timeId = setTimeout(() => {
      res = func.apply(context, _args);
    }, waitTime);
    return res;
  }

  return deb;
}

/**
 * Simple throttle
 */
export function throttle(func, waitTime) {
  let timeId;
  let _args;
  let context;
  function deb(...args) {
    context = this;
    _args = args;
    return readyToExecute();
  }

  function readyToExecute() {
    if (timeId) {
      return;
    }

    let res;
    timeId = setTimeout(() => {
      res = func.apply(context, _args);
      timeId = null;
    }, waitTime);
    return res;
  }

  return deb;
}
