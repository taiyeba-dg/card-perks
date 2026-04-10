import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PodiumEntry {
  id: string;
  name: string;
  value: number;
  image?: string;
  subtitle?: string;
}

interface MedalPodiumProps {
  entries: PodiumEntry[];
  valueLabel?: string;
  className?: string;
}

const PODIUM = [
  { place: 2, heightPct: 0.75, color: "from-gray-300/40 to-gray-400/20", accent: "#C0C0C0", label: "2nd" },
  { place: 1, heightPct: 1.0, color: "from-yellow-400/40 to-amber-500/20", accent: "#FFD700", label: "1st" },
  { place: 3, heightPct: 0.6, color: "from-amber-700/30 to-orange-800/15", accent: "#CD7F32", label: "3rd" },
] as const;

const MAX_HEIGHT = 160;

export function MedalPodium({ entries, valueLabel, className }: MedalPodiumProps) {
  const ordered = [entries[1], entries[0], entries[2]].filter(Boolean);

  if (ordered.length === 0) return null;

  return (
    <div className={cn("flex items-end justify-center gap-3", className)}>
      {PODIUM.map((podium, i) => {
        const entry = ordered[i];
        if (!entry) return null;
        const barHeight = MAX_HEIGHT * podium.heightPct;

        return (
          <div key={entry.id} className="flex flex-col items-center gap-2 min-w-[80px] max-w-[110px]">
            {entry.image && (
              <img
                src={entry.image}
                alt={entry.name}
                className="w-12 h-8 object-contain rounded"
              />
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: barHeight }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              className={cn(
                "w-full rounded-t-lg bg-gradient-to-t flex flex-col items-center justify-end pb-2 px-1 overflow-hidden",
                podium.color,
              )}
              style={{ borderTop: `3px solid ${podium.accent}` }}
            >
              <span className="text-xs font-bold opacity-60">{podium.label}</span>
              <span className="font-mono text-sm font-bold tabular-nums truncate">
                {entry.value.toLocaleString("en-IN")}
              </span>
              {valueLabel && (
                <span className="text-[9px] text-muted-foreground truncate">{valueLabel}</span>
              )}
            </motion.div>
            <p className="text-xs text-center font-medium leading-tight line-clamp-2">
              {entry.name}
            </p>
            {entry.subtitle && (
              <p className="text-[10px] text-muted-foreground text-center truncate w-full">
                {entry.subtitle}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
