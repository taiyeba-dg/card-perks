import { motion } from "framer-motion";
import { Wifi, CreditCard, Banknote, Plane } from "lucide-react";
import type { FinderAnswers } from "./finderTypes";

interface Props {
  answers: FinderAnswers;
  onChange: (patch: Partial<FinderAnswers>) => void;
}

const REWARD_TYPES = [
  { id: "points", label: "Points", desc: "Transfer flexibility", icon: "💰" },
  { id: "cashback", label: "Cashback", desc: "Just give me money back", icon: "💚" },
  { id: "miles", label: "Miles", desc: "I fly frequently", icon: "✈️" },
  { id: "no-pref", label: "No preference", desc: "Show me everything", icon: "🔄" },
];

const FEE_RANGES = [
  { id: "free", label: "₹0" },
  { id: "low", label: "₹500–₹2K" },
  { id: "mid", label: "₹2K–₹5K" },
  { id: "high", label: "₹5K–₹15K" },
  { id: "ultra", label: "₹15K+" },
];

const NETWORKS = [
  { id: "Visa", label: "Visa" },
  { id: "Mastercard", label: "Mastercard" },
  { id: "Rupay", label: "Rupay" },
  { id: "Diners Club", label: "Diners" },
  { id: "Amex", label: "Amex" },
];

export default function PreferencesStep({ answers, onChange }: Props) {
  const rewardType = answers.rewardType ?? "no-pref";
  const feeComfort = answers.feeComfort ?? ["free", "low", "mid", "high", "ultra"];
  const networks = answers.networks ?? ["Visa", "Mastercard", "Rupay", "Diners Club", "Amex"];

  const toggleFee = (id: string) => {
    const next = feeComfort.includes(id) ? feeComfort.filter((f) => f !== id) : [...feeComfort, id];
    onChange({ feeComfort: next.length > 0 ? next : [id] });
  };

  const toggleNetwork = (id: string) => {
    const next = networks.includes(id) ? networks.filter((n) => n !== id) : [...networks, id];
    onChange({ networks: next.length > 0 ? next : [id] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">Step 4 of 4</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight">
        🎯 Almost there! A few quick preferences...
      </h2>
      <p className="text-sm text-muted-foreground mb-6">These help us fine-tune your results</p>

      {/* Reward type preference */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground mb-2.5 block">Reward type preference</label>
        <div className="grid grid-cols-2 gap-2">
          {REWARD_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ rewardType: t.id })}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                rewardType === t.id
                  ? "border-gold bg-gold/10"
                  : "border-border/40 hover:border-gold/30"
              }`}
            >
              <span className="text-lg flex-shrink-0">{t.icon}</span>
              <div>
                <p className={`text-xs font-medium ${rewardType === t.id ? "text-gold" : ""}`}>{t.label}</p>
                <p className="text-[9px] text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Annual fee comfort */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground mb-2.5 block">Annual fee comfort</label>
        <div className="flex flex-wrap gap-1.5">
          {FEE_RANGES.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFee(f.id)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
                feeComfort.includes(f.id)
                  ? "border border-gold bg-gold/10 text-gold"
                  : "border border-border/40 text-muted-foreground hover:border-gold/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card network */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2.5 block">Card network</label>
        <div className="flex flex-wrap gap-1.5">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              onClick={() => toggleNetwork(n.id)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 ${
                networks.includes(n.id)
                  ? "border border-gold bg-gold/10 text-gold"
                  : "border border-border/40 text-muted-foreground hover:border-gold/30"
              }`}
            >
              {networks.includes(n.id) ? "✓" : ""} {n.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
