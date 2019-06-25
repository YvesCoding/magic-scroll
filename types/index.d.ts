import React from 'react';

type EasingPatterns =
  | 'easeInQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint';

interface Dest {
  x?: string | number;
  y?: string | number;
}

interface EventHandleScrollInfo {
  vertical: {
    type: 'vertical';
    /**
     * process: [0 , 1]
     */
    process: number;
    scrolledDistance: number;
  };
  horizontal: {
    type: 'horizontal';
    /**
     * process: [0 , 1]
     */
    process: number;
    scrolledDistance: number;
  };
}

interface Props {
  /** Inline style */
  style?: React.CSSProperties;

  /** Class */
  className?: string | string[];

  /** ---------- configs ----------------- */

  /**
   * The size type of magic scroll's container
   */
  sizeStrategy?: 'percent' | 'number';

  /**
   * The automic scrolling distance after component mounted
   */
  initialScrollY?: false | string | number;
  initialScrollX?: false | string | number;

  /**
   * scrollbar's size(Height/Width).
   */
  barSize?: string;

  /**
   * Min bar size
   */
  barMinSize?: number;

  /*
   *  scrollbar's border-radius.
   */
  barBorderRadius?: string | 'auto';

  /*
   * The keep-show time of scrollbar.
   */
  barKeepShowTime?: number;

  /**
   * keep bar show.
   */
  keepBarShow?: boolean;

  /**
   * Whether to showbar when mouse is moving on content.
   */
  onlyShowBarOnScroll?: boolean;

  /**
   * Bar's background.
   */
  barBg?: string;

  /**
   * Bar's opacity.
   */
  barOpacity?: number;

  /**
   * Bar's class.
   */
  barCls?: number;

  /**
   * Rail's background .
   */
  railBg?: string;

  /**
   * Rail's opacity.
   */
  railOpacity?: number;

  /**
   * Rail's calss.
   */
  railCls?: string;

  /**
   * scrollbar's size(Height/Width).
   */
  railSize?: string;

  /*
   *  scrollbar's border-radius.
   */
  railBorderRadius?: string | 'auto';

  /**
   * rail border
   */
  railBorder?: null;

  /**
   * Whether to keep rail show or not, event content height is not overflow.
   */
  keepRailShow?: boolean;

  /**
   * scroll button enable or not
   */
  scrollButtonEnable?: boolean;

  /**
   * scrollButton background
   */
  scrollButtonBg?: string;

  /**
   * the distance when you click scrollButton once.
   */
  scrollButtonClickStep?: number;

  /**
   * the distance when you keep pressing scrollButton.
   */
  scrollButtonPressingStep?: number;

  // ------------------ native props --------------------------

  /** smooth scroll time */
  speed?: number;

  /**
   * smooth scroll animation
   */
  easing?: EasingPatterns | undefined;

  /**
   * Whether to enable the scrolling in X direction
   */
  scrollingX?: boolean;

  /**
   * Whether to enable the scrolling in Ydirection
   */
  scrollingY?: boolean;

  /**
   * Vertial native bar position, suitable for RTL environment.
   */
  verticalNativeBarPos?: 'right' | 'left';

  /**
   * The scrolling speed while using mouse wheel.
   */
  wheelSpeed?: number;

  /** ---------- Customizable render function ----------------- */

  renderPanel?(props?: any): React.ReactElement<any>;
  renderView?(props?: any): React.ReactElement<any>;

  /**
   * handle for scrolling complete
   */
  handleScrollComplete?(): void;

  /** ---------- Customizable render function ----------------- */

  renderContainer?(props?: any): React.ReactElement<any>;

  // all kinds of event handlers..
  hanldeResize?(info?: EventHandleScrollInfo): void;
  handleScroll?(info?: EventHandleScrollInfo, event?: Event): void;
  hanldeScrollComplete?(info?: EventHandleScrollInfo): void;
}

declare class MagicScroll extends React.PureComponent<Props> {
  scrollTo({ x, y }: Dest, speed?: number, easing?: EasingPatterns): void;
  scrollBy({ x, y }: Dest, speed?: number, easing?: EasingPatterns): void;
  refresh(): void;
}

declare const GlobarBarOptionsContext: React.Context<Props>;

export { GlobarBarOptionsContext };
export default MagicScroll;
