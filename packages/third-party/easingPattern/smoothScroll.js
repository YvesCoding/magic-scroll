import { createEasingFunction, easingPattern } from './index';
import { core } from '../scroller/animate';

export function smoothScroll(
  elm,
  deltaX,
  deltaY,
  speed,
  easing,
  scrollingComplete
) {
  const startLocationY = elm.scrollTop;
  const startLocationX = elm.scrollLeft;
  let positionX = startLocationX;
  let positionY = startLocationY;
  /**
   * keep the limit of scroll delta.
   */
  /* istanbul ignore next */
  if (startLocationY + deltaY < 0) {
    deltaY = -startLocationY;
  }
  const scrollHeight = elm.scrollHeight;
  if (startLocationY + deltaY > scrollHeight) {
    deltaY = scrollHeight - startLocationY;
  }
  if (startLocationX + deltaX < 0) {
    deltaX = -startLocationX;
  }
  if (startLocationX + deltaX > elm.scrollWidth) {
    deltaX = elm.scrollWidth - startLocationX;
  }

  const easingMethod = createEasingFunction(easing, easingPattern);

  const stepCallback = percentage => {
    positionX = startLocationX + deltaX * percentage;
    positionY = startLocationY + deltaY * percentage;
    elm.scrollTop = Math.floor(positionY);
    elm.scrollLeft = Math.floor(positionX);
  };

  const verifyCallback = () => {
    return (
      Math.abs(positionY - startLocationY) <= Math.abs(deltaY) ||
      Math.abs(positionX - startLocationX) <= Math.abs(deltaX)
    );
  };

  core.effect.Animate.start(
    stepCallback,
    verifyCallback,
    scrollingComplete,
    speed,
    easingMethod
  );
}
