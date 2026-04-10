import type { CompareCard } from "../CompareUtils";
import { findWinner } from "../CompareUtils";
import { CompareRow, CompareColumnHeaders, CompareTableWrapper, CompareRowsContainer } from "../CompareTabShell";
import { LOYALTY_PROGRAMS, type LoyaltyProgram } from "@/data/transfer-partners";
import { getCurrencyByName } from "@/data/reward-currencies";

/** Reverse lookup: program display name → program */
const NAME_TO_PROGRAM: Record<string, LoyaltyProgram> = {};
for (const prog of Object.values(LOYALTY_PROGRAMS)) {
  NAME_TO_PROGRAM[prog.name.toLowerCase()] = prog;
}
function findProgram(name: string): LoyaltyProgram | undefined {
  return NAME_TO_PROGRAM[name.toLowerCase()];
}

interface Props { compareCards: CompareCard[]; }

export default function RedemptionTab({ compareCards }: Props) {
  const rows: { label: string; icon: string; direction: "highest" | "lowest"; getValue: (cc: CompareCard) => { display: React.ReactNode; numeric: number } }[] = [
    { label: "Best Redemption", icon: "🏆", direction: "highest", getValue: (cc) => {
      const best = cc.v3?.redemption.options[0];
      if (!best) return { display: "—", numeric: 0 };
      return { display: <><span className="font-medium">{best.type}</span> <span className="text-gold">₹{best.value.toFixed(2)}/pt</span></>, numeric: best.value };
    }},
    { label: "Worst Redemption", icon: "⚠️", direction: "highest", getValue: (cc) => {
      const opts = cc.v3?.redemption.options;
      if (!opts || opts.length === 0) return { display: "—", numeric: 0 };
      const worst = opts[opts.length - 1];
      return { display: <><span className="text-muted-foreground">{worst.type}</span> <span className="text-red-400">₹{worst.value.toFixed(2)}/pt</span></>, numeric: worst.value };
    }},
    { label: "Value Range (gap)", icon: "📊", direction: "lowest", getValue: (cc) => {
      const opts = cc.v3?.redemption.options;
      if (!opts || opts.length < 2) return { display: "—", numeric: 0 };
      const best = opts[0].value;
      const worst = opts[opts.length - 1].value;
      const gap = worst > 0 ? (best / worst).toFixed(1) : "∞";
      return { display: <span className="font-medium">{gap}× gap</span>, numeric: parseFloat(gap) || 999 };
    }},
    { label: "Transfer Partners", icon: "✈️", direction: "highest", getValue: (cc) => {
      const tp = cc.v3?.redemption.transferPartners || [];
      if (tp.length === 0) return { display: <span className="text-muted-foreground">None</span>, numeric: 0 };
      return { display: <>{tp.length} ({tp.map((t) => {
        const prog = findProgram(t.name);
        const shortName = t.name.split(" ")[0];
        const alliance = prog?.alliance && prog.alliance !== "None" ? ` (${prog.alliance})` : "";
        return shortName + alliance;
      }).join(", ")})</>, numeric: tp.length };
    }},
    { label: "Best Transfer", icon: "🔄", direction: "lowest", getValue: (cc) => {
      const tp = cc.v3?.redemption.transferPartners || [];
      if (tp.length === 0) return { display: <span className="text-muted-foreground">N/A</span>, numeric: 999 };
      const best = tp.reduce((a, b) => a.ratioNumeric < b.ratioNumeric ? a : b);
      return { display: <>{best.name.split(" ").slice(0, 2).join(" ")} <span className="text-gold">{best.ratio}</span></>, numeric: best.ratioNumeric };
    }},
    { label: "Reward Type", icon: "💎", direction: "highest", getValue: (cc) => {
      const type = cc.v3?.redemption.type;
      if (type === "cashback") return { display: <span className="text-green-400">💚 Cashback — 1:1 value</span>, numeric: 0 };
      const cur = cc.v3?.redemption.pointCurrency ? getCurrencyByName(cc.v3.redemption.pointCurrency) : undefined;
      return { display: cur?.displayName ?? cc.v3?.redemption.pointCurrency ?? "Points", numeric: 0 };
    }},
  ];

  return (
    <CompareTableWrapper>
      <CompareColumnHeaders compareCards={compareCards} />
      <CompareRowsContainer>
      {rows.map((row) => {
        const vals = compareCards.map((cc) => {
          const { display, numeric } = row.getValue(cc);
          return { cardId: cc.card.id, display, numeric };
        });
        const hasNumeric = new Set(vals.map((v) => v.numeric)).size > 1 && vals.some((v) => v.numeric > 0);
        const winnerId = hasNumeric ? findWinner(vals.map((v) => ({ cardId: v.cardId, value: v.numeric })), row.direction) : null;

        return (
          <CompareRow
            key={row.label}
            label={row.label}
            icon={row.icon}
            values={vals.map((v) => ({
              cardId: v.cardId,
              display: v.display,
              isWinner: winnerId === v.cardId,
            }))}
          />
        );
      })}

      {/* All redemption options expanded */}
      <div className="border-t border-border/30">
        <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/10">
          All Redemption Options (Ranked)
        </div>
        {compareCards[0]?.v3?.redemption.options.map((_, i) => (
          <CompareRow
            key={`opt-${i}`}
            label={`#${i + 1}`}
            values={compareCards.map((cc) => {
              const opt = cc.v3?.redemption.options[i];
              return {
                cardId: cc.card.id,
                display: opt ? (
                  <div className="text-[10px]">
                    <span className="font-medium">{opt.type}</span>
                    <span className="text-gold ml-1">₹{opt.value.toFixed(2)}/pt</span>
                    <span className="text-muted-foreground block">{opt.processingTime} · {opt.fee}</span>
                  </div>
                ) : <span className="text-muted-foreground">—</span>,
                isWinner: false,
              };
            })}
          />
        ))}
      </div>
      </CompareRowsContainer>
    </CompareTableWrapper>
  );
}
