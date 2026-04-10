import { useRef, useEffect, useMemo } from "react";
import { CreditCard } from "lucide-react";
import CardImage from "@/components/CardImage";
import type { CreditCard as CardType } from "@/data/cards";

const CARD_W = 280;
const GAP = 16;
const STEP = CARD_W + GAP;
const MAX_DOTS = 5;

interface CardStackProps {
  cards: { cardId: string; card: CardType }[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
  onCardTap?: (index: number) => void;
}

export default function CardStack({ cards, activeIndex, onActiveChange, onCardTap }: CardStackProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const skipObserver = useRef(false);

  /* ── Programmatic scroll when activeIndex changes externally ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    skipObserver.current = true;
    el.scrollTo({ left: activeIndex * STEP, behavior: "smooth" });
    const id = window.setTimeout(() => { skipObserver.current = false; }, 500);
    return () => clearTimeout(id);
  }, [activeIndex]);

  /* ── IntersectionObserver for active card detection ── */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (skipObserver.current) return;
        let bestIdx = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = Number((entry.target as HTMLElement).dataset.index);
          }
        }
        if (bestIdx >= 0 && bestRatio >= 0.5) {
          onActiveChange(bestIdx);
        }
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    const items = container.querySelectorAll<HTMLElement>("[data-index]");
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [cards.length, onActiveChange]);

  /* ── Scrolling dots: max 5 visible, window shifts with active ── */
  const total = cards.length;
  const { dotStart, dotCount } = useMemo(() => {
    if (total <= MAX_DOTS) return { dotStart: 0, dotCount: total };
    const start = Math.max(0, Math.min(activeIndex - Math.floor(MAX_DOTS / 2), total - MAX_DOTS));
    return { dotStart: start, dotCount: MAX_DOTS };
  }, [total, activeIndex]);

  if (cards.length === 0) return null;

  return (
    <div className="card-stack" role="region" aria-label="Card carousel" aria-roledescription="carousel">
      <div className="card-stack-container" ref={scrollRef} aria-live="polite">
        {cards.map((entry, i) => (
          <div
            key={entry.cardId}
            data-index={i}
            className={`card-stack-item${i === activeIndex ? " active" : ""}`}
            onClick={() => onCardTap?.(i)}
          >
            <div
              className="card-stack-item__inner"
              style={{ background: `linear-gradient(135deg, ${entry.card.color}22, ${entry.card.color}08)` }}
            >
              {entry.card.image ? (
                <CardImage
                  src={entry.card.image}
                  alt={entry.card.name}
                  fallbackColor={entry.card.color}
                  className="card-stack-item__img"
                />
              ) : (
                <CreditCard className="card-stack-item__fallback" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="card-stack-dots">
          {Array.from({ length: dotCount }, (_, i) => {
            const realIdx = dotStart + i;
            const isEdge =
              (i === 0 && dotStart > 0) ||
              (i === dotCount - 1 && dotStart + dotCount < total);
            return (
              <div
                key={realIdx}
                className={
                  `card-stack-dot` +
                  (realIdx === activeIndex ? " active" : "") +
                  (isEdge ? " edge" : "")
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
