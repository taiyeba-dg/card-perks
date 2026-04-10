import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Filter,
  Send,
  Shield,
  Zap,
  Lightbulb,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ValueChange, BankSummary } from "@/data/devaluation-data";
import { FILTER_DEFINITIONS } from "@/data/devaluation/devaluation-config";
import { detectPatterns } from "@/data/devaluation/devaluation-mappings";
import { BankIntelCards } from "@/components/devaluation/BankIntelCard";
import { ChangeCard } from "@/components/devaluation/ChangeCard";
import { ReportChangeSheet } from "@/components/devaluation/ReportChangeSheet";
import { cn } from "@/lib/utils";

// ── Props ───────────────────────────────────────────────────

interface Props {
  changes: ValueChange[];
  bankSummaries: BankSummary[];
  filters: { type: string; bank: string; category: string; impact: string; time: string };
  setFilter: (key: string, value: string) => void;
  myCardsOnly: boolean;
  setMyCardsOnly: (v: boolean) => void;
  hasMyCards: boolean;
  myCardChangesCount: number;
}

// ── KPI Glance Cards (2x2 Mobile Grid) ─────────────────────

function KPICards({
  totalChanges,
  devalCount,
  improvCount,
  myExposure,
}: {
  totalChanges: number;
  devalCount: number;
  improvCount: number;
  myExposure: number;
}) {
  return (
    <section className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-4 border-t-2 border-red-400/50 rounded-lg">
        <p className="font-label text-[9px] uppercase tracking-wider text-muted-foreground/70">
          Devaluations
        </p>
        <p className="font-mono text-xl font-bold text-red-400 mt-1 tracking-tight">
          {String(devalCount).padStart(2, "0")}
        </p>
      </div>
      <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-4 border-t-2 border-emerald-500/50 rounded-lg">
        <p className="font-label text-[9px] uppercase tracking-wider text-muted-foreground/70">
          Improvements
        </p>
        <p className={cn(
          "font-mono text-xl font-bold mt-1 tracking-tight",
          improvCount > 0 ? "text-emerald-400" : "text-foreground/20",
        )}>
          {String(improvCount).padStart(2, "0")}
        </p>
      </div>
      <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-4 border-t-2 border-primary/50 rounded-lg">
        <p className="font-label text-[9px] uppercase tracking-wider text-muted-foreground/70">
          Total Changes
        </p>
        <p className="font-mono text-xl font-bold text-primary mt-1 tracking-tight">
          {String(totalChanges).padStart(2, "0")}
        </p>
      </div>
      <div className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] p-4 border-t-2 border-muted-foreground/30 rounded-lg">
        <p className="font-label text-[9px] uppercase tracking-wider text-muted-foreground/70">
          Your Exposure
        </p>
        <p className="font-mono text-xl font-bold mt-1 tracking-tight">
          {String(myExposure).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}

// ── Alert Banner ───────────────────────────────────────────

const DISMISSED_KEY = "cardperks-dismissed-alerts-m";

function AlertBanner({
  changes,
}: {
  changes: ValueChange[];
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });

  const alert = changes
    .filter((c) => c.impactLevel === "high" && c.changeType === "devaluation")
    .find((c) => !dismissed.has(c.id));

  if (!alert) return null;

  const dismiss = () => {
    const next = new Set([...dismissed, alert.id]);
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 200 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) dismiss();
      }}
      className="relative overflow-hidden bg-primary/[0.03] border border-primary/30 rounded-xl p-4 flex gap-4 items-center mb-6"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
      <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary z-10">
        <Zap className="w-5 h-5" />
      </div>
      <div className="z-10 flex-1 min-w-0">
        <h3 className="font-label text-xs font-bold text-primary uppercase tracking-widest">
          Impact Intelligence
        </h3>
        <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
          {alert.cardName}: {alert.estimatedAnnualImpact} impact. {alert.recommendation.split(".")[0]}.
        </p>
      </div>
      <button
        onClick={dismiss}
        className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0 z-10"
      >
        <Check className="w-3 h-3" />
      </button>
    </motion.section>
  );
}

// ── Horizontal Filter Pills ────────────────────────────────

function MobileFilterPills({
  filters,
  setFilter,
  myCardsOnly,
  setMyCardsOnly,
  hasMyCards,
}: {
  filters: Props["filters"];
  setFilter: Props["setFilter"];
  myCardsOnly: boolean;
  setMyCardsOnly: (v: boolean) => void;
  hasMyCards: boolean;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeCount = Object.values(filters).filter((v) => v !== "all").length + (myCardsOnly ? 1 : 0);

  return (
    <div className="mb-5">
      {/* Primary horizontal scroll filters */}
      <section className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1">
        <button
          onClick={() =>
            setFilter("impact", filters.impact === "high" ? "all" : "high")
          }
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-[11px] font-bold uppercase tracking-wider transition-all min-h-[44px]",
            filters.impact === "high"
              ? "bg-primary text-primary-foreground"
              : "border border-border/40 text-muted-foreground bg-surface-1 dark:bg-[hsl(225,15%,11%)]",
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          High Impact
        </button>

        {hasMyCards && (
          <button
            onClick={() => setMyCardsOnly(!myCardsOnly)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-[11px] font-bold uppercase tracking-wider transition-all min-h-[44px]",
              myCardsOnly
                ? "bg-primary text-primary-foreground"
                : "border border-border/40 text-muted-foreground bg-surface-1 dark:bg-[hsl(225,15%,11%)]",
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            My Cards
          </button>
        )}

        <button
          onClick={() =>
            setFilter("time", filters.time === "30d" ? "all" : "30d")
          }
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-[11px] font-bold uppercase tracking-wider transition-all min-h-[44px]",
            filters.time === "30d"
              ? "bg-primary text-primary-foreground"
              : "border border-border/40 text-muted-foreground bg-surface-1 dark:bg-[hsl(225,15%,11%)]",
          )}
        >
          Last 30 Days
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex-shrink-0 w-10 h-10 border border-border/40 flex items-center justify-center rounded-full bg-surface-1 dark:bg-[hsl(225,15%,11%)] text-muted-foreground"
        >
          <Filter className="w-4 h-4" />
        </button>
      </section>

      {/* Advanced filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden -mx-4 px-4 mt-3 space-y-2"
          >
            {[
              { key: "type" as const, defs: FILTER_DEFINITIONS.type },
              { key: "bank" as const, defs: FILTER_DEFINITIONS.bank },
            ].map(({ key, defs }) => (
              <div
                key={key}
                className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5"
              >
                {defs.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(key, opt.value)}
                    className={cn(
                      "text-[10px] px-2.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center font-label",
                      filters[key] === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/30 text-muted-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ))}
            {activeCount > 0 && (
              <button
                onClick={() => {
                  setFilter("type", "all");
                  setFilter("bank", "all");
                  setFilter("category", "all");
                  setFilter("impact", "all");
                  setFilter("time", "all");
                  setMyCardsOnly(false);
                }}
                className="text-[10px] text-primary font-medium font-label"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Event Feed ─────────────────────────────────────────────

function EventFeed({ changes }: { changes: ValueChange[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const patterns = useMemo(() => detectPatterns(changes), [changes]);

  if (changes.length === 0) {
    return (
      <div className="text-center py-14">
        <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm font-bold mb-1">No changes found</p>
        <p className="text-xs text-muted-foreground">Try adjusting filters</p>
      </div>
    );
  }

  return (
    <section className="space-y-4 pb-12">
      <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
        Recent Devaluation Feed
      </h4>
      {changes.map((change, i) => (
        <ChangeCard
          key={change.id}
          change={change}
          pattern={patterns.get(change.id)}
          isExpanded={expandedId === change.id}
          onToggle={() =>
            setExpandedId(expandedId === change.id ? null : change.id)
          }
          variant="mobile"
          index={i}
        />
      ))}
    </section>
  );
}

// ── Main ────────────────────────────────────────────────────

export default function MobileDevaluationLayout({
  changes,
  bankSummaries,
  filters,
  setFilter,
  myCardsOnly,
  setMyCardsOnly,
  hasMyCards,
  myCardChangesCount,
}: Props) {
  const [reportOpen, setReportOpen] = useState(false);

  const devalCount = changes.filter((c) => c.changeType === "devaluation").length;
  const improvCount = changes.filter((c) => c.changeType === "improvement").length;

  return (
    <div className="md:hidden">
      {/* Branding Header */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 mt-2"
      >
        <p className="font-label text-[10px] tracking-[0.2em] text-primary font-bold uppercase">
          DEVALUATION TRACKER
        </p>
        <h2 className="font-serif text-2xl text-primary font-bold mt-1">
          Stay Ahead of Point Value Changes
        </h2>
      </motion.section>

      {/* KPI Glance Cards */}
      <KPICards
        totalChanges={changes.length}
        devalCount={devalCount}
        improvCount={improvCount}
        myExposure={myCardChangesCount}
      />

      {/* Alert Banner */}
      {hasMyCards && <AlertBanner changes={changes} />}

      {/* Filter Pills */}
      <MobileFilterPills
        filters={filters}
        setFilter={setFilter}
        myCardsOnly={myCardsOnly}
        setMyCardsOnly={setMyCardsOnly}
        hasMyCards={hasMyCards}
      />

      {/* Bank Stability Trends */}
      <BankIntelCards
        bankSummaries={bankSummaries}
        onBankClick={(bankId) => setFilter("bank", bankId)}
        activeBank={filters.bank}
        variant="mobile"
      />

      {/* Event Feed */}
      <EventFeed changes={changes} />

      {/* Report FAB */}
      <button
        onClick={() => setReportOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full gold-btn shadow-lg shadow-black/15 flex items-center justify-center"
      >
        <Send className="w-5 h-5" />
      </button>

      {/* Report Bottom Sheet */}
      <ReportChangeSheet open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
