import type { CompareCard } from "../CompareUtils";
import { findWinner, parseFee, formatCurrency } from "../CompareUtils";
import { CompareRow, CompareColumnHeaders, CompareTableWrapper, CompareRowsContainer } from "../CompareTabShell";

interface Props { compareCards: CompareCard[]; }

export default function FeesTab({ compareCards }: Props) {
  const rows: { label: string; icon: string; direction: "highest" | "lowest"; getValue: (cc: CompareCard) => { display: string; numeric: number } }[] = [
    { label: "Joining / Annual Fee", icon: "💳", direction: "lowest", getValue: (cc) => ({ display: cc.card.fee, numeric: parseFee(cc.card.fee) }) },
    { label: "Renewal Fee", icon: "🔄", direction: "lowest", getValue: (cc) => {
      const r = cc.v3?.fees.renewal ?? parseFee(cc.card.fee);
      return { display: formatCurrency(r), numeric: r };
    }},
    { label: "Waiver Threshold", icon: "🎯", direction: "lowest", getValue: (cc) => {
      const w = cc.v3?.fees.waivedOn;
      return { display: w ? formatCurrency(w) + "/yr" : "No waiver", numeric: w ?? 999999999 };
    }},
    { label: "Renewal Bonus Value", icon: "🎁", direction: "highest", getValue: (cc) => {
      const v = cc.v3?.fees.renewalBenefitValue ?? 0;
      return { display: formatCurrency(v), numeric: v };
    }},
    { label: "Effective Annual Cost", icon: "📊", direction: "lowest", getValue: (cc) => {
      const fee = parseFee(cc.card.fee);
      const renewal = cc.v3?.fees.renewalBenefitValue ?? 0;
      const eff = Math.max(0, fee - renewal);
      return { display: formatCurrency(eff), numeric: eff };
    }},
    { label: "Fuel Surcharge", icon: "⛽", direction: "highest", getValue: (cc) => ({ display: cc.card.fuelSurcharge, numeric: 0 }) },
    { label: "Forex Markup", icon: "🌍", direction: "lowest", getValue: (cc) => {
      const v = parseFloat(cc.card.forexMarkup) || 0;
      return { display: cc.card.forexMarkup, numeric: v };
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
