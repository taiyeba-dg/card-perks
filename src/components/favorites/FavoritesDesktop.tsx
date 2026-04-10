import { useState, useMemo, useRef, useLayoutEffect, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowUpDown, GitCompare, Download,
  CreditCard, Gift, BookOpen, Landmark,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { vouchers, iconMap, type Voucher } from "@/data/vouchers";
import { guides, type Guide } from "@/data/guides";
import { banks } from "@/data/banking";
import CardImage from "@/components/CardImage";
import FavoriteButton from "@/components/FavoriteButton";
import { TIER_CONFIG, TIER_ORDER } from "@/lib/tier-config";
import { Skeleton } from "@/components/ui/skeleton";
import "./favorites.css";

const TABS = [
  { id: "cards"    as const, label: "Cards",    icon: CreditCard },
  { id: "vouchers" as const, label: "Vouchers", icon: Gift },
  { id: "guides"   as const, label: "Guides",   icon: BookOpen },
  { id: "banking"  as const, label: "Banking",  icon: Landmark },
];

type TabId = (typeof TABS)[number]["id"];
type SortKey = "name" | "fee-asc" | "fee-desc" | "bank" | "tier";

/* ── Helpers ── */
function parseFee(fee: string): number {
  const n = fee.replace(/[^\d]/g, "");
  return n ? parseInt(n, 10) : 0;
}

function tierRank(tier: string): number {
  const i = TIER_ORDER.indexOf(tier);
  return i >= 0 ? i : 99;
}

function formatValue(v: number): string {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${Math.round(v)}`;
}

/* ================================================================
   Main component
   ================================================================ */
export default function FavoritesDesktop() {
  /* Favorites hooks */
  const { isFav: isCardFav,    toggle: toggleCardFav }    = useFavorites("card");
  const { isFav: isVoucherFav, toggle: toggleVoucherFav } = useFavorites("voucher");
  const { isFav: isGuideFav,   toggle: toggleGuideFav }   = useFavorites("guide");
  const { isFav: isBankingFav }                           = useFavorites("banking");

  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  /* Local state */
  const [activeTab, setActiveTab]   = useState<TabId>("cards");
  const [search, setSearch]         = useState("");
  const [sortBy, setSortBy]         = useState<SortKey>("name");
  const [bankFilter, setBankFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* ── Animated tab indicator ── */
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = tabRefs.current[activeTab];
    const container = tabContainerRef.current;
    if (el && container) {
      const cr = container.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setIndicator({ left: er.left - cr.left, width: er.width });
    }
  }, [activeTab]);

  /* ── Derive favorite lists ── */
  const favCards    = useMemo(() => cards.filter(c => isCardFav(c.id)),       [isCardFav]);
  const favVouchers = useMemo(() => vouchers.filter(v => isVoucherFav(v.id)), [isVoucherFav]);
  const favGuides   = useMemo(() => guides.filter(g => isGuideFav(g.slug)),   [isGuideFav]);

  const favBankingTiers = useMemo(() => {
    const result: { bankName: string; bankColor: string; tier: (typeof banks)[0]["tiers"][0] }[] = [];
    for (const bank of banks) {
      for (const tier of bank.tiers) {
        if (isBankingFav(`${bank.id}-${tier.name}`)) {
          result.push({ bankName: bank.name, bankColor: bank.color, tier });
        }
      }
    }
    return result;
  }, [isBankingFav]);

  /* ── Stats ── */
  const uniqueBanks = useMemo(() => new Set(favCards.map(c => c.issuer)), [favCards]);

  const bestDiscount = useMemo(() => {
    if (!favVouchers.length) return "0";
    return Math.max(...favVouchers.map(v => parseFloat(v.bestRate) || 0)).toFixed(0);
  }, [favVouchers]);

  const estimatedValue = useMemo(() => {
    // Rough: each fav card × avg reward rate × ₹1L assumed annual spend per card
    return favCards.reduce((sum, c) => sum + (parseFloat(c.rewardRate) || 0) / 100 * 100_000, 0);
  }, [favCards]);

  /* ── Filtered + sorted cards ── */
  const filteredCards = useMemo(() => {
    let list = [...favCards];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q));
    }
    if (bankFilter !== "all") list = list.filter(c => c.issuer === bankFilter);
    switch (sortBy) {
      case "name":     list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "fee-asc":  list.sort((a, b) => parseFee(a.fee) - parseFee(b.fee)); break;
      case "fee-desc": list.sort((a, b) => parseFee(b.fee) - parseFee(a.fee)); break;
      case "bank":     list.sort((a, b) => a.issuer.localeCompare(b.issuer)); break;
      case "tier":     list.sort((a, b) => tierRank(a.type) - tierRank(b.type)); break;
    }
    return list;
  }, [favCards, search, bankFilter, sortBy]);

  /* ── Filtered vouchers ── */
  const filteredVouchers = useMemo(() => {
    if (!search) return favVouchers;
    const q = search.toLowerCase();
    return favVouchers.filter(v => v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q));
  }, [favVouchers, search]);

  /* ── Filtered guides ── */
  const filteredGuides = useMemo(() => {
    if (!search) return favGuides;
    const q = search.toLowerCase();
    return favGuides.filter(g => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
  }, [favGuides, search]);

  /* ── Helpers ── */
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const tabCounts: Record<TabId, number> = {
    cards: favCards.length,
    vouchers: favVouchers.length,
    guides: favGuides.length,
    banking: favBankingTiers.length,
  };

  /* ── Loading skeleton ── */
  if (!ready) {
    return (
      <div className="fav-desktop">
        <div className="fav-stats-bar">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 rounded-xl mt-6" />
        <div className="fav-card-grid" style={{ marginTop: 24 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-3 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="fav-desktop">
      {/* ─── Stats Bar ─── */}
      <div className="fav-stats-bar">
        <StatCard icon="cards"    value={String(favCards.length)}    sub={`${uniqueBanks.size} bank${uniqueBanks.size !== 1 ? "s" : ""}`} />
        <StatCard icon="vouchers" value={String(favVouchers.length)} sub={`Best: ${bestDiscount}%`} />
        <StatCard icon="guides"   value={String(favGuides.length)}   sub="saved" />
        <StatCard icon="value"    value={formatValue(estimatedValue)} sub="/year est." />
      </div>

      {/* ─── Sticky Toolbar ─── */}
      <div className="fav-toolbar">
        <div className="fav-toolbar__row">
          {/* Search */}
          <div className="fav-search-wrapper">
            <Search className="fav-search-icon" />
            <input
              className="fav-search"
              type="text"
              placeholder="Search favorites…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Tab pills */}
          <div className="fav-tabs" ref={tabContainerRef} role="tablist" aria-label="Favorites categories">
            <div
              className="fav-tab-indicator"
              style={{ left: indicator.left, width: indicator.width }}
            />
            {TABS.map(tab => (
              <button
                key={tab.id}
                id={`fav-tab-${tab.id}`}
                ref={el => { tabRefs.current[tab.id] = el; }}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`fav-tab-pill${activeTab === tab.id ? " fav-tab-pill--active" : ""}`}
                onClick={() => { setActiveTab(tab.id); setSearch(""); setBankFilter("all"); }}
              >
                <tab.icon className="fav-tab-pill__icon" />
                {tab.label}
                <span className="fav-tab-pill__count">{tabCounts[tab.id]}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="fav-toolbar__actions">
            {activeTab === "cards" && selectedIds.size >= 2 && (
              <Link
                to={`/compare?cards=${[...selectedIds].join(",")}`}
                className="fav-action-btn fav-action-btn--primary"
              >
                <GitCompare className="w-4 h-4" />
                Compare ({selectedIds.size})
              </Link>
            )}
            <button className="fav-action-btn" title="Export favorites">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Sort / filter (cards only) */}
        {activeTab === "cards" && favCards.length > 0 && (
          <div className="fav-sort-bar">
            <div className="fav-sort-wrapper">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                className="fav-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortKey)}
              >
                <option value="name">Name</option>
                <option value="fee-asc">Fee: Low → High</option>
                <option value="fee-desc">Fee: High → Low</option>
                <option value="bank">Bank</option>
                <option value="tier">Tier</option>
              </select>
            </div>
            <div className="fav-bank-chips">
              <button
                className={`fav-chip${bankFilter === "all" ? " fav-chip--active" : ""}`}
                onClick={() => setBankFilter("all")}
              >
                All
              </button>
              {[...uniqueBanks].map(bank => (
                <button
                  key={bank}
                  className={`fav-chip${bankFilter === bank ? " fav-chip--active" : ""}`}
                  onClick={() => setBankFilter(bank)}
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="fav-content"
          role="tabpanel"
          aria-labelledby={`fav-tab-${activeTab}`}
        >
          {activeTab === "cards" && (
            filteredCards.length ? (
              <div className="fav-card-grid">
                {filteredCards.map((card, i) => (
                  <CardTile
                    key={card.id}
                    card={card}
                    index={i}
                    onToggleFav={() => toggleCardFav(card.id)}
                    isSelected={selectedIds.has(card.id)}
                    onToggleSelect={() => toggleSelect(card.id)}
                  />
                ))}
              </div>
            ) : <EmptyState type="cards" />
          )}

          {activeTab === "vouchers" && (
            filteredVouchers.length ? (
              <div className="fav-card-grid">
                {filteredVouchers.map((v, i) => (
                  <VoucherTile
                    key={v.id}
                    voucher={v}
                    index={i}
                    onToggleFav={() => toggleVoucherFav(v.id)}
                  />
                ))}
              </div>
            ) : <EmptyState type="vouchers" />
          )}

          {activeTab === "guides" && (
            filteredGuides.length ? (
              <div className="fav-guides-list">
                {filteredGuides.map((g, i) => (
                  <GuideTile
                    key={g.slug}
                    guide={g}
                    index={i}
                    onToggleFav={() => toggleGuideFav(g.slug)}
                  />
                ))}
              </div>
            ) : <EmptyState type="guides" />
          )}

          {activeTab === "banking" && (
            favBankingTiers.length ? (
              <div className="fav-guides-list">
                {favBankingTiers.map((item, i) => (
                  <BankingTile
                    key={`${item.bankName}-${item.tier.name}`}
                    bankName={item.bankName}
                    bankColor={item.bankColor}
                    tier={item.tier}
                    index={i}
                  />
                ))}
              </div>
            ) : <EmptyState type="banking" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   Sub-components
   ================================================================ */

/* ── Stat Card ── */
function StatCard({ icon, value, sub }: { icon: string; value: string; sub: string }) {
  const svgs: Record<string, React.ReactNode> = {
    cards: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="fav-stat__icon">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20" />
      </svg>
    ),
    vouchers: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="fav-stat__icon">
        <path d="M20 12V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0a2 2 0 00-2-2 2 2 0 00-2 2m-8 0a2 2 0 01-2 2 2 2 0 01-2-2" />
      </svg>
    ),
    guides: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="fav-stat__icon">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
      </svg>
    ),
    value: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="fav-stat__icon">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  };

  return (
    <div className="fav-stat-card">
      <div className="fav-stat__icon-wrap">{svgs[icon]}</div>
      <div>
        <p className="fav-stat__value">{value}</p>
        <p className="fav-stat__sub">{sub}</p>
      </div>
    </div>
  );
}

/* ── Card Tile ── */
const CardTile = memo(function CardTile({
  card, index, onToggleFav, isSelected, onToggleSelect,
}: {
  card: CardType; index: number; onToggleFav: () => void;
  isSelected: boolean; onToggleSelect: () => void;
}) {
  const tier = TIER_CONFIG[card.type] || TIER_CONFIG.entry;

  return (
    <motion.div
      className={`fav-card${isSelected ? " fav-card--selected" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      style={{
        "--tier-color": tier.color,
        "--tier-color-faded": `hsl(var(${tier.cssVar}) / 0.25)`,
      } as React.CSSProperties}
    >
      {/* Select checkbox */}
      <div className="fav-card__select" onClick={onToggleSelect}>
        <div className={`fav-card__checkbox${isSelected ? " fav-card__checkbox--checked" : ""}`}>
          {isSelected && (
            <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>
          )}
        </div>
      </div>

      <Link to={`/cards/${card.id}`} className="fav-card__link">
        <div
          className="fav-card__image-area"
          style={{ background: `linear-gradient(135deg, ${card.color}18, ${card.color}08)` }}
        >
          {card.image ? (
            <CardImage src={card.image} alt={card.name} fallbackColor={card.color} className="fav-card__img" />
          ) : (
            <CreditCard className="fav-card__img-fallback" />
          )}
        </div>

        <div className="fav-card__body">
          <div className="fav-card__header">
            <h3 className="fav-card__name">{card.name}</h3>
            <span
              className="fav-card__tier"
              style={{
                backgroundColor: `hsl(var(${tier.cssVar}) / 0.09)`,
                color: tier.color,
                borderColor: `hsl(var(${tier.cssVar}) / 0.19)`,
              }}
            >
              {tier.label}
            </span>
          </div>

          <p className="fav-card__meta">{card.issuer} · {card.network}</p>

          <div className="fav-card__stats">
            <span className="fav-card__stat">
              <span className="fav-card__stat-label">Fee</span>
              <span className="fav-card__stat-value">{card.fee}</span>
            </span>
            <span className="fav-card__stat">
              <span className="fav-card__stat-label">Rewards</span>
              <span className="fav-card__stat-value">{card.rewardRate}</span>
            </span>
            <span className="fav-card__stat">
              <span className="fav-card__stat-label">Lounge</span>
              <span className="fav-card__stat-value fav-card__stat-value--truncate">{card.lounge || "—"}</span>
            </span>
          </div>
        </div>
      </Link>

      <div className="fav-card__fav">
        <FavoriteButton isFav onToggle={onToggleFav} />
      </div>
    </motion.div>
  );
});

/* ── Voucher Tile ── */
const VoucherTile = memo(function VoucherTile({
  voucher, index, onToggleFav,
}: {
  voucher: Voucher; index: number; onToggleFav: () => void;
}) {
  const Icon = iconMap[voucher.category] || Gift;
  const livePlatforms = voucher.platformRates.filter(p => p.live).length;

  return (
    <motion.div
      className="fav-voucher"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to={`/vouchers/${voucher.id}`} className="fav-voucher__link">
        <div className="fav-voucher__icon-area" style={{ backgroundColor: `${voucher.color}15` }}>
          <Icon style={{ color: voucher.color }} className="w-7 h-7" />
        </div>
        <div>
          <h3 className="fav-voucher__name">{voucher.name}</h3>
          <p className="fav-voucher__category">{voucher.category}</p>
          <p className="fav-voucher__desc">{voucher.description}</p>
          <div className="fav-voucher__rate-row">
            <span className="fav-voucher__best-rate">{voucher.bestRate}</span>
            <span className="fav-voucher__discount">{voucher.discount}</span>
          </div>
          {livePlatforms > 0 && (
            <div className="fav-voucher__platforms">
              <span className="fav-voucher__platforms-dot" />
              {livePlatforms} live platform{livePlatforms !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </Link>
      <div className="fav-voucher__fav">
        <FavoriteButton isFav onToggle={onToggleFav} />
      </div>
    </motion.div>
  );
});

/* ── Guide Tile ── */
const GuideTile = memo(function GuideTile({
  guide, index, onToggleFav,
}: {
  guide: Guide; index: number; onToggleFav: () => void;
}) {
  const Icon = guide.icon;

  return (
    <motion.div
      className="fav-guide"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to={`/guides/${guide.slug}`} className="fav-guide__link">
        <div className="fav-guide__icon-area" style={{ backgroundColor: `${guide.color}15` }}>
          <Icon style={{ color: guide.color }} className="w-6 h-6" />
        </div>
        <div className="fav-guide__body">
          <h3 className="fav-guide__title">{guide.title}</h3>
          <p className="fav-guide__meta">{guide.author} · {guide.readTime} · {guide.category}</p>
          <p className="fav-guide__desc">{guide.description}</p>
        </div>
      </Link>
      <div className="fav-guide__fav">
        <FavoriteButton isFav onToggle={onToggleFav} />
      </div>
    </motion.div>
  );
});

/* ── Banking Tile ── */
function BankingTile({
  bankName, bankColor, tier, index,
}: {
  bankName: string; bankColor: string;
  tier: { name: string; color: string; eligibility: string };
  index: number;
}) {
  return (
    <motion.div
      className="fav-guide"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to="/banking" className="fav-guide__link">
        <div className="fav-guide__icon-area" style={{ backgroundColor: `${bankColor}15` }}>
          <Landmark style={{ color: bankColor }} className="w-6 h-6" />
        </div>
        <div className="fav-guide__body">
          <h3 className="fav-guide__title">{bankName}</h3>
          <span
            className="fav-guide__tier-badge"
            style={{ backgroundColor: `${tier.color}18`, color: tier.color, borderColor: `${tier.color}30` }}
          >
            {tier.name}
          </span>
          <p className="fav-guide__desc">{tier.eligibility}</p>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Empty State ── */
function EmptyState({ type }: { type: TabId }) {
  const cfg: Record<TabId, { svg: React.ReactNode; title: string; desc: string; cta: string; href: string }> = {
    cards: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-empty__svg">
          <rect x="8" y="16" width="48" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M8 26h48" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="34" width="16" height="4" rx="2" fill="currentColor" opacity="0.2" />
          <rect x="14" y="42" width="10" height="2" rx="1" fill="currentColor" opacity="0.12" />
        </svg>
      ),
      title: "No favorite cards yet",
      desc: "Browse cards and tap \u2665 to save them here",
      cta: "Browse Cards",
      href: "/cards",
    },
    vouchers: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-empty__svg">
          <rect x="8" y="14" width="48" height="36" rx="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M8 24a4 4 0 014-4 4 4 0 010 8 4 4 0 01-4-4z" fill="currentColor" opacity="0.15" />
          <path d="M56 24a4 4 0 00-4 4 4 4 0 000-8 4 4 0 004 4z" fill="currentColor" opacity="0.15" />
        </svg>
      ),
      title: "No saved vouchers yet",
      desc: "Browse voucher rates and tap \u2665 to save your favorites",
      cta: "Browse Vouchers",
      href: "/",
    },
    guides: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-empty__svg">
          <path d="M14 8h28a4 4 0 014 4v40a4 4 0 01-4 4H14a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="currentColor" strokeWidth="2" />
          <path d="M18 20h20M18 28h14M18 36h18" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path d="M46 16l8-4v36l-8 4V16z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.08" />
        </svg>
      ),
      title: "No favorite guides yet",
      desc: "Read our guides and tap \u2665 to save them for later",
      cta: "Browse Guides",
      href: "/guides",
    },
    banking: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-empty__svg">
          <path d="M32 8L8 22h48L32 8z" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="26" width="8" height="20" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <rect x="28" y="26" width="8" height="20" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <rect x="42" y="26" width="8" height="20" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <rect x="8" y="48" width="48" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      title: "No banking programs saved",
      desc: "Explore banking tiers and save your matches",
      cta: "Explore Banking",
      href: "/banking",
    },
  };

  const c = cfg[type];
  return (
    <div className="fav-empty">
      <div className="fav-empty__icon-wrap">{c.svg}</div>
      <h3 className="fav-empty__title">{c.title}</h3>
      <p className="fav-empty__desc">{c.desc}</p>
      <Link to={c.href} className="fav-empty__cta">
        {c.cta}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
}
