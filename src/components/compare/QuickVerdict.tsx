import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { CompareCard } from "./CompareUtils";
import { parseFee, parsePercent } from "./CompareUtils";
import { getDisplayName } from "@/lib/card-display";

interface QuickVerdictProps {
  compareCards: CompareCard[];
}

export default function QuickVerdict({ compareCards }: QuickVerdictProps) {
  const verdict = useMemo(() => {
    if (compareCards.length < 2) return null;

    const parts: string[] = [];
    const shortName = (cc: CompareCard) => getDisplayName({ name: cc.card.name, issuer: cc.card.issuer });

    // Compare base reward rates
    const rates = compareCards.map((cc) => ({
      name: shortName(cc),
      rate: cc.v3?.baseRate ?? parsePercent(cc.card.rewards),
    }));
    const sortedRates = [...rates].sort((a, b) => b.rate - a.rate);
    if (sortedRates[0].rate > sortedRates[1].rate) {
      parts.push(
        `The <strong class="text-foreground font-semibold">${sortedRates[0].name}</strong> leads in rewards (${sortedRates[0].rate}% vs ${sortedRates[1].rate}%)`
      );
    }

    // Compare annual fees
    const fees = compareCards.map((cc) => ({
      name: shortName(cc),
      fee: parseFee(cc.card.fee),
    }));
    const sortedFees = [...fees].sort((a, b) => a.fee - b.fee);
    if (sortedFees[0].fee < sortedFees[sortedFees.length - 1].fee) {
      parts.push(
        `<strong class="text-foreground font-semibold">${sortedFees[0].name}</strong> wins on lower fee (\u20B9${sortedFees[0].fee.toLocaleString("en-IN")})`
      );
    }

    // Compare lounge access
    const lounges = compareCards.map((cc) => ({
      name: shortName(cc),
      count:
        cc.card.lounge === "Unlimited"
          ? 999
          : parseInt(cc.card.lounge) || 0,
      label: cc.card.lounge,
    }));
    const sortedLounges = [...lounges].sort((a, b) => b.count - a.count);
    if (sortedLounges[0].count > sortedLounges[1].count) {
      parts.push(
        `<strong class="text-foreground font-semibold">${sortedLounges[0].name}</strong> has more lounges (${sortedLounges[0].label})`
      );
    }

    return parts.length > 0 ? parts.join(". ") + "." : null;
  }, [compareCards]);

  if (!verdict) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-10 relative overflow-hidden bg-surface-1/40 dark:bg-[hsl(225,15%,11%)]/40 rounded-2xl border border-border/5 border-l-4 border-l-primary backdrop-blur-sm"
    >
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at top left, hsl(var(--gold) / 0.05) 0%, transparent 70%)",
        }}
      />
      <div className="p-6 md:p-8 flex items-center gap-6 relative">
        <div className="flex-shrink-0 text-primary">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="flex-grow">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 font-label">
            Executive Intelligence Summary
          </h4>
          <p
            className="text-muted-foreground leading-relaxed text-sm md:text-base"
            dangerouslySetInnerHTML={{
              __html: `<strong class="text-foreground">Quick verdict:</strong> ${verdict}`,
            }}
          />
        </div>
      </div>
    </motion.section>
  );
}
