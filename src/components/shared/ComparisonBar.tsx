import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { cn } from "@/lib/utils";

interface ComparisonBarItem {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

interface ComparisonBarProps {
  items: ComparisonBarItem[];
  prefix?: string;
  className?: string;
}

export function ComparisonBar({
  items,
  prefix = "\u20B9",
  className,
}: ComparisonBarProps) {
  const globalMax = Math.max(...items.map((i) => i.maxValue ?? i.value), 1);

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => {
        const pct = Math.min((item.value / globalMax) * 100, 100);
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <AnimatedCounter
                value={item.value}
                prefix={prefix}
                className="font-semibold text-foreground"
              />
            </div>
            <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="h-full rounded-full"
                style={{
                  background:
                    item.color ||
                    "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold)), hsl(var(--gold-light)))",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
