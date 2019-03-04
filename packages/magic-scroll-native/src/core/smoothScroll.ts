import { requestAnimationFrame } from 'third-party/scroller/requestAnimationFrame';

function noop() {
  return true;
}

/* istanbul ignore next */
const now =
  Date.now ||
  (() => {
    return new Date().getTime();
  });

export default class Scroll {
  isRunning: boolean;
  dir: number;
  st: number;
  ed: number;
  df: number;
  spd: number;
  ts: number;

  completeCb: () => void;
  vertifyCb: (value: any) => void;
  stepCb: (value: any) => void;
  easingMethod: (easing?: any) => any;
  ref: (cb: any) => void;

  constructor() {
    this.init();

    this.isRunning = false;
  }

  startScroll(
    st,
    ed,
    spd,
    stepCb: any = noop,
    completeCb: any = noop,
    vertifyCb: any = noop,
    easingMethod: any = noop
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
