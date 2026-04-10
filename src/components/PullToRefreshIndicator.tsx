import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;  // 0 → threshold (px)
  refreshing: boolean;
  threshold?: number;    // default 72
}

export default function PullToRefreshIndicator({
  pullDistance,
  refreshing,
  threshold = 72,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const visible = pullDistance > 4 || refreshing;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ptr"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          // Sits in the flow so the page content pushes down naturally
          style={{ height: refreshing ? 56 : Math.max(pullDistance, 0) }}
          className="flex items-center justify-center overflow-hidden"
          aria-live="polite"
          aria-label={refreshing ? "Refreshing…" : "Pull to refresh"}
        >
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: progress * 270 }}
              transition={
                refreshing
                  ? { repeat: Infinity, duration: 0.75, ease: "linear" }
                  : { duration: 0, ease: "linear" }
              }
              style={{
                opacity: refreshing ? 1 : 0.4 + progress * 0.6,
                color: "hsl(var(--gold))",
              }}
            >
              <RefreshCw
                style={{
                  width: 22,
                  height: 22,
                  filter: progress >= 1 || refreshing
                    ? "drop-shadow(0 0 6px hsl(var(--gold) / 0.6))"
                    : "none",
                }}
              />
            </motion.div>
            <span
              className="text-[10px] font-medium transition-all"
              style={{
                color: "hsl(var(--gold))",
                opacity: refreshing ? 1 : 0.5 + progress * 0.5,
              }}
            >
              {refreshing ? "Refreshing…" : progress >= 1 ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
