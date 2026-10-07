import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

/** Durations in ms (README → Design tokens → Motion). */
export const duration = {
  push: 340,
  sheet: 360,
  paywall: 400,
  scrim: 300,
  /** Toast fade/slide in, and again out. */
  toast: 200,
  /** How long a toast stays on screen between the two. */
  toastVisible: 2000,
  hintPulse: 1600,
  logoBubbles: 3400,
  tipWave: 6000,
  /** Long-press on the About version line that reveals the DEV switches. */
  devLongPress: 800,
  /** Paywall price skeleton while products load. */
  priceSkeleton: 600,
};

/** cubic-bezier(.2,.8,.2,1) — every push, sheet and modal. */
export const easing = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Toast travels up this far while it fades in. */
export const toastOffset = 12;

/**
 * True while iOS Reduce Motion is on. Anything that loops (logo bubbles, hint
 * pulse, tip icons) must stand still then; slides become plain fades.
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => alive && setReduce(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}
