import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, FileDown, Flame, ArrowRight, LayoutGrid, Sparkles,
  ArrowRightLeft, PlaneTakeoff, Star, IndianRupee, Trophy,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { cards, type CreditCard as CardType } from "@/data/cards";
import CompareCardSelector from "@/components/compare/CompareCardSelector";
import MobileCardSelector from "@/components/compare/MobileCardSelector";
import CompareStickyHeader from "@/components/compare/CompareStickyHeader";
import QuickVerdict from "@/components/compare/QuickVerdict";
import { getCompareCards } from "@/components/compare/CompareUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { playSound } from "@/lib/sounds";
import CardImage from "@/components/CardImage";
import { CardSlot } from "@/components/shared/CardSlot";
import { GoldPillTabs, type PillTab } from "@/components/shared/GoldPillTabs";
import { Switch } from "@/components/ui/switch";
import OverviewTab from "@/components/compare/tabs/OverviewTab";
import RewardsTab from "@/components/compare/tabs/RewardsTab";
import RedemptionTab from "@/components/compare/tabs/RedemptionTab";
import LoungeTab from "@/components/compare/tabs/LoungeTab";
import FeaturesTab from "@/components/compare/tabs/FeaturesTab";
import FeesTab from "@/components/compare/tabs/FeesTab";
import VerdictTab from "@/components/compare/tabs/VerdictTab";

const POPULAR_PAIRS: [string, string][] = [
  ["hdfc-diners-black", "axis-magnus"],
  ["hdfc-diners-black", "au-zenith-plus"],
  ["axis-magnus", "au-zenith-plus"],
  ["bpcl-sbi-octane", "flipkart-axis"],
  ["club-vistara-sbi", "axis-privilege"],
  ["au-zenith-plus", "bob-eterna"],
];

const QUICK_PAIRS: { label: string; ids: [string, string] }[] = [
  { label: "Infinia vs Atlas", ids: ["hdfc-infinia-metal", "axis-atlas"] },
  { label: "SBI Elite vs Regalia Gold", ids: ["sbi-elite", "hdfc-regalia-gold"] },
  { label: "Diners Black vs Magnus", ids: ["hdfc-diners-black", "axis-magnus"] },
  { label: "Zenith+ vs Eterna", ids: ["au-zenith-plus", "bob-eterna"] },
  { label: "AMEX Plat vs MRCC", ids: ["amex-platinum-travel", "amex-mrcc"] },
];

const TABS: PillTab[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "rewards", label: "Rewards", icon: Sparkles },
  { id: "redemption", label: "Redemption", icon: ArrowRightLeft },
  { id: "lounge", label: "Lounge", icon: PlaneTakeoff },
  { id: "features", label: "Features", icon: Star },
  { id: "fees", label: "Fees", icon: IndianRupee },
  { id: "verdict", label: "Verdict", icon: Trophy },
];

export default function CompareCards() {
  const isMobile = useIsMobile();
  const MAX_CARDS = isMobile ? 2 : 4;
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<CardType[]>(() => {
    const cardIds = searchParams.get("cards")?.split(",").filter(Boolean) || [];
    return cardIds.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as CardType[];
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const slotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected.length > 0) {
      setSearchParams({ cards: selected.map((c) => c.id).join(",") }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selected, setSearchParams]);

  useEffect(() => {
    const el = slotsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting && selected.length >= 2),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selected.length]);

  const addCard = (card: CardType) => {
    if (selected.length < MAX_CARDS) { playSound("pop"); setSelected([...selected, card]); }
  };
  const removeCard = (id: string) => { playSound("pop"); setSelected(selected.filter((c) => c.id !== id)); };
  const selectPair = (pair: CardType[]) => setSelected(pair);

  const shareComparison = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const exportPDF = () => {
    document.title = `CardPerks \u2014 ${selected.map((c) => c.name).join(" vs ")}`;
    window.print();
    setTimeout(() => {
      document.title = "Compare Credit Cards Side by Side | CardPerks";
    }, 2000);
  };

  const emptySlots = MAX_CARDS - selected.length;
  const compareCards = getCompareCards(selected);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab compareCards={compareCards} />;
      case "rewards": return <RewardsTab compareCards={compareCards} />;
      case "redemption": return <RedemptionTab compareCards={compareCards} />;
      case "lounge": return <LoungeTab compareCards={compareCards} />;
      case "features": return <FeaturesTab compareCards={compareCards} />;
      case "fees": return <FeesTab compareCards={compareCards} />;
      case "verdict": return <VerdictTab compareCards={compareCards} />;
      default: return null;
    }
  };

  return (
    <PageLayout>
      <SEO
        fullTitle="Compare Credit Cards Side by Side | CardPerks"
        description="Compare up to 4 premium credit cards side by side. Analyze rewards, fees, lounge access, and perks."
        path="/compare"
      />

      <AnimatePresence>
        <CompareStickyHeader selected={selected} onRemove={removeCard} visible={stickyVisible} />
      </AnimatePresence>

      <section className="py-10 md:py-12 pb-32 md:pb-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative">
          {/* Breadcrumb */}
          <nav className="flex justify-center items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground/50 mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-foreground/20">&rsaquo;</span>
            <span>Compare Cards</span>
          </nav>

          {/* Hero */}
          <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Compare Cards <span className="gold-gradient">Side by Side</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              See exactly which card wins for rewards, fees, lounges, and more.
            </p>

            {selected.length >= 2 && (
              <div className="flex justify-center gap-4 mt-8 print-hide">
                <button onClick={shareComparison} className="flex items-center gap-2 bg-white/5 dark:bg-white/5 bg-secondary/10 border border-border/10 dark:border-white/10 px-6 py-2 rounded-lg text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 transition-all">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={exportPDF} className="flex items-center gap-2 bg-white/5 dark:bg-white/5 bg-secondary/10 border border-border/10 dark:border-white/10 px-6 py-2 rounded-lg text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 transition-all">
                  <FileDown className="w-4 h-4" /> Export PDF
                </button>
              </div>
            )}

            {/* Quick-start pills */}
            {selected.length === 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {QUICK_PAIRS.map(({ label, ids }) => {
                  const pair = ids.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as CardType[];
                  if (pair.length < 2) return null;
                  return (
                    <motion.button key={label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => selectPair(pair)}
                      className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
                    >{label}</motion.button>
                  );
                })}
              </div>
            )}
          </motion.header>

          {/* Card selection slots */}
          <motion.div
            ref={slotsRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-4 mb-10 flex-wrap"
          >
            {selected.map((card) => (
              <CardSlot
                key={card.id}
                card={{ id: card.id, name: card.name, bank: card.issuer, image: card.image }}
                onRemove={() => removeCard(card.id)}
                size={isMobile ? "sm" : "md"}
                className={isMobile ? "w-[calc(50%-0.5rem)]" : ""}
              />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) =>
              isMobile ? (
                <MobileCardSelector key={`empty-${i}`} cards={cards} onSelect={addCard} selectedIds={selected.map((c) => c.id)} slotIndex={selected.length + i} />
              ) : (
                <CompareCardSelector key={`empty-${i}`} cards={cards} onSelect={addCard} selectedIds={selected.map((c) => c.id)} slotIndex={selected.length + i} />
              )
            )}
          </motion.div>

          {/* AI Executive Summary */}
          {selected.length >= 2 && <QuickVerdict compareCards={compareCards} />}

          {/* Tab Controls */}
          {selected.length >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex justify-between items-center mb-8 bg-white/5 dark:bg-white/5 bg-secondary/5 p-1.5 rounded-full border border-border/5 dark:border-white/5"
            >
              <GoldPillTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} layoutId="compare-tabs" className="!bg-transparent !border-0 w-full md:w-auto" />
              <div className="hidden md:flex items-center gap-3 px-6 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Only differences</span>
                <Switch checked={showOnlyDiffs} onCheckedChange={setShowOnlyDiffs} />
              </div>
            </motion.div>
          )}

          {/* Comparison table */}
          {selected.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className={showOnlyDiffs ? "only-diffs" : ""}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Empty states */}
          {selected.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
              <p className="text-xl font-serif mb-2">Select at least 2 cards to compare</p>
              <p className="text-sm">Pick from {cards.length}+ cards above, or try a popular comparison</p>
            </motion.div>
          )}
          {selected.length === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <p className="text-sm text-muted-foreground">Select one more card to start comparing</p>
            </motion.div>
          )}

          {/* CTA */}
          {selected.length >= 2 && (
            <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 bg-gradient-to-r from-surface-1 to-surface-2 dark:from-[hsl(225,15%,8%)] dark:to-[hsl(225,15%,11%)] rounded-3xl border border-border/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Ready to upgrade your wallet?</h2>
                <p className="text-muted-foreground/70 text-base max-w-xl leading-relaxed">Find the perfect card match based on your spending patterns and lifestyle.</p>
              </div>
              <Link to="/find-my-card" className="relative z-10 gold-btn px-8 md:px-10 py-4 md:py-5 font-bold rounded-xl uppercase tracking-[0.2em] text-xs hover:scale-[1.03] active:scale-95 transition-all shadow-2xl whitespace-nowrap inline-flex items-center gap-2">
                Find My Card <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Popular comparisons */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-xl font-bold">Popular Comparisons</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {POPULAR_PAIRS.map(([a, b]) => {
                const c1 = cards.find((c) => c.id === a);
                const c2 = cards.find((c) => c.id === b);
                if (!c1 || !c2) return null;
                return (
                  <motion.button key={`${a}-${b}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => selectPair([c1, c2])}
                    className="bg-surface-1 dark:bg-[hsl(225,15%,9%)] rounded-2xl p-5 border border-border/10 dark:border-white/5 hover:border-primary/30 transition-all min-w-[220px] shrink-0 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-[30px] rounded-lg overflow-hidden shrink-0 shadow-md ring-1 ring-border/20 dark:ring-white/10">
                        {c1.image ? <CardImage src={c1.image} alt="" fallbackColor={c1.color} /> : <div className="w-full h-full" style={{ background: c1.color }} />}
                      </div>
                      <span className="text-xs font-bold truncate">{c1.name.split(" ").slice(-2).join(" ")}</span>
                    </div>
                    <div className="flex items-center justify-center my-2">
                      <span className="text-[9px] font-bold tracking-widest text-muted-foreground bg-secondary/30 dark:bg-white/5 px-3 py-1 rounded-full font-label uppercase">VS</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-[30px] rounded-lg overflow-hidden shrink-0 shadow-md ring-1 ring-border/20 dark:ring-white/10">
                        {c2.image ? <CardImage src={c2.image} alt="" fallbackColor={c2.color} /> : <div className="w-full h-full" style={{ background: c2.color }} />}
                      </div>
                      <span className="text-xs font-bold truncate">{c2.name.split(" ").slice(-2).join(" ")}</span>
                    </div>
                    <span className="mt-2 text-[10px] text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest font-label">
                      Compare <ArrowRight className="w-3 h-3" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile sticky actions */}
          {isMobile && selected.length >= 2 && (
            <div className="fixed bottom-[72px] left-0 right-0 z-30 px-4 pb-3 print-hide">
              <div className="flex gap-2">
                <button onClick={shareComparison} className="flex-1 py-3.5 rounded-xl gold-btn text-xs font-bold flex items-center justify-center gap-2 shadow-xl uppercase tracking-widest">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button onClick={exportPDF} className="py-3.5 px-5 rounded-xl bg-secondary/10 dark:bg-white/5 border border-border/10 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
                  <FileDown className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <BackToTop />
    </PageLayout>
  );
}
