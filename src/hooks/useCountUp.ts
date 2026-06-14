import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 → target on mount, with an ease-out curve.
 * Respects prefers-reduced-motion (jumps straight to the value).
 */
export function useCountUp(target: number, duration = 1100): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);
  const startTs = useRef<number>(0);

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target === 0) {
      setValue(target);
      return;
    }

    const tick = (ts: number) => {
      if (!startTs.current) startTs.current = ts;
      const progress = Math.min((ts - startTs.current) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(target * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

/** Formats a count-up value, preserving an optional prefix/suffix and decimals. */
export function formatCount(value: number, opts?: { decimals?: number; prefix?: string; suffix?: string }): string {
  const { decimals = 0, prefix = '', suffix = '' } = opts ?? {};
  const rounded = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
  return `${prefix}${rounded}${suffix}`;
}
