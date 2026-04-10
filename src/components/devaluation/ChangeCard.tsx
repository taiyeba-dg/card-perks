import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ValueChange } from "@/data/devaluation-data";
import { CHANGE_TYPE_CONFIG, IMPACT_CONFIG } from "@/data/devaluation/devaluation-config";
import { VisualBeforeAfter } from "@/components/devaluation/VisualBeforeAfter";
import { cards } from "@/data/cards";
import CardImage from "@/components/CardImage";
import { cn } from "@/lib/utils";

interface ChangeCardProps {
  change: ValueChange;
  pattern?: string;
  isExpanded: boolean;
  onToggle: () => void;
  variant: "desktop" | "mobile";
  index?: number;
}

export function ChangeCard({
  change,
  pattern,
  isExpanded,
  onToggle,
  variant,
  index = 0,
}: ChangeCardProps) {
  if (variant === "mobile") {
    return (
      <MobileChangeCard
        change={change}
        pattern={pattern}
        isExpanded={isExpanded}
        onToggle={onToggle}
        index={index}
      />
    );
  }
  return (
    <DesktopChangeCard
      change={change}
      pattern={pattern}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );
}

// ── Shared: Verified Badge ─────────────────────────────────

function VerifiedBadge({ verifiedBy, source, verifiedDate }: { verifiedBy: string; source?: string; verifiedDate?: string | null }) {
  const dateLabel = verifiedDate ? new Date(verifiedDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null;
  if (verifiedBy === "cardperks") {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 inline-flex items-center gap-0.5" title={source ? `Via ${source}${dateLabel ? `, ${dateLabel}` : ""}` : undefined}>
        <CheckCircle2 className="w-3 h-3" /> Verified{source ? ` via ${source}` : ""}
      </span>
    );
  }
  if (verifiedBy === "community") {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 inline-flex items-center gap-0.5" title={dateLabel ? `Verified ${dateLabel}` : undefined}>
        <CheckCircle2 className="w-3 h-3" /> Community verified
      </span>
    );
  }
  return null;
}

// ── Shared: Tags ───────────────────────────────────────────

function TagPills({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.slice(0, 5).map((tag) => (
        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/40 text-muted-foreground font-medium font-mono">
          {tag}
        </span>
      ))}
    </div>
  );
}

// ── Shared: Pattern Warning Banner ─────────────────────────

function PatternWarningBanner({ warning }: { warning: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
      <p className="text-xs text-amber-500 font-medium">{warning}</p>
    </div>
  );
}

// ── Shared: Alternatives Section ───────────────────────────

function AlternativesSection({ change }: { change: ValueChange }) {
  const [open, setOpen] = useState(false);
  const altCards = change.alternativeCards
    ?.map((id) => cards.find((c) => c.id === id))
    .filter(Boolean);

  if ((!altCards || altCards.length === 0) && !change.alternativeStrategy) return null;

  return (
    <div className="mt-3">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors font-label"
      >
        <ChevronRight className={cn("w-3 h-3 transition-transform", open && "rotate-90")} />
        Alternatives
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {change.alternativeStrategy && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {change.alternativeStrategy}
                </p>
              )}
              {altCards && altCards.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {altCards.map((c) => c && (
                    <Link
                      key={c.id}
                      to={`/cards/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-primary/5 text-primary font-medium hover:bg-primary/10 transition-colors inline-flex items-center gap-1"
                    >
                      {c.name} <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Desktop ChangeCard (Executive Summary Style) ──────────

function DesktopChangeCard({
  change,
  pattern,
  isExpanded,
  onToggle,
}: {
  change: ValueChange;
  pattern?: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cfg = CHANGE_TYPE_CONFIG[change.changeType];
  const impact = IMPACT_CONFIG[change.impactLevel];
  const affectedCardData = change.affectedCards
    .slice(0, 4)
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean);
  const moreCount = Math.max(0, change.affectedCards.length - 4);
  const primaryCard = affectedCardData[0];
  const dateLabel = new Date(change.effectiveDate).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  }).toUpperCase();

  return (
    <motion.div
      layout
      className="glass-card border border-border/10 rounded-xl overflow-hidden transition-all hover:border-border/20 p-6 lg:p-8"
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Left: Card image + affected asset */}
        <div className="lg:w-1/3">
          {primaryCard && (
            <div className="relative group cursor-pointer mb-6 rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 z-10">
                <Link
                  to={`/cards/${primaryCard.id}`}
                  className="text-[10px] font-mono text-white/60 tracking-widest uppercase hover:text-white"
                >
                  View Card Details
                </Link>
              </div>
              {primaryCard.image ? (
                <CardImage
                  src={primaryCard.image}
                  alt={primaryCard.name}
                  fallbackColor={primaryCard.color}
                  className="w-full aspect-[5/3] object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div
                  className="w-full h-48 lg:h-64"
                  style={{ background: primaryCard.color || "hsl(var(--surface-2))" }}
                />
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-1.5">
                Affected Asset
              </span>
              <span className="text-base font-label font-bold uppercase tracking-tight">
                {change.cardName}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  change.changeType === "devaluation" ? "bg-red-400 animate-pulse" : "bg-primary",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-widest",
                  change.changeType === "devaluation" ? "text-red-400" : "text-primary",
                )}
              >
                {change.changeType === "devaluation"
                  ? "Live Devaluation"
                  : change.changeType === "improvement"
                    ? "Improvement"
                    : cfg.label}
              </span>
            </div>

            {/* Affected cards avatars */}
            {affectedCardData.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[10px] text-muted-foreground font-mono">Also affects:</span>
                <div className="flex items-center -space-x-2">
                  {affectedCardData.slice(1).map(
                    (c) =>
                      c && (
                        <Link
                          key={c.id}
                          to={`/cards/${c.id}`}
                          className="w-8 h-5 rounded-sm overflow-hidden border-2 border-background hover:z-10 hover:scale-110 transition-transform"
                          title={c.name}
                        >
                          {c.image ? (
                            <CardImage src={c.image} alt="" fallbackColor={c.color} className="w-full h-full" />
                          ) : (
                            <div className="w-full h-full" style={{ background: c.color }} />
                          )}
                        </Link>
                      ),
                  )}
                </div>
                {moreCount > 0 && (
                  <button
                    onClick={onToggle}
                    className="text-[10px] text-primary font-medium hover:underline font-mono"
                  >
                    +{moreCount} more
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:w-3/5">
          {/* Badges + date */}
          <div className="flex justify-between items-start mb-6 lg:mb-8">
            <div>
              <div className="flex gap-3 mb-4 flex-wrap">
                <span
                  className={cn(
                    "px-3 py-1 text-[9px] font-mono rounded-full border uppercase tracking-widest",
                    cfg.badge,
                    change.changeType === "devaluation"
                      ? "border-red-500/10"
                      : "border-primary/10",
                  )}
                >
                  {cfg.label}
                </span>
                <span
                  className={cn(
                    "px-3 py-1 text-[9px] font-mono rounded-full border border-border/10 uppercase tracking-widest",
                    impact.badge,
                  )}
                >
                  {impact.label}
                </span>
                <VerifiedBadge verifiedBy={change.verifiedBy} source={change.source} verifiedDate={change.verifiedDate} />
              </div>
              <h2 className="text-xl lg:text-2xl font-serif font-bold tracking-tight leading-tight">
                {change.title}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/40 mt-3 shrink-0 uppercase tracking-widest">
              {dateLabel}
            </span>
          </div>

          {/* Pattern Warning */}
          {change.patternWarning && (
            <PatternWarningBanner warning={change.patternWarning} />
          )}

          {/* Description */}
          <p className="text-muted-foreground/80 text-base lg:text-lg font-light mb-8 lg:mb-10 leading-relaxed">
            {change.description}
          </p>

          {/* Typographic Before/After Comparison */}
          <div className="mb-8 lg:mb-10">
            <VisualBeforeAfter
              before={change.previousNumeric}
              after={change.newNumeric}
              beforeLabel={change.previousValue}
              afterLabel={change.newValue}
              changePercent={change.changePercent}
              isPositive={change.changeType === "improvement"}
              layout="typographic"
            />
          </div>

          {/* Recommendation + Portfolio Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/[0.03] border border-primary/10 p-5 lg:p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <span className="text-primary text-[10px] font-mono flex items-center gap-2 uppercase tracking-[0.2em] mb-3">
                <Lightbulb className="w-3.5 h-3.5" /> Recommendation
              </span>
              <p className="text-primary/90 text-[13px] font-light italic leading-relaxed">
                {change.recommendation}
              </p>
            </div>
            <div className="bg-surface-2/5 dark:bg-[hsl(225,15%,14%)]/5 border border-border/5 p-5 lg:p-6 rounded-lg flex flex-col justify-center">
              <span className="text-muted-foreground/60 text-[10px] font-mono uppercase tracking-[0.2em] mb-2">
                Portfolio Impact
              </span>
              <span className="text-xl font-mono font-bold tracking-tighter">
                {change.estimatedAnnualImpact}
              </span>
              {change.source && (
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1">
                  {change.source}
                  {change.sourceUrl && (
                    <a href={change.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Alternatives */}
          <AlternativesSection change={change} />

          {/* Tags */}
          <TagPills tags={change.tags} />

          {/* Expanded cards list */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/15">
                  {change.affectedCards.slice(4).map((id) => {
                    const c = cards.find((card) => card.id === id);
                    return c ? (
                      <Link
                        key={id}
                        to={`/cards/${id}`}
                        className="text-[10px] px-2 py-1 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors font-medium font-mono"
                      >
                        {c.name}
                      </Link>
                    ) : null;
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Mobile ChangeCard (Event Feed Style) ─────────────────

function MobileChangeCard({
  change,
  pattern,
  isExpanded,
  onToggle,
  index,
}: {
  change: ValueChange;
  pattern?: string;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const [showRec, setShowRec] = useState(false);
  const cfg = CHANGE_TYPE_CONFIG[change.changeType];
  const impact = IMPACT_CONFIG[change.impactLevel];
  const TypeIcon = cfg.icon;

  const affectedCardData = change.affectedCards
    .slice(0, 3)
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean);
  const moreCount = Math.max(0, change.affectedCards.length - 3);
  const primaryCard = affectedCardData[0];

  const dateLabel = new Date(change.effectiveDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      layout
      className="bg-surface-1 dark:bg-[hsl(225,15%,11%)] rounded-xl overflow-hidden border border-border/10 shadow-lg"
    >
      {/* Header with card thumbnail */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 active:bg-secondary/5"
      >
        <div className="flex gap-4">
          {/* Card thumbnail */}
          {primaryCard && (
            <div className="w-16 h-10 flex-shrink-0 bg-surface-2 dark:bg-[hsl(225,15%,14%)] rounded border border-border/20 overflow-hidden">
              {primaryCard.image ? (
                <CardImage
                  src={primaryCard.image}
                  alt=""
                  fallbackColor={primaryCard.color}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" style={{ background: primaryCard.color || "hsl(var(--surface-2))" }} />
              )}
            </div>
          )}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <h5 className="font-serif text-sm font-bold text-primary leading-tight">
                {change.cardName}
              </h5>
              <span
                className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full uppercase font-bold font-label border",
                  cfg.badge,
                  change.changeType === "devaluation"
                    ? "border-red-500/20"
                    : "border-primary/20",
                )}
              >
                {cfg.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
              {change.title}
            </p>
          </div>
        </div>
      </button>

      {/* Value impact section (always visible) */}
      <div className="px-4 pb-4 flex justify-between items-end border-b border-border/10">
        <div>
          <p className="font-label text-[9px] uppercase tracking-widest text-muted-foreground/50">
            Value Impact
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-base text-foreground/50 line-through">
              {change.previousValue.length > 20
                ? `${change.previousNumeric.toLocaleString("en-IN")}`
                : change.previousValue}
            </span>
            {change.changeType === "improvement" ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span
              className={cn(
                "font-mono text-xl font-bold",
                change.changeType === "improvement" ? "text-emerald-400" : "text-red-400",
              )}
            >
              {change.newValue.length > 20
                ? `${change.newNumeric.toLocaleString("en-IN")}`
                : change.newValue}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-label text-[9px] uppercase tracking-widest text-muted-foreground/50">
            Timeline
          </p>
          <p className="font-label text-xs font-medium">{dateLabel}</p>
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3">
              {/* Pattern Warning */}
              {change.patternWarning && (
                <PatternWarningBanner warning={change.patternWarning} />
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">
                {change.description}
              </p>

              {/* Impact */}
              <div className="rounded-lg p-3 bg-secondary/10">
                <p className="text-[8px] uppercase tracking-wider text-muted-foreground mb-0.5 font-label">
                  Impact
                </p>
                <p className="text-xs font-semibold font-mono">
                  {change.estimatedAnnualImpact}
                </p>
              </div>

              {/* Expert tip / recommendation */}
              <div className="bg-primary/[0.03] dark:bg-[hsl(225,25%,5%)]/50 p-3 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                  <span className="font-label text-[10px] font-bold text-primary uppercase tracking-wider">
                    Expert Tip
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {change.recommendation}
                </p>
              </div>

              {/* Alternatives */}
              <AlternativesSection change={change} />

              {/* Affected cards */}
              <div className="flex flex-wrap gap-1.5">
                {affectedCardData.map(
                  (c) =>
                    c && (
                      <Link
                        key={c.id}
                        to={`/cards/${c.id}`}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/20 text-[10px] font-medium active:scale-[0.97] transition-transform"
                      >
                        <div className="w-4 h-3 rounded-sm overflow-hidden shrink-0">
                          {c.image ? (
                            <CardImage
                              src={c.image}
                              alt=""
                              fallbackColor={c.color}
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ background: c.color }}
                            />
                          )}
                        </div>
                        {c.name.split(" ").slice(0, 2).join(" ")}
                      </Link>
                    ),
                )}
                {moreCount > 0 && (
                  <span className="text-[10px] text-primary font-medium self-center">
                    +{moreCount} more
                  </span>
                )}
              </div>

              {/* Source */}
              {change.source && (
                <p className="text-[9px] text-muted-foreground flex items-center gap-1 font-mono">
                  {change.source}
                  {change.sourceUrl && (
                    <a
                      href={change.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </p>
              )}

              {/* Tags */}
              <TagPills tags={change.tags} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
