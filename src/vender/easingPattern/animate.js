export function requestAnimationFrame(global) {
  // Check for request animation Frame support
  var requestFrame =
    global.requestAnimationFrame ||
    global.webkitRequestAnimationFrame ||
    global.mozRequestAnimationFrame ||
    global.oRequestAnimationFrame;
  var isNative = !!requestFrame;

  if (
    requestFrame &&
    !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(
      requestFrame.toString()
    )
  ) {
    isNative = false;
  }

  if (isNative) {
    return function(callback, root) {
      requestFrame(callback, root);
    };
  }

  var TARGET_FPS = 60;
  var requests = {};
  var rafHandle = 1;
  var intervalHandle = null;
  var lastActive = +new Date();

  return function(callback) {
    var callbackHandle = rafHandle++;

    // Store callback
    requests[callbackHandle] = callback;

    // Create timeout at first request
    if (intervalHandle === null) {
      intervalHandle = setInterval(function() {
        var time = +new Date();
        var currentRequests = requests;

        // Reset data structure before executing callbacks
        requests = {};

        for (var key in currentRequests) {
          if (currentRequests.hasOwnProperty(key)) {
            currentRequests[key](time);
            lastActive = time;
          }
        }

        // Disable the timeout when nothing happens for a certain
        // period of time
        if (time - lastActive > 2500) {
          clearInterval(intervalHandle);
          intervalHandle = null;
        }
      }, 1000 / TARGET_FPS);
    }

    return callbackHandle;
  };
}

function noop() {
  return true;
}

/* istanbul ignore next */
const now =
  Date.now ||
  (() => {
    return new Date().getTime();
  });

export class Animate {
  constructor() {
    this.init();

    this.isRunning = false;
  }

  startScroll(
    st,
    ed,
    spd,
    stepCb = noop,
    completeCb = noop,
    vertifyCb = noop,
    easingMethod = noop
  ) {
    const df = ed - st;
    const dir = df > 0 ? -1 : 1;
    const nt = now();

    if (!this.isRunning) {
      this.init();
    }

    if (dir != this.dir || nt - this.ts > 200) {
      this.ts = nt;

      this.dir = dir;
      this.st = st;
      this.ed = ed;
      this.df = df;
    } /* istanbul ignore next */ else {
      this.df += df;
    }

    this.spd = spd;

    this.completeCb = completeCb;
    this.vertifyCb = vertifyCb;
    this.stepCb = stepCb;
    this.easingMethod = easingMethod;

    this.ref = requestAnimationFrame(window);

    if (!this.isRunning) {
      this.execScroll();
    }
  }

  execScroll() {
    let percent = 0;
    this.isRunning = true;

    const loop = () => {
      /* istanbul ignore if */
      if (!this.isRunning || !this.vertifyCb(percent)) {
        this.isRunning = false;
        return;
      }

      percent = (now() - this.ts) / this.spd;
      if (percent < 1) {
        const value = this.st + this.df * this.easingMethod(percent);
        this.stepCb(value);
        this.ref(loop);
      } else {
        // trigger complete
        this.stepCb(this.st + this.df);
        this.completeCb();

        this.isRunning = false;
      }
    };

    this.ref(loop);
  }

  init() {
    this.st = 0;
    this.ed = 0;
    this.df = 0;
    this.spd = 0;
    this.ts = 0;
    this.dir = 0;
  }
}
