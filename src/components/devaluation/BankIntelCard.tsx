import { cn } from "@/lib/utils";
import { BANK_PROFILES } from "@/data/devaluation/devaluation-banks";
import { HealthScoreRing } from "@/components/devaluation/HealthScoreRing";
import { SparklineChart } from "@/components/devaluation/SparklineChart";
import type { BankSummary } from "@/data/devaluation-data";

interface BankIntelCardsProps {
  bankSummaries: BankSummary[];
  onBankClick: (bankId: string) => void;
  activeBank: string;
  variant?: "desktop" | "mobile";
}

export function BankIntelCards({
  bankSummaries,
  onBankClick,
  activeBank,
  variant = "desktop",
}: BankIntelCardsProps) {
  if (variant === "mobile") {
    return (
      <section className="space-y-3 mb-6">
        <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
          Bank Stability Trends
        </h4>
        {BANK_PROFILES.map((bank) => {
          const summary = bankSummaries.find((s) => s.bankId === bank.id);
          const isActive = activeBank === bank.id;
          const borderColor =
            bank.healthScore < 40
              ? "border-l-red-400/40"
              : bank.healthScore < 70
                ? "border-l-amber-400/40"
                : "border-l-primary/40";

          return (
            <button
              key={bank.id}
              onClick={() => onBankClick(isActive ? "all" : bank.id)}
              className={cn(
                "w-full bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-xl overflow-hidden p-4 flex items-center justify-between border-l-4 transition-all active:scale-[0.98]",
                borderColor,
                isActive && "ring-1 ring-primary/30",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-2 dark:bg-[hsl(225,15%,14%)] rounded-lg flex items-center justify-center border border-border/20">
                  <span className="font-label text-xs font-bold text-primary">
                    {bank.shortName.slice(0, 2)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-label text-xs font-bold uppercase">
                    {bank.shortName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {summary
                      ? `${summary.devaluations} devaluation${summary.devaluations !== 1 ? "s" : ""} tracked`
                      : "No changes tracked"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={cn(
                    "font-label text-lg font-bold",
                    bank.healthScore < 40
                      ? "text-red-400"
                      : bank.healthScore < 70
                        ? "text-amber-400"
                        : "text-primary",
                  )}
                >
                  {bank.healthScore}/100
                </span>
                <span
                  className={cn(
                    "font-label text-[8px] uppercase tracking-widest",
                    bank.healthScore < 40
                      ? "text-red-400/70"
                      : bank.healthScore < 70
                        ? "text-amber-400/70"
                        : "text-primary/70",
                  )}
                >
                  Stability Score
                </span>
              </div>
            </button>
          );
        })}
      </section>
    );
  }

  // Desktop variant — 4-column grid with sparklines and circular progress
  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      {BANK_PROFILES.map((bank) => {
        const summary = bankSummaries.find((s) => s.bankId === bank.id);
        const isActive = activeBank === bank.id;
        const sparkData = bank.historicalScores.map((s) => s.score);
        const borderColor =
          bank.healthScore < 40
            ? "border-l-red-400/70"
            : bank.healthScore < 70
              ? "border-l-amber-400/50"
              : "border-l-primary/40";
        const sparkColor =
          bank.healthScore < 40
            ? "#ffb4ab"
            : bank.healthScore < 70
              ? "#f59e0b"
              : "#10b981";

        return (
          <button
            key={bank.id}
            onClick={() => onBankClick(isActive ? "all" : bank.id)}
            className={cn(
              "bg-surface-1 dark:bg-[hsl(225,15%,9%)] p-6 rounded-sm border-l-2 hover:bg-surface-2 dark:hover:bg-[hsl(225,15%,11%)] transition-colors group text-left",
              borderColor,
              isActive && "ring-1 ring-primary/30",
            )}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-xs font-bold font-mono tracking-widest uppercase">
                  {bank.shortName}
                </h4>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
                  {summary?.mostAffected || "Portfolio"}
                </p>
              </div>
              <HealthScoreRing score={bank.healthScore} size={48} strokeWidth={2} />
            </div>

            <div className="h-8 w-full mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
              <SparklineChart
                data={sparkData}
                width={140}
                height={32}
                color={sparkColor}
                className="w-full"
              />
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-bold",
                  bank.healthTrend === "down"
                    ? "bg-red-500/10 text-red-300"
                    : bank.healthTrend === "up"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {bank.healthTrend === "down"
                  ? "Declining \u2198"
                  : bank.healthTrend === "up"
                    ? "Improving \u2197"
                    : "Stable \u2192"}
              </span>
              <span className="text-muted-foreground/60">
                {summary
                  ? `${summary.devaluations + summary.improvements + summary.modifications} REPORT${(summary.devaluations + summary.improvements + summary.modifications) !== 1 ? "S" : ""}`
                  : "0 REPORTS"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
