import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

function formatIndian(num: number): string {
  const n = Math.round(Math.abs(num));
  const str = n.toString();
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCounter({
  value,
  prefix = "\u20B9",
  suffix = "",
  duration = 1000,
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const prevValueRef = useRef(0);

  const animate = useCallback(
    (from: number, to: number) => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = from + (to - from) * eased;

        if (ref.current) {
          const display =
            decimals > 0
              ? current.toFixed(decimals)
              : formatIndian(Math.round(current));
          ref.current.textContent = `${prefix}${display}${suffix}`;
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    },
    [duration, prefix, suffix, decimals],
  );

  useEffect(() => {
    animate(prevValueRef.current, value);
    prevValueRef.current = value;
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, animate]);

  return (
    <span
      ref={ref}
      className={cn("font-mono tabular-nums", className)}
    >
      {prefix}0{suffix}
    </span>
  );
}
