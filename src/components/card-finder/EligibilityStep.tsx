import { Check } from "lucide-react";
import { INCOME_RANGES, BANK_OPTIONS, type FinderAnswers } from "./finderTypes";

interface Props {
  answers: FinderAnswers;
  onChange: (patch: Partial<FinderAnswers>) => void;
}

const REWARD_TYPES = [
  { id: "points", label: "Points", icon: "\uD83D\uDCB0" },
  { id: "cashback", label: "Cashback", icon: "\uD83D\uDC9A" },
  { id: "miles", label: "Miles", icon: "\u2708\uFE0F" },
  { id: "no-pref", label: "Any", icon: "\uD83D\uDD04" },
];

const NETWORKS = ["Visa", "Mastercard", "Rupay", "Diners Club", "Amex"];

const INCOME_ICONS: Record<string, string> = {
  "0-3": "🌱",
  "3-6": "💼",
  "6-12": "🎯",
  "12-25": "💎",
  "25+": "👑",
};

export default function EligibilityStep({ answers, onChange }: Props) {
  const rewardType = answers.rewardType ?? "no-pref";
  const networks = answers.networks ?? NETWORKS;

  const toggleBank = (bank: string) => {
    const banks = answers.existingBanks.includes(bank)
      ? answers.existingBanks.filter((b) => b !== bank)
      : [...answers.existingBanks, bank];
    onChange({ existingBanks: banks });
  };

  const toggleNetwork = (id: string) => {
    const next = networks.includes(id) ? networks.filter((n) => n !== id) : [...networks, id];
    onChange({ networks: next.length > 0 ? next : [id] });
  };

  return (
    <div className="w-full">
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-2">Step 3 of 3</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 leading-tight">A few more details</h2>
      <p className="text-sm text-muted-foreground mb-6">Helps us recommend cards you can actually get</p>

      <div className="mb-6">
        <p className="text-xs font-semibold mb-3">Annual Income</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INCOME_RANGES.map((r) => {
            const active = answers.income === r.value;
            return (
              <button
                key={r.value}
                onClick={() => onChange({ income: r.value })}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 min-h-[100px] transition-all ${
                  active
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--gold)/0.2)]"
                    : "border-border/40 hover:border-primary/30 hover:bg-primary/[0.03]"
                }`}
              >
                <span className="text-2xl">{INCOME_ICONS[r.value] ?? "💰"}</span>
                <span className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>{r.label}</span>
                {active && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold mb-3">Banks you have cards with <span className="text-muted-foreground font-normal">(optional)</span></p>
        <div className="flex flex-wrap gap-2">
          {BANK_OPTIONS.map((bank) => (
            <button
              key={bank}
              onClick={() => toggleBank(bank)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                answers.existingBanks.includes(bank)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/30 text-muted-foreground hover:border-primary/30"
              }`}
            >
              {answers.existingBanks.includes(bank) && <Check className="w-2.5 h-2.5 inline mr-1" />}
              {bank}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/20 pt-5 space-y-5">
        <p className="text-xs font-semibold text-muted-foreground">Optional Preferences</p>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Reward type</p>
          <div className="flex flex-wrap gap-2">
            {REWARD_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => onChange({ rewardType: t.id })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  rewardType === t.id ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Card network</p>
          <div className="flex flex-wrap gap-2">
            {NETWORKS.map((n) => (
              <button
                key={n}
                onClick={() => toggleNetwork(n)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  networks.includes(n) ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30"
                }`}
              >
                {networks.includes(n) ? "\u2713 " : ""}{n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(answers.feeComfort?.length ?? 0) === 1 && answers.feeComfort?.[0] === "free"}
              onChange={(e) => onChange({ feeComfort: e.target.checked ? ["free"] : ["free", "low", "mid", "high", "ultra"], willingHighFee: !e.target.checked })}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-xs">I want a lifetime free card</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={answers.travelsInternationally} onChange={(e) => onChange({ travelsInternationally: e.target.checked })} className="w-4 h-4 rounded border-border accent-primary" />
            <span className="text-xs">I travel internationally</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={answers.usesPortals} onChange={(e) => onChange({ usesPortals: e.target.checked })} className="w-4 h-4 rounded border-border accent-primary" />
            <span className="text-xs">I use shopping portals (SmartBuy, EDGE, etc.)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
