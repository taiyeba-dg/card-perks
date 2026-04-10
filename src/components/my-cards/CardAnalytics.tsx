import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed, Plane, ShoppingBag, ShoppingCart, Fuel, Tv,
} from "lucide-react";
import type { CreditCard as CardType } from "@/data/cards";
import type { CardV3Data } from "@/data/card-v3-types";
import { TIER_CONFIG, TIER_ORDER } from "@/lib/tier-config";
import "./my-cards.css";

const SPEND_CATEGORIES = [
  { key: "dining",  label: "Dining",   icon: UtensilsCrossed, color: "#E23744" },
  { key: "travel",  label: "Travel",   icon: Plane,           color: "#276EF1" },
  { key: "online",  label: "Shopping", icon: ShoppingBag,     color: "#F8C534" },
  { key: "grocery", label: "Grocery",  icon: ShoppingCart,    color: "#F97316" },
  { key: "fuel",    label: "Fuel",     icon: Fuel,            color: "#006838" },
];

/* ── Helpers ── */
function parseFee(fee: string): number {
  const n = fee.replace(/[^\d]/g, "");
  return n ? parseInt(n, 10) : 0;
}

function formatVal(v: number): string {
  if (v >= 100000) return `\u20B9${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `\u20B9${(v / 1000).toFixed(1)}K`;
  return `\u20B9${Math.round(v).toLocaleString("en-IN")}`;
}

/* ── Types ── */
interface CardEntry {
  cardId: string;
  card: CardType;
  v3: CardV3Data | undefined;
}

interface CardAnalyticsProps {
  cards: CardEntry[];
  selectedCard: CardEntry | null;
}

/* ================================================================
   Main component
   ================================================================ */
export default function CardAnalytics({ cards, selectedCard }: CardAnalyticsProps) {
  if (selectedCard) {
    return <CardDetailPanel entry={selectedCard} />;
  }
  return <PortfolioPanel cards={cards} />;
}

/* ================================================================
   Portfolio Panel (no card selected)
   ================================================================ */
function PortfolioPanel({ cards }: { cards: CardEntry[] }) {
  const totalFees = useMemo(
    () => cards.reduce((s, e) => s + (e.v3?.fees.annual ?? parseFee(e.card.fee)), 0),
    [cards],
  );

  const avgRate = useMemo(
    () => cards.length
      ? cards.reduce((s, e) => s + (e.v3?.baseRate ?? (parseFloat(e.card.rewardRate) || 0)), 0) / cards.length
      : 0,
    [cards],
  );

  /* Tier distribution */
  const tierDist = useMemo(() => {
    const map = new Map<string, number>();
    cards.forEach(e => {
      const t = e.card.type;
      map.set(t, (map.get(t) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([tier, count]) => ({
        tier, count,
        ...(TIER_CONFIG[tier] || TIER_CONFIG.entry),
      }))
      .sort((a, b) => {
        const ai = TIER_ORDER.indexOf(a.tier);
        const bi = TIER_ORDER.indexOf(b.tier);
        return (bi >= 0 ? bi : 99) - (ai >= 0 ? ai : 99);
      });
  }, [cards]);

  const maxTierCount = Math.max(...tierDist.map(t => t.count), 1);

  /* Best card for each category */
  const bestCardFor = useMemo(() => {
    return SPEND_CATEGORIES.map(cat => {
      let bestName = "";
      let bestRate = 0;
      for (const entry of cards) {
        const cats = entry.v3?.categories as Record<string, { rate: number }> | undefined;
        const rate = cats?.[cat.key]?.rate ?? 0;
        if (rate > bestRate) {
          bestRate = rate;
          bestName = entry.card.name;
        }
      }
      return { ...cat, cardName: bestName, rate: bestRate };
    }).filter(b => b.rate > 0);
  }, [cards]);

  return (
    <div className="ca">
      {/* Summary */}
      <div className="mc-section">
        <h2 className="mc-section__title">Portfolio Summary</h2>
        <div className="ca__summary">
          <div className="ca__stat">
            <p className="ca__stat-value">{formatVal(totalFees)}</p>
            <p className="ca__stat-label">Annual Fees</p>
          </div>
          <div className="ca__stat">
            <p className="ca__stat-value ca__stat-value--gold">{avgRate.toFixed(1)}%</p>
            <p className="ca__stat-label">Avg Reward Value</p>
          </div>
        </div>
      </div>

      {/* Tier distribution */}
      {tierDist.length > 0 && (
        <div className="mc-section">
          <h2 className="mc-section__title">Tier Distribution</h2>
          <div className="ca__tiers">
            {tierDist.map(t => (
              <div key={t.tier} className="ca__tier-row">
                <span className="ca__tier-dot" style={{ background: t.color }} />
                <span className="ca__tier-label">{t.label}</span>
                <div
                  className="ca__tier-bar-wrap"
                  role="progressbar"
                  aria-valuenow={t.count}
                  aria-valuemin={0}
                  aria-valuemax={maxTierCount}
                  aria-label={`${t.label} tier: ${t.count} card${t.count !== 1 ? "s" : ""}`}
                >
                  <div
                    className="ca__tier-bar"
                    style={{ width: `${(t.count / maxTierCount) * 100}%`, background: t.color }}
                  />
                </div>
                <span className="ca__tier-count">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best card for */}
      {bestCardFor.length > 0 && (
        <div className="mc-section">
          <h2 className="mc-section__title">Best Card For</h2>
          <div className="ca__bestfor">
            {bestCardFor.map(item => (
              <div key={item.key} className="ca__bestfor-row">
                <div className="ca__bestfor-icon" style={{ background: `${item.color}18` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="ca__bestfor-cat">{item.label}</span>
                <span className="ca__bestfor-card">{item.cardName}</span>
                <span className="ca__bestfor-rate">{item.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Card Detail Panel (card selected)
   ================================================================ */
function CardDetailPanel({ entry }: { entry: CardEntry }) {
  const { card, v3 } = entry;
  const tier = TIER_CONFIG[card.type] || TIER_CONFIG.entry;
  const fee = v3?.fees.annual ?? parseFee(card.fee);
  const rate = v3?.baseRate ?? (parseFloat(card.rewardRate) || 0);
  const lounge = card.lounge || "None";

  /* Value-for-money: if reward value on ₹1L spend exceeds fee, it's good */
  const annualRewardOn1L = rate / 100 * 100_000;
  const isGoodValue = fee === 0 || annualRewardOn1L >= fee;

  return (
    <div className="ca">
      {/* Card identity */}
      <div className="mc-section">
        <div className="ca__card-header">
          <div>
            <h2 className="ca__card-name">{card.name}</h2>
            <p className="ca__card-bank">{card.issuer} · {card.network}</p>
          </div>
          <span
            className="ca__card-tier"
            style={{ backgroundColor: `hsl(var(${tier.cssVar}) / 0.09)`, color: tier.color, borderColor: `hsl(var(${tier.cssVar}) / 0.19)` }}
          >
            {tier.label}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="mc-section">
        <h2 className="mc-section__title">Key Details</h2>
        <div className="ca__metrics">
          <div className="ca__metric">
            <p className="ca__metric-value">{fee === 0 ? "FREE" : formatVal(fee)}</p>
            <p className="ca__metric-label">Annual Fee</p>
            <span className={`ca__metric-badge ${isGoodValue ? "ca__metric-badge--good" : "ca__metric-badge--warn"}`}>
              {isGoodValue ? "Good value" : "Review spend"}
            </span>
          </div>
          <div className="ca__metric">
            <p className="ca__metric-value">{rate.toFixed(1)}%</p>
            <p className="ca__metric-label">Reward Rate</p>
          </div>
          <div className="ca__metric">
            <p className="ca__metric-value ca__metric-value--truncate">{lounge}</p>
            <p className="ca__metric-label">Lounge Access</p>
          </div>
        </div>
      </div>

      {/* Link to full guide */}
      <Link to={`/cards/${card.id}`} className="ca__guide-link">
        View full card guide
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
}
