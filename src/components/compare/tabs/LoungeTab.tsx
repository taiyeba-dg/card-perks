import type { CompareCard } from "../CompareUtils";
import { findWinner } from "../CompareUtils";
import { CompareRow, CompareColumnHeaders, CompareTableWrapper, CompareRowsContainer } from "../CompareTabShell";

interface Props { compareCards: CompareCard[]; }

function parseLoungeCount(lounge: string): number {
  if (lounge === "Unlimited") return 999;
  const m = lounge.match(/\d+/);
  return m ? parseInt(m[0]) : 0;
}

export default function LoungeTab({ compareCards }: Props) {
  const rows: { label: string; icon: string; direction: "highest" | "lowest"; getValue: (cc: CompareCard) => { display: string; numeric: number } }[] = [
    { label: "Lounge Access", icon: "🛋️", direction: "highest", getValue: (cc) => ({ display: cc.card.lounge, numeric: parseLoungeCount(cc.card.lounge) }) },
    { label: "Fuel Surcharge", icon: "⛽", direction: "highest", getValue: (cc) => ({ display: cc.card.fuelSurcharge, numeric: 0 }) },
    { label: "Forex Markup", icon: "🌍", direction: "lowest", getValue: (cc) => {
      const v = parseFloat(cc.card.forexMarkup) || 0;
      return { display: cc.card.forexMarkup, numeric: v };
    }},
  ];

  // Extract insurance items
  const maxInsurance = Math.max(...compareCards.map((cc) => cc.card.insurance.length));

  return (
    <CompareTableWrapper>
      <CompareColumnHeaders compareCards={compareCards} />
      <CompareRowsContainer>
      {rows.map((row) => {
        const vals = compareCards.map((cc) => {
          const { display, numeric } = row.getValue(cc);
          return { cardId: cc.card.id, display, numeric };
        });
        const hasNumeric = new Set(vals.map((v) => v.numeric)).size > 1;
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

      {/* Insurance rows */}
      <div className="border-t border-border/30">
        <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/10">
          Insurance Coverage
        </div>
        {Array.from({ length: maxInsurance }).map((_, i) => (
          <CompareRow
            key={`ins-${i}`}
            label={`Coverage ${i + 1}`}
            icon="🛡️"
            values={compareCards.map((cc) => ({
              cardId: cc.card.id,
              display: <span className="text-[10px]">{cc.card.insurance[i] || "—"}</span>,
              isWinner: false,
            }))}
          />
        ))}
      </div>
      </CompareRowsContainer>
    </CompareTableWrapper>
  );
}
