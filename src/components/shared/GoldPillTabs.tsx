import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface PillTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface GoldPillTabsProps {
  tabs: PillTab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
}

export function GoldPillTabs({
  tabs,
  activeTab,
  onChange,
  className,
  layoutId = "gold-pill",
}: GoldPillTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1.5 rounded-full bg-white/5 dark:bg-white/5 border border-border/5 overflow-x-auto scrollbar-hide",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors uppercase tracking-widest",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary shadow-lg"
                style={{
                  boxShadow: "0 0 20px hsl(var(--gold) / 0.2)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
