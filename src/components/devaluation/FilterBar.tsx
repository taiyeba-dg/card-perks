import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILTER_DEFINITIONS } from "@/data/devaluation/devaluation-config";

interface FilterBarProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  quickFilters?: { key: string; value: string; label: string; icon: ReactNode }[];
  className?: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  quickFilters,
  className,
}: FilterBarProps) {
  const activeFilters = Object.entries(filters).filter(([, v]) => v !== "all");
  const hasActive = activeFilters.length > 0;

  return (
    <div className={cn("flex flex-col lg:flex-row gap-4 items-center", className)}>
      {/* Quick filter pills (High Impact, Last 30 Days, My Cards) */}
      {quickFilters && quickFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-surface-1 dark:bg-[hsl(225,15%,9%)] p-1 rounded-lg border border-border/5 w-full lg:w-auto shadow-sm">
          {quickFilters.map((qf) => {
            const isActive = filters[qf.key] === qf.value;
            return (
              <button
                key={`${qf.key}-${qf.value}`}
                onClick={() =>
                  onFilterChange(qf.key, isActive ? "all" : qf.value)
                }
                className={cn(
                  "px-4 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] rounded-sm flex items-center gap-2 transition-all",
                  isActive
                    ? "bg-red-500/5 text-red-400 border border-red-500/10"
                    : "hover:bg-surface-2 dark:hover:bg-[hsl(225,15%,14%)]/10 text-muted-foreground/60",
                )}
              >
                {qf.icon}
                {qf.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grouped filter sections (Type / Entity) */}
      <div className="flex-1 bg-surface-1 dark:bg-[hsl(225,15%,9%)] p-1 rounded-lg border border-border/5 flex items-center gap-6 overflow-x-auto whitespace-nowrap px-4 w-full shadow-sm scrollbar-hide">
        {/* Type filter group */}
        <div className="flex items-center gap-3 border-r border-border/10 pr-6">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Type:
          </span>
          {FILTER_DEFINITIONS.type.options.map((opt) => {
            const isActive = filters.type === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange("type", opt.value)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono uppercase tracking-tighter rounded-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground/40 hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Bank filter group */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Entity:
          </span>
          {FILTER_DEFINITIONS.bank.options.map((opt) => {
            const isActive = filters.bank === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange("bank", opt.value)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono uppercase tracking-tighter rounded-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground/40 hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filter summary */}
      {hasActive && (
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {activeFilters.map(([key, value]) => {
            const defKey = key as keyof typeof FILTER_DEFINITIONS;
            const def = FILTER_DEFINITIONS[defKey];
            if (!def) return null;
            const opt = def.options.find((o) => o.value === value);
            return (
              <button
                key={key}
                onClick={() => onFilterChange(key, "all")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary text-xs px-2 py-0.5 font-mono"
              >
                {opt?.label ?? value}
                <X className="w-3 h-3" />
              </button>
            );
          })}
          <button
            onClick={() => {
              Object.keys(filters).forEach((k) => onFilterChange(k, "all"));
            }}
            className="text-xs text-muted-foreground hover:text-foreground ml-1 underline underline-offset-2 font-mono"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
