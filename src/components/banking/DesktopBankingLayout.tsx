import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gem,
  Users,
  Check,
  X,
  ChevronDown,
  Building2,
  Crown,
  Shield,
} from "lucide-react";
import { banks, type BankData, type BankingTier } from "@/data/banking";

interface Props {
  activeSection: "wealth" | "family";
  setActiveSection: (s: "wealth" | "family") => void;
  heroRef: React.RefObject<HTMLDivElement>;
}

/* ── helpers ─────────────────────────────────────────────── */

function extractMinBalance(elig: string): string {
  return elig.match(/₹[\d,.]+\s*(?:Lakhs?|Crores?|Cr)?/i)?.[0] ?? "—";
}

function extractLounge(benefits: string[], keyword: "domestic" | "international"): string {
  const hit = benefits.find(
    (b) => new RegExp(keyword, "i").test(b) && /lounge/i.test(b)
  );
  if (!hit) {
    // fallback: generic lounge line
    if (keyword === "domestic") {
      const generic = benefits.find((b) => /lounge/i.test(b) && !/international/i.test(b));
      if (generic) return /unlimited/i.test(generic) ? "Unlimited" : generic.match(/(\d+\/year)/)?.[1] ?? "Yes";
    }
    return "—";
  }
  if (/unlimited/i.test(hit)) return "Unlimited";
  return hit.match(/(\d+\/year)/)?.[1] ?? "Yes";
}

/* ── family data (hardcoded) ─────────────────────────────── */

interface FamilyCard {
  bank: string;
  color: string;
  eligibility: string;
  members: string[];
  benefits: string[];
  howToApply: string;
}

const familyData: FamilyCard[] = [
  {
    bank: "HDFC Bank",
    color: "#003D8F",
    eligibility: "Imperia / Private Banking customers eligible for family pooling",
    members: ["Spouse", "Children", "Parents", "Siblings", "In-laws", "Grandparents", "Grandchildren", "Domestic Partner"],
    benefits: [
      "Pool balances across 8 family members",
      "Shared lounge access privileges",
      "Common Relationship Manager for the family",
      "Family locker allocation benefits",
    ],
    howToApply: "Visit your Imperia / Private Banking branch with family KYC documents.",
  },
  {
    bank: "ICICI Bank",
    color: "#F58220",
    eligibility: "NRV of ₹25 Lakhs across family accounts for Wealth tier",
    members: ["Spouse", "Children", "Parents", "Siblings", "In-laws"],
    benefits: [
      "Pool NRV across 5 family members",
      "Shared Sapphiro debit card benefits",
      "Single RM for all family accounts",
      "Preferential rates extended to family",
    ],
    howToApply: "Request via your Wealth RM or ICICI Wealth branch.",
  },
  {
    bank: "Axis Bank",
    color: "#97144D",
    eligibility: "₹30 Lakhs combined NRV for Burgundy family banking",
    members: ["Spouse", "Children", "Parents", "Siblings"],
    benefits: [
      "Combined NRV ₹30L qualifies entire family",
      "Shared Burgundy lounge & golf privileges",
      "Family Burgundy debit cards",
      "Common RM across family accounts",
    ],
    howToApply: "Apply through your Burgundy RM with joint family declaration.",
  },
  {
    bank: "Kotak Mahindra Bank",
    color: "#ED1C24",
    eligibility: "Privy League family pooling for combined relationship value",
    members: ["Spouse", "Children", "Parents"],
    benefits: [
      "Privy League benefits extended to family",
      "Pooled relationship value for tier upgrade",
      "Shared lounge and lifestyle privileges",
      "Common advisory & RM support",
    ],
    howToApply: "Contact Privy League branch or your existing RM.",
  },
  {
    bank: "State Bank of India",
    color: "#0033A0",
    eligibility: "Limited family banking features under SBI Wealth tier",
    members: ["Spouse", "Children"],
    benefits: [
      "Joint account priority servicing",
      "Family FD club rates",
      "Limited shared lounge access",
    ],
    howToApply: "Visit your SBI Wealth home branch with joint account request.",
  },
];

/* ── Wealth: comparison table for a single bank ──────────── */

function BankComparisonTable({ bank }: { bank: BankData }) {
  const [showEligibility, setShowEligibility] = useState(false);
  const tiers = bank.tiers;

  const rows: { label: string; render: (t: BankingTier) => React.ReactNode }[] = [
    {
      label: "Min Balance",
      render: (t) => (
        <span className="text-gold font-semibold text-sm">{extractMinBalance(t.eligibility)}</span>
      ),
    },
    {
      label: "Eligible Card",
      render: (t) => (
        <span className="text-xs text-muted-foreground leading-relaxed">
          {t.eligibleCards.join(", ") || "—"}
        </span>
      ),
    },
    {
      label: "Domestic Lounge",
      render: (t) => <span className="text-sm">{extractLounge(t.benefits, "domestic")}</span>,
    },
    {
      label: "Intl Lounge",
      render: (t) => <span className="text-sm">{extractLounge(t.benefits, "international")}</span>,
    },
    {
      label: "Relationship Manager",
      render: (t) =>
        t.hasRM ? (
          <Check className="w-4 h-4 text-gold" />
        ) : (
          <X className="w-4 h-4 text-muted-foreground/30" />
        ),
    },
    {
      label: "Key Perks",
      render: (t) => (
        <ul className="space-y-1">
          {t.keyTakeaways.slice(0, 3).map((p, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-2xl border border-gold/20 overflow-hidden"
    >
      {/* Bank title bar */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b border-border/15"
        style={{ background: `${bank.color}0A` }}
      >
        <Building2 className="w-5 h-5" style={{ color: bank.color }} />
        <h3 className="font-serif text-lg font-bold">{bank.name}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {tiers.length} tier{tiers.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/15">
              <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold w-40">
                Feature
              </th>
              {tiers.map((tier) => (
                <th key={tier.name} className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: tier.color }}
                    />
                    <span className="text-xs font-bold" style={{ color: tier.color }}>
                      {tier.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.label}
                className={`border-b border-border/10 ${ri % 2 === 0 ? "bg-secondary/5" : ""}`}
              >
                <td className="px-6 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {row.label}
                </td>
                {tiers.map((tier) => (
                  <td key={tier.name} className="px-4 py-3 text-center align-top">
                    <div className="flex justify-center">{row.render(tier)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collapsible eligibility */}
      <div className="border-t border-border/15">
        <button
          onClick={() => setShowEligibility((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Full Eligibility Details
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${showEligibility ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {showEligibility && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 grid gap-3" style={{ gridTemplateColumns: `repeat(${tiers.length}, 1fr)` }}>
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="rounded-xl p-3 text-xs text-muted-foreground leading-relaxed"
                    style={{
                      background: `${tier.color}08`,
                      border: `1px solid ${tier.color}18`,
                    }}
                  >
                    <p className="font-bold mb-1.5" style={{ color: tier.color }}>
                      {tier.name}
                    </p>
                    {tier.eligibility}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Family: single card ─────────────────────────────────── */

function FamilyBankCard({ card, index }: { card: FamilyCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="glass-card rounded-2xl border border-border/20 p-5 hover:border-gold/25 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${card.color}18` }}
        >
          <Building2 className="w-4 h-4" style={{ color: card.color }} />
        </div>
        <div>
          <h4 className="font-serif text-sm font-bold">{card.bank}</h4>
          <p className="text-[11px] text-muted-foreground">{card.eligibility}</p>
        </div>
      </div>

      {/* Member tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {card.members.map((m) => (
          <span
            key={m}
            className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Benefits checklist */}
      <ul className="space-y-2 mb-4">
        {card.benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* How to apply */}
      <div className="rounded-lg bg-secondary/15 border border-border/15 px-3 py-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
          How to Apply
        </p>
        <p className="text-xs text-muted-foreground">{card.howToApply}</p>
      </div>
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function DesktopBankingLayout({
  activeSection,
  setActiveSection,
  heroRef,
}: Props) {
  const [selectedBank, setSelectedBank] = useState<string>(banks[0].id);
  const activeBankData = banks.find((b) => b.id === selectedBank) ?? banks[0];

  return (
    <div className="hidden md:block">
      {/* ── Hero ────────────────────────────────────────── */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-3">
          <span className="text-white">Banking</span>{" "}
          <span className="gold-gradient">Guides</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-6">
          Compare wealth management tiers, family banking privileges, and premium
          perks across India's top banks — all in one place.
        </p>

        {/* Segmented toggle */}
        <div className="inline-flex glass-card rounded-xl p-1 border border-border/20">
          {(
            [
              { key: "wealth" as const, icon: Gem, label: "Wealth Banking" },
              { key: "family" as const, icon: Users, label: "Family Banking" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`relative px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                activeSection === s.key
                  ? "text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeSection === s.key && (
                <motion.span
                  layoutId="banking-tab-desktop"
                  className="absolute inset-0 rounded-lg bg-gold shadow-lg shadow-gold/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <s.icon className="w-4 h-4" />
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Content ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeSection === "wealth" ? (
          <motion.div
            key="wealth"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* Bank selector pills */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {banks.map((bank) => {
                const active = bank.id === selectedBank;
                return (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border ${
                      active
                        ? "bg-gold/15 border-gold/40 text-gold"
                        : "glass-card border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {bank.name}
                  </button>
                );
              })}
            </div>

            {/* Comparison table for selected bank */}
            <AnimatePresence mode="wait">
              <BankComparisonTable key={activeBankData.id} bank={activeBankData} />
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="family"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-2 gap-5">
              {familyData.map((card, i) => (
                <FamilyBankCard key={card.bank} card={card} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
