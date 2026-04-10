import type { CompareCard } from "../CompareUtils";
import { findWinner, parseFee, parsePercent, parseIncome, formatCurrency } from "../CompareUtils";
import { CompareRow, CompareColumnHeaders, CompareTableWrapper, CompareRowsContainer } from "../CompareTabShell";
import { getCurrencyByName } from "@/data/reward-currencies";

interface Props { compareCards: CompareCard[]; }

export default function OverviewTab({ compareCards }: Props) {
  const rows: { label: string; icon: string; getValue: (cc: CompareCard) => { display: string; numeric: number }; direction: "highest" | "lowest" }[] = [
    { label: "Annual Fee", icon: "💳", direction: "lowest", getValue: (cc) => ({ display: cc.card.fee, numeric: parseFee(cc.card.fee) }) },
    { label: "Fee Waiver", icon: "🎯", direction: "lowest", getValue: (cc) => {
      const w = cc.v3?.fees.waivedOn;
      return { display: w ? formatCurrency(w) + "/yr" : "N/A", numeric: w ?? 999999999 };
    }},
    { label: "Effective Fee", icon: "📊", direction: "lowest", getValue: (cc) => {
      const fee = parseFee(cc.card.fee);
      const renewal = cc.v3?.fees.renewalBenefitValue ?? 0;
      const eff = fee - renewal;
      return { display: formatCurrency(eff), numeric: eff };
    }},
    { label: "Base Reward Rate", icon: "⭐", direction: "highest", getValue: (cc) => ({ display: cc.v3 ? cc.v3.baseRate + "%" : cc.card.rewards, numeric: cc.v3?.baseRate ?? parsePercent(cc.card.rewards) }) },
    { label: "Best Point Value", icon: "💰", direction: "highest", getValue: (cc) => {
      const v = cc.v3?.redemption.baseValue ?? 0;
      return { display: `₹${v.toFixed(2)}/pt`, numeric: v };
    }},
    { label: "Reward Type", icon: "🎁", direction: "highest", getValue: (cc) => { const cur = cc.v3?.redemption.pointCurrency ? getCurrencyByName(cc.v3.redemption.pointCurrency) : undefined; return { display: cur?.displayName ?? cc.v3?.redemption.pointCurrency ?? "Points", numeric: 0 }; } },
    { label: "Network", icon: "🌐", direction: "highest", getValue: (cc) => ({ display: cc.card.network, numeric: 0 }) },
    { label: "Card Type", icon: "🏷️", direction: "highest", getValue: (cc) => ({ display: cc.card.type, numeric: 0 }) },
    { label: "Min Income", icon: "💼", direction: "lowest", getValue: (cc) => ({ display: cc.card.minIncome, numeric: parseIncome(cc.card.minIncome) }) },
    { label: "Forex Markup", icon: "🌍", direction: "lowest", getValue: (cc) => ({ display: cc.card.forexMarkup, numeric: parsePercent(cc.card.forexMarkup) }) },
    { label: "Welcome Bonus", icon: "🎉", direction: "highest", getValue: (cc) => {
      const wb = cc.card.welcomeBonus;
      const m = wb.match(/[\d,]+/);
      return { display: wb, numeric: m ? parseInt(m[0].replace(/,/g, "")) : 0 };
    }},
    { label: "Lounge Access", icon: "🛋️", direction: "highest", getValue: (cc) => {
      const l = cc.card.lounge;
      return { display: l, numeric: l === "Unlimited" ? 999 : parseInt(l) || 0 };
    }},
    { label: "Rating", icon: "⭐", direction: "highest", getValue: (cc) => ({ display: String(cc.card.rating), numeric: cc.card.rating }) },
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
        // Only find winner for numeric-meaningful rows
        const hasNumericVariance = new Set(vals.map((v) => v.numeric)).size > 1 && vals.every((v) => v.numeric > 0 || row.direction === "lowest");
        const winnerId = hasNumericVariance ? findWinner(vals.map((v) => ({ cardId: v.cardId, value: v.numeric })), row.direction) : null;

        return (
          <CompareRow
            key={row.label}
            label={row.label}
            icon={row.icon}
            values={vals.map((v) => ({
              cardId: v.cardId,
              display: <span className={winnerId === v.cardId ? "text-gold font-semibold" : ""}>{v.display}</span>,
              isWinner: winnerId === v.cardId,
            }))}
          />
        );
      })}
      </CompareRowsContainer>
    </CompareTableWrapper>
  );
}
