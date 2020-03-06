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
var now =
  Date.now ||
  function() {
    return new Date().getTime();
  };

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return !!right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Animate =
  /*#__PURE__*/
  (function() {
    function Animate() {
      _classCallCheck(this, Animate);

      this.init();
      this.isRunning = false;
    }

    _createClass(Animate, [
      {
        key: "startScroll",
        value: function startScroll(st, ed, spd) {
          var stepCb =
            arguments.length > 3 && arguments[3] !== undefined
              ? arguments[3]
              : noop;
          var completeCb =
            arguments.length > 4 && arguments[4] !== undefined
              ? arguments[4]
              : noop;
          var vertifyCb =
            arguments.length > 5 && arguments[5] !== undefined
              ? arguments[5]
              : noop;
          var easingMethod =
            arguments.length > 6 && arguments[6] !== undefined
              ? arguments[6]
              : noop;
          var df = ed - st;
          var dir = df > 0 ? -1 : 1;
          var nt = now();

          if (!this.isRunning) {
            this.init();
          }

          if (dir != this.dir || nt - this.ts > 200) {
            this.ts = nt;
            this.dir = dir;
            this.st = st;
            this.ed = ed;
            this.df = df;
          } else {
            /* istanbul ignore next */
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
      },
      {
        key: "execScroll",
        value: function execScroll() {
          var _this = this;

          var percent = 0;
          this.isRunning = true;

          var loop = function loop() {
            /* istanbul ignore if */
            if (!_this.isRunning || !_this.vertifyCb(percent)) {
              _this.isRunning = false;
              return;
            }

            percent = (now() - _this.ts) / _this.spd;

            if (percent < 1) {
              var value = _this.st + _this.df * _this.easingMethod(percent);

              _this.stepCb(value);

              _this.ref(loop);
            } else {
              // trigger complete
              _this.stepCb(_this.st + _this.df);

              _this.completeCb();

              _this.isRunning = false;
            }
          };

          this.ref(loop);
        }
      },
      {
        key: "init",
        value: function init() {
          this.st = 0;
          this.ed = 0;
          this.df = 0;
          this.spd = 0;
          this.ts = 0;
          this.dir = 0;
        }
      }
    ]);

    return Animate;
  })();

export { Animate };
