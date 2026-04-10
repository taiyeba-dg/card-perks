import type { CompareCard } from "../CompareUtils";
import { CompareRow, CompareColumnHeaders, CompareTableWrapper, CompareRowsContainer } from "../CompareTabShell";

interface Props { compareCards: CompareCard[]; }

export default function FeaturesTab({ compareCards }: Props) {
  // Max perks across cards
  const maxPerks = Math.max(...compareCards.map((cc) => cc.card.perks.length));
  const maxBestFor = Math.max(...compareCards.map((cc) => cc.card.bestFor.length));
  const maxMilestones = Math.max(...compareCards.map((cc) => cc.card.milestones.length));

  return (
    <CompareTableWrapper>
      <CompareColumnHeaders compareCards={compareCards} />
      <CompareRowsContainer>

      {/* Key perks */}
      <div className="border-b border-border/30">
        <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/10 flex">
          <div className="w-[120px] sm:w-[160px] min-w-[120px] sm:min-w-[160px] sticky left-0 bg-secondary/10">Key Perks</div>
        </div>
        {Array.from({ length: maxPerks }).map((_, i) => (
          <CompareRow
            key={`perk-${i}`}
            label={`Perk ${i + 1}`}
            icon="✨"
            values={compareCards.map((cc) => ({
              cardId: cc.card.id,
              display: cc.card.perks[i] ? (
                <span className="text-[10px] sm:text-xs">✅ {cc.card.perks[i]}</span>
              ) : (
                <span className="text-[10px] text-muted-foreground/40">—</span>
              ),
              isWinner: false,
            }))}
          />
        ))}
      </div>

      {/* Milestone benefits */}
      <div className="border-b border-border/30">
        <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/10 flex">
          <div className="w-[120px] sm:w-[160px] min-w-[120px] sm:min-w-[160px] sticky left-0 bg-secondary/10">Milestones</div>
        </div>
        {Array.from({ length: maxMilestones }).map((_, i) => (
          <CompareRow
            key={`ms-${i}`}
            label={`Milestone ${i + 1}`}
            icon="🎯"
            values={compareCards.map((cc) => ({
              cardId: cc.card.id,
              display: <span className="text-[10px] sm:text-xs">{cc.card.milestones[i] || "—"}</span>,
              isWinner: false,
            }))}
          />
        ))}
      </div>

      {/* Best for */}
      <div>
        <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/10 flex">
          <div className="w-[120px] sm:w-[160px] min-w-[120px] sm:min-w-[160px] sticky left-0 bg-secondary/10">Best For</div>
        </div>
        {Array.from({ length: maxBestFor }).map((_, i) => (
          <CompareRow
            key={`bf-${i}`}
            label={`Use Case ${i + 1}`}
            icon="❤️"
            values={compareCards.map((cc) => ({
              cardId: cc.card.id,
              display: <span className="text-[10px] sm:text-xs">{cc.card.bestFor[i] || "—"}</span>,
              isWinner: false,
            }))}
          />
        ))}
      </div>
      </CompareRowsContainer>
    </CompareTableWrapper>
  );
}
