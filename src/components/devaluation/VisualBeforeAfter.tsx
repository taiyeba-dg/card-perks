import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualBeforeAfterProps {
  before: number;
  after: number;
  beforeLabel: string;
  afterLabel: string;
  changePercent: number;
  isPositive: boolean;
  layout?: "horizontal" | "vertical" | "typographic";
  className?: string;
}

export function VisualBeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  changePercent,
  isPositive,
  layout = "horizontal",
  className,
}: VisualBeforeAfterProps) {
  // New typographic comparison grid (desktop executive summary style)
  if (layout === "typographic") {
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const percentLabel = `${Math.abs(changePercent).toFixed(1)}% ${isPositive ? "GAIN" : "CUT"}`;

    return (
      <div
        className={cn(
          "grid grid-cols-3 items-center gap-4 bg-background/40 dark:bg-[hsl(225,25%,5%)]/40 p-4 lg:p-5 rounded-lg border border-border/5",
          className,
        )}
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Previous
          </span>
          <span className="text-sm lg:text-base font-mono text-foreground/20 line-through decoration-red-400/30 tracking-tight">
            {beforeLabel}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div
            className={cn(
              "p-2 rounded-full border mb-2",
              isPositive
                ? "bg-emerald-500/5 border-emerald-500/10"
                : "bg-red-500/5 border-red-500/10",
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                isPositive ? "text-emerald-400" : "text-red-400",
              )}
            />
          </div>
          <span
            className={cn(
              "text-[10px] font-mono font-bold tracking-widest",
              isPositive ? "text-emerald-400" : "text-red-400",
            )}
          >
            {percentLabel}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Current
          </span>
          <span className="text-base lg:text-xl font-mono text-foreground font-bold tracking-tight">
            {afterLabel}
          </span>
        </div>
      </div>
    );
  }

  // Mobile vertical and desktop horizontal bar layouts
  const maxVal = Math.max(before, after);
  const afterPct = maxVal > 0 ? (after / maxVal) * 100 : 0;
  const beforePct = maxVal > 0 ? (before / maxVal) * 100 : 0;

  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  const barClasses = layout === "horizontal" ? "flex-row gap-3" : "flex-col gap-2";

  return (
    <div className={cn("flex", barClasses, className)}>
      {/* Before bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground truncate">{beforeLabel}</span>
          <span className="text-xs font-mono tabular-nums">{before.toLocaleString("en-IN")}</span>
        </div>
        <div className="h-6 rounded bg-secondary/30 overflow-hidden">
          <div
            className="h-full rounded bg-secondary/50"
            style={{ width: `${beforePct}%` }}
          />
        </div>
      </div>

      {/* Change badge */}
      <div className="flex items-center justify-center shrink-0">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
            isPositive
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30",
          )}
        >
          <Icon className="w-3 h-3" />
          {Math.abs(changePercent).toFixed(1)}%
        </span>
      </div>

      {/* After bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground truncate">{afterLabel}</span>
          <span className="text-xs font-mono tabular-nums">{after.toLocaleString("en-IN")}</span>
        </div>
        <div className="h-6 rounded bg-secondary/10 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded border",
              isPositive
                ? "bg-emerald-500/20 border-emerald-500/30"
                : "bg-red-500/20 border-red-500/30",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${afterPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
