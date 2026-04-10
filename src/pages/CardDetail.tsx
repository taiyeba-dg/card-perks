import { useEffect, useMemo, useRef, useState } from "react";
import CardImage from "@/components/CardImage";
import { useParams, Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { motion } from "framer-motion";
import { Star, Check, Wallet, ChevronRight, Home, Share2, GitCompareArrows, ExternalLink } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import BackToTop from "@/components/BackToTop";
import FavoriteButton from "@/components/FavoriteButton";
import SEO from "@/components/SEO";
import StickySubNav from "@/components/StickySubNav";
import { getCardById, cards } from "@/data/cards";
import { getMasterCard } from "@/data/card-v3-master";
import { useCardsV3 } from "@/hooks/use-cards-v3";
import type { CardV3 } from "@/data/card-v3-unified-types";
import { v3ToLegacyCard, cardV3ToV3Data } from "@/data/card-v3-transforms";
import { useMyCards } from "@/hooks/use-my-cards";
import { useFavorites } from "@/hooks/use-favorites";
import ShareCardModal, { ShareCardCanvas } from "@/components/ShareCardModal";
import { haptic } from "@/lib/haptics";
import { getCardLoungeAccess, getLoungeProgram } from "@/data/lounge-programs";
import { playSound } from "@/lib/sounds";
import MobileCardDetailLayout from "@/components/card-detail/MobileCardDetailLayout";
import DesktopCardDetailLayout from "@/components/card-detail/DesktopCardDetailLayout";
import SpecialOffersCarousel from "@/components/card-detail/SpecialOffersCarousel";
import CategoryRewardsSection from "@/components/card-detail/CategoryRewardsSection";
import PortalEarningSection from "@/components/card-detail/PortalEarningSection";
import RedemptionSpectrumSection from "@/components/card-detail/RedemptionSpectrumSection";
import TransferPartnersSection from "@/components/card-detail/TransferPartnersSection";
import FeeWorthSection from "@/components/card-detail/FeeWorthSection";
import UpgradePathSection from "@/components/card-detail/UpgradePathSection";
import EnhancedSimilarCards from "@/components/card-detail/EnhancedSimilarCards";
import CardDetailPersonalization from "@/components/card-detail/CardDetailPersonalization";
import EligibilitySection from "@/components/card-detail/EligibilitySection";
import ExpandedFeesSection from "@/components/card-detail/ExpandedFeesSection";
import LifestylePerksSection from "@/components/card-detail/LifestylePerksSection";
import RewardPointsInfoBox from "@/components/card-detail/RewardPointsInfoBox";
import DeepLinkCTA, { DeepLinkGroup } from "@/components/DeepLinkCTA";

function generateProsAndCons(card: NonNullable<ReturnType<typeof getCardById>>) {
  const pros: string[] = [];
  const cons: string[] = [];
  if (card.lounge === "Unlimited") pros.push("Unlimited lounge access");
  else if (card.lounge.includes("8")) pros.push("8 lounge visits/quarter");
  else if (card.lounge.includes("4")) pros.push("4 lounge visits/quarter");
  if (parseFloat(card.rewards) >= 3) pros.push(`${card.rewards} reward value`);
  if (parseFloat(card.forexMarkup) <= 2) pros.push(`Low ${card.forexMarkup} forex markup`);
  if (card.insurance.length >= 3) pros.push("Comprehensive insurance coverage");
  if (card.welcomeBonus) pros.push(`Welcome bonus: ${card.welcomeBonus}`);
  const fee = parseInt(card.fee.replace(/[₹,]/g, ""));
  if (fee >= 10000) cons.push(`High annual fee of ${card.fee}`);
  const income = parseInt(card.minIncome.replace(/[₹L+/year,]/g, ""));
  if (income >= 20) cons.push(`Requires ${card.minIncome} income`);
  if (parseFloat(card.forexMarkup) >= 3) cons.push(`${card.forexMarkup} forex markup`);
  if (card.lounge.includes("2/year")) cons.push("Limited lounge access (2/year)");
  return { pros: pros.slice(0, 4), cons: cons.slice(0, 3) };
}

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const rawCard = getCardById(id || "");
  const { getCardById: getFullV3 } = useCardsV3();
  const fullV3 = getFullV3(id || "");
  // Prefer adapter from full V3 data (180 cards), fall back to hardcoded enrichment (10 cards)
  const v3 = useMemo(() => fullV3 ? cardV3ToV3Data(fullV3) : getMasterCard(id || "")?.enrichment, [fullV3, id]);
  const { toggle: toggleMyCard, has: isMyCard } = useMyCards();
  const { toggle: toggleFav, isFav } = useFavorites("card");
  const heroRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Phase 1: Enrich card with V3 data — fills blank detail fields
  const card = useMemo(() => {
    if (!rawCard) return rawCard;
    if (!fullV3) return rawCard;
    const v3Card = v3ToLegacyCard(fullV3);
    return {
      ...rawCard,
      minIncome: v3Card.minIncome || rawCard.minIncome,
      welcomeBonus: v3Card.welcomeBonus || rawCard.welcomeBonus,
      fuelSurcharge: v3Card.fuelSurcharge || rawCard.fuelSurcharge,
      forexMarkup: v3Card.forexMarkup || rawCard.forexMarkup,
      rewardRate: v3Card.rewardRate || rawCard.rewardRate,
      milestones: v3Card.milestones.length > 0 ? v3Card.milestones : rawCard.milestones,
      insurance: v3Card.insurance.length > 0 ? v3Card.insurance : rawCard.insurance,
      perks: v3Card.perks[0] !== "See full details" ? v3Card.perks : rawCard.perks,
      vouchers: v3Card.vouchers.length > 0 ? v3Card.vouchers : rawCard.vouchers,
      bestFor: v3Card.bestFor.length > 0 ? v3Card.bestFor : rawCard.bestFor,
    };
  }, [rawCard, fullV3]);

  const CARD_SUBNAV = [
    { id: "cd-overview",   label: "Overview" },
    { id: "cd-rewards",    label: "Rewards" },
    { id: "cd-fees",       label: "Fees" },
    { id: "cd-benefits",   label: "Benefits" },
    { id: "cd-compare",    label: "Compare" },
  ];

  const similarCards = (() => {
    // Use V3 related cards if available
    if (v3 && v3.relatedCardIds.length > 0) {
      return v3.relatedCardIds.map((rid) => cards.find((c) => c.id === rid)).filter(Boolean) as typeof cards;
    }
    const sameType = cards.filter((c) => c.id !== id && c.type === card?.type);
    if (sameType.length >= 3) return sameType.slice(0, 3);
    const sameIssuer = cards.filter((c) => c.id !== id && c.issuer === card?.issuer);
    const combined = [...new Map([...sameType, ...sameIssuer].map((c) => [c.id, c])).values()];
    if (combined.length >= 3) return combined.slice(0, 3);
    return [...combined, ...cards.filter((c) => c.id !== id && !combined.find((x) => x.id === c.id))].slice(0, 3);
  })();

  const { record } = useRecentlyViewed();

  useEffect(() => {
    if (card) {
      document.title = `${card.name} | CardPerks`;
      record({ id: card.id, type: "card", name: card.name, image: card.image, color: card.color, href: `/cards/${card.id}` });
    }
    return () => { document.title = "CardPerks"; };
  }, [card?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!card) {
    return (
      <PageLayout>
        <div className="py-32 text-center">
          <p className="text-lg text-muted-foreground">Card not found</p>
          <Link to="/cards" className="text-gold text-sm mt-4 inline-block">← Back to Cards</Link>
        </div>
      </PageLayout>
    );
  }

  // Use V3 native pros/cons when available, fall back to generated
  const { pros: genPros, cons: genCons } = generateProsAndCons(card);
  const pros = fullV3?.metadata.pros?.length ? fullV3.metadata.pros : genPros;
  const cons = fullV3?.metadata.cons?.length ? fullV3.metadata.cons : genCons;

  return (
    <PageLayout>
      <SEO
        fullTitle={`${card.name} — Perks, Fees & Benefits | CardPerks`}
        description={`Explore ${card.name} benefits: ${card.rewards} rewards, ${card.lounge} lounge access, and more. Annual fee ₹${card.fee?.toLocaleString() ?? "N/A"}.`}
        path={`/cards/${card.id}`}
      />
      <StickySubNav items={CARD_SUBNAV} triggerRef={heroRef} />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-gold transition-colors flex items-center gap-1"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/cards" className="hover:text-gold transition-colors">Know Your Cards</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-[140px] sm:max-w-none">{card.name}</span>
          </nav>

          {/* Hero: card image left, data right */}
          <motion.div ref={heroRef} id="cd-overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left: Card image + quick actions */}
              <div className="w-full lg:w-[340px] flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative aspect-[5/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                    {card.image ? (
                      <CardImage src={card.image} alt={`${card.name} credit card`} fallbackColor={card.color} fit="cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}66, ${card.color}33)` }}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                        <div className="absolute bottom-4 left-5">
                          <p className="text-xs text-white/50 font-medium tracking-widest uppercase">{card.issuer}</p>
                          <p className="text-sm text-white/80 font-semibold mt-0.5">{card.name}</p>
                        </div>
                        <div className="absolute top-4 right-5 text-white/40 text-[10px] font-medium tracking-wider uppercase">{card.network}</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  </motion.div>

                  {/* Actions under card */}
                  <div className="flex items-center gap-2 mt-4">
                    <FavoriteButton isFav={isFav(card.id)} onToggle={() => toggleFav(card.id)} className="bg-secondary/50 hover:bg-secondary/80" />
                    <button onClick={() => setShareOpen(true)} className="w-8 h-8 rounded-lg bg-secondary/50 hover:bg-secondary/80 flex items-center justify-center transition-colors" title="Share">
                      <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <Link
                      to={`/compare?cards=${card.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/30 hover:border-gold/30 text-xs text-muted-foreground hover:text-gold transition-colors ml-auto"
                    >
                      <GitCompareArrows className="w-3.5 h-3.5" /> Compare
                    </Link>
                  </div>

                  {/* Devaluation warning */}
                  {fullV3?.rewards.devaluationNote && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                      <p className="text-xs text-amber-400">⚠️ <span className="font-semibold">Devaluation Alert:</span> {fullV3.rewards.devaluationNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Card info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{card.issuer} · {card.type}</p>
                <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">{card.name}</h1>

                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-gold/10 px-3 py-1.5 rounded-xl">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm font-semibold">{card.rating}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground">{fullV3?.network || card.network}</span>
                  {fullV3?.features.cardMaterial === "metal" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold border border-gold/30">Metal</span>
                  )}
                  {fullV3?.features.contactless && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">Contactless</span>
                  )}
                </div>

                {/* Key stats — 2x2 grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-card rounded-xl p-4" style={{ background: `${card.color}06` }}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Annual Fee</p>
                    <p className="text-lg font-bold text-gold">{card.fee || "N/A"}</p>
                    {fullV3?.fees.waiverText && <p className="text-[10px] text-green-400 mt-1">{fullV3.fees.waiverText}</p>}
                  </div>
                  <div className="glass-card rounded-xl p-4" style={{ background: `${card.color}06` }}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Reward Rate</p>
                    <p className="text-lg font-bold text-gold">{card.rewards || "N/A"}</p>
                    {fullV3?.rewards.baseRateLabel && <p className="text-[10px] text-muted-foreground mt-1">{fullV3.rewards.baseRateLabel}</p>}
                  </div>
                  <div className="glass-card rounded-xl p-4" style={{ background: `${card.color}06` }}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Lounge Access</p>
                    <p className="text-lg font-bold text-gold">{card.lounge || "None"}</p>
                    {(() => {
                      const loungeAccess = getCardLoungeAccess(card.id);
                      if (loungeAccess && loungeAccess.programs.length > 0) {
                        const primary = loungeAccess.programs[0];
                        const network = getLoungeProgram(primary.programId);
                        return network ? (
                          <p className="text-[10px] text-muted-foreground mt-1">via {network.name} ({network.accessMethod})</p>
                        ) : null;
                      }
                      if (fullV3?.features.lounge?.domestic && typeof fullV3.features.lounge.domestic === "object" && fullV3.features.lounge.domestic.accessVia) {
                        return <p className="text-[10px] text-muted-foreground mt-1">via {fullV3.features.lounge.domestic.accessVia}</p>;
                      }
                      return null;
                    })()}
                  </div>
                  <div className="glass-card rounded-xl p-4" style={{ background: `${card.color}06` }}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Forex Markup</p>
                    <p className="text-lg font-bold text-gold">{card.forexMarkup || "N/A"}</p>
                    {fullV3?.features.forex?.zeroMarkup && <p className="text-[10px] text-green-400 mt-1">Zero Markup</p>}
                  </div>
                </div>

                {/* Verdict */}
                {fullV3?.metadata.verdict && (
                  <p className="text-sm italic text-muted-foreground mb-6 leading-relaxed border-l-2 border-gold/30 pl-4">"{fullV3.metadata.verdict}"</p>
                )}

                {/* Best For, Pros/Cons, Key Perks */}
                <MobileCardDetailLayout card={card} pros={pros} cons={cons} />
                <DesktopCardDetailLayout card={card} pros={pros} cons={cons} />
              </div>
            </div>
          </motion.div>

          {/* Special Offers Carousel */}
          {v3 && v3.specialOffers.length > 0 && <SpecialOffersCarousel offers={v3.specialOffers} />}

          {/* Personalized stats */}
          <CardDetailPersonalization card={card} v3={v3} />

          {/* Reward Points Info Box */}
          {fullV3 && <RewardPointsInfoBox card={fullV3} />}

          {/* V3 Enrichment + Phase 4 Sections — unified block */}
          {v3 && (
            <div id="cd-rewards" className="space-y-4 mb-8">
              <CategoryRewardsSection v3={v3} />
              <PortalEarningSection v3={v3} />
              <RedemptionSpectrumSection v3={v3} cardId={card.id} />
              <TransferPartnersSection v3={v3} />
            </div>
          )}

          <div id="cd-fees" className="space-y-4 mb-8">
            {fullV3 && <ExpandedFeesSection card={fullV3} />}
            {v3 && <FeeWorthSection v3={v3} cardId={card.id} cardFee={card.fee} />}
          </div>

          <div id="cd-benefits" className="space-y-4 mb-8">
            {fullV3 && <EligibilitySection card={fullV3} />}
            {fullV3 && <LifestylePerksSection card={fullV3} />}
            {v3 && <UpgradePathSection v3={v3} currentCardId={card.id} />}
          </div>

          {/* Restrictions footnotes */}
          {fullV3?.features.restrictions && typeof fullV3.features.restrictions === "object" && Object.keys(fullV3.features.restrictions as Record<string, unknown>).length > 0 && (
            <div className="mb-8 px-4 py-3 rounded-xl bg-secondary/20 border border-border/20">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Restrictions & Notes</p>
              <div className="space-y-1">
                {Object.entries(fullV3.features.restrictions as Record<string, string>).map(([key, value]) => (
                  <p key={key} className="text-[11px] text-muted-foreground">
                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>: {value}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Deep links + Similar Cards */}
          <DeepLinkGroup className="mb-6">
            <DeepLinkCTA to="/find-my-card" emoji="📱" title="Find the best card for your spending" subtitle="Take the quiz and get personalized recommendations" />
            {similarCards.length > 0 && (
              <DeepLinkCTA to={`/compare?cards=${card.id},${similarCards[0].id}`} emoji="⚔️" title={`Compare with ${similarCards[0].name}`} subtitle="Head-to-head side by side" />
            )}
          </DeepLinkGroup>

          <div id="cd-compare">
            <EnhancedSimilarCards card={card} similarCards={similarCards} />
          </div>

          {/* Sticky CTA — Section 9 Enhanced */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="sticky bottom-[72px] lg:bottom-6 z-30">
            <div className="glass-card rounded-2xl border border-gold/20 shadow-2xl shadow-gold/10 backdrop-blur-xl p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 sm:w-10 aspect-[5/3] rounded-lg overflow-hidden shadow-md flex-shrink-0">
                  {card.image ? (
                    <CardImage src={card.image} alt={`${card.name} credit card`} fallbackColor={card.color} />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />
                  )}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-semibold truncate">{card.name}</p>
                  <p className="text-[10px] text-muted-foreground">{card.fee}/yr</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">

                {/* Compare */}
                <Link
                  to={`/compare?cards=${card.id}`}
                  className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl border border-border/30 hover:border-gold/30 text-[10px] sm:text-xs text-muted-foreground hover:text-gold transition-colors"
                  title="Compare"
                >
                  <GitCompareArrows className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compare</span>
                </Link>

                {/* Apply link */}
                {v3?.applyLink && (
                  <a
                    href={v3.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl gold-btn text-[10px] sm:text-xs font-semibold"
                    title="Apply"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Apply</span>
                  </a>
                )}

                {/* Add to My Cards */}
                <button
                  onClick={() => {
                    const adding = !isMyCard(card.id);
                    haptic(adding ? "confirm" : "light");
                    playSound(adding ? "chime" : "tap");
                    toggleMyCard(card.id);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isMyCard(card.id) ? "bg-gold/15 text-gold border border-gold/30" : "gold-btn"
                  }`}
                >
                  {isMyCard(card.id) ? <><Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">In My Cards</span></> : <><Wallet className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Add</span></>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <BackToTop />

      <div style={{ position: "fixed", top: 0, left: "-9999px", pointerEvents: "none", zIndex: -1, visibility: "hidden" }} aria-hidden="true">
        <ShareCardCanvas card={card} />
      </div>

      <ShareCardModal card={card} open={shareOpen} onClose={() => setShareOpen(false)} />
    </PageLayout>
  );
}
