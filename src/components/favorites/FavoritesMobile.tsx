import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Search, X, CreditCard, Gift, BookOpen, Landmark,
  ChevronRight, Trash2,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cards, type CreditCard as CardType } from "@/data/cards";
import { vouchers, iconMap, type Voucher } from "@/data/vouchers";
import { guides, type Guide } from "@/data/guides";
import { banks } from "@/data/banking";
import CardImage from "@/components/CardImage";
import FavoriteButton from "@/components/FavoriteButton";
import { TIER_CONFIG } from "@/lib/tier-config";
import { Skeleton } from "@/components/ui/skeleton";
import "./favorites.css";

const TABS = [
  { id: "cards"    as const, label: "Cards",    icon: CreditCard },
  { id: "vouchers" as const, label: "Vouchers", icon: Gift },
  { id: "guides"   as const, label: "Guides",   icon: BookOpen },
  { id: "banking"  as const, label: "Banking",  icon: Landmark },
];

type TabId = (typeof TABS)[number]["id"];

/* ================================================================
   Main component
   ================================================================ */
export default function FavoritesMobile() {
  const { isFav: isCardFav,    toggle: toggleCardFav }    = useFavorites("card");
  const { isFav: isVoucherFav, toggle: toggleVoucherFav } = useFavorites("voucher");
  const { isFav: isGuideFav,   toggle: toggleGuideFav }   = useFavorites("guide");
  const { isFav: isBankingFav }                           = useFavorites("banking");

  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  const [activeTab, setActiveTab] = useState<TabId>("cards");
  const [search, setSearch]       = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  /* ── Scroll-direction search toggle ── */
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY.current - 15) setSearchOpen(true);
      else if (y > lastY.current + 15 && y > 120) setSearchOpen(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Derive favorites ── */
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

  /* ── Search filter ── */
  const q = search.toLowerCase();

  const filteredCards = useMemo(
    () => (q ? favCards.filter(c => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q)) : favCards),
    [favCards, q],
  );
  const filteredVouchers = useMemo(
    () => (q ? favVouchers.filter(v => v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) : favVouchers),
    [favVouchers, q],
  );
  const filteredGuides = useMemo(
    () => (q ? favGuides.filter(g => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)) : favGuides),
    [favGuides, q],
  );

  /* ── Subtitle ── */
  const parts: string[] = [];
  if (favCards.length)    parts.push(`${favCards.length} Card${favCards.length !== 1 ? "s" : ""}`);
  if (favVouchers.length) parts.push(`${favVouchers.length} Voucher${favVouchers.length !== 1 ? "s" : ""}`);
  if (favGuides.length)   parts.push(`${favGuides.length} Guide${favGuides.length !== 1 ? "s" : ""}`);
  const subtitle = parts.join(" \u00b7 ") || "No items saved";

  const tabCounts: Record<TabId, number> = {
    cards: favCards.length,
    vouchers: favVouchers.length,
    guides: favGuides.length,
    banking: favBankingTiers.length,
  };

  const switchTab = useCallback((id: TabId) => {
    setActiveTab(id);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── Loading skeleton ── */
  if (!ready) {
    return (
      <div className="fav-mobile" style={{ padding: "16px" }}>
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-4 w-24 mt-2 rounded" />
        <Skeleton className="h-10 rounded-lg mt-4" />
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Skeleton className="w-16 h-10 rounded-lg flex-shrink-0" />
              <div style={{ flex: 1 }}>
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 mt-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="fav-mobile">
      {/* ─── Compact Header ─── */}
      <div className="fav-mobile__header">
        <div className="fav-mobile__header-row">
          <div>
            <h1 className="fav-mobile__title">Favorites</h1>
            <p className="fav-mobile__subtitle">{subtitle}</p>
          </div>
          <button
            className="fav-mobile__search-toggle"
            onClick={() => { setSearchOpen(o => !o); if (searchOpen) setSearch(""); }}
            aria-label={searchOpen ? "Close search" : "Search"}
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── Sticky Tabs ─── */}
      <div className="fav-mobile__tabs-sticky">
        <div className="fav-mobile__tabs-scroll" role="tablist" aria-label="Favorites categories">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`fav-mobile__tab${activeTab === tab.id ? " fav-mobile__tab--active" : ""}`}
              onClick={() => switchTab(tab.id)}
            >
              <tab.icon className="fav-mobile__tab-icon" />
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span className="fav-mobile__tab-count">{tabCounts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Collapsible Search ─── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="fav-mobile__search-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="fav-mobile__search-inner">
                <Search className="fav-mobile__search-icon" />
                <input
                  className="fav-mobile__search-input"
                  type="text"
                  placeholder="Search favorites…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
                {search && (
                  <button className="fav-mobile__search-clear" onClick={() => setSearch("")}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          ref={contentRef}
          role="tabpanel"
          className="fav-mobile__content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Cards */}
          {activeTab === "cards" && (
            filteredCards.length ? (
              <div className="fav-mobile__list">
                {filteredCards.map((card, i) => (
                  <MobileCardRow
                    key={card.id}
                    card={card}
                    index={i}
                    onToggleFav={() => toggleCardFav(card.id)}
                  />
                ))}
              </div>
            ) : <MobileEmptyState type="cards" />
          )}

          {/* Vouchers */}
          {activeTab === "vouchers" && (
            filteredVouchers.length ? (
              <div className="fav-mobile__list">
                {filteredVouchers.map((v, i) => (
                  <MobileVoucherRow
                    key={v.id}
                    voucher={v}
                    index={i}
                    onToggleFav={() => toggleVoucherFav(v.id)}
                  />
                ))}
              </div>
            ) : <MobileEmptyState type="vouchers" />
          )}

          {/* Guides */}
          {activeTab === "guides" && (
            filteredGuides.length ? (
              <div className="fav-mobile__list">
                {filteredGuides.map((g, i) => (
                  <MobileGuideRow
                    key={g.slug}
                    guide={g}
                    index={i}
                    onToggleFav={() => toggleGuideFav(g.slug)}
                  />
                ))}
              </div>
            ) : <MobileEmptyState type="guides" />
          )}

          {/* Banking */}
          {activeTab === "banking" && (
            favBankingTiers.length ? (
              <div className="fav-mobile__list">
                {favBankingTiers.map((item, i) => (
                  <MobileBankingRow
                    key={`${item.bankName}-${item.tier.name}`}
                    bankName={item.bankName}
                    bankColor={item.bankColor}
                    tier={item.tier}
                    index={i}
                  />
                ))}
              </div>
            ) : <MobileEmptyState type="banking" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   Swipeable wrapper — swipe left reveals "Remove" action
   ================================================================ */
function SwipeableRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  const x = useMotionValue(0);
  const actionOpacity = useTransform(x, [-80, -30, 0], [1, 0.4, 0]);
  const actionScale   = useTransform(x, [-80, -30, 0], [1, 0.85, 0.7]);

  return (
    <div className="fav-mobile-swipe">
      {/* Background action */}
      <motion.div className="fav-mobile-swipe__action" style={{ opacity: actionOpacity, scale: actionScale }}>
        <button className="fav-mobile-swipe__btn" onClick={onRemove} aria-label="Remove from favorites">
          <Trash2 className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Foreground draggable */}
      <motion.div
        className="fav-mobile-swipe__fg"
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        tabIndex={0}
        aria-label="Swipe left to remove, or press Delete key"
        onKeyDown={(e) => {
          if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            onRemove();
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ================================================================
   Card row
   ================================================================ */
const MobileCardRow = memo(function MobileCardRow({ card, index, onToggleFav }: {
  card: CardType; index: number; onToggleFav: () => void;
}) {
  const tier = TIER_CONFIG[card.type] || TIER_CONFIG.entry;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <SwipeableRow onRemove={onToggleFav}>
        <div className="fav-mobile-card">
          <Link to={`/cards/${card.id}`} className="fav-mobile-card__link">
            {/* Card image */}
            <div
              className="fav-mobile-card__img-wrap"
              style={{ background: `linear-gradient(135deg, ${card.color}20, ${card.color}08)` }}
            >
              {card.image ? (
                <CardImage src={card.image} alt={card.name} fallbackColor={card.color} className="fav-mobile-card__img" />
              ) : (
                <CreditCard className="fav-mobile-card__img-fallback" />
              )}
            </div>

            {/* Info */}
            <div className="fav-mobile-card__info">
              <h3 className="fav-mobile-card__name">{card.name}</h3>
              <p className="fav-mobile-card__meta">{card.issuer} · {card.network}</p>
              <div className="fav-mobile-card__details">
                <span>{card.fee}</span>
                <span className="fav-mobile-card__dot" />
                <span>{card.rewardRate}</span>
                {card.lounge && card.lounge !== "None" && (
                  <>
                    <span className="fav-mobile-card__dot" />
                    <span className="fav-mobile-card__lounge">{card.lounge}</span>
                  </>
                )}
              </div>
              <span
                className="fav-mobile-card__tier"
                style={{ backgroundColor: `hsl(var(${tier.cssVar}) / 0.09)`, color: tier.color, borderColor: `hsl(var(${tier.cssVar}) / 0.19)` }}
              >
                {tier.label}
              </span>
            </div>
          </Link>

          {/* Heart */}
          <div className="fav-mobile-card__fav">
            <FavoriteButton isFav onToggle={onToggleFav} size="sm" />
          </div>
        </div>
      </SwipeableRow>
    </motion.div>
  );
});

/* ================================================================
   Voucher row
   ================================================================ */
const MobileVoucherRow = memo(function MobileVoucherRow({ voucher, index, onToggleFav }: {
  voucher: Voucher; index: number; onToggleFav: () => void;
}) {
  const Icon = iconMap[voucher.category] || Gift;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <SwipeableRow onRemove={onToggleFav}>
        <div className="fav-mobile-voucher">
          <Link to={`/vouchers/${voucher.id}`} className="fav-mobile-voucher__link">
            <div className="fav-mobile-voucher__icon" style={{ backgroundColor: `${voucher.color}15` }}>
              <Icon style={{ color: voucher.color }} className="w-5 h-5" />
            </div>
            <div className="fav-mobile-voucher__info">
              <h3 className="fav-mobile-voucher__name">{voucher.name}</h3>
              <p className="fav-mobile-voucher__category">{voucher.category} · {voucher.discount}</p>
            </div>
            <div className="fav-mobile-voucher__rate">
              <span className="fav-mobile-voucher__best">{voucher.bestRate}</span>
              <span className="fav-mobile-voucher__label">best</span>
            </div>
          </Link>
          <div className="fav-mobile-voucher__fav">
            <FavoriteButton isFav onToggle={onToggleFav} size="sm" />
          </div>
        </div>
      </SwipeableRow>
    </motion.div>
  );
});

/* ================================================================
   Guide row
   ================================================================ */
const MobileGuideRow = memo(function MobileGuideRow({ guide, index, onToggleFav }: {
  guide: Guide; index: number; onToggleFav: () => void;
}) {
  const Icon = guide.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <div className="fav-mobile-guide">
        <Link to={`/guides/${guide.slug}`} className="fav-mobile-guide__link">
          <div className="fav-mobile-guide__icon" style={{ backgroundColor: `${guide.color}15` }}>
            <Icon style={{ color: guide.color }} className="w-5 h-5" />
          </div>
          <div className="fav-mobile-guide__info">
            <h3 className="fav-mobile-guide__title">{guide.title}</h3>
            <p className="fav-mobile-guide__meta">{guide.author} · {guide.readTime}</p>
          </div>
          <ChevronRight className="fav-mobile-guide__arrow" />
        </Link>
        <div className="fav-mobile-guide__fav">
          <FavoriteButton isFav onToggle={onToggleFav} size="sm" />
        </div>
      </div>
    </motion.div>
  );
});

/* ================================================================
   Banking row
   ================================================================ */
function MobileBankingRow({ bankName, bankColor, tier, index }: {
  bankName: string; bankColor: string;
  tier: { name: string; color: string; eligibility: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <div className="fav-mobile-guide">
        <Link to="/banking" className="fav-mobile-guide__link">
          <div className="fav-mobile-guide__icon" style={{ backgroundColor: `${bankColor}15` }}>
            <Landmark style={{ color: bankColor }} className="w-5 h-5" />
          </div>
          <div className="fav-mobile-guide__info">
            <h3 className="fav-mobile-guide__title">{bankName}</h3>
            <p className="fav-mobile-guide__meta">
              <span style={{ color: tier.color }}>{tier.name}</span> Tier
            </p>
          </div>
          <ChevronRight className="fav-mobile-guide__arrow" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ================================================================
   Empty state (mobile-sized)
   ================================================================ */
function MobileEmptyState({ type }: { type: TabId }) {
  const cfg: Record<TabId, { svg: React.ReactNode; title: string; desc: string; cta: string; href: string }> = {
    cards: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-mobile-empty__svg">
          <rect x="8" y="16" width="48" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M8 26h48" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="34" width="16" height="4" rx="2" fill="currentColor" opacity="0.2" />
        </svg>
      ),
      title: "No favorite cards yet",
      desc: "Browse cards and tap \u2665 to save them here",
      cta: "Browse Cards",
      href: "/cards",
    },
    vouchers: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-mobile-empty__svg">
          <rect x="8" y="14" width="48" height="36" rx="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        </svg>
      ),
      title: "No saved vouchers yet",
      desc: "Browse voucher rates and tap \u2665 to save your favorites",
      cta: "Browse Vouchers",
      href: "/",
    },
    guides: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-mobile-empty__svg">
          <path d="M14 8h28a4 4 0 014 4v40a4 4 0 01-4 4H14a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="currentColor" strokeWidth="2" />
          <path d="M18 20h20M18 28h14M18 36h18" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        </svg>
      ),
      title: "No favorite guides yet",
      desc: "Read our guides and tap \u2665 to save them for later",
      cta: "Browse Guides",
      href: "/guides",
    },
    banking: {
      svg: (
        <svg viewBox="0 0 64 64" fill="none" className="fav-mobile-empty__svg">
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
    <div className="fav-mobile-empty">
      <div className="fav-mobile-empty__icon">{c.svg}</div>
      <h3 className="fav-mobile-empty__title">{c.title}</h3>
      <p className="fav-mobile-empty__desc">{c.desc}</p>
      <Link to={c.href} className="fav-mobile-empty__cta">
        {c.cta}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
