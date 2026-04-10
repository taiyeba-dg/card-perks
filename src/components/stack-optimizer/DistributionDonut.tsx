import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import type { OptimizerResult } from "./optimizerEngine";
import { OPTIMIZER_COLORS } from "@/data/color-schemes";

const COLORS = OPTIMIZER_COLORS;

interface Props {
  result: OptimizerResult;
}

export default function DistributionDonut({ result }: Props) {
  const data = result.cardSummaries.map((cs) => ({
    name: cs.card.card.name.split(" ").slice(-2).join(" "),
    value: cs.annualEarning,
    pct: cs.pctOfTotal,
    fullName: cs.card.card.name,
  }));

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Card Usage Distribution
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                animationBegin={200}
                animationDuration={800}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedCounter
              value={result.totalOptimized}
              className="text-lg font-bold text-foreground"
            />
            <span className="text-[10px] text-muted-foreground">/year</span>
          </div>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 truncate font-medium">
                {entry.fullName}
              </span>
              <span className="text-muted-foreground shrink-0">
                {entry.pct}%
              </span>
              <span
                className="font-semibold shrink-0"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {"\u20B9"}
                {(entry.value / 1000).toFixed(1)}K
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
