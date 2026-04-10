import { useEffect, useRef, useState, useCallback } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;   // px of pull needed to trigger (default 72)
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 72,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);   // 0-threshold
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const triggered = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || refreshing) return;
      // Only start pull-to-refresh when already at the top of the page
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = false;
      triggered.current = false;
    },
    [disabled, refreshing],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || refreshing || startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        setPullDistance(0);
        return;
      }
      pulling.current = true;
      // Dampen the pull distance so it feels elastic
      const capped = Math.min(delta * 0.45, threshold + 20);
      setPullDistance(capped);
      if (capped >= threshold && !triggered.current) {
        triggered.current = true;
        // Haptic feedback when threshold is crossed
        if (navigator.vibrate) navigator.vibrate(30);
      }
    },
    [disabled, refreshing, threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || startY.current === null) return;
    startY.current = null;
    if (!pulling.current || !triggered.current) {
      setPullDistance(0);
      return;
    }
    // Snap to 56px spinner height while refreshing
    setPullDistance(56);
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  }, [disabled, onRefresh]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, refreshing, triggered: triggered.current };
}
