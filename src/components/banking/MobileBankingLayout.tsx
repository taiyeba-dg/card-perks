import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Users, Check, ChevronDown, Building2 } from "lucide-react";
import { banks, type BankData, type BankingTier } from "@/data/banking";
import { BANK_COLORS } from "@/data/color-schemes";

interface Props {
  activeSection: "wealth" | "family";
  setActiveSection: (s: "wealth" | "family") => void;
  heroRef: React.RefObject<HTMLDivElement>;
}

const familyData: { bank: string; color: string; members: string; requirement: string; benefits: string[]; howToApply: string }[] = [
  { bank: "HDFC Bank", color: BANK_COLORS.hdfc, members: "Up to 8 family members", requirement: "Combined AMB for Imperia", benefits: ["Shared lounge access for all members", "Single RM for entire family", "Pooled FD + Savings for tier qualification", "Joint locker facility at preferential rates", "Family debit cards on same account", "Consolidated wealth statements", "Priority branch servicing for all", "Shared lifestyle & golf benefits"], howToApply: "Visit your home branch with family KYC documents and request Family Banking enrollment under Imperia." },
  { bank: "ICICI Bank", color: BANK_COLORS.icici, members: "Up to 5 members, NRV ₹25L", requirement: "Pooled NRV for Wealth tier", benefits: ["Combined NRV across family accounts", "Shared Wealth tier privileges", "Single relationship manager", "Family travel insurance cover", "Joint investment advisory"], howToApply: "Request through your RM or iMobile app under Wealth Management > Family Banking." },
  { bank: "Axis Bank", color: BANK_COLORS.axis, members: "NRV ₹30L combined", requirement: "Combined balance for Burgundy", benefits: ["Pooled balances for Burgundy qualification", "Shared lounge & golf benefits", "Family concierge access", "Joint preferential loan rates", "Combined rewards pooling"], howToApply: "Apply through Burgundy relationship manager or visit a Burgundy-enabled branch." },
  { bank: "Kotak Mahindra", color: BANK_COLORS.kotak, members: "Family pooling available", requirement: "Privy League Signature pooling", benefits: ["Family balance pooling for Privy League", "Shared locker & lounge benefits", "Combined FD for higher rates", "Family investment portfolio view"], howToApply: "Contact your Privy League RM or apply through Kotak net banking." },
  { bank: "SBI", color: BANK_COLORS.sbi, members: "Limited family features", requirement: "Basic family account linking", benefits: ["Joint account facilities", "Family FD benefits", "Linked accounts view", "Nomination management"], howToApply: "Visit your home branch for joint account or family linking options." },
];

function TierContent({ tier }: { tier: BankingTier }) {
  const [eligOpen, setEligOpen] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const visibleBenefits = showAllBenefits ? tier.benefits : tier.benefits.slice(0, 4);
  const hiddenCount = tier.benefits.length - 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass-card rounded-2xl p-4 border border-border/20 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: tier.color }} />
        <h4 className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</h4>
        {tier.hasRM && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-gold/10 text-gold font-semibold">RM</span>}
      </div>

      <button
        onClick={() => setEligOpen(!eligOpen)}
        className="w-full text-left rounded-xl p-3 border border-border/15 transition-colors active:bg-secondary/20"
        style={{ background: `${tier.color}08` }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Eligibility</span>
          <span className="text-[9px] text-muted-foreground/60">{eligOpen ? "Collapse" : "Tap to expand"}</span>
        </div>
        <AnimatePresence>
          {eligOpen && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-[11px] text-muted-foreground leading-relaxed mt-2 overflow-hidden"
            >
              {tier.eligibility}
            </motion.p>
          )}
        </AnimatePresence>
      </button>

      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Benefits</p>
        <ul className="space-y-1.5">
          {visibleBenefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Check className="w-3 h-3 flex-shrink-0 mt-0.5 text-gold" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
        {hiddenCount > 0 && !showAllBenefits && (
          <button onClick={() => setShowAllBenefits(true)} className="text-[10px] text-gold font-semibold mt-2 active:opacity-70">
            +{hiddenCount} more
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tier.eligibleCards.map((card) => (
          <span key={card} className="text-[9px] px-2 py-1 rounded-lg bg-secondary/30 text-foreground font-medium">{card}</span>
        ))}
      </div>

      {tier.keyTakeaways.length > 0 && (
        <div className="rounded-xl p-3 bg-gold/5 border border-gold/10">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gold mb-1.5">Key Takeaways</p>
          <ul className="space-y-1">
            {tier.keyTakeaways.map((t, i) => (
              <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Gem className="w-2.5 h-2.5 text-gold flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function WealthSection() {
  const [activeBankIdx, setActiveBankIdx] = useState(0);
  const [activeTierIdx, setActiveTierIdx] = useState(0);
  const bank = banks[activeBankIdx];
  const tier = bank.tiers[activeTierIdx];

  const handleBankChange = (idx: number) => {
    setActiveBankIdx(idx);
    setActiveTierIdx(0);
  };

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }} className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {banks.map((b, i) => (
          <button
            key={b.id}
            onClick={() => handleBankChange(i)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border ${
              i === activeBankIdx
                ? "border-gold text-gold bg-gold/10"
                : "border-border/20 text-muted-foreground bg-secondary/20 active:bg-secondary/40"
            }`}
          >
            <Building2 className="w-3 h-3" />
            {b.name.replace(/ Bank| Mahindra Bank| of India/g, "")}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory -mx-1 px-1">
        {bank.tiers.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActiveTierIdx(i)}
            className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
              i === activeTierIdx
                ? "border-gold/60 text-gold bg-gold/10"
                : "border-border/15 text-muted-foreground bg-secondary/15 active:bg-secondary/30"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <TierContent key={`${bank.id}-${tier.name}`} tier={tier} />
      </AnimatePresence>
    </motion.div>
  );
}

function FamilyCard({ data }: { data: typeof familyData[number] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? data.benefits : data.benefits.slice(0, 4);
  const hiddenCount = data.benefits.length - 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 border border-border/20 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: data.color }} />
        <h4 className="text-sm font-bold">{data.bank}</h4>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[9px] px-2 py-1 rounded-lg bg-gold/10 text-gold font-semibold">{data.members}</span>
        <span className="text-[9px] px-2 py-1 rounded-lg bg-secondary/30 text-muted-foreground font-medium">{data.requirement}</span>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Benefits</p>
        <ul className="space-y-1.5">
          {visible.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Check className="w-3 h-3 flex-shrink-0 mt-0.5 text-gold" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
        {hiddenCount > 0 && !showAll && (
          <button onClick={() => setShowAll(true)} className="text-[10px] text-gold font-semibold mt-2 active:opacity-70">
            +{hiddenCount} more
          </button>
        )}
      </div>

      <div className="rounded-xl p-3 bg-secondary/10 border border-border/10">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">How to Apply</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{data.howToApply}</p>
      </div>
    </motion.div>
  );
}

function FamilySection() {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="space-y-3">
      {familyData.map((d) => (
        <FamilyCard key={d.bank} data={d} />
      ))}
    </motion.div>
  );
}

export default function MobileBankingLayout({ activeSection, setActiveSection, heroRef }: Props) {
  return (
    <div className="md:hidden pb-24">
      <div ref={heroRef} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Gem className="w-4 h-4 text-gold" />
          <h1 className="font-serif text-lg font-bold tracking-tight">
            Banking <span className="text-gold">Guides</span>
          </h1>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">Compare wealth tiers and family programs across top Indian banks.</p>
      </div>

      <div className="relative flex p-0.5 rounded-xl bg-secondary/30 border border-border/20 mb-5">
        {([
          { key: "wealth" as const, icon: Gem, label: "Wealth" },
          { key: "family" as const, icon: Users, label: "Family" },
        ]).map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`relative flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeSection === s.key ? "text-background" : "text-muted-foreground"
            }`}
          >
            {activeSection === s.key && (
              <motion.span
                layoutId="mobile-banking-tab"
                className="absolute inset-0 rounded-lg bg-gold shadow-md shadow-gold/15"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5"><s.icon className="w-3 h-3" /> {s.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === "wealth" ? (
          <WealthSection key="wealth" />
        ) : (
          <FamilySection key="family" />
        )}
      </AnimatePresence>
    </div>
  );
}
