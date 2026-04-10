import { ReactNode, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * CSS-only scroll reveal using IntersectionObserver — no framer-motion.
 * Uses a generous rootMargin so elements near the viewport trigger immediately.
 * Falls back to visible after 1.2s if the observer never fires (e.g. SSR, slow paint).
 * Respects prefers-reduced-motion by showing content immediately.
 */
export default function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect reduced motion preference — show immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Safety-net: if observer doesn't fire within 1.2s, force visible
    const fallbackTimer = setTimeout(() => setVisible(true), 1200);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallbackTimer);
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        // Large bottom margin so elements well below the fold still trigger
        // when they're within 200px of viewport. threshold 0 = any pixel visible.
        rootMargin: "200px 0px 200px 0px",
        threshold: 0,
      }
    );
    observer.observe(el);
    return () => { clearTimeout(fallbackTimer); observer.disconnect(); };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
